# DEVELOPMENT CHECKLIST
## Quick Reference for Letters Cascade Challenge

### 🚀 BEFORE STARTING DEVELOPMENT

- [ ] Check Blender installation path
- [ ] Verify PowerShell syntax for Blender execution
- [ ] Clear previous scene data properly
- [ ] Set up development render settings (low quality, fast)

### 🔧 MATERIAL CREATION

- [ ] Use only confirmed available Principled BSDF inputs
- [ ] Test material inputs in Blender UI first
- [ ] Avoid: 'Subsurface', 'Specular' (check version compatibility)
- [ ] Use: 'Base Color', 'Roughness', 'Metallic', 'IOR'
- [ ] Always provide fallback for emission materials

### 🎬 ANIMATION SETUP

- [ ] Never animate `pose.bones` collection directly
- [ ] Animate individual bone properties: `rotation_euler`
- [ ] Use proper keyframe insertion: `bone.keyframe_insert(data_path="rotation_euler")`
- [ ] Set frame range before animation

### 💡 LIGHTING SETUP

- [ ] Use 3-point lighting system
- [ ] Key light: Main illumination (20.0 energy)
- [ ] Fill light: Soften shadows (8.0 energy)
- [ ] Rim light: Character separation (15.0 energy)
- [ ] Bounce light: Ground reflection (3.0 energy)
- [ ] Accent lights: Extra drama (12.0 energy each)

### 📷 CAMERA SETUP

- [ ] Position: (0, -18, 12) for balanced composition
- [ ] Angle: 35° for professional look
- [ ] Lens: 32mm for good field of view
- [ ] Focus distance: 18 units
- [ ] Disable DOF during development

### 🎨 RENDER SETTINGS

#### Development Mode
- [ ] Samples: 64-128
- [ ] Resolution: 1280x720
- [ ] Render only frame 1
- [ ] Basic denoising

#### Final Quality
- [ ] Samples: 256+
- [ ] Resolution: 1920x1080
- [ ] Advanced denoising (OPTIX fallback)
- [ ] Filmic color management
- [ ] High contrast look

### 🧹 SCENE CLEANUP

```python
# ALWAYS use this pattern
for material in bpy.data.materials:
    bpy.data.materials.remove(material)
for mesh in bpy.data.meshes:
    bpy.data.meshes.remove(mesh)
for armature in bpy.data.armatures:
    bpy.data.armatures.remove(armature)
```

### 🔍 VALIDATION CHECKS

- [ ] Verify character creation (26 total)
- [ ] Check material assignment
- [ ] Validate bone hierarchy
- [ ] Confirm lighting setup
- [ ] Test camera framing
- [ ] Verify render output

### 🚫 NEVER DO THESE

- [ ] Use `.clear()` on Blender collections
- [ ] Animate `pose.bones` collection
- [ ] Assume material inputs exist
- [ ] Skip error handling
- [ ] Use high-quality renders during development
- [ ] Forget to validate object creation
- [ ] Use PowerShell syntax without testing
- [ ] Assume Blender is in PATH

### ✅ ALWAYS DO THESE

- [ ] Use try-except blocks for critical operations
- [ ] Provide fallback options
- [ ] Test each component individually
- [ ] Document all changes
- [ ] Validate before proceeding
- [ ] Use iterative development approach
- [ ] Check console output for errors
- [ ] Analyze render quality

### 📊 QUALITY METRICS

- [ ] Render time: 1-2 min (dev), 5-10 min (final)
- [ ] File size: 6-9 MB for high quality
- [ ] Character visibility: All 26 clearly visible
- [ ] Lighting: Professional 3-point setup
- [ ] Composition: Balanced and cinematic
- [ ] Materials: ArtStation-quality appearance

### 🔄 ITERATION PROCESS

1. [ ] Identify issue from render/console
2. [ ] Apply targeted fix
3. [ ] Test with development settings
4. [ ] Validate fix resolves issue
5. [ ] Document in error log
6. [ ] Iterate until quality achieved

### 📁 FILE ORGANIZATION

- [ ] Keep only essential files
- [ ] Single main script: `letters_cascade_challenge.py`
- [ ] Reference documents: Error log, Checklist
- [ ] Clean up test renders regularly
- [ ] Maintain organized folder structure

---

**Use this checklist before every development session to prevent common errors!**
