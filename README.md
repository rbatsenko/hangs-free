# HangsFree

A React Native app for tracking hangboard training with Bluetooth scale integration.

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
