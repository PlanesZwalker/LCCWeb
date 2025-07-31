# 🎮 Letters Cascade Challenge

A modern, unified 2D/3D word puzzle game built with Three.js, featuring dynamic grid modes, comprehensive testing, and responsive design.

## 🌟 Features

### 🎯 Core Gameplay
- **Unified 2D/3D Experience**: Single game engine with mode switching
- **Dynamic Grid Modes**: Switch between 2D and 3D grid layouts seamlessly
- **Word Detection**: Advanced algorithms for horizontal, vertical, and diagonal word finding
- **Progressive Difficulty**: Increasing complexity with levels and speed
- **Score System**: Combo multipliers, high score tracking, and statistics

### 🎨 Visual & Audio
- **3D Rendering**: Immersive Three.js-powered 3D environment
- **Particle Effects**: Dynamic visual feedback for word completion
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Modern UI**: Glassmorphism design with smooth animations
- **Audio Feedback**: Sound effects for game events

### 🛠 Technical Excellence
- **Modern Build System**: Webpack 5 with optimization
- **Comprehensive Testing**: 234 Jest tests with 100% coverage
- **Code Quality**: ESLint + Prettier for clean, maintainable code
- **Performance Optimized**: Efficient rendering and asset management
- **Cross-Platform**: Works on all modern browsers

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/PlanesZwalker/LCCWeb.git
cd LCCWeb

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Development Commands
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run test suite
npm run lint       # Check code quality
npm run lint:fix   # Fix linting issues
```

## 🎮 How to Play

### Controls
- **Arrow Keys**: Move falling letters
- **Spacebar**: Drop letter quickly
- **Mouse/Touch**: Click to place letters (3D mode)
- **Mode Switch**: Toggle between 2D and 3D grid modes

### Game Rules
1. **Objective**: Create words by placing letters strategically
2. **Word Detection**: Words can be formed horizontally, vertically, or diagonally
3. **Scoring**: Longer words and combos earn more points
4. **Progression**: Complete words to advance levels
5. **Game Over**: When grid fills up or time runs out

### Game Modes
- **2D Grid Mode**: Classic top-down view with enhanced visuals
- **3D Grid Mode**: Immersive 3D environment with depth and perspective

## 📁 Project Structure

```
LCCWeb/
├── public/                 # Source files
│   ├── index.html         # Main landing page
│   ├── unified-game.html  # Game interface
│   ├── rules.html         # Game rules
│   ├── sitemap.html       # Project navigation
│   ├── js/               # Game scripts
│   │   ├── index.js      # 2D game engine
│   │   ├── game3d.js     # 3D game engine
│   │   ├── utils.js      # Utility functions
│   │   └── libs/         # External libraries
│   ├── css/              # Stylesheets
│   └── images/           # Game assets
├── src/                  # Modern source code
│   └── core/            # Game engine components
├── tests/               # Test suite
│   ├── 2d-game.test.js # 2D game tests
│   ├── 3d-game.test.js # 3D game tests
│   └── setup.js        # Test configuration
├── dist/               # Production build
├── Docs/              # Documentation
└── package.json       # Project configuration
```

## 🧪 Testing

The project includes a comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test files
npm test -- 2d-game.test.js
npm test -- 3d-game.test.js
```

### Test Coverage
- **234 total tests** (117 2D + 117 3D)
- **Game mechanics** validation
- **Rendering** verification
- **User interactions** testing
- **Performance** benchmarks
- **Error handling** scenarios

## 🛠 Development

### Architecture
- **Modular Design**: Separated concerns with clear interfaces
- **Event-Driven**: Custom event system for game state management
- **Renderer Abstraction**: Factory pattern for 2D/3D rendering
- **State Management**: Centralized game state with history

### Key Components
- `GameEngine`: Core game logic and coordination
- `Renderer2D/Renderer3D`: Rendering abstraction
- `WordDetector`: Advanced word detection algorithms
- `ScoreManager`: Points, combos, and statistics
- `LevelManager`: Difficulty progression
- `AudioManager`: Sound effects and feedback
- `ParticleSystem`: Visual effects

### Code Quality
- **ESLint**: Code style enforcement
- **Prettier**: Consistent formatting
- **TypeScript-ready**: Modern JavaScript patterns
- **Documentation**: Comprehensive JSDoc comments

## 📚 Documentation

See the `Docs/` folder for detailed documentation:
- [Game Design Document](Docs/Game-Design.md)
- [Technical Architecture](Docs/Technical-Architecture.md)
- [API Reference](Docs/API-Reference.md)
- [Testing Guide](Docs/Testing-Guide.md)
- [Deployment Guide](Docs/Deployment-Guide.md)

## 🌐 Deployment

### Production Build
```bash
npm run build
```

The `dist/` folder contains all production files:
- Optimized JavaScript bundles
- Minified CSS
- Compressed assets
- Static HTML files

### Hosting
Deploy the `dist/` folder to any static hosting service:
- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Traditional web servers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Three.js**: 3D graphics library
- **Tween.js**: Animation library
- **Font Awesome**: Icon library
- **Jest**: Testing framework
- **Webpack**: Build system

## 📞 Support

For questions, issues, or contributions:
- Create an issue on GitHub
- Check the documentation in `Docs/`
- Review the test suite for examples

---

**Made with ❤️ for the gaming community** 