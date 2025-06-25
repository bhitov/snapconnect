# SnapConnect 📸

A modern, ephemeral messaging app built with React Native, TypeScript, and Firebase. SnapConnect brings the excitement of disappearing messages, stories, and real-time communication to mobile devices.


## HOW TO RUN THIS (the part of this file written by a human)
npm install
cp env.demo.local .env.local
in one console tab, npm run emulator
in another, npm run start:tunnel
when the app builds, hit 'a' to launch your android emulator. You may need to install the android developer studio for this to work.

(END OF HUMAN WRITTEN PART)


## 🚀 Quick Start

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/snapconnect.git
cd snapconnect
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Configure Firebase:
   - Create a new Firebase project
   - Enable Authentication, Realtime Database, and Storage
   - Copy your config values to `.env`

5. Start development server:
```bash
npm start
```

6. Scan QR code with Expo Go app

## 📱 Features

### Core Features (MVP)
- ✅ User authentication (email/password, Google OAuth)
- ✅ Camera functionality with filters
- ✅ Send disappearing photos/videos (snaps)
- ✅ Real-time messaging
- ✅ Stories (24-hour posts)
- ✅ Friend system
- ✅ Group messaging

### Advanced Features (Coming Soon)
- AR filters and lenses
- Voice and video calls
- Snap Map
- Memories
- Premium features

## 🛠 Tech Stack

### Frontend
- **React Native** (Expo Managed Workflow) - Cross-platform mobile development
- **TypeScript** - Type safety and better developer experience
- **React Navigation v6** - Seamless screen navigation
- **React Native Elements** - UI component library
- **React Native Reanimated 3** - High-performance animations

### Backend
- **Firebase Auth** - User authentication and session management
- **Firebase Realtime Database** - Real-time data synchronization
- **Firebase Cloud Storage** - Media file storage
- **Firebase Cloud Functions** - Server-side logic

### State & Data
- **Zustand** - Lightweight state management
- **React Hook Form** - Performant form handling
- **AsyncStorage** - Local data persistence

### Development
- **ESLint & Prettier** - Code quality and formatting
- **Jest & React Native Testing Library** - Testing framework
- **Reactotron** - Development debugging

## 📁 Project Structure

```
snapconnect/
├── src/
│   ├── app/                  # App-level configuration
│   ├── features/            # Feature-based modules
│   │   ├── auth/           # Authentication
│   │   ├── camera/         # Camera functionality
│   │   ├── chat/           # Messaging features
│   │   ├── friends/        # Friend management
│   │   └── stories/        # Stories feature
│   ├── shared/             # Shared resources
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── navigation/     # Navigation configuration
│   │   ├── services/       # API and external services
│   │   ├── theme/          # Design system
│   │   └── utils/          # Helper functions
│   └── assets/             # Images, fonts, etc.
├── _docs/                  # Project documentation
│   ├── phases/            # Development phases
│   └── *.md              # Documentation files
└── __tests__/             # Test files
```

## 🎯 Development Phases

### Phase 1: Setup ✅ Complete
- [x] Project initialization with Expo
- [x] TypeScript configuration
- [x] Directory structure setup
- [x] Theme system implementation
- [x] Navigation structure
- [x] Base components
- [x] Development tools configuration
- [x] Firebase setup

### Phase 2: MVP Features (In Progress)
- [ ] User authentication screens
- [ ] Camera implementation
- [ ] Snap sending functionality
- [ ] Friend system
- [ ] Basic messaging
- [ ] Stories feature

### Phase 3: Social Features
- [ ] Group chats
- [ ] Push notifications
- [ ] Advanced animations
- [ ] Friend suggestions

### Phase 4: Polish & Advanced
- [ ] AR filters
- [ ] Voice/video calls
- [ ] Performance optimization
- [ ] Premium features

## 🏗 Development

### Code Style

This project follows strict TypeScript and functional programming patterns:
- No classes, only functional components and hooks
- Maximum file length: 500 lines
- Comprehensive JSDoc documentation
- AI-friendly, self-documenting code

### Available Scripts

```bash
# Development
npm start              # Start Expo dev server
npm run ios           # Run on iOS simulator
npm run android       # Run on Android emulator

# Code Quality
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint issues
npm run format        # Format with Prettier
npm run type-check    # TypeScript validation

# Building
eas build             # Build with EAS
```

### Git Workflow

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes following our coding standards
3. Commit with conventional commits: `git commit -m "feat: add new feature"`
4. Push and create PR

## 📚 Documentation

- [Project Overview](_docs/project-overview.md) - Detailed PRD
- [Tech Stack](_docs/tech-stack.md) - Technology decisions
- [User Flow](_docs/user-flow.md) - User journey maps
- [UI Rules](_docs/ui-rules.md) - Design guidelines
- [Theme Rules](_docs/theme-rules.md) - Color and styling
- [Project Rules](_docs/project-rules.md) - Coding standards
- [Development Phases](_docs/phases/) - Implementation roadmap

## 🤝 Contributing

Please read our [Project Rules](_docs/project-rules.md) before contributing. We maintain high code quality standards and appreciate your cooperation.

## 📄 License

This project is for educational purposes. Please respect Snapchat's trademarks and intellectual property.

---

Built with ❤️ using React Native and TypeScript

## 🚦 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (Mac) or Android Emulator
- Firebase account for backend services

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/snapconnect.git
   cd snapconnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Firebase credentials
   ```

4. **Start development server**
   ```bash
   expo start
   ```

5. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## 📱 Core User Flows

1. **Authentication** → Register/Login → Profile Setup → Main App
2. **Capture & Send** → Camera → Capture → Preview → Select Friends → Send
3. **View Snaps** → Chats → Tap Snap → View (auto-disappear) → Return
4. **Stories** → Camera → Add to Story → Friends View → 24hr Expiration
5. **Friends** → Search → Add Friend → Accept Request → Start Snapping

See [User Flow](./_docs/user-flow.md) for detailed journey maps.

## 🎨 Design System

SnapConnect uses a modern, vibrant design system:

- **Primary Color**: `#FFD60A` (Bright Yellow)
- **Secondary Color**: `#7209B7` (Deep Purple)
- **Typography**: System fonts (SF Pro/Roboto)
- **Spacing**: 8px grid system
- **Animations**: 200-300ms for optimal performance

See [Theme Rules](./_docs/theme-rules.md) and [UI Rules](./_docs/ui-rules.md) for complete design guidelines.

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e
```

## 📚 Documentation

- [Project Overview](./_docs/project-overview.md) - Detailed project requirements
- [Tech Stack](./_docs/tech-stack.md) - Technology decisions and rationale
- [Project Rules](./_docs/project-rules.md) - Coding standards and conventions
- [User Flow](./_docs/user-flow.md) - User journey and navigation
- [UI Rules](./_docs/ui-rules.md) - Interface design principles
- [Theme Rules](./_docs/theme-rules.md) - Visual design system
- [Development Phases](./_docs/phases/) - Iterative development plan

## 🙏 Acknowledgments

- Built with React Native and Expo
- Powered by Firebase
- Inspired by Snapchat's ephemeral messaging concept

---

**Note**: This is an educational project demonstrating modern mobile app development practices with React Native, TypeScript, and Firebase. 