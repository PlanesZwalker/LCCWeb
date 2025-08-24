import requests
import json
import base64
import os
import time
from pathlib import Path

class OllamaVisionAnalyzer:
    def __init__(self, model_name="llava", ollama_url="http://localhost:11434"):
        self.model_name = model_name
        self.ollama_url = ollama_url
        self.renders_dir = Path("references_and_renders/renders")
        
    def encode_image_to_base64(self, image_path):
        """Encode image to base64 for Ollama API"""
        try:
            with open(image_path, "rb") as image_file:
                return base64.b64encode(image_file.read()).decode('utf-8')
        except Exception as e:
            print(f"❌ Error encoding image {image_path}: {e}")
            return None
    
    def analyze_render(self, image_path, custom_prompt=None):
        """Analyze a render using Ollama vision model"""
        print(f"🔍 Analyzing render: {image_path}")
        
        # Check if image exists
        if not os.path.exists(image_path):
            print(f"❌ Image not found: {image_path}")
            return None
        
        # Encode image
        image_base64 = self.encode_image_to_base64(image_path)
        if not image_base64:
            return None
        
        # Default analysis prompt
        if not custom_prompt:
            custom_prompt = """
            Analyze this Blender render in detail. Please describe:

            1. VISIBILITY:
            - Are there any visible characters or objects?
            - Is the image completely white, black, or has content?
            - Can you see letters A, B, C?

            2. COLORS:
            - What colors are visible?
            - Are the colors bright and clear or faded?
            - Any specific color issues?

            3. LIGHTING:
            - Is the scene well-lit or too dark/bright?
            - Are shadows visible?
            - Any lighting problems?

            4. POSITIONING:
            - Where are objects positioned?
            - Are characters properly spaced?
            - Any positioning issues?

            5. STYLE:
            - Does it look 2D or 3D?
            - Is it cartoonish as intended?
            - Any style issues?

            6. TECHNICAL ISSUES:
            - Any obvious rendering problems?
            - Missing elements?
            - Quality issues?

            Please be very specific and detailed in your analysis.
            """
        
        # Prepare request payload
        payload = {
            "model": self.model_name,
            "prompt": custom_prompt,
            "images": [image_base64],
            "stream": False
        }
        
        try:
            print("🤖 Sending to Ollama...")
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json=payload,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                analysis = result.get('response', 'No analysis received')
                print("✅ Analysis received from Ollama")
                return analysis
            else:
                print(f"❌ Ollama API error: {response.status_code}")
                print(f"Response: {response.text}")
                return None
                
        except Exception as e:
            print(f"❌ Error communicating with Ollama: {e}")
            return None
    
    def analyze_latest_render(self, custom_prompt=None):
        """Analyze the most recent render in the renders directory"""
        if not self.renders_dir.exists():
            print(f"❌ Renders directory not found: {self.renders_dir}")
            return None
        
        # Get all PNG files
        png_files = list(self.renders_dir.glob("*.png"))
        if not png_files:
            print("❌ No PNG files found in renders directory")
            return None
        
        # Sort by modification time (most recent first)
        png_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        latest_render = png_files[0]
        
        print(f"📸 Latest render found: {latest_render.name}")
        return self.analyze_render(str(latest_render), custom_prompt)
    
    def analyze_specific_render(self, render_name, custom_prompt=None):
        """Analyze a specific render by name"""
        render_path = self.renders_dir / render_name
        return self.analyze_render(str(render_path), custom_prompt)
    
    def compare_renders(self, render1_name, render2_name):
        """Compare two renders side by side"""
        print(f"🔄 Comparing renders: {render1_name} vs {render2_name}")
        
        render1_path = self.renders_dir / render1_name
        render2_path = self.renders_dir / render2_name
        
        if not render1_path.exists():
            print(f"❌ First render not found: {render1_path}")
            return None
        if not render2_path.exists():
            print(f"❌ Second render not found: {render2_path}")
            return None
        
        # Encode both images
        img1_base64 = self.encode_image_to_base64(str(render1_path))
        img2_base64 = self.encode_image_to_base64(str(render2_path))
        
        if not img1_base64 or not img2_base64:
            return None
        
        comparison_prompt = """
        Compare these two Blender renders side by side. Please analyze:

        1. DIFFERENCES:
        - What's different between the two renders?
        - Which one looks better?
        - What improvements or regressions do you see?

        2. VISIBILITY:
        - Are characters visible in both?
        - Any differences in clarity?

        3. COLORS:
        - How do the colors compare?
        - Which has better color quality?

        4. LIGHTING:
        - How does lighting compare?
        - Which is better lit?

        5. OVERALL QUALITY:
        - Which render is closer to a good 2D cartoon style?
        - What specific improvements would you suggest?

        Please be detailed and specific in your comparison.
        """
        
        payload = {
            "model": self.model_name,
            "prompt": comparison_prompt,
            "images": [img1_base64, img2_base64],
            "stream": False
        }
        
        try:
            print("🤖 Sending comparison to Ollama...")
            response = requests.post(
                f"{self.ollama_url}/api/generate",
                json=payload,
                timeout=90
            )
            
            if response.status_code == 200:
                result = response.json()
                comparison = result.get('response', 'No comparison received')
                print("✅ Comparison received from Ollama")
                return comparison
            else:
                print(f"❌ Ollama API error: {response.status_code}")
                return None
                
        except Exception as e:
            print(f"❌ Error comparing renders: {e}")
            return None
    
    def list_available_renders(self):
        """List all available renders"""
        if not self.renders_dir.exists():
            print(f"❌ Renders directory not found: {self.renders_dir}")
            return []
        
        png_files = list(self.renders_dir.glob("*.png"))
        if not png_files:
            print("❌ No PNG files found")
            return []
        
        # Sort by modification time
        png_files.sort(key=lambda x: x.stat().st_mtime, reverse=True)
        
        print("📸 Available renders (newest first):")
        for i, png_file in enumerate(png_files, 1):
            mod_time = time.ctime(png_file.stat().st_mtime)
            print(f"  {i}. {png_file.name} (modified: {mod_time})")
        
        return [f.name for f in png_files]
    
    def test_ollama_connection(self):
        """Test if Ollama is running and accessible"""
        try:
            response = requests.get(f"{self.ollama_url}/api/tags", timeout=5)
            if response.status_code == 200:
                models = response.json().get('models', [])
                print("✅ Ollama connection successful!")
                print("📋 Available models:")
                for model in models:
                    print(f"  - {model['name']}")
                return True
            else:
                print(f"❌ Ollama connection failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Cannot connect to Ollama: {e}")
            print("💡 Make sure Ollama is running: ollama serve")
            return False

