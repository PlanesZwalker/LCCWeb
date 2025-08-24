#!/usr/bin/env python3
"""
Apply Best Framing Position to Main Render Script
Automatically updates ultimate_cascade_render.py with the optimal camera framing
"""

import os
import re

def apply_framing_settings(framing_position):
    """Apply the best framing position to the main render script"""
    
    # Framing position mappings based on analysis results
    framing_settings = {
        "dynamic_left": {
            "location": "(-15, -45, 30)",
            "rotation": "(math.radians(30), math.radians(10), 0)",
            "lens": "35",
            "focus": "45.0"
        }
    }
    
    if framing_position not in framing_settings:
        print(f"❌ Unknown framing position: {framing_position}")
        return False
    
    settings = framing_settings[framing_position]
    
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
    
    print(f"✅ Successfully applied framing position: {framing_position}")
    print(f"   Location: {settings['location']}")
    print(f"   Rotation: {settings['rotation']}")
    print(f"   Lens: {settings['lens']}")
    print(f"   Focus: {settings['focus']}")
    
    return True

def main():
    """Main function"""
    print("🔧 Apply Best Framing Position to Main Render Script")
    print("=" * 60)
    
    # Based on framing analysis, dynamic_left achieved the highest score (8/10)
    best_framing = "dynamic_left"
    print(f"🎯 Applying best framing position: {best_framing}")
    print("📊 Analysis Score: 8/10 (Highest)")
    print("✅ Character Visibility: 6/10")
    print("✅ Waterfall Visibility: 6/10")
    print("✅ Pagoda Visibility: 7/10")
    print("✅ Environment Balance: 8/10")
    print("✅ Composition Quality: 7/10")
    
    apply_framing_settings(best_framing)

if __name__ == "__main__":
    main()

