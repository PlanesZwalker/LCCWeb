#!/usr/bin/env python3
"""
Apply Best Camera Position to Main Render Script
Automatically updates ultimate_cascade_render.py with the optimal camera settings
"""

import os
import re

def apply_camera_settings(camera_position):
    """Apply the best camera position to the main render script"""
    
    # Camera position mappings
    camera_settings = {
        "far_high": {
            "location": "(0, -60, 45)",
            "rotation": "(math.radians(25), 0, 0)",
            "lens": "35",
            "focus": "50.0"
        },
        "medium_medium": {
            "location": "(0, -40, 30)",
            "rotation": "(math.radians(35), 0, 0)",
            "lens": "40",
            "focus": "40.0"
        },
        "close_low": {
            "location": "(0, -30, 20)",
            "rotation": "(math.radians(45), 0, 0)",
            "lens": "50",
            "focus": "30.0"
        },
        "very_far_high": {
            "location": "(0, -80, 60)",
            "rotation": "(math.radians(20), 0, 0)",
            "lens": "28",
            "focus": "70.0"
        },
        "side_view": {
            "location": "(20, -40, 30)",
            "rotation": "(math.radians(30), math.radians(15), 0)",
            "lens": "35",
            "focus": "45.0"
        },
        "wide_angle": {
            "location": "(0, -50, 35)",
            "rotation": "(math.radians(30), 0, 0)",
            "lens": "24",
            "focus": "50.0"
        },
        "telephoto": {
            "location": "(0, -70, 50)",
            "rotation": "(math.radians(25), 0, 0)",
            "lens": "70",
            "focus": "60.0"
        },
        "perfect_framing": {
            "location": "(0, -55, 40)",
            "rotation": "(math.radians(28), 0, 0)",
            "lens": "32",
            "focus": "55.0"
        }
    }
    
    if camera_position not in camera_settings:
        print(f"❌ Unknown camera position: {camera_position}")
        return False
    
    settings = camera_settings[camera_position]
    
    # Read the main script
    script_path = "ultimate_cascade_render.py"
    if not os.path.exists(script_path):
        print(f"❌ Main script not found: {script_path}")
        return False
    
    with open(script_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update camera location
    content = re.sub(
        r'bpy\.ops\.object\.camera_add\(location=\([^)]+\), rotation=\([^)]+\)\)',
        f'bpy.ops.object.camera_add(location={settings["location"]}, rotation={settings["rotation"]})',
        content
    )
    
    # Update camera lens
    content = re.sub(
        r'camera\.data\.lens = \d+',
        f'camera.data.lens = {settings["lens"]}',
        content
    )
    
    # Update focus distance
    content = re.sub(
        r'camera\.data\.dof\.focus_distance = \d+\.\d+',
        f'camera.data.dof.focus_distance = {settings["focus"]}',
        content
    )
    
    # Write the updated script
    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Successfully applied camera position: {camera_position}")
    print(f"   Location: {settings['location']}")
    print(f"   Rotation: {settings['rotation']}")
    print(f"   Lens: {settings['lens']}")
    print(f"   Focus: {settings['focus']}")
    
    return True

def main():
    """Main function"""
    print("🔧 Apply Best Camera Position to Main Render Script")
    print("=" * 60)
    
    # Get camera position from user
    positions = [
        "far_high", "medium_medium", "close_low", "very_far_high",
        "side_view", "wide_angle", "telephoto", "perfect_framing"
    ]
    
    print("Available camera positions:")
    for i, pos in enumerate(positions, 1):
        print(f"   {i}. {pos}")
    
    # Based on camera analysis, wide_angle (option 6) achieved the highest score (8/10)
    choice = 5  # wide_angle is position 6 (0-indexed = 5)
    camera_position = positions[choice]
    print(f"🎯 Automatically selecting best camera position: {camera_position}")
    apply_camera_settings(camera_position)

if __name__ == "__main__":
    main()
