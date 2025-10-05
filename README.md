# QuikQuill - AI Writer Agents Platform

A modern, responsive web application for creating and managing AI writer agents with advanced collaboration features.

## Features

- 🤖 **Multi-Agent AI Writing**: Create specialized AI writers with custom styles and tones
- 📝 **Rich Text Editor**: Advanced editing with AI rephrasing and custom prompts
- 📚 **Revision History**: Branch-style history tracking with restoration capabilities
- 🔄 **Real-time Collaboration**: Live updates with Firebase Realtime Database
- 📎 **File Management**: Support for PDF, DOC, images, and video attachments
- 💳 **Subscription Management**: Stripe integration for premium features
- 🎨 **Premium UI/UX**: Responsive design with smooth animations
- 🔐 **Secure Authentication**: Google OAuth via Firebase

## Tech Stack

- **Frontend**: Next.js 13+ with App Router
- **UI**: ShadCN UI components with Tailwind CSS
- **Backend**: Firebase (Auth, Realtime Database, Storage)
- **AI**: Google Gemini API
- **Payments**: Stripe
- **Animations**: Framer Motion

## Setup Instructions

### 1. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication and select Google as sign-in provider
3. Enable Realtime Database
4. Enable Storage
5. Copy your Firebase config and add to `.env.local`

### 2. Gemini AI Setup

1. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add the API key to `.env.local`

### 3. Stripe Setup

1. Create a Stripe account at [Stripe Dashboard](https://dashboard.stripe.com)
2. Get your API keys (publishable and secret)
3. Create a subscription product ($10/month)
4. Set up a webhook endpoint for your app
5. Add all Stripe configuration to `.env.local`

### 4. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your configuration:

```bash
cp .env.local.example .env.local
```

### 5. Install and Run

```bash
npm install
npm run dev
```

## Firebase Security Rules

### Realtime Database Rules

```json
{
  "rules": {
    "agents": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "tasks": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

### Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Deployment

The app is configured for static export and can be deployed to any static hosting provider:

```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.