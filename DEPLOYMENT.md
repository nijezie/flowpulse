# FlowPulse Deployment Guide

## Quick Deploy to Vercel

### 1. Prerequisites
- GitHub account
- Vercel account (free)
- Neon PostgreSQL account (free)

### 2. Database Setup (Neon)

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project called "flowpulse"
3. Copy the connection string (it looks like: `postgresql://username:password@host/database`)
4. Save this for step 4

### 3. Deploy to Vercel

#### Option A: One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/flowpulse)

#### Option B: Manual Deploy
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your GitHub repository
5. Configure build settings:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/build`
   - **Install Command**: `npm run install-all`

### 4. Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables, add:

\`\`\`
DATABASE_URL=your_neon_connection_string_here
NODE_ENV=production
PORT=3000
ENABLE_POLLING=true
\`\`\`

### 5. Initialize Database

After deployment, run the database initialization:

1. Go to Vercel Dashboard → Project → Functions
2. Find the `/api/health` function
3. Or use Vercel CLI:
   \`\`\`bash
   npx vercel env pull .env.local
   cd server && node scripts/init-db.js
   \`\`\`

### 6. Test Your Deployment

Visit your Vercel URL:
- Main app: `https://your-app.vercel.app`
- Health check: `https://your-app.vercel.app/api/health`
- Flows API: `https://your-app.vercel.app/api/flows`

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify DATABASE_URL is correct
   - Check Neon database is active
   - Ensure IP allowlist includes 0.0.0.0/0

2. **Build Failures**
   - Check Node.js version (should be 18+)
   - Verify all dependencies are installed
   - Check build logs in Vercel dashboard

3. **API Routes Not Working**
   - Verify vercel.json routing configuration
   - Check function logs in Vercel dashboard
   - Ensure CORS settings are correct

### Performance Tips

1. **Database Optimization**
   - Run the index creation scripts
   - Monitor query performance in Neon
   - Consider connection pooling for high traffic

2. **Vercel Optimization**
   - Enable Edge Functions for better performance
   - Use Vercel Analytics to monitor usage
   - Set up proper caching headers

## Post-Deployment

### 1. Monitor Your App
- Check Vercel Analytics
- Monitor database usage in Neon
- Set up error tracking (Sentry recommended)

### 2. Custom Domain (Optional)
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Update CORS settings in server code

### 3. Scale Considerations
- Neon free tier: 512 MB storage, 1 compute unit
- Vercel free tier: 100 GB bandwidth, 6000 minutes build time
- Consider upgrading for production traffic

## Security Checklist

- [ ] Environment variables are set correctly
- [ ] Database credentials are secure
- [ ] CORS is configured for your domain only
- [ ] Rate limiting is enabled
- [ ] Input validation is working
- [ ] HTTPS is enforced

## Next Steps After Deployment

1. **Add Real APIs**: Replace mock data with actual blockchain APIs
2. **User Authentication**: Implement login system
3. **Monitoring**: Set up error tracking and performance monitoring
4. **Testing**: Add automated tests
5. **Documentation**: Create API documentation

---

🎉 **Congratulations!** Your FlowPulse dashboard is now live!

Share your deployment URL and start getting feedback from users.
