import bpy
import math
import os

class UltimateCascadeRender:
    def __init__(self):
        self.output_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "references_and_renders", "renders", "ultimate_cascade_render.png"
        )
        self.selected_font = 'Impact'
        self.character_scale = 8.0  # ENORMOUS characters for 100% visibility
        self.materials = {}

    # ----------------------------------------
    # SCENE SETUP
    # ----------------------------------------
    def clear_scene(self):
        print("🧹 [Clear] Scene...")
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete(use_global=False)

        for data_block in (bpy.data.meshes, bpy.data.materials, bpy.data.lights):
            for item in data_block:
                data_block.remove(item)
        print("✅ Scene cleared.")

    def setup_render_settings(self):
        print("⚙️ [Render] Configuring...")
        scene = bpy.context.scene
        scene.render.engine = 'BLENDER_EEVEE'
        scene.render.resolution_x = 3840  # 4K resolution for sharpness
        scene.render.resolution_y = 2160
        scene.render.image_settings.file_format = 'PNG'
        
        # EEVEE settings - ULTRA HIGH QUALITY
        scene.eevee.taa_render_samples = 256  # Ultra high quality
        scene.eevee.use_taa_reprojection = True
        scene.eevee.use_gtao = True
        scene.eevee.gtao_distance = 0.2
        scene.eevee.gtao_factor = 1.0
        
        # ENHANCED SHADOWS for realistic depth
        scene.eevee.use_shadows = True
        scene.eevee.shadow_cascade_size = '4096'  # Higher shadow quality
        scene.eevee.shadow_cube_size = '4096'
        
        # ADDITIONAL QUALITY SETTINGS
        scene.eevee.use_bloom = True  # Add bloom for better lighting
        scene.eevee.bloom_threshold = 1.0
        scene.eevee.bloom_intensity = 0.05

        # Color management - ENHANCED CONTRAST AND VISIBILITY
        scene.view_settings.view_transform = 'Filmic'  # More natural lighting
        scene.view_settings.look = 'High Contrast'     # Enhanced contrast for better visibility
        scene.view_settings.exposure = -0.3            # Slightly darker for better contrast
        scene.view_settings.gamma = 1.1                # Enhanced gamma for better visibility
        print("✅ Render settings applied.")

    # ----------------------------------------
    # MATERIALS
    # ----------------------------------------
    def create_material(self, name, color):
        mat = bpy.data.materials.new(name)
        mat.use_nodes = False
        mat.diffuse_color = (*color[:3], 1.0)
        return mat

    def setup_materials(self):
        print("🎨 [Materials] Creating...")
        self.materials = {
            'red': self.create_material("Red", (1.0, 0.0, 0.0)),        # PURE bright red - maximum saturation
            'pink': self.create_material("Pink", (1.0, 0.2, 0.8)),      # VIBRANT pink - maximum saturation
            'green': self.create_material("Green", (0.0, 1.0, 0.0)),    # PURE bright green - maximum saturation
            'eye': self.create_material("Eye", (1.0, 1.0, 1.0)),
            'pupil': self.create_material("Pupil", (0.0, 0.0, 0.0)),
            'ground': self.create_material("Ground", (0.7, 0.5, 0.2)),  # Natural ground color
            'rock': self.create_material("Rock", (0.5, 0.5, 0.5)),     # Natural rock color
            'water': self.create_material("Water", (0.2, 0.6, 0.9)),   # Natural blue water
            'vegetation': self.create_material("Vegetation", (0.1, 0.6, 0.1)),  # Natural green
            'sky': self.create_material("Sky", (0.4, 0.7, 1.0)),       # Natural sky blue
            'pagoda': self.create_material("Pagoda", (0.8, 0.6, 0.4)), # Natural pagoda color
            'cloud': self.create_material("Cloud", (0.9, 0.7, 0.8))    # Natural pink clouds
        }
        print("✅ Materials created.")

    # ----------------------------------------
    # LIGHTING
    # ----------------------------------------
    def setup_lighting(self):
        print("💡 [Lighting] Setting up...")

        def add_light(type, loc, energy, size=1, color=(1, 1, 1), rot=(0, 0, 0)):
            bpy.ops.object.light_add(type=type, location=loc, rotation=rot)
            light = bpy.context.active_object
            light.data.energy = energy
            light.data.color = color
            if type == 'AREA':
                light.data.size = size
            return light

        # OPTIMIZED LIGHTING FOR PERFECT VISIBILITY AND CONTRAST
        add_light('SUN', (5, 5, 10), energy=8.0, rot=(math.radians(45), math.radians(30), 0))  # Balanced sun for natural shadows
        add_light('AREA', (0, 0, 8), energy=150.0, size=20.0)  # Balanced fill light
        add_light('POINT', (0, -10, 5), energy=100.0)  # Balanced rim light
        add_light('SPOT', (-8, -6, 15), energy=80.0, rot=(math.radians(-60), 0, 0))  # Spotlight on waterfall

        print("✅ Lighting configured.")

    # ----------------------------------------
    # CAMERA
    # ----------------------------------------
    def setup_camera(self):
        print("📷 [Camera] Creating...")
        # PERFECT CAMERA POSITIONING FOR 100% VISIBILITY
        # Using the BEST framing position from analysis: dynamic_left
        # Position: (-15, -45, 30) - Optimal for character and environment visibility
        # Rotation: (30°, 10°, 0°) - Perfect angle to see characters, waterfall, and environment
        bpy.ops.object.camera_add(location=(-15, -45, 30), rotation=(math.radians(30), math.radians(10), 0))
        camera = bpy.context.active_object
        camera.data.lens = 35  # Optimal lens for this framing
        camera.data.clip_start = 0.1
        camera.data.clip_end = 1000.0  # Ensure we capture everything
        camera.data.dof.use_dof = True  # Enable depth of field
        camera.data.dof.focus_distance = 45.0  # Focus on the main scene area
        camera.data.dof.aperture_fstop = 5.6  # Nice bokeh effect
        bpy.context.scene.camera = camera
        print("✅ Camera positioned for PERFECT framing.")

    # ----------------------------------------
    # CHARACTERS
    # ----------------------------------------
    def get_font_path(self, font_name):
        font_files = {
            'Impact': 'impact.ttf',
            'Arial': 'arial.ttf',
            'Verdana': 'verdana.ttf',
            # Extend as needed
        }
        font_file = font_files.get(font_name, 'impact.ttf')
        return os.path.join("C:\\Windows\\Fonts", font_file)

    def create_character(self, letter, pos, material, scale=1.0):
        print(f"🎭 [Character] Creating {letter}...")

        # Create main letter body
        bpy.ops.object.text_add(location=pos)
        obj = bpy.context.active_object
        obj.name = f"{letter}_Body"
        obj.data.body = letter
        obj.data.size = 8.0 * scale
        obj.data.extrude = 0.2
        obj.data.bevel_depth = 0.0  # No bevel for flat look

        # Load font
        try:
            font_path = self.get_font_path(self.selected_font)
            obj.data.font = bpy.data.fonts.load(font_path)
        except Exception as e:
            print(f"⚠️ Could not load font '{self.selected_font}': {e}")

        obj.data.materials.append(material)

        # Create eyes (smaller to match reference)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.25, location=(pos[0] - 0.35, pos[1] + 0.35, pos[2] + 0.1))
        left_eye = bpy.context.active_object
        left_eye.name = f"{letter}_LeftEye"
        left_eye.scale = (1.0, 0.8, 1.0)  # Slightly flattened
        left_eye.data.materials.append(self.materials['eye'])
        
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.25, location=(pos[0] + 0.35, pos[1] + 0.35, pos[2] + 0.1))
        right_eye = bpy.context.active_object
        right_eye.name = f"{letter}_RightEye"
        right_eye.scale = (1.0, 0.8, 1.0)  # Slightly flattened
        right_eye.data.materials.append(self.materials['eye'])

        # Create pupils
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.08, location=(pos[0] - 0.35, pos[1] + 0.45, pos[2] + 0.1))
        left_pupil = bpy.context.active_object
        left_pupil.name = f"{letter}_LeftPupil"
        left_pupil.data.materials.append(self.materials['pupil'])
        
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.08, location=(pos[0] + 0.35, pos[1] + 0.45, pos[2] + 0.1))
        right_pupil = bpy.context.active_object
        right_pupil.name = f"{letter}_RightPupil"
        right_pupil.data.materials.append(self.materials['pupil'])

        # Create mouth (open expression)
        bpy.ops.mesh.primitive_cube_add(size=0.25, location=(pos[0], pos[1] + 0.15, pos[2] + 0.05))
        mouth = bpy.context.active_object
        mouth.name = f"{letter}_Mouth"
        mouth.scale = (0.7, 0.4, 0.1)  # Wide open mouth
        mouth.data.materials.append(self.materials['pupil'])

        # Create ULTRA-VISIBLE stick limbs with WATERFALL-THEMED dynamic poses
        # Left arm - WATERFALL SPLASHING POSE
        bpy.ops.mesh.primitive_cylinder_add(radius=0.25, depth=2.0, location=(pos[0] - 2.0, pos[1] + 0.5, pos[2]))
        left_arm = bpy.context.active_object
        left_arm.name = f"{letter}_LeftArm"
        left_arm.rotation_euler = (math.radians(60), math.radians(30), math.radians(45))  # Splashing pose
        left_arm.data.materials.append(self.materials['pupil'])
        
        # Right arm - WATERFALL SPLASHING POSE
        bpy.ops.mesh.primitive_cylinder_add(radius=0.25, depth=2.0, location=(pos[0] + 2.0, pos[1] + 0.5, pos[2]))
        right_arm = bpy.context.active_object
        right_arm.name = f"{letter}_RightArm"
        right_arm.rotation_euler = (math.radians(60), math.radians(-30), math.radians(-45))  # Splashing pose
        right_arm.data.materials.append(self.materials['pupil'])
        
        # Left leg - FALLING/JUMPING POSE
        bpy.ops.mesh.primitive_cylinder_add(radius=0.25, depth=2.0, location=(pos[0] - 0.8, pos[1] - 1.5, pos[2]))
        left_leg = bpy.context.active_object
        left_leg.name = f"{letter}_LeftLeg"
        left_leg.rotation_euler = (math.radians(45), 0, math.radians(20))  # Falling pose
        left_leg.data.materials.append(self.materials['pupil'])
        
        # Right leg - FALLING/JUMPING POSE
        bpy.ops.mesh.primitive_cylinder_add(radius=0.25, depth=2.0, location=(pos[0] + 0.8, pos[1] - 1.5, pos[2]))
        right_leg = bpy.context.active_object
        right_leg.name = f"{letter}_RightLeg"
        right_leg.rotation_euler = (math.radians(-45), 0, math.radians(-20))  # Falling pose
        right_leg.data.materials.append(self.materials['pupil'])

        print(f"✅ Character {letter} created.")

    def create_characters(self):
        print("🎭 [Characters] Creating A, B, C...")
        characters = [
            ('A', (-20, -25, 12), self.materials['red']),    # PERFECTLY positioned for camera view
            ('B', (0, -25, 12), self.materials['pink']),     # PERFECTLY positioned for camera view
            ('C', (20, -25, 12), self.materials['green'])    # PERFECTLY positioned for camera view
        ]
        for letter, pos, mat in characters:
            self.create_character(letter, pos, mat, scale=self.character_scale)
        print("✅ Characters created.")

    # ----------------------------------------
    # ENVIRONMENT
    # ----------------------------------------
    def create_primitive(self, type, loc, scale=(1,1,1), rot=(0,0,0), material=None):
        """Helper function to create primitives"""
        if type == 'plane':
            bpy.ops.mesh.primitive_plane_add(location=loc, scale=scale, rotation=rot)
        elif type == 'cube':
            bpy.ops.mesh.primitive_cube_add(location=loc, scale=scale, rotation=rot)
        elif type == 'cylinder':
            bpy.ops.mesh.primitive_cylinder_add(location=loc, scale=scale, rotation=rot)
        elif type == 'sphere':
            bpy.ops.mesh.primitive_uv_sphere_add(location=loc, scale=scale, rotation=rot)
        
        obj = bpy.context.active_object
        if material:
            obj.data.materials.append(material)
        return obj

    def build_waterfall(self):
        """Create the main waterfall - MUCH MORE VISIBLE"""
        print("🌊 [Waterfall] Creating PROMINENT waterfall...")
        
        # Create MASSIVE, IMPOSSIBLE-TO-MISS waterfall
        # Main waterfall - ENORMOUS and bright
        bpy.ops.mesh.primitive_plane_add(location=(-10, -15, 10), scale=(15, 2, 15))  # PERFECTLY positioned for camera
        waterfall_main = bpy.context.active_object
        waterfall_main.name = "WaterfallMain"
        waterfall_main.rotation_euler = (math.radians(90), 0, 0)  # Vertical
        waterfall_main.data.materials.append(self.materials['water'])
        
        # Additional MASSIVE waterfall layers
        waterfall_layers = [
            ((-8, -15, 8), (12, 2, 12)),   # Layer 2 - PERFECTLY positioned
            ((-12, -15, 6), (10, 2, 10)),  # Layer 3 - PERFECTLY positioned
            ((-10, -15, 4), (8, 2, 8)),    # Layer 4 - PERFECTLY positioned
        ]
        
        for i, (pos, scale) in enumerate(waterfall_layers):
            bpy.ops.mesh.primitive_plane_add(location=pos, scale=scale)
            waterfall = bpy.context.active_object
            waterfall.name = f"Waterfall_{i+2}"
            waterfall.rotation_euler = (math.radians(90), 0, 0)  # Vertical
            waterfall.data.materials.append(self.materials['water'])
        
        # ENORMOUS water pool at bottom
        bpy.ops.mesh.primitive_plane_add(location=(-10, -20, -1.5), scale=(20, 20, 1))  # PERFECTLY positioned for camera
        water_pool = bpy.context.active_object
        water_pool.name = "WaterPool"
        water_pool.data.materials.append(self.materials['water'])
        
        print("✅ PROMINENT waterfall created.")

    def build_cliffside(self):
        """Create the cliffside rocks"""
        print("🏔️ [Cliffside] Creating...")
        
        # Main cliff rocks
        rock_positions = [
            ((-10, -8, 0), (2.5, 1.5, 2.5)),
            ((-8, -6, 1), (2, 1, 2)),
            ((-6, -4, 2), (1.5, 1, 1.5))
        ]
        
        for i, (pos, scale) in enumerate(rock_positions):
            self.create_primitive('cube', pos, scale=scale, material=self.materials['rock'])
            bpy.context.active_object.name = f"CliffRock_{i+1}"
        
        # Scattered rocks
        scatter_positions = [
            (-5, -5, 0), (5, -7, 0), (3, -9, 0), (-3, -11, 0),
            (-12, -3, 0), (12, -5, 0), (-8, -7, 0), (8, -9, 0),
            (-15, -8, 0), (15, -6, 0), (-2, -13, 0), (2, -15, 0)
        ]
        
        for i, pos in enumerate(scatter_positions):
            scale = (1 + (i % 3) * 0.3, 1 + (i % 2) * 0.2, 0.8 + (i % 2) * 0.4)
            rot = (math.radians((i * 17) % 30), math.radians((i * 23) % 40), math.radians((i * 13) % 25))
            self.create_primitive('cube', pos, scale=scale, rot=rot, material=self.materials['rock'])
            bpy.context.active_object.name = f"ScatterRock_{i+1}"
        
        print("✅ Cliffside created.")

    def build_pagoda(self):
        """Create Eastern-style pagoda/temple"""
        print("🏯 [Pagoda] Creating...")
        
        # Main building
        self.create_primitive('cube', (15, -5, 1.5), scale=(2, 1.5, 2), material=self.materials['pagoda'])
        bpy.context.active_object.name = "PagodaMain"
        
        # Small building/hut
        self.create_primitive('cube', (18, -3, 1), scale=(1, 1, 1.5), material=self.materials['pagoda'])
        bpy.context.active_object.name = "PagodaHut"
        
        # Bridge structure
        self.create_primitive('cube', (10, -4, 0.5), scale=(4, 0.5, 0.3), material=self.materials['pagoda'])
        bpy.context.active_object.name = "PagodaBridge"
        
        print("✅ Pagoda created.")

    def build_trees(self):
        """Create background trees and mountains"""
        print("🌳 [Trees] Creating...")
        
        # Large trees in background
        tree_positions = [(-15, -15, 0), (-10, -18, 0), (-5, -20, 0), (5, -18, 0), (10, -16, 0), (15, -14, 0)]
        
        for i, pos in enumerate(tree_positions):
            # Tree trunk
            self.create_primitive('cylinder', (pos[0], pos[1], pos[2] + 2), scale=(0.8, 0.8, 2), material=self.materials['rock'])
            bpy.context.active_object.name = f"TreeTrunk_{i+1}"
            
            # Tree foliage
            self.create_primitive('sphere', (pos[0], pos[1], pos[2] + 4), scale=(2, 2, 3), material=self.materials['vegetation'])
            bpy.context.active_object.name = f"TreeFoliage_{i+1}"
        
        # Smaller plants and bushes
        for i in range(12):
            x = (i - 5.5) * 2
            self.create_primitive('cube', (x, -10, 0), scale=(0.8, 0.8, 2.0), material=self.materials['vegetation'])
            bpy.context.active_object.name = f"Plant_{i+1}"
        
        print("✅ Trees created.")

    def build_sky_and_clouds(self):
        """Create sky background with pink clouds"""
        print("☁️ [Sky] Creating...")
        
        # Sky background (handled by world settings)
        # Pink clouds
        cloud_positions = [(-20, -5, 15), (20, -8, 18), (0, -12, 20), (-15, -15, 16), (25, -10, 17)]
        
        for i, pos in enumerate(cloud_positions):
            scale = (3 + (i % 2) * 1, 2 + (i % 3) * 0.5, 1.5)
            self.create_primitive('sphere', pos, scale=scale, material=self.materials['cloud'])
            bpy.context.active_object.name = f"Cloud_{i+1}"
        
        print("✅ Sky and clouds created.")

    def build_foreground_branches(self):
        """Create framing branches and leaves"""
        print("🌿 [Branches] Creating...")
        
        # Foreground branch
        self.create_primitive('cylinder', (-5, -8, 3), scale=(0.3, 4, 0.3), rot=(0, 0, math.radians(15)), material=self.materials['rock'])
        bpy.context.active_object.name = "ForegroundBranch"
        
        # Leaves on branch
        leaf_positions = [(-6, -6, 3), (-4, -7, 3), (-5, -9, 3), (-7, -8, 3)]
        for i, pos in enumerate(leaf_positions):
            self.create_primitive('sphere', pos, scale=(0.8, 0.8, 0.5), material=self.materials['vegetation'])
            bpy.context.active_object.name = f"Leaf_{i+1}"
        
        print("✅ Foreground branches created.")

    def build_environment(self):
        print("🌊 [Environment] Building...")
        
        # Create ground
        self.create_primitive('plane', (0, 0, -2), scale=(40, 40, 1), material=self.materials['ground'])
        bpy.context.active_object.name = "Ground"
        
        # Build all environment components
        self.build_waterfall()
        self.build_cliffside()
        self.build_pagoda()
        self.build_trees()
        self.build_sky_and_clouds()
        self.build_foreground_branches()
        
        print("✅ Environment built.")

    def set_background(self):
        world = bpy.context.scene.world
        world.use_nodes = False
        world.color = (0.7, 0.9, 1.0)  # Sky blue background
        print("🌍 Background set.")

    # ----------------------------------------
    # RENDER
    # ----------------------------------------
    def render(self):
        print("🎨 [Render] Rendering...")
        bpy.context.scene.render.filepath = self.output_path
        bpy.ops.render.render(write_still=True)
        print(f"✅ Render saved to {self.output_path}")

    # ----------------------------------------
    # MAIN RUNNER
    # ----------------------------------------
    def run(self):
        print("🚀 Starting Ultimate Cascade Render...")
        print("=" * 50)
        
        self.clear_scene()
        self.setup_render_settings()
        self.setup_materials()
        self.setup_lighting()
        self.build_environment()
        self.create_characters()
        self.setup_camera()
        self.set_background()
        self.render()
        
        print("=" * 50)
        print("🎉 Ultimate Cascade Render Complete!")
        print("=" * 50)

# Run it
if __name__ == "__main__":
    UltimateCascadeRender().run()
