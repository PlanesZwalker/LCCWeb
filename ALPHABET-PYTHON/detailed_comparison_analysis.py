#!/usr/bin/env python3
"""
Ultra-detailed comparison analysis between our render and the reference image
"""

import sys
import os
from ollama_vision_analyzer import OllamaVisionAnalyzer

def detailed_comparison_analysis():
    """Get ultra-detailed comparison between our render and reference"""
    analyzer = OllamaVisionAnalyzer()
    
    # Test connection
    if not analyzer.test_ollama_connection():
        print("❌ Cannot connect to Ollama. Make sure it's running: ollama serve")
        return
    
    # EXHAUSTIVE ULTRA-DETAILED ANALYSIS PROMPT WITH MEASUREMENTS
    detailed_prompt = """
    CRITICAL TASK: Provide an EXHAUSTIVE, BRUTALLY HONEST, PIXEL-PERFECT analysis of this 3D Blender render.

    CONTEXT: This is a 3D recreation of a 2D illustration featuring cartoon alphabet characters A, B, C in a waterfall environment with Eastern pagoda architecture.

    REFERENCE 2D ILLUSTRATION SPECIFICATIONS:
    
    CHARACTER SPECIFICATIONS:
    - Letter A: RED cartoon character (RGB: 255, 50, 50) with:
      * Size: Approximately 15% of total image height
      * Eyes: Two large round white eyes with black pupils, each eye ~8% of character width
      * Mouth: Wide open black mouth, ~12% of character width
      * Limbs: Four thin black stick limbs (arms and legs), each ~20% of character height
      * Position: Left side of frame, falling/jumping pose
      * Style: Flat 2D cartoon with no shading or gradients
    
    - Letter B: PINK cartoon character (RGB: 255, 100, 180) with:
      * Size: Same as Letter A (15% of total image height)
      * Eyes: Identical to Letter A (two large round white eyes with black pupils)
      * Mouth: Identical to Letter A (wide open black mouth)
      * Limbs: Identical to Letter A (four thin black stick limbs)
      * Position: Center of frame, falling/jumping pose
      * Style: Flat 2D cartoon with no shading or gradients
    
    - Letter C: GREEN cartoon character (RGB: 50, 200, 50) with:
      * Size: Same as Letters A and B (15% of total image height)
      * Eyes: Identical to other letters (two large round white eyes with black pupils)
      * Mouth: Identical to other letters (wide open black mouth)
      * Limbs: Identical to other letters (four thin black stick limbs)
      * Position: Right side of frame, falling/jumping pose
      * Style: Flat 2D cartoon with no shading or gradients
    
    ENVIRONMENT SPECIFICATIONS:
    - WATERFALL: 
      * Size: Occupies ~25% of image width, ~40% of image height
      * Color: Bright blue/white (RGB: 100, 180, 255)
      * Position: Center-left of frame, cascading from top to bottom
      * Style: Multiple visible layers with white foam/water effects
    
    - CLIFFSIDE:
      * Size: Occupies ~60% of image width, ~30% of image height
      * Color: Various grays and browns (RGB: 120-180 range)
      * Position: Behind and around waterfall
      * Style: Rocky texture with visible individual rocks
    
    - PAGODA/TEMPLE:
      * Size: ~8% of image width, ~12% of image height
      * Color: Traditional red/brown (RGB: 180, 100, 50)
      * Position: Right side of frame, on cliffside
      * Style: Eastern architecture with visible details
    
    - TREES:
      * Size: Various, largest ~10% of image height
      * Color: Green foliage (RGB: 50, 150, 50)
      * Position: Background and foreground
      * Style: Stylized cartoon trees with visible leaves
    
    - CLOUDS:
      * Size: ~15% of image width each
      * Color: Pink/white (RGB: 255, 200, 220)
      * Position: Sky background
      * Style: Soft, fluffy cartoon clouds
    
    - SKY:
      * Color: Light blue (RGB: 150, 200, 255)
      * Coverage: Entire background
      * Style: Flat color with no gradients
    
         COMPOSITION SPECIFICATIONS:
     - Image aspect ratio: 16:9 or similar wide format
     - Character positioning: All three characters at similar height, evenly spaced
     - Depth: Characters in foreground, waterfall in mid-ground, pagoda/trees in background
     - Lighting: Even, flat lighting with no dramatic shadows
     - Overall style: 2D cartoon aesthetic with flat colors, minimal shading, childlike/playful appearance

     CURRENT 3D SCRIPT SPECIFICATIONS (What our script creates):
     
     RENDER SETTINGS:
     - Resolution: 3840x2160 (4K)
     - Engine: EEVEE with 256 samples
     - Shadows: Enabled with 4096 quality
     - Bloom: Enabled for lighting effects
     - Color management: Filmic with Medium Contrast
     
     CHARACTER CREATION (What our script builds):
     - Letter A: Position (-10, -15, 5), Scale 5.0x, RED material (0.8, 0.1, 0.1)
     - Letter B: Position (0, -15, 5), Scale 5.0x, PINK material (0.9, 0.3, 0.7)
     - Letter C: Position (10, -15, 5), Scale 5.0x, GREEN material (0.1, 0.7, 0.1)
     - Each character has: 2 white eyes, 2 black pupils, 1 black mouth, 4 black stick limbs
     - Font: Impact, Size: 8.0 * 5.0 = 40.0, Extrude: 0.2
     
     WATERFALL CREATION (What our script builds):
     - WaterfallMain: Position (-8, -6, 8), Scale (12, 2, 12), Vertical rotation
     - Waterfall_2: Position (-6, -6, 6), Scale (10, 2, 10), Vertical rotation
     - Waterfall_3: Position (-10, -6, 4), Scale (8, 2, 8), Vertical rotation
     - Waterfall_4: Position (-8, -6, 2), Scale (6, 2, 6), Vertical rotation
     - WaterPool: Position (-8, -10, -1.5), Scale (15, 15, 1)
     - Water material: (0.2, 0.6, 0.9) - Natural blue
     
     ENVIRONMENT CREATION (What our script builds):
     - Ground: Position (0, 0, -2), Scale (40, 40, 1), Material (0.7, 0.5, 0.2)
     - Cliffside: 3 main rocks + 12 scattered rocks, Material (0.5, 0.5, 0.5)
     - Pagoda: 3 buildings (main, hut, bridge), Material (0.8, 0.6, 0.4)
     - Trees: 6 large trees + 12 small plants, Material (0.1, 0.6, 0.1)
     - Clouds: 5 pink clouds, Material (0.9, 0.7, 0.8)
     - Foreground: 1 branch + 4 leaves, Materials rock + vegetation
     
     LIGHTING SETUP (What our script creates):
     - Sun light: Position (5, 5, 10), Energy 8.0, Rotation (45°, 30°, 0°)
     - Area light: Position (0, 0, 8), Energy 200.0, Size 20.0
     - Point light: Position (0, -10, 5), Energy 150.0
     
     CAMERA SETUP (What our script creates):
     - Position: (0, -30, 25)
     - Rotation: (35°, 0°, 0°)
     - Lens: 40mm
     - Clip start: 0.1

    PROVIDE EXHAUSTIVE ANALYSIS IN THESE CATEGORIES:

    1. IMMEDIATE VISUAL ASSESSMENT:
       - What do you see EXACTLY in this image? Be brutally specific.
       - Are the letters A, B, C clearly visible and identifiable?
       - What colors are dominant? List every color you observe.
       - Is this a high-quality, clear image or are there visibility issues?
       - Rate overall image clarity: Excellent/Good/Poor/Terrible

    2. CHARACTER ANALYSIS (CRITICAL):
       Letter A:
       - Is it visible? What color is it? Is it RED as expected?
       - Describe its exact position in the frame
       - Are eyes visible? How many? What size? What color?
       - Is there a mouth? Open or closed? What shape?
       - Are limbs visible? How many arms/legs? What style (stick-like vs thick)?
       - What pose/expression does it have?
       - Size relative to other elements?

       Letter B:
       - Is it visible? What color is it? Is it PINK as expected?
       - Describe its exact position in the frame
       - Are eyes visible? How many? What size? What color?
       - Is there a mouth? Open or closed? What shape?
       - Are limbs visible? How many arms/legs? What style?
       - What pose/expression does it have?
       - Size relative to other elements?

       Letter C:
       - Is it visible? What color is it? Is it GREEN as expected?
       - Describe its exact position in the frame
       - Are eyes visible? How many? What size? What color?
       - Is there a mouth? Open or closed? What shape?
       - Are limbs visible? How many arms/legs? What style?
       - What pose/expression does it have?
       - Size relative to other elements?

    3. ENVIRONMENT INVENTORY:
       WATERFALL:
       - Is there a visible waterfall? YES/NO
       - If yes: How prominent? What colors? How many layers?
       - If no: This is a CRITICAL MISSING ELEMENT
       - Water effects visible? Transparency? Motion blur?

       ROCKS/CLIFFSIDE:
       - How many rock formations are visible?
       - What colors/textures do they have?
       - Are they properly sized and positioned?
       - Do they look natural or artificial?

       PAGODA/BUILDINGS:
       - Are there any building structures visible?
       - How many? What style? What colors?
       - Do they match Eastern/Asian architecture?

       VEGETATION:
       - How many trees are visible?
       - What about smaller plants/bushes?
       - What colors? Green, brown, other?
       - Are they properly distributed in the scene?

       SKY/BACKGROUND:
       - What color is the sky?
       - Are clouds visible? How many? What colors?
       - Is the background properly rendered?

    4. TECHNICAL QUALITY ASSESSMENT:
       - Image resolution and sharpness: Rate 1-10
       - Color saturation: Too bright/Too dull/Just right
       - Lighting quality: Harsh/Soft/Natural/Artificial
       - Shadows: Present/Absent/Realistic/Unrealistic
       - Overall render quality: Professional/Amateur/Broken

    5. STYLE CONFORMANCE:
       - Does this look like 2D cartoon style? YES/NO - explain why
       - Are colors flat or do they have 3D shading?
       - Is the aesthetic childlike/playful as expected?
       - Does it match the intended cartoon reference style?

    6. CRITICAL ISSUES LIST:
       - List EVERY visible problem or missing element
       - Rate each issue: CRITICAL/MAJOR/MINOR
       - Provide specific solutions for each issue

         7. SCRIPT VS RENDER COMPARISON:
        - Compare what you see in the render vs what our script specifications say should be created
        - Are all script elements visible? List any missing elements
        - Are the positions, sizes, and colors matching our script specifications?
        - Are there any elements visible that aren't in our script?
        - Is the camera capturing all the elements our script created?

     8. OVERALL VERDICT:
        - Success rate: What percentage does this match the intended result?
        - Most critical fixes needed (top 3)
        - Is this render acceptable for production use? YES/NO

     BE BRUTALLY HONEST. If something is wrong, missing, or poorly implemented, say so explicitly. This analysis will guide critical improvements.
    """
    
    # Analyze our current render
    current_render_path = "references_and_renders/renders/fast_professional_render.png"
    reference_path = "references_and_renders/reference_images/Cascade Letters - 03 - Illu - bdnoires.png"
    
    print(f"🔍 Analyzing current render: {current_render_path}")
    current_analysis = analyzer.analyze_render(current_render_path, detailed_prompt)
    
    if current_analysis:
        print("\n" + "="*100)
        print("📊 ULTRA-DETAILED COMPARISON ANALYSIS")
        print("="*100)
        print(current_analysis)
        print("="*100)
    else:
        print("❌ Analysis failed")

if __name__ == "__main__":
    detailed_comparison_analysis()
