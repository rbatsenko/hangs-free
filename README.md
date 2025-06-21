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

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for detailed information on how to get started, code standards, and the development workflow.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes following our [code standards](CONTRIBUTING.md#code-standards)
4. Run tests: `npm test -- --watchAll=false`
5. Submit a pull request

For more details, see [CONTRIBUTING.md](CONTRIBUTING.md).
