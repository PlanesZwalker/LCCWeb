# 🤖 Ollama Vision Analyzer Setup Guide

## 📋 Prerequisites

1. **Ollama installed** on your system
2. **Vision model** downloaded (e.g., llava, bakllava, qwen-vl)
3. **Python dependencies** installed

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
pip install -r requirements_vision.txt
```

### 2. Start Ollama
```bash
ollama serve
```

### 3. Download a Vision Model
```bash
# Option 1: LLaVA (recommended)
ollama pull llava

# Option 2: BakLLaVA
ollama pull bakllava

# Option 3: Qwen-VL
ollama pull qwen-vl
```

### 4. Test Connection
```bash
python quick_analyze.py
```

## 🎯 Usage

### Quick Analysis
```bash
# Analyze latest render
python quick_analyze.py

# Analyze specific render
python quick_analyze.py simple_working_abc.png
```

### Interactive Analysis
```bash
python ollama_vision_analyzer.py
```

## 📊 What the Analyzer Does

The vision analyzer will provide detailed feedback on:

1. **Visibility**: Are characters visible? Is the image white/black?
2. **Colors**: What colors are present? Are they bright/faded?
3. **Lighting**: Is the scene well-lit? Any lighting issues?
4. **Positioning**: Where are objects? Any spacing issues?
5. **Style**: Does it look 2D cartoonish as intended?
6. **Technical Issues**: Any rendering problems?

## 🔧 Troubleshooting

### Ollama Not Running
```bash
# Start Ollama
ollama serve

# Check if it's running
curl http://localhost:11434/api/tags
```

### Model Not Found
```bash
# List available models
ollama list

# Pull a vision model
ollama pull llava
```

### Connection Issues
- Make sure Ollama is running on port 11434
- Check firewall settings
- Try restarting Ollama

## 🎨 Example Workflow

1. **Run Blender render**: `simple_working_abc.py`
2. **Analyze result**: `python quick_analyze.py`
3. **Get detailed feedback** on what's wrong
4. **Fix issues** based on analysis
5. **Repeat** until perfect

## 📝 Custom Prompts

You can create custom analysis prompts:

```python
custom_prompt = """
Focus specifically on:
- Are the A, B, C characters visible?
- What colors are they?
- Does it match the 2D cartoon style?
- Any specific issues to fix?
"""

analyzer.analyze_latest_render(custom_prompt)
```

## 🚀 Next Steps

Once Ollama is running, we can:
1. Analyze the current `simple_working_abc.png`
2. Get detailed feedback on what's wrong
3. Fix the issues based on the analysis
4. Create the perfect 2D cartoon render
