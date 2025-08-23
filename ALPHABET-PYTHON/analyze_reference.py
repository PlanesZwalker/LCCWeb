#!/usr/bin/env python3
"""
Analyze the reference image to understand the 2D concept
"""

import sys
import os
from ollama_vision_analyzer import OllamaVisionAnalyzer

def analyze_reference():
    """Analyze the reference image with custom prompt"""
    analyzer = OllamaVisionAnalyzer()
    
    # Test connection
    if not analyzer.test_ollama_connection():
        print("❌ Cannot connect to Ollama. Make sure it's running: ollama serve")
        return
    
    # Custom prompt for reference analysis
    custom_prompt = """
    Analyze this 2D concept art image in EXTREME DETAIL. This is our target aesthetic for a 3D Blender render of anthropomorphic alphabet characters (A, B, C) in a waterfall environment.

    Please provide SPECIFIC, ACTIONABLE details for each section:

    1. VISUAL STYLE & AESTHETIC:
    - What is the exact artistic style? (cartoon, anime, manga, children's book, etc.)
    - Is it completely flat 2D or does it have subtle depth cues?
    - What is the exact color palette? (list specific colors with descriptions)
    - What is the overall mood/atmosphere? (peaceful, exciting, mysterious, etc.)
    - What makes this style unique and recognizable?

    2. CHARACTER DESIGN (LETTERS A, B, C):
    - How are the characters physically designed? (stick figures, chibi, realistic proportions, etc.)
    - What are their exact proportions? (head size, body size, limb length, etc.)
    - How are their faces designed? (eye size, eye shape, mouth style, expressions)
    - What colors are used for each character? (be specific about shades)
    - How are the limbs designed? (thick, thin, straight, curved, etc.)
    - What poses are they in? (standing, falling, floating, etc.)
    - How do they interact with the environment?

    3. ENVIRONMENT DETAILS:
    - What is the exact environment type? (waterfall, forest, mountain, etc.)
    - What specific elements are present? (rocks, trees, water, buildings, etc.)
    - How is the waterfall designed? (height, width, flow style, etc.)
    - What is the background like? (sky, mountains, trees, etc.)
    - What is the ground/terrain like? (grass, rocks, dirt, etc.)
    - Are there any architectural elements? (bridges, buildings, etc.)
    - What perspective/viewpoint is used? (eye level, bird's eye, etc.)

    4. LIGHTING & SHADING TECHNIQUES:
    - How is lighting handled? (flat colors, cell shading, gradients, etc.)
    - What type of shadows are used? (none, simple, complex, etc.)
    - How are highlights applied? (none, simple, detailed, etc.)
    - What creates the sense of depth? (shading, perspective, overlap, etc.)
    - Is there any atmospheric perspective? (fog, haze, etc.)

    5. COMPOSITION & LAYOUT:
    - How are characters positioned in the scene?
    - What is the exact focal point?
    - How is depth conveyed? (size, overlap, perspective, etc.)
    - What is the camera angle/viewpoint?
    - How are elements balanced in the frame?

    6. COLOR & MATERIALS:
    - What is the exact color scheme? (warm, cool, complementary, etc.)
    - How are colors applied? (flat, gradients, textures, etc.)
    - What materials are suggested? (smooth, rough, shiny, etc.)
    - How do colors create mood and atmosphere?

    7. TECHNICAL IMPLEMENTATION GUIDE:
    - How can we achieve this 2D look in 3D Blender?
    - What specific Blender techniques should we use?
    - What materials and shaders would work best?
    - How should we handle lighting to match this style?
    - What camera settings would work best?
    - What specific elements are most important to get right?

    8. CRITICAL SUCCESS FACTORS:
    - What are the 3 most important elements to get right?
    - What would make this render fail vs succeed?
    - What specific details make this style recognizable?

    Please be EXTREMELY detailed and specific. Include exact measurements, colors, positions, and techniques where possible. This analysis will directly guide our 3D implementation.
    """
    
    # Analyze the reference image
    reference_path = "references_and_renders/reference_images/Cascade Letters - 03 - Illu - bdnoires.png"
    
    print(f"🔍 Analyzing reference image: {reference_path}")
    analysis = analyzer.analyze_render(reference_path, custom_prompt)
    
    if analysis:
        print("\n" + "="*80)
        print("📊 REFERENCE IMAGE ANALYSIS")
        print("="*80)
        print(analysis)
        print("="*80)
    else:
        print("❌ Analysis failed")

if __name__ == "__main__":
    analyze_reference()
