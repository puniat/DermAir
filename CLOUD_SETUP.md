# Cloud Storage Setup Guide

This guide will help you set up cloud storage for DermAir using Supabase (free tier supports 5000+ users).

## Quick Setup Steps

### 1. Create a Supabase Account
1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up for a free account
3. Create a new project (choose a name like "dermair")

### 2. Set Up the Database
1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `database/schema.sql` in this project
3. Paste it into the SQL Editor and run it
4. This creates all the necessary tables and security policies

### 3. Configure Environment Variables
1. Copy `.env.example` to `.env.local`
2. In your Supabase dashboard, go to Settings → API
3. Copy your Project URL and anon public key
4. Update `.env.local` with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Set Up File Storage (Optional)
1. In Supabase dashboard, go to Storage
2. Create a new bucket called `dermair-images`
3. Set it to private (not public)
4. Configure upload policies as needed

### 5. Test the Connection
1. Restart your development server: `npm run dev`
2. Go to Settings in the DermAir dashboard
3. Toggle "Cloud Storage" on
4. Your data should start syncing to the cloud!

## Free Tier Limits
- **Database Storage**: 500MB (plenty for user data)
- **File Storage**: 1GB (good for ~5000 skin images)
- **Monthly Active Users**: 50,000 (way more than needed)
- **Bandwidth**: 5GB/month
- **API Requests**: 500,000/month

## Data Migration
When you enable cloud storage for the first time:
1. Your existing local data will be automatically uploaded
2. A backup of your local data is kept
3. You can switch back to local storage anytime

## Privacy & Security
- All data is encrypted in transit and at rest
- Row Level Security ensures users only see their own data
- No data is shared between users
- You can export your data anytime
- GDPR compliant

## Troubleshooting

### Connection Issues
- Check your environment variables are correct
- Ensure your Supabase project is not paused (free tier pauses after 1 week of inactivity)
- Check the browser console for specific error messages

### Performance
- The free tier includes real-time syncing
- Data loads instantly from the cloud
- Offline functionality still works with local caching

### Data Loss Prevention
- Cloud storage provides automatic backups
- Your data is replicated across multiple servers
- Much more reliable than local storage
- No more data loss on server restarts!

## Advanced Configuration

### Custom Policies
If you want to customize data access, edit the RLS policies in `database/schema.sql`

### Monitoring Usage
Use the Supabase dashboard to monitor:
- Database size and growth
- API usage
- Active users
- Storage usage

### Scaling Beyond Free Tier
When you outgrow the free tier:
- Pro plan: $25/month for 8GB database, 100GB storage
- Teams plan: $599/month for unlimited everything
- But free tier should handle 5000+ users easily!

## Need Help?
- Supabase docs: [https://supabase.com/docs](https://supabase.com/docs)
- Check the console logs in your browser for errors
- Feel free to modify the cloud storage service in `src/lib/cloudStorage.ts`