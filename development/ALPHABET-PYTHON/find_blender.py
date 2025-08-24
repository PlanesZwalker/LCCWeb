#!/usr/bin/env python3
"""
Find Blender Installation and Run Camera Tests
Helps locate Blender and provides the correct command to run camera tests
"""

import os
import subprocess
import sys

def find_blender():
    """Find Blender installation"""
    possible_paths = [
        # Windows common paths
        r"C:\Program Files\Blender Foundation\Blender\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 4.0\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 3.6\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 3.5\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 3.4\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 3.3\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 3.2\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 3.1\blender.exe",
        r"C:\Program Files\Blender Foundation\Blender 3.0\blender.exe",
        # User installation
        os.path.expanduser(r"~\AppData\Local\Programs\Blender Foundation\Blender\blender.exe"),
        # Steam installation
        r"C:\Program Files (x86)\Steam\steamapps\common\Blender\blender.exe",
        # Portable installation
        r"C:\blender\blender.exe",
    ]
    
    print("🔍 Searching for Blender installation...")
    
    for path in possible_paths:
        if os.path.exists(path):
            print(f"✅ Found Blender at: {path}")
            return path
    
    print("❌ Blender not found in common locations")
    print("\n📋 Please install Blender or provide the path manually:")
    print("   1. Download from: https://www.blender.org/download/")
    print("   2. Install to default location")
    print("   3. Or provide the full path to blender.exe")
    
    return None

def run_camera_tests(blender_path):
    """Run camera tests with the found Blender"""
    camera_script = "camera_test_script.py"
    
    if not os.path.exists(camera_script):
        print(f"❌ Camera test script not found: {camera_script}")
        return False
    
    print(f"\n🚀 Running camera tests with Blender...")
    print(f"📷 Blender: {blender_path}")
    print(f"📝 Script: {camera_script}")
    
    # Build the command
    cmd = [blender_path, "--background", "--python", camera_script]
    
    print(f"\n💻 Command to run:")
    print(f"   {' '.join(cmd)}")
    
    # Ask user if they want to run it
    response = input("\n🤔 Do you want to run this command now? (y/n): ").lower().strip()
    
    if response == 'y':
        try:
            print("⏳ Running camera tests...")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            
            if result.returncode == 0:
                print("✅ Camera tests completed successfully!")
                print("📁 Check the results in: references_and_renders/camera_tests/")
                return True
            else:
                print("❌ Camera tests failed!")
                print("Error output:")
                print(result.stderr)
                return False
                
        except subprocess.TimeoutExpired:
            print("❌ Camera tests timed out")
            return False
        except Exception as e:
            print(f"❌ Error running camera tests: {e}")
            return False
    else:
        print("📋 Please run the command manually:")
        print(f"   {' '.join(cmd)}")
        return False

def main():
    """Main function"""
    print("🔧 Find Blender and Run Camera Tests")
    print("=" * 50)
    
    # Find Blender
    blender_path = find_blender()
    
    if blender_path:
        # Run camera tests
        success = run_camera_tests(blender_path)
        
        if success:
            print("\n🎉 Camera tests completed!")
            print("📊 Next step: Run 'python analyze_camera_tests.py'")
        else:
            print("\n❌ Camera tests failed")
            print("🔧 Please check the error messages above")
    else:
        print("\n❌ Cannot proceed without Blender")
        print("📥 Please install Blender and try again")

if __name__ == "__main__":
    main()
