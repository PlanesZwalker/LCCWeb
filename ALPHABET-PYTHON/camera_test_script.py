#!/usr/bin/env python3
"""
Camera Testing Script for Ultimate Cascade Render
Tests multiple camera positions to find the perfect view for 100% visibility
"""

import bpy
import math
import os

class CameraTester:
    def __init__(self):
        self.output_dir = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "references_and_renders", "camera_tests"
        )
        os.makedirs(self.output_dir, exist_ok=True)
        
    def setup_scene(self):
        """Setup the basic scene with all elements"""
        print("🎬 Setting up test scene...")
        
        # Clear scene
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete(use_global=False)
        
        # Create materials
        materials = {
            'red': self.create_material("Red", (1.0, 0.0, 0.0)),
            'pink': self.create_material("Pink", (1.0, 0.2, 0.8)),
            'green': self.create_material("Green", (0.0, 1.0, 0.0)),
            'water': self.create_material("Water", (0.2, 0.6, 0.9)),
            'rock': self.create_material("Rock", (0.5, 0.5, 0.5)),
            'vegetation': self.create_material("Vegetation", (0.1, 0.6, 0.1)),
        }
        
        # Create characters (A, B, C)
        self.create_test_character('A', (-20, -25, 12), materials['red'], scale=8.0)
        self.create_test_character('B', (0, -25, 12), materials['pink'], scale=8.0)
        self.create_test_character('C', (20, -25, 12), materials['green'], scale=8.0)
        
        # Create waterfall
        self.create_waterfall((-10, -15, 10), materials['water'])
        
        # Create some environment elements
        self.create_ground(materials['rock'])
        self.create_trees(materials['vegetation'])
        
        # Setup lighting
        self.setup_lighting()
        
        print("✅ Test scene created.")
    
    def create_material(self, name, color):
        mat = bpy.data.materials.new(name)
        mat.use_nodes = False
        mat.diffuse_color = (*color[:3], 1.0)
        return mat
    
    def create_test_character(self, letter, pos, material, scale=1.0):
        """Create a simple test character"""
        # Main body
        bpy.ops.mesh.primitive_cube_add(location=pos, scale=(scale, scale, scale))
        obj = bpy.context.active_object
        obj.name = f"{letter}_Body"
        obj.data.materials.append(material)
        
        # Eyes
        bpy.ops.mesh.primitive_uv_sphere_add(location=(pos[0] - 0.5, pos[1] + 0.5, pos[2] + 0.5), scale=(0.3, 0.3, 0.3))
        eye = bpy.context.active_object
        eye.name = f"{letter}_Eye1"
        eye.data.materials.append(self.create_material("White", (1.0, 1.0, 1.0)))
        
        bpy.ops.mesh.primitive_uv_sphere_add(location=(pos[0] + 0.5, pos[1] + 0.5, pos[2] + 0.5), scale=(0.3, 0.3, 0.3))
        eye = bpy.context.active_object
        eye.name = f"{letter}_Eye2"
        eye.data.materials.append(self.create_material("White", (1.0, 1.0, 1.0)))
    
    def create_waterfall(self, pos, material):
        """Create a simple waterfall"""
        bpy.ops.mesh.primitive_plane_add(location=pos, scale=(15, 2, 15))
        waterfall = bpy.context.active_object
        waterfall.name = "Waterfall"
        waterfall.rotation_euler = (math.radians(90), 0, 0)
        waterfall.data.materials.append(material)
    
    def create_ground(self, material):
        """Create ground plane"""
        bpy.ops.mesh.primitive_plane_add(location=(0, 0, -2), scale=(50, 50, 1))
        ground = bpy.context.active_object
        ground.name = "Ground"
        ground.data.materials.append(material)
    
    def create_trees(self, material):
        """Create some test trees"""
        for i in range(5):
            x = (i - 2) * 10
            bpy.ops.mesh.primitive_cylinder_add(location=(x, -30, 0), scale=(1, 1, 5))
            tree = bpy.context.active_object
            tree.name = f"Tree_{i}"
            tree.data.materials.append(material)
    
    def setup_lighting(self):
        """Setup basic lighting"""
        bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))
        sun = bpy.context.active_object
        sun.data.energy = 5.0
        
        bpy.ops.object.light_add(type='AREA', location=(0, 0, 8))
        area = bpy.context.active_object
        area.data.energy = 100.0
        area.data.size = 10.0
    
    def test_camera_position(self, name, location, rotation, lens=35, focus_distance=50):
        """Test a specific camera position"""
        print(f"📷 Testing camera position: {name}")
        
        # Create camera
        bpy.ops.object.camera_add(location=location, rotation=rotation)
        camera = bpy.context.active_object
        camera.name = f"Camera_{name}"
        camera.data.lens = lens
        camera.data.clip_start = 0.1
        camera.data.clip_end = 1000.0
        
        # Setup depth of field
        camera.data.dof.use_dof = True
        camera.data.dof.focus_distance = focus_distance
        camera.data.dof.aperture_fstop = 5.6
        
        # Set as active camera
        bpy.context.scene.camera = camera
        
        # Setup render settings
        bpy.context.scene.render.engine = 'BLENDER_EEVEE'
        bpy.context.scene.render.resolution_x = 1920
        bpy.context.scene.render.resolution_y = 1080
        bpy.context.scene.render.image_settings.file_format = 'PNG'
        
        # Render
        output_path = os.path.join(self.output_dir, f"camera_test_{name}.png")
        bpy.context.scene.render.filepath = output_path
        bpy.ops.render.render(write_still=True)
        
        print(f"✅ Rendered: {output_path}")
        
        # Remove camera for next test
        bpy.data.objects.remove(camera, do_unlink=True)
    
    def run_all_tests(self):
        """Run all camera position tests"""
        print("🚀 Starting camera position tests...")
        
        # Setup the scene
        self.setup_scene()
        
        # Test different camera positions
        camera_tests = [
            # Test 1: Far back, high angle
            ("far_high", (0, -60, 45), (math.radians(25), 0, 0), 35, 50),
            
            # Test 2: Medium distance, medium angle
            ("medium_medium", (0, -40, 30), (math.radians(35), 0, 0), 40, 40),
            
            # Test 3: Closer, lower angle
            ("close_low", (0, -30, 20), (math.radians(45), 0, 0), 50, 30),
            
            # Test 4: Very far, very high
            ("very_far_high", (0, -80, 60), (math.radians(20), 0, 0), 28, 70),
            
            # Test 5: Side angle view
            ("side_view", (20, -40, 30), (math.radians(30), math.radians(15), 0), 35, 45),
            
            # Test 6: Wide angle view
            ("wide_angle", (0, -50, 35), (math.radians(30), 0, 0), 24, 50),
            
            # Test 7: Telephoto view
            ("telephoto", (0, -70, 50), (math.radians(25), 0, 0), 70, 60),
            
            # Test 8: Perfect framing (our best guess)
            ("perfect_framing", (0, -55, 40), (math.radians(28), 0, 0), 32, 55),
        ]
        
        for name, location, rotation, lens, focus in camera_tests:
            self.test_camera_position(name, location, rotation, lens, focus)
        
        print("🎉 All camera tests completed!")
        print(f"📁 Check results in: {self.output_dir}")

if __name__ == "__main__":
    tester = CameraTester()
    tester.run_all_tests()
