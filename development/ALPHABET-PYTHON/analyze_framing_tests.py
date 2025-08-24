#!/usr/bin/env python3
"""
Analyze Framing Test Results
Uses Ollama to analyze camera framing tests and determine the best camera position
"""

import os
from ollama_vision_analyzer import OllamaVisionAnalyzer

def analyze_framing_tests():
    """Analyze all framing test renders to find the best camera position"""
    analyzer = OllamaVisionAnalyzer()
    
    # Test connection
    if not analyzer.test_ollama_connection():
        print("❌ Cannot connect to Ollama. Make sure it's running: ollama serve")
        return
    
    framing_tests_dir = "references_and_renders/framing_tests"
    if not os.path.exists(framing_tests_dir):
        print(f"❌ Framing tests directory not found: {framing_tests_dir}")
        print("Please run the camera_framing_analyzer.py first in Blender")
        return
    
    # Comprehensive analysis prompt
    analysis_prompt = """
    CRITICAL FRAMING ANALYSIS: Evaluate this camera framing test for the Ultimate Cascade Render project.
    
    FRAMING EVALUATION CRITERIA (Rate each 1-10):
    
    1. CHARACTER VISIBILITY (CRITICAL - 30% weight):
       - Are letters A, B, C clearly visible and identifiable?
       - Are their colors (red, pink, green) clearly distinguishable?
       - Are eyes, mouths, and limbs visible on all characters?
       - Are characters properly sized and positioned in frame?
    
    2. WATERFALL VISIBILITY (CRITICAL - 25% weight):
       - Is the waterfall clearly visible and prominent?
       - Is it properly positioned in the frame?
       - Does it have good visual impact?
       - Is the water pool visible?
    
    3. PAGODA VISIBILITY (CRITICAL - 20% weight):
       - Is the pagoda/temple clearly visible?
       - Is it properly positioned and sized?
       - Does it contribute to the scene composition?
    
    4. ENVIRONMENT BALANCE (15% weight):
       - Are trees, ground, and clouds visible?
       - Is the environment well-balanced in the frame?
       - Does it provide good context and depth?
    
    5. COMPOSITION QUALITY (10% weight):
       - Is the overall composition balanced and professional?
       - Are elements properly spaced and positioned?
       - Does the camera angle work well for the scene?
    
    TECHNICAL ASSESSMENT:
    - Image clarity and sharpness
    - Lighting quality and shadows
    - Color balance and saturation
    - Overall technical quality
    
    PROVIDE:
    - Overall framing score (1-10)
    - Character visibility score (1-10)
    - Waterfall visibility score (1-10)
    - Pagoda visibility score (1-10)
    - Environment balance score (1-10)
    - Composition quality score (1-10)
    
    SPECIFIC FEEDBACK:
    - What works well in this framing?
    - What needs improvement?
    - Would this framing work for the final render?
    
    BE BRUTALLY HONEST. This will determine the final camera position for 100% success.
    """
    
    # Get all framing test renders
    test_files = [f for f in os.listdir(framing_tests_dir) if f.endswith('.png')]
    if not test_files:
        print("❌ No framing test renders found")
        return
    
    print(f"🔍 Analyzing {len(test_files)} framing test renders...")
    print("=" * 80)
    
    results = []
    for test_file in sorted(test_files):
        test_path = os.path.join(framing_tests_dir, test_file)
        test_name = test_file.replace('framing_test_', '').replace('.png', '')
        
        print(f"\n📷 Analyzing: {test_name}")
        print("-" * 40)
        
        analysis = analyzer.analyze_render(test_path, analysis_prompt)
        if analysis:
            print(analysis)
            results.append((test_name, analysis))
        else:
            print("❌ Analysis failed")
    
    # Summary and recommendations
    print("\n" + "=" * 80)
    print("📊 FRAMING ANALYSIS SUMMARY")
    print("=" * 80)
    
    if results:
        print("\n🎯 RECOMMENDATIONS:")
        print("Based on the analysis, here are the camera positions ranked by framing effectiveness:")
        
        # Simple ranking based on analysis content
        for test_name, analysis in results:
            print(f"\n📷 {test_name.upper()}:")
            # Extract scores if present
            lines = analysis.split('\n')
            for line in lines:
                if "score" in line.lower() or "Overall" in line:
                    print(f"   {line.strip()}")
    
    print(f"\n📁 All framing test renders are in: {framing_tests_dir}")
    print("🎯 Use the best performing camera position in the main render script!")

def main():
    """Main function"""
    print("🔍 Analyze Framing Test Results")
    print("=" * 60)
    analyze_framing_tests()

if __name__ == "__main__":
    main()

