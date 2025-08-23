#!/usr/bin/env python3
"""
Analyze Camera Test Results
Helps determine which camera position provides the best visibility
"""

import os
from ollama_vision_analyzer import OllamaVisionAnalyzer

def analyze_camera_tests():
    """Analyze all camera test renders to find the best position"""
    analyzer = OllamaVisionAnalyzer()
    
    # Test connection
    if not analyzer.test_ollama_connection():
        print("❌ Cannot connect to Ollama. Make sure it's running: ollama serve")
        return
    
    camera_tests_dir = "references_and_renders/camera_tests"
    
    if not os.path.exists(camera_tests_dir):
        print(f"❌ Camera tests directory not found: {camera_tests_dir}")
        print("Please run the camera_test_script.py first in Blender")
        return
    
    # Analysis prompt
    analysis_prompt = """
    CRITICAL TASK: Analyze this camera test render for the Ultimate Cascade Render project.
    
    EVALUATION CRITERIA (Rate each 1-10):
    
    1. CHARACTER VISIBILITY (CRITICAL):
       - Are letters A, B, C clearly visible and identifiable?
       - Are they properly sized and positioned?
       - Are their colors (red, pink, green) clearly distinguishable?
       - Are eyes and features visible?
    
    2. WATERFALL VISIBILITY (CRITICAL):
       - Is the waterfall clearly visible?
       - Is it properly positioned in the frame?
       - Does it have good prominence?
    
    3. ENVIRONMENT VISIBILITY:
       - Are trees and ground elements visible?
       - Is the overall scene well-framed?
    
    4. COMPOSITION QUALITY:
       - Is the overall composition balanced?
       - Are elements properly spaced?
       - Does the camera angle work well?
    
    5. TECHNICAL QUALITY:
       - Is the image clear and well-lit?
       - Are there any technical issues?
    
    PROVIDE:
    - Overall score (1-10)
    - Specific strengths of this camera position
    - Specific weaknesses or issues
    - Recommendations for improvement
    - Would this position work for the final render? YES/NO
    
    BE BRUTALLY HONEST. This will determine the final camera position for 100% success.
    """
    
    # Get all test renders
    test_files = [f for f in os.listdir(camera_tests_dir) if f.endswith('.png')]
    
    if not test_files:
        print("❌ No test renders found")
        return
    
    print(f"🔍 Analyzing {len(test_files)} camera test renders...")
    print("=" * 80)
    
    results = []
    
    for test_file in sorted(test_files):
        test_path = os.path.join(camera_tests_dir, test_file)
        test_name = test_file.replace('camera_test_', '').replace('.png', '')
        
        print(f"\n📷 Analyzing: {test_name}")
        print("-" * 40)
        
        analysis = analyzer.analyze_render(test_path, analysis_prompt)
        
        if analysis:
            print(analysis)
            results.append((test_name, analysis))
        else:
            print("❌ Analysis failed")
    
    # Summary
    print("\n" + "=" * 80)
    print("📊 CAMERA TEST ANALYSIS SUMMARY")
    print("=" * 80)
    
    if results:
        print("\n🎯 RECOMMENDATIONS:")
        print("Based on the analysis, here are the camera positions ranked by effectiveness:")
        
        # Simple ranking based on analysis content
        for test_name, analysis in results:
            if "Overall score" in analysis:
                print(f"\n📷 {test_name.upper()}:")
                # Extract score if present
                lines = analysis.split('\n')
                for line in lines:
                    if "Overall score" in line or "score" in line.lower():
                        print(f"   {line.strip()}")
            else:
                print(f"\n📷 {test_name.upper()}: Analysis completed")
    
    print(f"\n📁 All test renders are in: {camera_tests_dir}")
    print("🎯 Use the best performing camera position in the main render script!")

if __name__ == "__main__":
    analyze_camera_tests()