def main():
    """Main function to run the analyzer"""
    print("🤖 OLLAMA VISION ANALYZER")
    print("=" * 50)
    
    # Initialize analyzer
    analyzer = OllamaVisionAnalyzer()
    
    # Test connection
    if not analyzer.test_ollama_connection():
        return
    
    # List available renders
    renders = analyzer.list_available_renders()
    if not renders:
        return
    
    print("\n🎯 ANALYSIS OPTIONS:")
    print("1. Analyze latest render")
    print("2. Analyze specific render")
    print("3. Compare two renders")
    print("4. Custom analysis")
    
    choice = input("\nEnter your choice (1-4): ").strip()
    
    if choice == "1":
        print("\n" + "="*50)
        analysis = analyzer.analyze_latest_render()
        if analysis:
            print("\n📊 ANALYSIS RESULTS:")
            print("=" * 50)
            print(analysis)
            print("=" * 50)
    
    elif choice == "2":
        print("\nAvailable renders:")
        for i, render in enumerate(renders, 1):
            print(f"  {i}. {render}")
        
        try:
            render_idx = int(input("\nEnter render number: ")) - 1
            if 0 <= render_idx < len(renders):
                print("\n" + "="*50)
                analysis = analyzer.analyze_specific_render(renders[render_idx])
                if analysis:
                    print("\n📊 ANALYSIS RESULTS:")
                    print("=" * 50)
                    print(analysis)
                    print("=" * 50)
            else:
                print("❌ Invalid render number")
        except ValueError:
            print("❌ Please enter a valid number")
    
    elif choice == "3":
        print("\nAvailable renders:")
        for i, render in enumerate(renders, 1):
            print(f"  {i}. {render}")
        
        try:
            render1_idx = int(input("\nEnter first render number: ")) - 1
            render2_idx = int(input("Enter second render number: ")) - 1
            
            if 0 <= render1_idx < len(renders) and 0 <= render2_idx < len(renders):
                print("\n" + "="*50)
                comparison = analyzer.compare_renders(renders[render1_idx], renders[render2_idx])
                if comparison:
                    print("\n📊 COMPARISON RESULTS:")
                    print("=" * 50)
                    print(comparison)
                    print("=" * 50)
            else:
                print("❌ Invalid render number")
        except ValueError:
            print("❌ Please enter valid numbers")
    
    elif choice == "4":
        custom_prompt = input("\nEnter your custom analysis prompt: ")
        if custom_prompt.strip():
            print("\n" + "="*50)
            analysis = analyzer.analyze_latest_render(custom_prompt)
            if analysis:
                print("\n📊 CUSTOM ANALYSIS RESULTS:")
                print("=" * 50)
                print(analysis)
                print("=" * 50)
    
    else:
        print("❌ Invalid choice")

if __name__ == "__main__":
    main()
