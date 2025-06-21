# Contributing to Hangs Free

Thank you for your interest in contributing to Hangs Free! This guide will help you get started with contributing to our React Native hangboard training app.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Code of Conduct](#code-of-conduct)

## Getting Started

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Version 8 or higher
- **Git**: For version control
- **Expo CLI**: For React Native development
- **iOS Simulator** (macOS) or **Android Emulator**: For testing

### Development Environment Setup

1. **Fork and Clone the Repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/hangs-free.git
   cd hangs-free
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Verify Setup**
   Run the following commands to ensure everything is working:
   ```bash
   npm run lint          # Check code style
   npm run ts-check      # Verify TypeScript
   npm test -- --watchAll=false  # Run tests
   ```

### Project Structure

```
app/                 # Expo Router pages
components/          # Reusable UI components
  ├── common/        # Common components (Collapsible, etc.)
  └── ui/           # UI-specific components
contexts/           # React contexts (Theme, WeightData)
hooks/              # Custom React hooks
constants/          # App constants (colors, etc.)
types/              # TypeScript type definitions
```

## Development Workflow

### Branch Naming Convention

We use a strict branch naming convention enforced by git hooks:

- `feature/your-feature-name` - New features
- `bugfix/issue-description` - Bug fixes
- `hotfix/urgent-fix` - Critical fixes
- `chore/maintenance-task` - Maintenance tasks
- `release/version-number` - Release preparation

**Examples:**
```bash
git checkout -b feature/bluetooth-device-pairing
git checkout -b bugfix/weight-display-accuracy
git checkout -b chore/update-dependencies
```

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/) standard, enforced by commitlint:

**Format:** `type(scope): description`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes
- `perf`: Performance improvements
- `build`: Build system changes
- `revert`: Reverting changes

**Examples:**
```bash
git commit -m "feat(bluetooth): add Tindeq Progressor support"
git commit -m "fix(weight-display): correct unit conversion for pounds"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(hooks): add tests for useBLE hook"
```

### Git Workflow

1. **Create a new branch** from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our code standards

3. **Commit your changes** using conventional commit format

4. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** via GitHub

## Code Standards

### Linting and Formatting

We use ESLint and Prettier for code consistency:

```bash
npm run lint          # Check for linting issues
npm run lint:fix      # Auto-fix linting issues
```

### TypeScript

All code must be written in TypeScript with proper type definitions:

```bash
npm run ts-check      # Verify TypeScript compilation
```

### Code Style Guidelines

- Use **functional components** with hooks
- Follow **React Native** best practices
- Use **TypeScript interfaces** for props and data structures
- Implement proper **error handling**
- Write **clear, descriptive variable names**
- Add **JSDoc comments** for complex functions

### Import Organization

We enforce import order through ESLint:

```typescript
// 1. React imports
import React from 'react';
import { useState, useEffect } from 'react';

// 2. React Native imports
import { View, Text, StyleSheet } from 'react-native';

// 3. Third-party libraries
import { Ionicons } from '@expo/vector-icons';

// 4. Internal imports (@ aliases)
import { useColorScheme } from '@/hooks/useColorScheme';
import { ThemedView } from '@/components/ui/ThemedView';

// 5. Relative imports
import './Component.styles';
```

## Testing Guidelines

### Running Tests

```bash
npm test                          # Run tests in watch mode
npm test -- --watchAll=false     # Run tests once
npm test -- --coverage           # Run tests with coverage
```

### Writing Tests

- **Unit Tests**: Test individual functions and hooks
- **Component Tests**: Test React components with React Testing Library
- **Integration Tests**: Test feature workflows

**Example Test Structure:**
```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useCustomHook } from '../useCustomHook';

describe('useCustomHook', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useCustomHook());
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('should handle async operations', async () => {
    const { result } = renderHook(() => useCustomHook());
    
    await act(async () => {
      await result.current.fetchData();
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeDefined();
  });
});
```

### Test Requirements

- All new features must include tests
- Bug fixes should include regression tests
- Maintain test coverage above 80%
- Tests must pass in CI before merging

## Pull Request Process

### Before Submitting

1. **Update your branch** with latest main:
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```

2. **Run all checks locally**:
   ```bash
   npm run lint
   npm run ts-check
   npm test -- --watchAll=false
   ```

3. **Update documentation** if needed

### PR Requirements

- **Clear title** describing the change
- **Detailed description** explaining what was changed and why
- **Link to related issues** using "Fixes #123" or "Closes #123"
- **Screenshots/videos** for UI changes
- **Tests included** for new functionality
- **Documentation updated** if applicable

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for new functionality
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots or videos here

## Related Issues
Fixes #123
```

### Review Process

1. **Automated Checks**: CI must pass (linting, tests, TypeScript)
2. **Code Review**: At least one maintainer approval required
3. **Testing**: Reviewer will test functionality
4. **Merge**: Squash and merge with conventional commit message

## Issue Reporting

### Bug Reports

Use the following template for bug reports:

```markdown
**Describe the Bug**
A clear description of the bug

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Device Information:**
- Device: [e.g. iPhone 12, Pixel 5]
- OS: [e.g. iOS 15.0, Android 11]
- App Version: [e.g. 0.1.13]

**Additional Context**
Any other relevant information
```

### Feature Requests

```markdown
**Feature Description**
Clear description of the proposed feature

**Problem Statement**
What problem does this solve?

**Proposed Solution**
How should this feature work?

**Alternatives Considered**
Other solutions you've considered

**Additional Context**
Any other relevant information
```

### Issue Labels

- `bug`: Something isn't working
- `enhancement`: New feature or request
- `documentation`: Documentation improvements
- `good first issue`: Good for newcomers
- `help wanted`: Extra attention needed
- `priority: high`: High priority
- `priority: low`: Low priority

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you are expected to uphold this code.

### Our Standards

- **Be respectful** and inclusive
- **Be collaborative** and constructive
- **Be patient** with newcomers
- **Focus on** what is best for the community
- **Show empathy** towards other community members

## Recognition

Contributors will be recognized in:
- GitHub contributor statistics
- Release notes for significant contributions
- Special mentions for first-time contributors

## Getting Help

- **Documentation**: Check README.md and this guide
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for questions
- **Community**: Join our community discussions

## Development Tips

### Bluetooth Development

- Use iOS Simulator or Android Emulator with Bluetooth capabilities
- Test with actual Bluetooth scales when possible
- Handle connection failures gracefully

### Performance

- Use React Native's performance profiling tools
- Optimize re-renders with useMemo and useCallback
- Test on lower-end devices

### Debugging

```bash
# React Native debugging
npx react-native log-ios     # iOS logs
npx react-native log-android # Android logs

# Flipper debugging (if configured)
npx flipper-server

# Metro bundler reset
npx expo start --clear
```

## Questions?

If you have questions about contributing, feel free to:
- Open an issue with the `question` label
- Start a discussion in GitHub Discussions
- Check existing documentation

Thank you for contributing to Hangs Free! 🧗‍♀️