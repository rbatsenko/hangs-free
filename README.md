# 🪄 HangsFree

**The ultimate hangboard training companion for climbers** 🧗‍♀️🧗‍♂️

A modern React Native app built with Expo that helps climbers track their hangboard training sessions with real-time weight measurement and comprehensive analytics.

## ✨ Features

### 🏋️ **Smart Weight Tracking**
- **Real-time measurements** from connected scales
- **Dual-hand tracking** with independent left/right monitoring
- **Multiple device support**: WH-C06 Scale & Tindeq Progressor
- **Live weight display** with max weight recording

### 🎨 **Adaptive Theme System**
- **Manual dark mode control** - override system preferences
- **Three theme options**: System, Light, Dark
- **Persistent preferences** using high-performance MMKV storage
- **Seamless theme switching** across the entire app

### 📊 **Training Analytics**
- **Cycle-based training** with stopwatch integration
- **Progress tracking** across multiple sessions
- **Weight percentages** for progressive training
- **Session summaries** and performance insights

### ⚙️ **Device Management**
- **Bluetooth connectivity** for supported scales
- **Device selection** and pairing management
- **Connection status** and error handling
- **Multiple scale support** with easy switching

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/rbatsenko/hangs-free.git
cd hangs-free

# Install dependencies
npm install

# Start the development server
npm start
```

### Development Builds

For testing device connectivity and native features:

```bash
# iOS Development Build
eas build --platform ios --profile development

# Android Development Build  
eas build --platform android --profile development
```

## 🏗️ Architecture

### **Tech Stack**
- **Framework**: React Native with Expo Router
- **Language**: TypeScript
- **Storage**: MMKV (30x faster than AsyncStorage)
- **State Management**: React Context API
- **Connectivity**: React Native BLE PLX
- **Testing**: Jest with React Native Testing Library
- **CI/CD**: EAS Build & GitHub Actions

### **Project Structure**
```
app/                    # Expo Router pages
├── (tabs)/            # Tab navigation screens
│   ├── index.tsx      # Home/Dashboard
│   ├── lift.tsx       # Training session
│   └── settings.tsx   # App settings
components/            # Reusable UI components
├── ui/               # Design system components
└── common/           # Shared components
contexts/             # React Context providers
├── ThemeContext.tsx  # Theme management
├── WeightDataContext.tsx  # Weight tracking
└── SelectedDeviceContext.tsx  # Device selection
hooks/                # Custom React hooks
types/                # TypeScript definitions
constants/            # App constants and themes
```

## 🎨 Theming

HangsFree features a comprehensive theming system with manual dark mode control:

```tsx
// Theme options available to users
type ThemeMode = 'system' | 'light' | 'dark'

// Automatic system detection with manual override
const { themeMode, setThemeMode, colorScheme } = useTheme()
```

**Theme Features:**
- 🔄 **System sync** - Follows device dark mode by default
- 🎛️ **Manual control** - Users can override system preferences  
- 💾 **Persistent storage** - Remembers user choice across sessions
- ⚡ **Instant switching** - No app restart required

## 📱 Supported Devices

### **Scales & Sensors**
- **WH-C06 Bluetooth Scale** - Consumer-grade weight measurement
- **Tindeq Progressor** - Professional hangboard load cell
- **Manual input** - For use without connected devices

### **Platforms**
- **iOS** - iPhone & iPad support
- **Android** - Phone & tablet support  
- **Development** - Expo Go for quick prototyping

## 🧪 Testing

```bash
# Run test suite
npm test

# Run with coverage
npm test -- --coverage

# Type checking
npm run ts-check

# Linting
npm run lint
```

**Test Coverage:**
- ✅ 58 tests passing
- ✅ Component testing with React Native Testing Library
- ✅ Hook testing for custom logic
- ✅ Context testing for state management
- ✅ Mock implementations for native modules

## 🚀 Deployment

### **EAS Build Configuration**
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

### **Release Process**
1. **Feature branches** → `feature/feature-name`
2. **Conventional commits** → `feat: add new feature`
3. **Pull requests** → Code review & CI checks
4. **EAS Build** → Automated builds on merge
5. **Distribution** → TestFlight (iOS) / Internal (Android)

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### **Development Standards**
- 📝 **TypeScript** - Strict typing required
- 🧪 **Testing** - Test coverage for new features
- 📋 **Conventional Commits** - Semantic commit messages
- 🎨 **ESLint + Prettier** - Automated code formatting
- 📱 **Responsive Design** - Works on all screen sizes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Expo Team** - For the amazing development platform
- **React Native Community** - For the robust ecosystem
- **Climbing Community** - For inspiration and feedback
- **MMKV** - For blazing-fast storage performance

---

**Built with ❤️ for the climbing community**

[Report Bug](https://github.com/rbatsenko/hangs-free/issues) · [Request Feature](https://github.com/rbatsenko/hangs-free/issues) · [Join Discussion](https://github.com/rbatsenko/hangs-free/discussions)
