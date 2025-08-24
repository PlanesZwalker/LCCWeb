#!/usr/bin/env python3
"""
Camera Framing Analyzer
Comprehensive camera positioning and framing analysis for 100% success
"""

import bpy
import math
import os

class CameraFramingAnalyzer:
    def __init__(self):
        self.output_dir = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "references_and_renders", "framing_tests"
        )
        os.makedirs(self.output_dir, exist_ok=True)
        self.best_framing = None
        self.best_score = 0
        
    def setup_test_scene(self):
        """Create a comprehensive test scene with all elements"""
        print("🎬 Setting up comprehensive test scene...")
        
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
            'pagoda': self.create_material("Pagoda", (0.8, 0.6, 0.4)),
            'vegetation': self.create_material("Vegetation", (0.1, 0.6, 0.1)),
            'cloud': self.create_material("Cloud", (0.9, 0.7, 0.8)),
        }
        
        # Create characters (A, B, C) - PERFECTLY positioned
        self.create_test_character('A', (-20, -25, 12), materials['red'], scale=8.0)
        self.create_test_character('B', (0, -25, 12), materials['pink'], scale=8.0)
        self.create_test_character('C', (20, -25, 12), materials['green'], scale=8.0)
        
        # Create waterfall - PROMINENT and visible
        self.create_waterfall((-10, -15, 10), materials['water'])
        
        # Create pagoda - VISIBLE and prominent
        self.create_pagoda((10, -15, 5), materials['pagoda'])
        
        # Create environment elements
        self.create_ground(materials['rock'])
        self.create_trees(materials['vegetation'])
        self.create_clouds(materials['cloud'])
        
        # Setup lighting
        self.setup_lighting()
        print("✅ Comprehensive test scene created.")
        
    def create_material(self, name, color):
        mat = bpy.data.materials.new(name)
        mat.use_nodes = False
        mat.diffuse_color = (*color[:3], 1.0)
        return mat
        
    def create_test_character(self, letter, pos, material, scale=1.0):
        """Create a comprehensive test character with all features"""
        # Main body
        bpy.ops.mesh.primitive_cube_add(location=pos, scale=(scale, scale, scale))
        obj = bpy.context.active_object
        obj.name = f"{letter}_Body"
        obj.data.materials.append(material)
        
        # Eyes - VISIBLE
        bpy.ops.mesh.primitive_uv_sphere_add(location=(pos[0] - 0.5, pos[1] + 0.5, pos[2] + 0.5), scale=(0.3, 0.3, 0.3))
        eye = bpy.context.active_object
        eye.name = f"{letter}_Eye1"
        eye.data.materials.append(self.create_material("White", (1.0, 1.0, 1.0)))
        
        bpy.ops.mesh.primitive_uv_sphere_add(location=(pos[0] + 0.5, pos[1] + 0.5, pos[2] + 0.5), scale=(0.3, 0.3, 0.3))
        eye = bpy.context.active_object
        eye.name = f"{letter}_Eye2"
        eye.data.materials.append(self.create_material("White", (1.0, 1.0, 1.0)))
        
        # Mouth - LARGE and VISIBLE
        bpy.ops.mesh.primitive_cube_add(location=(pos[0], pos[1] + 0.3, pos[2] + 0.2), scale=(0.8, 0.4, 0.2))
        mouth = bpy.context.active_object
        mouth.name = f"{letter}_Mouth"
        mouth.data.materials.append(self.create_material("Black", (0.0, 0.0, 0.0)))
        
        # Limbs - VISIBLE
        bpy.ops.mesh.primitive_cylinder_add(location=(pos[0] - 1.5, pos[1], pos[2]), scale=(0.2, 0.2, 1.5))
        arm = bpy.context.active_object
        arm.name = f"{letter}_Arm1"
        arm.data.materials.append(self.create_material("Black", (0.0, 0.0, 0.0)))
        
        bpy.ops.mesh.primitive_cylinder_add(location=(pos[0] + 1.5, pos[1], pos[2]), scale=(0.2, 0.2, 1.5))
        arm = bpy.context.active_object
        arm.name = f"{letter}_Arm2"
        arm.data.materials.append(self.create_material("Black", (0.0, 0.0, 0.0)))
        
    def create_waterfall(self, pos, material):
        """Create a prominent waterfall"""
        # Main waterfall
        bpy.ops.mesh.primitive_plane_add(location=pos, scale=(15, 2, 15))
        waterfall = bpy.context.active_object
        waterfall.name = "Waterfall"
        waterfall.rotation_euler = (math.radians(90), 0, 0)
        waterfall.data.materials.append(material)
        
        # Water pool
        bpy.ops.mesh.primitive_plane_add(location=(pos[0], pos[1] - 5, -1), scale=(20, 20, 1))
        pool = bpy.context.active_object
        pool.name = "WaterPool"
        pool.data.materials.append(material)
        
    def create_pagoda(self, pos, material):
        """Create a visible pagoda"""
        # Main building
        bpy.ops.mesh.primitive_cube_add(location=pos, scale=(3, 2, 4))
        pagoda = bpy.context.active_object
        pagoda.name = "PagodaMain"
        pagoda.data.materials.append(material)
        
        # Roof
        bpy.ops.mesh.primitive_cube_add(location=(pos[0], pos[1], pos[2] + 3), scale=(3.5, 2.5, 1))
        roof = bpy.context.active_object
        roof.name = "PagodaRoof"
        roof.data.materials.append(material)
        
    def create_ground(self, material):
        """Create ground plane"""
        bpy.ops.mesh.primitive_plane_add(location=(0, 0, -2), scale=(50, 50, 1))
        ground = bpy.context.active_object
        ground.name = "Ground"
        ground.data.materials.append(material)
        
    def create_trees(self, material):
        """Create visible trees"""
        for i in range(6):
            x = (i - 2.5) * 8
            bpy.ops.mesh.primitive_cylinder_add(location=(x, -30, 0), scale=(1, 1, 6))
            tree = bpy.context.active_object
            tree.name = f"Tree_{i}"
            tree.data.materials.append(material)
            
    def create_clouds(self, material):
        """Create visible clouds"""
        for i in range(5):
            x = (i - 2) * 10
            bpy.ops.mesh.primitive_uv_sphere_add(location=(x, -10, 20), scale=(3, 2, 1))
            cloud = bpy.context.active_object
            cloud.name = f"Cloud_{i}"
            cloud.data.materials.append(material)
            
    def setup_lighting(self):
        """Setup comprehensive lighting"""
        bpy.ops.object.light_add(type='SUN', location=(5, 5, 10))
        sun = bpy.context.active_object
        sun.data.energy = 8.0
        
        bpy.ops.object.light_add(type='AREA', location=(0, 0, 8))
        area = bpy.context.active_object
        area.data.energy = 200.0
        area.data.size = 15.0
        
    def test_camera_framing(self, name, location, rotation, lens=35, focus_distance=50):
        """Test a specific camera framing"""
        print(f"📷 Testing camera framing: {name}")
        
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
        output_path = os.path.join(self.output_dir, f"framing_test_{name}.png")
        bpy.context.scene.render.filepath = output_path
        bpy.ops.render.render(write_still=True)
        print(f"✅ Rendered: {output_path}")
        
        # Remove camera for next test
        bpy.data.objects.remove(camera, do_unlink=True)
        
    def run_comprehensive_framing_tests(self):
        """Run comprehensive camera framing tests"""
        print("🚀 Starting comprehensive camera framing tests...")
        
        # Setup the scene
        self.setup_test_scene()
        
        # Define comprehensive camera positions for perfect framing
        framing_tests = [
            # Perfect framing positions
            ("perfect_center", (0, -55, 40), (math.radians(28), 0, 0), 32, 55),
            ("perfect_left", (-10, -50, 35), (math.radians(30), math.radians(5), 0), 35, 50),
            ("perfect_right", (10, -50, 35), (math.radians(30), math.radians(-5), 0), 35, 50),
            
            # Character-focused positions
            ("character_close", (0, -40, 25), (math.radians(35), 0, 0), 40, 40),
            ("character_wide", (0, -60, 45), (math.radians(25), 0, 0), 28, 60),
            
            # Environment-focused positions
            ("environment_wide", (0, -70, 50), (math.radians(22), 0, 0), 24, 70),
            ("environment_high", (0, -50, 60), (math.radians(15), 0, 0), 35, 50),
            
            # Balanced positions
            ("balanced_1", (0, -45, 30), (math.radians(32), 0, 0), 36, 45),
            ("balanced_2", (0, -65, 40), (math.radians(26), 0, 0), 30, 65),
            ("balanced_3", (0, -55, 35), (math.radians(30), 0, 0), 33, 55),
            
            # Dynamic angles
            ("dynamic_left", (-15, -45, 30), (math.radians(30), math.radians(10), 0), 35, 45),
            ("dynamic_right", (15, -45, 30), (math.radians(30), math.radians(-10), 0), 35, 45),
            
            # Cinematic positions
            ("cinematic_low", (0, -35, 20), (math.radians(40), 0, 0), 45, 35),
            ("cinematic_high", (0, -75, 55), (math.radians(20), 0, 0), 25, 75),
        ]
        
        for name, location, rotation, lens, focus in framing_tests:
            self.test_camera_framing(name, location, rotation, lens, focus)
            
        print("🎉 All framing tests completed!")
        print(f"📁 Check results in: {self.output_dir}")
        
    def analyze_framing_results(self):
        """Analyze the framing test results"""
        print("🔍 Analyzing framing results...")
        
        # This would typically use Ollama to analyze each render
        # For now, we'll provide a framework for analysis
        analysis_criteria = {
            "character_visibility": "Are all 3 characters (A, B, C) clearly visible?",
            "character_positioning": "Are characters properly positioned in frame?",
            "waterfall_visibility": "Is the waterfall clearly visible and prominent?",
            "pagoda_visibility": "Is the pagoda clearly visible?",
            "environment_balance": "Is the environment well-balanced in the frame?",
            "composition_quality": "Is the overall composition professional?",
            "technical_quality": "Is the image sharp and well-lit?",
        }
        
        print("📊 Framing Analysis Criteria:")
        for criterion, description in analysis_criteria.items():
            print(f"   • {criterion}: {description}")
            
        print("\n🎯 Next steps:")
        print("   1. Review all framing test renders")
        print("   2. Identify the best framing position")
        print("   3. Apply the best camera settings to main script")
        print("   4. Run final render with perfect framing")

def main():
    """Main function"""
    analyzer = CameraFramingAnalyzer()
    analyzer.run_comprehensive_framing_tests()
    analyzer.analyze_framing_results()

if __name__ == "__main__":
    main()

