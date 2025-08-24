# Letters Cascade Challenge - Folder Synchronization Script
# Syncs public/ folder to dist/ folder with error handling and logging

param(
    [string]$ConfigPath = "config.json",
    [switch]$Verbose
)

# Load configuration
$configPath = Join-Path -Path $PSScriptRoot -ChildPath $ConfigPath
if (-Not (Test-Path $configPath)) {
    Write-Error "Configuration file not found: $configPath"
    exit 1
}

$config = Get-Content -Path $configPath | ConvertFrom-Json
$sourceFolder = Join-Path -Path $PSScriptRoot -ChildPath $config.sourceFolder
$destinationFolder = Join-Path -Path $PSScriptRoot -ChildPath $config.destinationFolder
$logFile = Join-Path -Path $PSScriptRoot -ChildPath "sync_log.txt"

function Write-Log {
    param(
        [string]$Message, 
        [string]$Level = "INFO"
    )
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    $logEntry = "$timestamp [$Level] $Message"
    Add-Content -Path $logFile -Value $logEntry
    
    if ($Verbose -or $Level -eq "ERROR") {
        $color = switch ($Level) {
            "ERROR" { "Red" }
            "WARN" { "Yellow" }
            "SUCCESS" { "Green" }
            default { "White" }
        }
        Write-Host $logEntry -ForegroundColor $color
    }
}

function Test-SyncPrerequisites {
    # Check if source folder exists
    if (-Not (Test-Path $sourceFolder)) {
        Write-Log "Source folder does not exist: $sourceFolder" -Level ERROR
        return $false
    }
    
    # Create destination folder if it doesn't exist
    if (-Not (Test-Path $destinationFolder)) {
        try {
            New-Item -ItemType Directory -Path $destinationFolder -Force | Out-Null
            Write-Log "Created destination folder: $destinationFolder" -Level INFO
        } catch {
            Write-Log "Failed to create destination folder: $_" -Level ERROR
            return $false
        }
    }
    
    return $true
}

function Start-Sync {
    try {
        Write-Log "Starting folder synchronization..." -Level INFO
        Write-Log "Source: $sourceFolder" -Level INFO
        Write-Log "Destination: $destinationFolder" -Level INFO
        
        # Build robocopy command with exclusions
        $robocopyArgs = @(
            "`"$sourceFolder`"",
            "`"$destinationFolder`"",
            "/MIR",           # Mirror mode
            "/COPY:DAT",      # Copy data, attributes, and timestamps
            "/R:3",           # Retry 3 times
            "/W:5",           # Wait 5 seconds between retries
            "/NP",            # No progress
            "/TEE",           # Output to console and log
            "/LOG+:$logFile"  # Append to log file
        )
        
        # Add exclusion patterns if specified
        if ($config.excludePatterns) {
            foreach ($pattern in $config.excludePatterns) {
                # Handle directory exclusions with /XD
                if ($pattern -like "*/*" -or $pattern -like "*\\*") {
                    $robocopyArgs += "/XD"
                    $robocopyArgs += "`"$pattern`""
                } else {
                    # Handle file exclusions with /XF
                    $robocopyArgs += "/XF"
                    $robocopyArgs += "`"$pattern`""
                }
            }
        }
        
        $robocopyCmd = "robocopy " + ($robocopyArgs -join " ")
        Write-Log "Executing: $robocopyCmd" -Level INFO
        
        # Execute robocopy
        $process = Start-Process -FilePath "robocopy" -ArgumentList $robocopyArgs -Wait -PassThru -NoNewWindow
        
        # Check exit code
        switch ($process.ExitCode) {
            0 { Write-Log "Synchronization completed successfully - No files copied" -Level SUCCESS }
            1 { Write-Log "Synchronization completed successfully - Files copied" -Level SUCCESS }
            2 { Write-Log "Synchronization completed - Extra files/directories detected" -Level WARN }
            3 { Write-Log "Synchronization completed - Modified files copied" -Level SUCCESS }
            4 { Write-Log "Synchronization completed - Mismatched files/directories detected" -Level WARN }
            5 { Write-Log "Synchronization completed - Some files/directories could not be copied" -Level WARN }
            6 { Write-Log "Synchronization completed - Additional files/directories detected" -Level WARN }
            7 { Write-Log "Synchronization completed - Files copied, some files/directories could not be copied" -Level WARN }
            default { 
                Write-Log "Synchronization failed with exit code: $($process.ExitCode)" -Level ERROR
                return $false
            }
        }
        
        return $true
        
    } catch {
        Write-Log "Error during synchronization: $_" -Level ERROR
        return $false
    }
}

function Send-Notification {
    param([string]$Message, [string]$Level = "ERROR")
    
    if ($config.emailNotifications.enabled -and $Level -eq "ERROR") {
        try {
            $body = "Folder synchronization failed:`n$Message`n`nTime: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            
            Send-MailMessage -SmtpServer $config.emailNotifications.smtpServer `
                           -From $config.emailNotifications.fromAddress `
                           -To $config.emailNotifications.toAddress `
                           -Subject $config.emailNotifications.subject `
                           -Body $body
            
            Write-Log "Email notification sent" -Level INFO
        } catch {
            Write-Log "Failed to send email notification: $_" -Level WARN
        }
    }
}

# Main execution
Write-Log "=== Starting Folder Sync Process ===" -Level INFO

if (-Not (Test-SyncPrerequisites)) {
    Write-Log "Prerequisites check failed" -Level ERROR
    Send-Notification "Prerequisites check failed"
    exit 1
}

$syncSuccess = Start-Sync

if (-Not $syncSuccess) {
    Write-Log "Synchronization failed" -Level ERROR
    Send-Notification "Synchronization failed"
    exit 1
}

Write-Log "=== Folder Sync Process Completed ===" -Level SUCCESS
