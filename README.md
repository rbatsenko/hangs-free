# Hangs Free

A React Native app for tracking hangboard training with Bluetooth scale integration.

🌐 **Website**: [hangsfree.com](https://hangsfree.com)

## Features

- Real-time weight measurement from connected scales (WH-C06, Tindeq Progressor)
- Manual dark mode switcher (System/Light/Dark)
- Training session tracking with stopwatch
- Device selection and Bluetooth management

## Setup

```bash
npm install
npm start
```

For development builds with device connectivity:
```bash
eas build --platform ios --profile development
```

## Tech Stack

- React Native + Expo Router
- TypeScript
- MMKV for storage
- React Native BLE PLX for Bluetooth
- Jest for testing

## Project Structure

```
app/                 # Expo Router pages
components/          # UI components
contexts/           # React contexts
hooks/              # Custom hooks
```

## Testing

```bash
npm test
npm run ts-check
npm run lint
```

## Releases & Changelog

This project uses automated releases and changelog generation via [Release Please](https://github.com/googleapis/release-please). 

### How it works:
- **Conventional Commits**: All commits must follow [conventional commit format](https://www.conventionalcommits.org/)
- **Automatic Releases**: When changes are pushed to `main`, Release Please creates/updates a release PR
- **Changelog Generation**: The `CHANGELOG.md` file is automatically updated based on commit messages
- **GitHub Releases**: When the release PR is merged, a new GitHub release is created automatically

### Commit Types:
- `feat:` - New features (minor version bump)
- `fix:` - Bug fixes (patch version bump)
- `feat!:` or `fix!:` - Breaking changes (major version bump)
- `docs:`, `style:`, `refactor:`, `test:`, `ci:`, `build:`, `chore:` - Other changes

Example: `feat: add new weight tracking feature`

View the full changelog at [CHANGELOG.md](CHANGELOG.md).

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for detailed information on how to get started, code standards, and the development workflow.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following our [code standards](CONTRIBUTING.md#code-standards)
4. Use conventional commits: `git commit -m "feat: add your feature"`
5. Run tests: `npm test -- --watchAll=false`
6. Submit a pull request

For more details, see [CONTRIBUTING.md](CONTRIBUTING.md).
