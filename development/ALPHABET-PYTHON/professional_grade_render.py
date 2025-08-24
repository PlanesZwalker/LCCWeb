#!/usr/bin/env python3
"""
Professional Grade Cascade Render
Advanced Blender techniques for professional-quality output
"""

import bpy
import math
import os

class ProfessionalGradeRender:
    def __init__(self):
        self.output_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            "references_and_renders", "renders", "professional_grade_render.png"
        )
        self.selected_font = 'Impact'
        self.character_scale = 10.0
        self.materials = {}

    # ----------------------------------------
    # SCENE SETUP
    # ----------------------------------------
    def clear_scene(self):
        print("🧹 [Clear] Scene...")
        bpy.ops.object.select_all(action='SELECT')
        bpy.ops.object.delete(use_global=False)

        for data_block in (bpy.data.meshes, bpy.data.materials, bpy.data.lights, bpy.data.textures):
            for item in data_block:
                data_block.remove(item)
        print("✅ Scene cleared.")

    def setup_render_settings(self):
        print("⚙️ [Render] Configuring professional settings...")
        scene = bpy.context.scene
        scene.render.engine = 'CYCLES'  # Use Cycles for professional quality
        scene.render.resolution_x = 3840
        scene.render.resolution_y = 2160
        scene.render.image_settings.file_format = 'PNG'
        scene.render.film_transparent = False
        
        # Professional Cycles settings
        scene.cycles.samples = 512  # High quality samples
        scene.cycles.use_denoising = True
        scene.cycles.denoiser = 'OPTIX'  # Use OptiX denoiser
        scene.cycles.max_bounces = 12
        scene.cycles.diffuse_bounces = 4
        scene.cycles.glossy_bounces = 4
        scene.cycles.transmission_bounces = 8
        scene.cycles.volume_bounces = 2
        scene.cycles.transparent_max_bounces = 8
        
        # Color management for professional look
        scene.view_settings.view_transform = 'Filmic'
        scene.view_settings.look = 'Medium High Contrast'
        scene.view_settings.exposure = 0.0
        scene.view_settings.gamma = 1.0
        
        # World settings
        world = bpy.context.scene.world
        world.use_nodes = True
        world_nodes = world.node_tree.nodes
        world_links = world.node_tree.links
        
        # Clear existing nodes
        world_nodes.clear()
        
        # Create professional sky setup
        sky_texture = world_nodes.new('ShaderNodeTexSky')
        sky_texture.sky_type = 'HOSEK_WILKIE'
        sky_texture.sun_elevation = 1.0
        sky_texture.sun_rotation = 0.5
        sky_texture.altitude = 0.0
        sky_texture.air_density = 1.0
        sky_texture.dust_density = 1.0
        
        background = world_nodes.new('ShaderNodeBackground')
        output = world_nodes.new('ShaderNodeOutputWorld')
        
        world_links.new(sky_texture.outputs['Color'], background.inputs['Color'])
        world_links.new(background.outputs['Background'], output.inputs['Surface'])
        
        print("✅ Professional render settings applied.")

    # ----------------------------------------
    # PROFESSIONAL MATERIALS
    # ----------------------------------------
    def create_pbr_material(self, name, base_color, metallic=0.0, roughness=0.5, specular=0.5):
        """Create professional PBR material"""
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        
        # Clear default nodes
        nodes.clear()
        
        # Create principled BSDF
        principled = nodes.new('ShaderNodeBsdfPrincipled')
        principled.inputs['Base Color'].default_value = (*base_color, 1.0)
        principled.inputs['Metallic'].default_value = metallic
        principled.inputs['Roughness'].default_value = roughness
        # Note: Specular input might not exist in all Blender versions
        if 'Specular' in principled.inputs:
            principled.inputs['Specular'].default_value = specular
        
        # Create output
        output = nodes.new('ShaderNodeOutputMaterial')
        
        # Link nodes
        links.new(principled.outputs['BSDF'], output.inputs['Surface'])
        
        return mat

    def create_water_material(self, name):
        """Create professional water material with transparency and caustics"""
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        
        nodes.clear()
        
        # Glass BSDF for water
        glass = nodes.new('ShaderNodeBsdfGlass')
        glass.inputs['Color'].default_value = (0.2, 0.6, 0.9, 1.0)
        glass.inputs['Roughness'].default_value = 0.0
        glass.inputs['IOR'].default_value = 1.33  # Water IOR
        
        # Mix with transparent for better water look
        transparent = nodes.new('ShaderNodeBsdfTransparent')
        mix = nodes.new('ShaderNodeMixShader')
        mix.inputs[0].default_value = 0.3
        
        output = nodes.new('ShaderNodeOutputMaterial')
        
        links.new(glass.outputs['BSDF'], mix.inputs[1])
        links.new(transparent.outputs['BSDF'], mix.inputs[2])
        links.new(mix.outputs['Shader'], output.inputs['Surface'])
        
        return mat

    def setup_materials(self):
        print("🎨 [Materials] Creating professional PBR materials...")
        self.materials = {
            'red': self.create_pbr_material("Red", (0.8, 0.1, 0.1), metallic=0.0, roughness=0.3),
            'pink': self.create_pbr_material("Pink", (0.9, 0.3, 0.7), metallic=0.0, roughness=0.3),
            'green': self.create_pbr_material("Green", (0.1, 0.8, 0.1), metallic=0.0, roughness=0.3),
            'eye': self.create_pbr_material("Eye", (1.0, 1.0, 1.0), metallic=0.0, roughness=0.1),
            'pupil': self.create_pbr_material("Pupil", (0.0, 0.0, 0.0), metallic=0.0, roughness=0.0),
            'ground': self.create_pbr_material("Ground", (0.4, 0.3, 0.2), metallic=0.0, roughness=0.8),
            'rock': self.create_pbr_material("Rock", (0.3, 0.3, 0.3), metallic=0.0, roughness=0.9),
            'water': self.create_water_material("Water"),
            'vegetation': self.create_pbr_material("Vegetation", (0.1, 0.5, 0.1), metallic=0.0, roughness=0.7),
            'pagoda': self.create_pbr_material("Pagoda", (0.6, 0.4, 0.2), metallic=0.0, roughness=0.6),
            'cloud': self.create_pbr_material("Cloud", (0.9, 0.8, 0.9), metallic=0.0, roughness=0.2)
        }
        print("✅ Professional materials created.")

    # ----------------------------------------
    # PROFESSIONAL LIGHTING
    # ----------------------------------------
    def setup_lighting(self):
        print("💡 [Lighting] Setting up professional lighting...")

        def add_light(type, loc, energy, size=1, color=(1, 1, 1), rot=(0, 0, 0)):
            bpy.ops.object.light_add(type=type, location=loc, rotation=rot)
            light = bpy.context.active_object
            light.data.energy = energy
            light.data.color = color
            if type == 'AREA':
                light.data.size = size
                light.data.size_y = size
            return light

        # Professional three-point lighting setup
        # Key light (main light)
        key_light = add_light('SUN', (10, -20, 15), energy=5.0, rot=(math.radians(45), math.radians(-30), 0))
        key_light.data.color = (1.0, 0.95, 0.9)  # Warm key light
        
        # Fill light (soft fill)
        fill_light = add_light('AREA', (-15, -10, 8), energy=2.0, size=8.0, rot=(math.radians(30), math.radians(60), 0))
        fill_light.data.color = (0.9, 0.95, 1.0)  # Cool fill light
        
        # Rim light (backlight)
        rim_light = add_light('SPOT', (0, 20, 12), energy=3.0, rot=(math.radians(-60), 0, 0))
        rim_light.data.color = (1.0, 1.0, 1.0)
        rim_light.data.spot_size = math.radians(45)
        
        # Waterfall accent light
        waterfall_light = add_light('SPOT', (-10, -15, 20), energy=2.0, rot=(math.radians(-80), 0, 0))
        waterfall_light.data.color = (0.8, 0.9, 1.0)  # Blue tint for water
        waterfall_light.data.spot_size = math.radians(30)

        print("✅ Professional lighting configured.")

    # ----------------------------------------
    # PROFESSIONAL CAMERA
    # ----------------------------------------
    def setup_camera(self):
        print("📷 [Camera] Creating professional camera...")
        
        # Professional camera positioning
        bpy.ops.object.camera_add(location=(-8, -30, 20), rotation=(math.radians(25), math.radians(5), 0))
        camera = bpy.context.active_object
        camera.data.lens = 50  # Standard professional lens
        camera.data.clip_start = 0.1
        camera.data.clip_end = 1000.0
        
        # Professional depth of field
        camera.data.dof.use_dof = True
        camera.data.dof.focus_distance = 25.0
        camera.data.dof.aperture_fstop = 2.8  # Shallow depth of field for professional look
        camera.data.dof.aperture_blades = 6
        
        bpy.context.scene.camera = camera
        print("✅ Professional camera configured.")

    # ----------------------------------------
    # CHARACTERS WITH PROFESSIONAL DETAIL
    # ----------------------------------------
    def get_font_path(self, font_name):
        font_files = {
            'Impact': 'impact.ttf',
            'Arial': 'arial.ttf',
            'Verdana': 'verdana.ttf',
        }
        font_file = font_files.get(font_name, 'impact.ttf')
        return os.path.join("C:\\Windows\\Fonts", font_file)

    def create_character(self, letter, pos, material, scale=1.0):
        print(f"🎭 [Character] Creating professional {letter}...")

        # Create main letter body with professional detail
        bpy.ops.object.text_add(location=pos)
        obj = bpy.context.active_object
        obj.name = f"{letter}_Body"
        obj.data.body = letter
        obj.data.size = 8.0 * scale
        obj.data.extrude = 0.3  # Slight extrusion for depth
        obj.data.bevel_depth = 0.05  # Subtle bevel for professional look
        obj.data.bevel_resolution = 3

        # Load font
        try:
            font_path = self.get_font_path(self.selected_font)
            obj.data.font = bpy.data.fonts.load(font_path)
        except Exception as e:
            print(f"⚠️ Could not load font '{self.selected_font}': {e}")

        obj.data.materials.append(material)

        # Professional eyes with proper anatomy
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.3, location=(pos[0] - 0.4, pos[1] + 0.4, pos[2] + 0.15))
        left_eye = bpy.context.active_object
        left_eye.name = f"{letter}_LeftEye"
        left_eye.scale = (1.0, 0.7, 1.0)  # Realistic eye shape
        left_eye.data.materials.append(self.materials['eye'])
        
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.3, location=(pos[0] + 0.4, pos[1] + 0.4, pos[2] + 0.15))
        right_eye = bpy.context.active_object
        right_eye.name = f"{letter}_RightEye"
        right_eye.scale = (1.0, 0.7, 1.0)
        right_eye.data.materials.append(self.materials['eye'])

        # Professional pupils
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.1, location=(pos[0] - 0.4, pos[1] + 0.5, pos[2] + 0.15))
        left_pupil = bpy.context.active_object
        left_pupil.name = f"{letter}_LeftPupil"
        left_pupil.data.materials.append(self.materials['pupil'])
        
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.1, location=(pos[0] + 0.4, pos[1] + 0.5, pos[2] + 0.15))
        right_pupil = bpy.context.active_object
        right_pupil.name = f"{letter}_RightPupil"
        right_pupil.data.materials.append(self.materials['pupil'])

        # Professional mouth
        bpy.ops.mesh.primitive_cube_add(size=0.3, location=(pos[0], pos[1] + 0.2, pos[2] + 0.1))
        mouth = bpy.context.active_object
        mouth.name = f"{letter}_Mouth"
        mouth.scale = (0.8, 0.5, 0.15)
        mouth.data.materials.append(self.materials['pupil'])

        # Professional limbs with proper proportions
        # Arms
        bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=2.0, location=(pos[0] - 1.5, pos[1] + 0.3, pos[2]))
        left_arm = bpy.context.active_object
        left_arm.name = f"{letter}_LeftArm"
        left_arm.rotation_euler = (math.radians(45), math.radians(20), math.radians(30))
        left_arm.data.materials.append(self.materials['pupil'])
        
        bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=2.0, location=(pos[0] + 1.5, pos[1] + 0.3, pos[2]))
        right_arm = bpy.context.active_object
        right_arm.name = f"{letter}_RightArm"
        right_arm.rotation_euler = (math.radians(45), math.radians(-20), math.radians(-30))
        right_arm.data.materials.append(self.materials['pupil'])
        
        # Legs
        bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=2.0, location=(pos[0] - 0.6, pos[1] - 1.2, pos[2]))
        left_leg = bpy.context.active_object
        left_leg.name = f"{letter}_LeftLeg"
        left_leg.rotation_euler = (math.radians(30), 0, math.radians(15))
        left_leg.data.materials.append(self.materials['pupil'])
        
        bpy.ops.mesh.primitive_cylinder_add(radius=0.2, depth=2.0, location=(pos[0] + 0.6, pos[1] - 1.2, pos[2]))
        right_leg = bpy.context.active_object
        right_leg.name = f"{letter}_RightLeg"
        right_leg.rotation_euler = (math.radians(-30), 0, math.radians(-15))
        right_leg.data.materials.append(self.materials['pupil'])

        print(f"✅ Professional character {letter} created.")

    def create_characters(self):
        print("🎭 [Characters] Creating professional A, B, C...")
        characters = [
            ('A', (-15, -20, 10), self.materials['red']),
            ('B', (0, -20, 10), self.materials['pink']),
            ('C', (15, -20, 10), self.materials['green'])
        ]
        for letter, pos, mat in characters:
            self.create_character(letter, pos, mat, scale=self.character_scale)
        print("✅ Professional characters created.")

    # ----------------------------------------
    # PROFESSIONAL ENVIRONMENT
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
        """Create professional waterfall with multiple layers"""
        print("🌊 [Waterfall] Creating professional waterfall...")
        
        # Main waterfall with professional detail
        bpy.ops.mesh.primitive_plane_add(location=(-10, -12, 8), scale=(12, 1.5, 12))
        waterfall_main = bpy.context.active_object
        waterfall_main.name = "WaterfallMain"
        waterfall_main.rotation_euler = (math.radians(90), 0, 0)
        waterfall_main.data.materials.append(self.materials['water'])
        
        # Additional waterfall layers for depth
        waterfall_layers = [
            ((-8, -12, 6), (10, 1.5, 10)),
            ((-12, -12, 4), (8, 1.5, 8)),
            ((-10, -12, 2), (6, 1.5, 6)),
        ]
        
        for i, (pos, scale) in enumerate(waterfall_layers):
            bpy.ops.mesh.primitive_plane_add(location=pos, scale=scale)
            waterfall = bpy.context.active_object
            waterfall.name = f"Waterfall_{i+2}"
            waterfall.rotation_euler = (math.radians(90), 0, 0)
            waterfall.data.materials.append(self.materials['water'])
        
        # Professional water pool
        bpy.ops.mesh.primitive_plane_add(location=(-10, -18, -1), scale=(15, 15, 1))
        water_pool = bpy.context.active_object
        water_pool.name = "WaterPool"
        water_pool.data.materials.append(self.materials['water'])
        
        print("✅ Professional waterfall created.")

    def build_cliffside(self):
        """Create professional cliffside with detail"""
        print("🏔️ [Cliffside] Creating professional cliffside...")
        
        # Main cliff rocks with professional detail
        rock_positions = [
            ((-10, -8, 0), (2, 1.5, 2)),
            ((-8, -6, 1), (1.5, 1, 1.5)),
            ((-6, -4, 2), (1, 0.8, 1)),
        ]
        
        for i, (pos, scale) in enumerate(rock_positions):
            self.create_primitive('cube', pos, scale=scale, material=self.materials['rock'])
            bpy.context.active_object.name = f"CliffRock_{i+1}"
        
        # Scattered rocks for natural look
        scatter_positions = [
            (-5, -5, 0), (5, -7, 0), (3, -9, 0), (-3, -11, 0),
            (-12, -3, 0), (12, -5, 0), (-8, -7, 0), (8, -9, 0),
        ]
        
        for i, pos in enumerate(scatter_positions):
            scale = (0.8 + (i % 3) * 0.2, 0.8 + (i % 2) * 0.15, 0.6 + (i % 2) * 0.3)
            rot = (math.radians((i * 17) % 25), math.radians((i * 23) % 30), math.radians((i * 13) % 20))
            self.create_primitive('cube', pos, scale=scale, rot=rot, material=self.materials['rock'])
            bpy.context.active_object.name = f"ScatterRock_{i+1}"
        
        print("✅ Professional cliffside created.")

    def build_pagoda(self):
        """Create professional Eastern pagoda"""
        print("🏯 [Pagoda] Creating professional pagoda...")
        
        # Main building with professional detail
        self.create_primitive('cube', (12, -3, 1.5), scale=(2.5, 1.8, 2.5), material=self.materials['pagoda'])
        bpy.context.active_object.name = "PagodaMain"
        
        # Small building
        self.create_primitive('cube', (15, -1, 1), scale=(1.2, 1.2, 1.8), material=self.materials['pagoda'])
        bpy.context.active_object.name = "PagodaHut"
        
        # Bridge structure
        self.create_primitive('cube', (8, -2, 0.5), scale=(3.5, 0.6, 0.4), material=self.materials['pagoda'])
        bpy.context.active_object.name = "PagodaBridge"
        
        print("✅ Professional pagoda created.")

    def build_trees(self):
        """Create professional trees and vegetation"""
        print("🌳 [Trees] Creating professional trees...")
        
        # Professional trees
        tree_positions = [(-12, -12, 0), (-8, -15, 0), (-4, -18, 0), (4, -15, 0), (8, -12, 0), (12, -10, 0)]
        
        for i, pos in enumerate(tree_positions):
            # Tree trunk
            self.create_primitive('cylinder', (pos[0], pos[1], pos[2] + 1.5), scale=(0.6, 0.6, 1.5), material=self.materials['rock'])
            bpy.context.active_object.name = f"TreeTrunk_{i+1}"
            
            # Tree foliage
            self.create_primitive('sphere', (pos[0], pos[1], pos[2] + 3), scale=(1.8, 1.8, 2.5), material=self.materials['vegetation'])
            bpy.context.active_object.name = f"TreeFoliage_{i+1}"
        
        # Professional ground vegetation
        for i in range(8):
            x = (i - 3.5) * 2.5
            self.create_primitive('cube', (x, -8, 0), scale=(0.6, 0.6, 1.5), material=self.materials['vegetation'])
            bpy.context.active_object.name = f"Plant_{i+1}"
        
        print("✅ Professional trees created.")

    def build_sky_and_clouds(self):
        """Create professional sky and clouds"""
        print("☁️ [Sky] Creating professional sky and clouds...")
        
        # Professional clouds
        cloud_positions = [(-15, -3, 12), (15, -6, 15), (0, -10, 18), (-12, -12, 14), (18, -8, 16)]
        
        for i, pos in enumerate(cloud_positions):
            scale = (2.5 + (i % 2) * 0.8, 2 + (i % 3) * 0.5, 1.2)
            self.create_primitive('sphere', pos, scale=scale, material=self.materials['cloud'])
            bpy.context.active_object.name = f"Cloud_{i+1}"
        
        print("✅ Professional sky and clouds created.")

    def build_foreground_branches(self):
        """Create professional foreground elements"""
        print("🌿 [Branches] Creating professional foreground...")
        
        # Foreground branch
        self.create_primitive('cylinder', (-4, -6, 2), scale=(0.2, 3, 0.2), rot=(0, 0, math.radians(10)), material=self.materials['rock'])
        bpy.context.active_object.name = "ForegroundBranch"
        
        # Leaves
        leaf_positions = [(-5, -4, 2), (-3, -5, 2), (-4, -7, 2)]
        for i, pos in enumerate(leaf_positions):
            self.create_primitive('sphere', pos, scale=(0.6, 0.6, 0.4), material=self.materials['vegetation'])
            bpy.context.active_object.name = f"Leaf_{i+1}"
        
        print("✅ Professional foreground created.")

    def build_environment(self):
        print("🌊 [Environment] Building professional environment...")
        
        # Professional ground
        self.create_primitive('plane', (0, 0, -2), scale=(30, 30, 1), material=self.materials['ground'])
        bpy.context.active_object.name = "Ground"
        
        # Build all environment components
        self.build_waterfall()
        self.build_cliffside()
        self.build_pagoda()
        self.build_trees()
        self.build_sky_and_clouds()
        self.build_foreground_branches()
        
        print("✅ Professional environment built.")

    # ----------------------------------------
    # RENDER
    # ----------------------------------------
    def render(self):
        print("🎨 [Render] Rendering professional image...")
        bpy.context.scene.render.filepath = self.output_path
        bpy.ops.render.render(write_still=True)
        print(f"✅ Professional render saved to {self.output_path}")

    # ----------------------------------------
    # MAIN RUNNER
    # ----------------------------------------
    def run(self):
        print("🚀 Starting Professional Grade Render...")
        print("=" * 60)
        
        self.clear_scene()
        self.setup_render_settings()
        self.setup_materials()
        self.setup_lighting()
        self.build_environment()
        self.create_characters()
        self.setup_camera()
        self.render()
        
        print("=" * 60)
        print("🎉 Professional Grade Render Complete!")
        print("=" * 60)

# Run it
if __name__ == "__main__":
    ProfessionalGradeRender().run()
