# Travel eSIM App

A comprehensive mobile application for purchasing and managing eSIM plans for international travel. Built with React Native and Expo for cross-platform compatibility (iOS and Android).

## Features

### 🏠 Home Screen
- Welcome dashboard with active eSIM status
- Quick action buttons for common tasks
- Featured eSIM plans with pricing
- Data usage tracking for active plans

### 📱 eSIM Plans
- Browse available eSIM plans by region
- Search and filter functionality
- Detailed plan information
- Purchase flow with secure payment
- Plan comparison features

### ✈️ Travel Management
- Trip planning and tracking
- Active eSIM management
- Data usage monitoring
- Trip history and statistics

### 👤 User Profile
- User account management
- App settings and preferences
- Notification controls
- Support and help center

## Tech Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **Icons**: Expo Vector Icons (Ionicons)
- **State Management**: React Hooks
- **Platform**: Cross-platform (iOS & Android)

## Prerequisites

Before running this app, make sure you have the following installed:

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ESIMTravelApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

## Running the App

### For iOS
```bash
npm run ios
```
*Note: Requires macOS and Xcode*

### For Android
```bash
npm run android
```
*Note: Requires Android Studio and Android SDK*

### For Web (Development)
```bash
npm run web
```

### Using Expo Go App
1. Install Expo Go on your device
2. Scan the QR code from the terminal
3. The app will load on your device

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Screen components
│   ├── HomeScreen.tsx
│   ├── ESIMScreen.tsx
│   ├── TravelScreen.tsx
│   ├── ProfileScreen.tsx
│   └── ESIMDetailScreen.tsx
├── types/              # TypeScript type definitions
│   └── index.ts
├── services/           # API services and utilities
├── utils/              # Helper functions
└── assets/             # Images, fonts, etc.
```

## Key Features Implementation

### Navigation
- Bottom tab navigation for main sections
- Stack navigation for eSIM details
- Type-safe navigation with TypeScript

### Data Management
- Mock data for demonstration
- TypeScript interfaces for type safety
- State management with React hooks

### UI/UX
- Modern, clean design
- Responsive layout
- Consistent color scheme
- Intuitive user interactions

## Configuration

### App Configuration
The app configuration is in `app.json`:
```json
{
  "expo": {
    "name": "Travel eSIM",
    "slug": "esim-travel-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#007AFF"
    }
  }
}
```

## Development

### Adding New Features
1. Create new components in `src/components/`
2. Add new screens in `src/screens/`
3. Update types in `src/types/index.ts`
4. Add navigation routes in `App.tsx`

### Styling
- Use StyleSheet for component styling
- Follow the established color scheme
- Maintain consistent spacing and typography

### State Management
- Use React hooks for local state
- Consider Context API for global state
- Implement proper error handling

## Testing

### Manual Testing
- Test on both iOS and Android devices
- Verify all navigation flows
- Test purchase flows
- Check responsive design

### Automated Testing
```bash
npm test
```

## Deployment

### Building for Production

#### iOS
```bash
expo build:ios
```

#### Android
```bash
expo build:android
```

### App Store Deployment
1. Configure app signing
2. Update app metadata
3. Submit to App Store Connect
4. Submit to Google Play Console

## API Integration

The current version uses mock data. To integrate with real APIs:

1. Create API services in `src/services/`
2. Replace mock data with API calls
3. Implement proper error handling
4. Add loading states

## Security Considerations

- Implement secure payment processing
- Add user authentication
- Secure API communication
- Data encryption for sensitive information

## Performance Optimization

- Implement lazy loading for images
- Optimize bundle size
- Use React.memo for expensive components
- Implement proper caching strategies

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **iOS build issues**
   ```bash
   cd ios && pod install
   ```

3. **Android build issues**
   ```bash
   cd android && ./gradlew clean
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Roadmap

- [ ] Real API integration
- [ ] Push notifications
- [ ] Offline support
- [ ] Multi-language support
- [ ] Advanced analytics
- [ ] Social features
- [ ] Loyalty program
- [ ] Advanced trip planning

---

**Note**: This is a demonstration app with mock data. For production use, integrate with real eSIM providers and implement proper security measures.