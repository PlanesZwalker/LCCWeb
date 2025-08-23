#!/usr/bin/env python3
"""
Fix White Render Issues
Comprehensive fix for the washed-out render appearance
"""

import bpy
import math
import os

def fix_white_render_issues():
    """Fix all issues causing the white/washed-out render"""
    print("🔧 Fixing white render issues...")
    
    # 1. FIX CAMERA POSITION - Move closer and adjust angle
    print("📷 Fixing camera position...")
    if 'Camera' in bpy.data.objects:
        camera = bpy.data.objects['Camera']
        # Move camera much closer for better visibility
        camera.location = (-10, -35, 25)  # Much closer position
        camera.rotation_euler = (math.radians(35), math.radians(5), 0)  # Better angle
        camera.data.lens = 40  # Slightly longer lens for better framing
        camera.data.dof.focus_distance = 35.0  # Adjust focus
    
    # 2. FIX LIGHTING - Reduce intensity and improve positioning
    print("💡 Fixing lighting...")
    for light in bpy.data.lights:
        # Reduce light intensity significantly
        light.energy *= 0.3  # Much lower intensity
        
        # Make lights warmer for better contrast
        if light.color[0] > 0.8 and light.color[1] > 0.8 and light.color[2] > 0.8:
            light.color = (1.0, 0.9, 0.8)  # Warmer light
    
    # 3. FIX MATERIALS - Increase saturation and contrast
    print("🎨 Fixing materials...")
    for material in bpy.data.materials:
        if material.use_nodes == False:  # Only affect simple materials
            color = material.diffuse_color
            # Increase saturation significantly
            new_color = (
                min(1.0, color[0] * 1.5),  # Increase red
                min(1.0, color[1] * 1.5),  # Increase green
                min(1.0, color[2] * 1.5),  # Increase blue
                color[3]  # Keep alpha
            )
            material.diffuse_color = new_color
    
    # 4. FIX WATERFALL VISIBILITY - Make it much more prominent
    print("🌊 Fixing waterfall visibility...")
    waterfall_objects = ['WaterfallMain', 'Waterfall_2', 'Waterfall_3', 'Waterfall_4', 'WaterPool']
    for obj_name in waterfall_objects:
        if obj_name in bpy.data.objects:
            obj = bpy.data.objects[obj_name]
            # Make waterfall much larger and more visible
            obj.scale = (obj.scale[0] * 1.5, obj.scale[1] * 1.5, obj.scale[2] * 1.5)
            # Move it closer to camera view
            obj.location.z += 2
            obj.location.y -= 5
    
    # 5. FIX CHARACTER VISIBILITY - Make them much larger and more prominent
    print("🎭 Fixing character visibility...")
    for letter in ['A', 'B', 'C']:
        # Make body much larger
        body_name = f"{letter}_Body"
        if body_name in bpy.data.objects:
            body = bpy.data.objects[body_name]
            body.scale = (body.scale[0] * 2.0, body.scale[1] * 2.0, body.scale[2] * 2.0)
            # Move characters closer to camera
            body.location.y -= 5
            body.location.z += 3
        
        # Make eyes much larger and more visible
        for eye_side in ['Left', 'Right']:
            eye_name = f"{letter}_{eye_side}Eye"
            if eye_name in bpy.data.objects:
                eye = bpy.data.objects[eye_name]
                eye.scale = (eye.scale[0] * 2.0, eye.scale[1] * 2.0, eye.scale[2] * 2.0)
        
        # Make mouth much larger and more visible
        mouth_name = f"{letter}_Mouth"
        if mouth_name in bpy.data.objects:
            mouth = bpy.data.objects[mouth_name]
            mouth.scale = (mouth.scale[0] * 3.0, mouth.scale[1] * 3.0, mouth.scale[2] * 3.0)
            # Move mouth forward
            mouth.location.z += 0.5
        
        # Make limbs much larger and more visible
        for limb_type in ['LeftArm', 'RightArm', 'LeftLeg', 'RightLeg']:
            limb_name = f"{letter}_{limb_type}"
            if limb_name in bpy.data.objects:
                limb = bpy.data.objects[limb_name]
                limb.scale = (limb.scale[0] * 2.0, limb.scale[1] * 2.0, limb.scale[2] * 2.0)
    
    # 6. FIX RENDER SETTINGS - Improve contrast and reduce washout
    print("⚙️ Fixing render settings...")
    scene = bpy.context.scene
    
    # Much better color management
    scene.view_settings.view_transform = 'Filmic'
    scene.view_settings.look = 'High Contrast'
    scene.view_settings.exposure = -0.5  # Much darker for better contrast
    scene.view_settings.gamma = 1.2      # Higher gamma for better visibility
    
    # Better EEVEE settings
    scene.eevee.taa_render_samples = 128  # Good quality
    scene.eevee.use_taa_reprojection = True
    scene.eevee.use_gtao = True
    scene.eevee.gtao_distance = 0.2
    scene.eevee.gtao_factor = 1.0
    
    # Enhanced shadows
    scene.eevee.use_shadows = True
    scene.eevee.shadow_cascade_size = '2048'
    scene.eevee.shadow_cube_size = '2048'
    
    # Reduce bloom to prevent washout
    scene.eevee.use_bloom = False
    
    # 7. FIX BACKGROUND - Make it darker for better contrast
    print("🌍 Fixing background...")
    world = bpy.context.scene.world
    if world:
        world.use_nodes = False
        # Much darker sky for better contrast
        world.color = (0.3, 0.5, 0.8)  # Darker blue
    
    # 8. FIX PAGODA VISIBILITY - Make it more prominent
    print("🏯 Fixing pagoda visibility...")
    pagoda_objects = ['PagodaMain', 'PagodaHut', 'PagodaBridge']
    for obj_name in pagoda_objects:
        if obj_name in bpy.data.objects:
            obj = bpy.data.objects[obj_name]
            # Make pagoda larger and move it closer
            obj.scale = (obj.scale[0] * 1.5, obj.scale[1] * 1.5, obj.scale[2] * 1.5)
            obj.location.y -= 3
            obj.location.z += 1
    
    print("✅ White render issues fixed!")

def main():
    """Main function"""
    print("🔧 Fix White Render Issues")
    print("=" * 50)
    
    # Check if we have a scene to work with
    if len(bpy.data.objects) == 0:
        print("❌ No objects found in scene. Please run the main render script first.")
        return
    
    # Fix the issues
    fix_white_render_issues()
    
    print("\n🎯 Issues addressed:")
    print("   ✅ Camera moved closer with better angle")
    print("   ✅ Lighting intensity reduced and warmed")
    print("   ✅ Material saturation increased")
    print("   ✅ Waterfall made much more prominent")
    print("   ✅ Characters made much larger and more visible")
    print("   ✅ Render settings optimized for better contrast")
    print("   ✅ Background darkened for better contrast")
    print("   ✅ Pagoda made more prominent")
    
    print("\n📝 Next steps:")
    print("   1. Run the main render script again")
    print("   2. Check if the white/washout issues are resolved")
    print("   3. Run analysis again to verify improvements")

if __name__ == "__main__":
    main()

