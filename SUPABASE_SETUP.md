# 🚀 Supabase Setup Guide

This guide will help you complete the Supabase migration for QuikQuillAI.

## ✅ What's Already Done

- ✅ Supabase client installed
- ✅ Configuration files created
- ✅ Environment variables updated
- ✅ Firebase Auth kept for Google Sign-in

## 📋 Steps to Complete Setup

### Step 1: Run SQL Migration

1. Go to your Supabase project: https://cwzplvdihhiluediffmr.supabase.co
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy the entire content from `supabase/migrations/001_initial_schema.sql`
5. Paste it into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

This will create:
- ✅ 5 tables: users, agents, scripts, tasks, usage_tracking
- ✅ All indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Helper functions for token tracking

### Step 2: Create Storage Bucket

1. In Supabase, click **Storage** in the left sidebar
2. Click **New Bucket**
3. Enter these settings:
   - **Name**: `agent-scripts`
   - **Public**: ❌ OFF (keep it private)
   - **File size limit**: 10 MB
   - **Allowed MIME types**: Leave empty (or add: text/*, application/javascript, application/x-python-code)
4. Click **Create Bucket**

### Step 3: Set Storage Policies

1. Click on the `agent-scripts` bucket you just created
2. Click on **Policies** tab
3. Click **New Policy**
4. Select **Full customization**
5. Run this SQL in the **SQL Editor** to add all policies:

```sql
-- Copy from supabase/storage-setup.sql
```

Or manually create these policies:

#### Policy 1: Users can upload
- **Name**: Users can upload own scripts
- **Policy definition**:
```sql
bucket_id = 'agent-scripts' AND auth.role() = 'authenticated'
```
- **Allowed operations**: INSERT

#### Policy 2: Users can view
- **Name**: Users can view own scripts
- **Policy definition**:
```sql
bucket_id = 'agent-scripts' AND auth.role() = 'authenticated'
```
- **Allowed operations**: SELECT

#### Policy 3: Users can delete
- **Name**: Users can delete own scripts
- **Policy definition**:
```sql
bucket_id = 'agent-scripts' AND auth.role() = 'authenticated'
```
- **Allowed operations**: DELETE

### Step 4: Verify Setup

Run this test query in SQL Editor to verify tables exist:

```sql
SELECT
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'agents', COUNT(*) FROM agents
UNION ALL
SELECT 'scripts', COUNT(*) FROM scripts
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'usage_tracking', COUNT(*) FROM usage_tracking;
```

You should see all 5 tables with 0 count.

### Step 5: Test Storage Bucket

1. Go to **Storage** > `agent-scripts`
2. Try uploading a test file
3. If successful, delete the test file
4. You're all set!

## 🔐 Security Notes

- Firebase Auth handles user authentication
- Supabase uses Firebase UID as user ID
- All data is isolated per user via RLS policies
- Storage is private by default
- Anonymous access is disabled

## 📊 Database Schema

```
users (Firebase UID as ID)
├── agents (1:many)
│   ├── scripts (1:many) [Storage: agent-scripts bucket]
│   └── tasks (1:many)
└── usage_tracking (1:many)
```

## 🎯 Next Steps

After completing setup:
1. Restart your Next.js dev server: `npm run dev`
2. Test creating an agent
3. Test uploading scripts to an agent
4. Test creating tasks

## 🐛 Troubleshooting

### Issue: SQL Migration fails
- Make sure you copied the ENTIRE script
- Check for syntax errors in the console
- Try running sections separately

### Issue: Storage policies not working
- Verify bucket name is exactly `agent-scripts`
- Check that policies are enabled
- Make sure you're authenticated

### Issue: Can't upload files
- Check file size < 10MB
- Verify storage policies are set
- Check browser console for errors

## 📞 Need Help?

Check the Supabase docs: https://supabase.com/docs
