# Firebase Realtime Database Setup Guide

## Issue: Permission Denied Error

If you're getting "permission denied" errors when creating agents or tasks, it means your Firebase Realtime Database security rules need to be updated.

## Quick Fix - Update Firebase Database Rules

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **quikquillai**

### Step 2: Navigate to Realtime Database Rules
1. In the left sidebar, click on **"Realtime Database"**
2. Click on the **"Rules"** tab at the top

### Step 3: Replace the Rules
Replace the existing rules with these:

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

### Step 4: Publish the Rules
1. Click the **"Publish"** button
2. Wait a few seconds for the rules to take effect

## What These Rules Do

- **`.read: "$uid === auth.uid"`** - Users can only read their own data
- **`.write: "$uid === auth.uid"`** - Users can only write to their own data
- The `$uid` variable matches the user ID in the database path
- Only authenticated users can access the database

## Verify the Database Structure

Your database should have this structure:
```
/
├── agents/
│   └── {userId}/
│       └── {agentId}/
│           ├── name: "..."
│           ├── role: "..."
│           └── ...
└── tasks/
    └── {userId}/
        └── {taskId}/
            ├── title: "..."
            ├── description: "..."
            └── ...
```

## Check if it's Working

1. Refresh your app
2. Try creating a new agent
3. You should see it appear in the list
4. No more "permission denied" errors!

## Alternative: Use Firebase CLI

If you prefer using the command line:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init database

# Deploy the rules
firebase deploy --only database
```

## Troubleshooting

### Still getting permission denied?
1. Make sure you're logged in with Google (check the user icon in the sidebar)
2. Check browser console for detailed error messages
3. Verify your `.env.local` file has the correct Firebase configuration
4. Try logging out and logging back in

### Database URL not set?
Make sure your `.env.local` has:
```
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://quikquillai-default-rtdb.firebaseio.com
```
(Replace with your actual database URL from Firebase Console)

### Can't find Realtime Database in Firebase?
1. You might need to create a Realtime Database first
2. Go to Firebase Console → Realtime Database
3. Click "Create Database"
4. Choose a location (e.g., us-central1)
5. Start in "locked mode" (we'll add rules manually)
6. Then follow the steps above to add the correct rules

## Need Help?

If you're still having issues, please check:
1. Firebase Console → Authentication → Users (make sure your user is listed)
2. Firebase Console → Realtime Database → Data (check if data is being created)
3. Browser Console (F12) → Check for any error messages
