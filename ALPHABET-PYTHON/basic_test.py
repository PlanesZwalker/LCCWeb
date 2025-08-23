#!/usr/bin/env python3
"""
Very basic test to identify rendering issues
"""

import bpy

def clear_scene():
    """Clear everything"""
    print("🧹 Clearing scene...")
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    print("✅ Scene cleared")

def setup_basic_render():
    """Setup basic render"""
    print("⚙️ Setting up basic render...")
    scene = bpy.context.scene
    scene.render.engine = 'BLENDER_EEVEE'
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.image_settings.file_format = 'PNG'
    scene.render.filepath = "./.agents/ALPHABET-PYTHON/references_and_renders/renders/basic_test.png"
    print("✅ Basic render setup complete")

def create_basic_scene():
    """Create basic scene with one cube"""
    print("🎭 Creating basic scene...")
    
    # Create one cube
    bpy.ops.mesh.primitive_cube_add(location=(0, 0, 0))
    cube = bpy.context.active_object
    cube.name = "TestCube"
    
    # Create basic material
    material = bpy.data.materials.new(name="TestMaterial")
    material.use_nodes = False
    material.diffuse_color = (1.0, 0.0, 0.0, 1.0)  # Red
    cube.data.materials.append(material)
    
    # Create basic light
    bpy.ops.object.light_add(type='SUN', location=(5, 5, 5))
    sun = bpy.context.active_object
    sun.data.energy = 1.0
    
    # Create basic camera
    bpy.ops.object.camera_add(location=(0, -5, 3))
    camera = bpy.context.active_object
    bpy.context.scene.camera = camera
    
    print("✅ Basic scene created")

def run():
    """Run the basic test"""
    print("🚀 STARTING BASIC TEST")
    print("=" * 50)
    
    # Step 1: Clear scene
    clear_scene()
    
    # Step 2: Setup render
    setup_basic_render()
    
    # Step 3: Create basic scene
    create_basic_scene()
    
    # Step 4: Render
    print("🎨 Rendering scene...")
    bpy.ops.render.render(write_still=True)
    print("✅ Render complete")
    
    print("=" * 50)
    print("🎉 BASIC TEST COMPLETE!")
    print("=" * 50)

if __name__ == "__main__":
    run()
