# 🎨 Font Selection Guide
## Letters Cascade Challenge

### Overview
You can now choose between 10 different font families for your alphabet characters before creating the scene!

### Available Fonts
1. **Arial** - Clean, modern sans-serif
2. **Times New Roman** - Classic serif font
3. **Helvetica** - Professional sans-serif
4. **Georgia** - Elegant serif font
5. **Verdana** - Readable sans-serif
6. **Courier New** - Monospace font
7. **Comic Sans MS** - Fun, casual font
8. **Impact** - Bold, dramatic font
9. **Tahoma** - Clean sans-serif
10. **Trebuchet MS** - Modern sans-serif

### How to Use

#### Method 1: Interactive Font Selector
1. Run the font selector:
   ```bash
   python font_selector.py
   ```
2. Choose your font from the menu
3. The main script will be automatically updated
4. Run the main script to create your scene

#### Method 2: Direct Script Modification
1. Open `letters_cascade_challenge.py`
2. Find this line in the `select_font()` method:
   ```python
   choice = 1  # Default to Arial
   ```
3. Change the number to your desired font:
   - 1 = Arial
   - 2 = Times New Roman
   - 3 = Helvetica
   - 4 = Georgia
   - 5 = Verdana
   - 6 = Courier New
   - 7 = Comic Sans MS
   - 8 = Impact
   - 9 = Tahoma
   - 10 = Trebuchet MS

#### Method 3: Quick Font Change
You can also modify the `self.selected_font` variable directly:
```python
self.selected_font = 'Impact'  # Change this line
```

### Font Recommendations

#### For Professional Look
- **Helvetica** - Clean and modern
- **Georgia** - Elegant and readable
- **Verdana** - Great for digital display

#### For Fun/Game Style
- **Comic Sans MS** - Playful and friendly
- **Impact** - Bold and dramatic
- **Arial** - Clean and versatile

#### For Classic Style
- **Times New Roman** - Traditional and formal
- **Courier New** - Retro/monospace look

### Technical Notes

#### Font Loading
- The script attempts to load the selected font
- If the font is not available, it falls back to the default system font
- Font selection is logged during character creation

#### Font Persistence
- Your font choice is saved in `font_selection.json`
- The selector will remember your previous choice
- You can change fonts between renders

#### Font Effects
- All fonts are rendered as 3D text objects
- Fonts support extrusion and bevel effects
- Professional materials are applied regardless of font choice

### Example Usage

```bash
# Step 1: Select font
python font_selector.py

# Step 2: Run main script
& "C:\Program Files\Blender Foundation\Blender 4.5\blender.exe" --background --python letters_cascade_challenge.py
```

### Troubleshooting

#### Font Not Loading
- Check if the font is installed on your system
- The script will use a fallback font if needed
- Check console output for font loading messages

#### Font Selector Not Working
- Make sure you have Python installed
- Run from the correct directory
- Check file permissions

#### Font Looks Different
- Different fonts have different character spacing
- Some fonts may appear larger or smaller
- Adjust text size in the script if needed

### Custom Fonts
To add custom fonts:
1. Add your font to the `font_families` dictionary
2. Update the `get_font_path()` method
3. Ensure the font file is accessible

### Performance
- Font selection has minimal impact on render time
- All fonts use the same material system
- Font choice affects only the text appearance, not performance

---

**Happy font selecting! 🎨**
