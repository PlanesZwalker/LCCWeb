#!/usr/bin/env python3
"""
Fix Render Issues Script
Addresses the main problems identified in the analysis:
1. Character mouths not visible
2. Pagoda not visible
3. Overly bright colors
4. Poor lighting quality
"""

import bpy
import math
import os

def fix_render_issues():
    """Fix the main issues in the current render"""
    print("🔧 Fixing render issues...")
    
    # 1. Fix character mouths - make them MUCH larger and more visible
    print("👄 Fixing character mouths...")
    for letter in ['A', 'B', 'C']:
        mouth_name = f"{letter}_Mouth"
        if mouth_name in bpy.data.objects:
            mouth = bpy.data.objects[mouth_name]
            # Make mouth MUCH larger and more visible
            mouth.scale = (1.5, 0.8, 0.3)  # Much larger mouth
            mouth.location.z += 0.2  # Move it forward slightly
    
    # 2. Fix pagoda positioning - move it to be more visible
    print("🏯 Fixing pagoda positioning...")
    pagoda_objects = ['PagodaMain', 'PagodaHut', 'PagodaBridge']
    for obj_name in pagoda_objects:
        if obj_name in bpy.data.objects:
            obj = bpy.data.objects[obj_name]
            # Move pagoda to be more visible in camera view
            obj.location.x += 5  # Move closer to center
            obj.location.y -= 10  # Move closer to camera
            obj.location.z += 2   # Raise it up
    
    # 3. Reduce color saturation for more natural look
    print("🎨 Reducing color saturation...")
    for material in bpy.data.materials:
        if material.use_nodes == False:  # Only affect simple materials
            color = material.diffuse_color
            # Reduce saturation by mixing with gray
            new_color = (
                color[0] * 0.7 + 0.3,  # Reduce red saturation
                color[1] * 0.7 + 0.3,  # Reduce green saturation  
                color[2] * 0.7 + 0.3,  # Reduce blue saturation
                color[3]  # Keep alpha
            )
            material.diffuse_color = new_color
    
    # 4. Improve lighting for more natural look
    print("💡 Improving lighting...")
    for light in bpy.data.lights:
        # Reduce light intensity for more natural look
        light.energy *= 0.6
        # Make colors more natural
        if light.color[0] > 0.8 and light.color[1] > 0.8 and light.color[2] > 0.8:
            # Make white lights slightly warmer
            light.color = (1.0, 0.95, 0.9)
    
    # 5. Improve render settings for better quality
    print("⚙️ Improving render settings...")
    scene = bpy.context.scene
    
    # Better color management
    scene.view_settings.view_transform = 'Filmic'
    scene.view_settings.look = 'Medium High Contrast'
    scene.view_settings.exposure = -0.2  # Slightly darker
    scene.view_settings.gamma = 1.1      # Slightly more contrast
    
    # Better EEVEE settings
    scene.eevee.taa_render_samples = 128  # More samples for better quality
    scene.eevee.use_taa_reprojection = True
    scene.eevee.use_gtao = True
    scene.eevee.gtao_distance = 0.2
    scene.eevee.gtao_factor = 1.0
    
    print("✅ Render issues fixed!")

def main():
    """Main function"""
    print("🔧 Fix Render Issues")
    print("=" * 50)
    
    # Check if we have a scene to work with
    if len(bpy.data.objects) == 0:
        print("❌ No objects found in scene. Please run the main render script first.")
        return
    
    # Fix the issues
    fix_render_issues()
    
    print("\n🎯 Issues addressed:")
    print("   ✅ Character mouths made larger and more visible")
    print("   ✅ Pagoda repositioned for better visibility")
    print("   ✅ Color saturation reduced for natural look")
    print("   ✅ Lighting improved for better quality")
    print("   ✅ Render settings optimized")
    
    print("\n📝 Next steps:")
    print("   1. Run the main render script again")
    print("   2. Check if the issues are resolved")
    print("   3. Run analysis again to verify improvements")

if __name__ == "__main__":
    main()
