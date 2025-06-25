# Changelog

All notable changes to this project will be documented in this file.

This changelog is automatically generated based on [Conventional Commits](https://www.conventionalcommits.org/).

## [0.1.13] - 2025-06-23

### Features

- Add manual dark mode switcher to settings
- Add copy to clipboard button
- Add support for Tindeq Progressor devices
- Add comprehensive tests and GitHub Actions CI/CD
- Improve type safety and reduce code duplication
- Add comprehensive contribution guide with GitHub templates

### Bug Fixes

- Add Android Bluetooth permissions
- Fix Tindeq scan functionality
- Fix copy icon display on Android
- Correct WH-C06 protocol to always treat transmission data as kg units
- Improve splash screen handling with error case and better UX
- Fix theme synchronization and system appearance switching

### Performance Improvements

- Migrate from AsyncStorage to React Native MMKV for better performance

### Code Refactoring

- Extract user weight input props for better component organization
- Improve user weight input implementation

### Documentation

- Add hangsfree.com website link to README
- Improve README with comprehensive project documentation
- Simplify and clarify project documentation

### Build System

- Use recommended package versions
- Add commitlint for conventional commits
- Improve package.json configuration
- Add workflow permissions for GitHub Actions

## [0.1.12] - 2025-02-25

### Features

- Add support for Tindeq Progressor devices
- Improve timestamps and add live stopwatch functionality

### Bug Fixes

- Fix switching hands functionality
- Fix BLE manager implementation

### Miscellaneous Chores

- Code cleanup and organization
- Mock BLE for development

## [0.1.11] - 2025-02-25

### Miscellaneous Chores

- Internal version bump for development builds
- Package maintenance and fixes

## [0.1.10] - 2025-02-25

### Features

- Add support for Tindeq Progressor devices

### Miscellaneous Chores

- Bump app version
- Package maintenance and fixes

## [0.1.9] - 2025-02-10

### Features

- Improve timestamps and add live stopwatch functionality

### Code Refactoring

- Extract user weight input props
- Improve user weight input implementation

### Miscellaneous Chores

- Fix switching hands functionality
- Fix external link types
- Package maintenance and dependency updates
- Add import ordering
- Fix package-lock and versions

## [0.1.0 - 0.1.8] - 2025-02-07 to 2025-02-08

### Features

- Initial React Native app with Expo Router
- Bluetooth Low Energy (BLE) connectivity for WH-C06 scales
- Real-time weight measurement display
- User weight percentage calculations
- Force graph visualization
- Left and right hand weight tracking
- Maximum weight summary
- Android Bluetooth permission handling
- Pre-commit hooks and ESLint configuration

### Build System

- Initial project setup with Expo
- Configure EAS Build
- Add GitHub Actions workflow
- Set up development dependencies
- Configure TypeScript and testing

### Performance Improvements

- Add low latency scanning for Android
- Optimize BLE connection handling

### Miscellaneous Chores

- Initial commit and project scaffolding
- Configure splash screen and icons
- Set up project structure and navigation
- Dependency management and updates 