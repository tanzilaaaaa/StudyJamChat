# Deployment Guide

## 🚀 Overview

This guide covers deploying both the backend server and building the mobile app for distribution.

---

## 📦 Backend Deployment (Render)

### **Step 1: Prepare Your Backend**

Make sure your `backend/package.json` has the correct start script:

```json
{
  "name": "studyjam-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.6.1",
    "cors": "^2.8.5"
  }
}
```

### **Step 2: Create Render Account**

1. Go to https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"

### **Step 3: Connect Repository**

1. Connect your GitHub repository
2. Select the repository containing your backend
3. Render will detect it's a Node.js app

### **Step 4: Configure Service**

**Settings:**
- **Name:** `studyjam-backend` (or your choice)
- **Region:** Choose closest to your users
- **Branch:** `main` (or your default branch)
- **Root Directory:** `backend`
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** Free (or paid for better performance)

### **Step 5: Environment Variables**

Add these environment variables in Render dashboard:

```
NODE_ENV=production
PORT=3000
```

### **Step 6: Deploy**

1. Click "Create Web Service"
2. Render will build and deploy automatically
3. Wait for deployment to complete (5-10 minutes)
4. You'll get a URL like: `https://studyjam-backend.onrender.com`

### **Step 7: Test Deployment**

```bash
# Test health endpoint
curl https://your-app.onrender.com

# Should return:
# {"message":"StudyJam Chat Server is running","timestamp":"..."}
```

### **Step 8: Update App Configuration**

Update `src/socketService.js` with your Render URL:

```javascript
const SOCKET_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://your-app.onrender.com';
```

---

## 📱 Mobile App Build (EAS Build)

### **Prerequisites**

1. **Expo Account:**
   - Sign up at https://expo.dev
   - Install EAS CLI: `npm install -g eas-cli`
   - Login: `eas login`

2. **Android/iOS Developer Accounts:**
   - Android: Google Play Console ($25 one-time)
   - iOS: Apple Developer Program ($99/year)

---

## 🤖 Android APK Build

### **Step 1: Configure EAS**

Your `eas.json` should look like this:

```json
{
  "cli": {
    "version": ">= 13.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildType": "release"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### **Step 2: Update app.json**

Make sure your `app.json` has correct package name:

```json
{
  "expo": {
    "name": "Studyjam",
    "slug": "Studyjam",
    "version": "1.0.0",
    "android": {
      "package": "com.tanzisprvv.Studyjam",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      }
    }
  }
}
```

### **Step 3: Build APK**

```bash
# For testing (preview build)
eas build --platform android --profile preview

# For production
eas build --platform android --profile production
```

### **Step 4: Download APK**

1. Build will take 10-20 minutes
2. You'll get a link to download the APK
3. Or check builds at: https://expo.dev/accounts/[your-username]/projects/studyjam/builds

### **Step 5: Install APK**

**On Android Device:**
1. Download APK to phone
2. Enable "Install from Unknown Sources" in Settings
3. Open APK file
4. Click "Install"

**Via ADB:**
```bash
adb install path/to/your-app.apk
```

---

## 🍎 iOS Build

### **Step 1: Apple Developer Setup**

1. Join Apple Developer Program ($99/year)
2. Create App ID in Apple Developer Console
3. Create provisioning profile

### **Step 2: Configure iOS in app.json**

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.studyjam",
      "buildNumber": "1.0.0",
      "supportsTablet": true
    }
  }
}
```

### **Step 3: Build for iOS**

```bash
# For testing (TestFlight)
eas build --platform ios --profile preview

# For production (App Store)
eas build --platform ios --profile production
```

### **Step 4: Submit to App Store**

```bash
eas submit --platform ios
```

---

## 🌐 Web Deployment

### **Step 1: Build for Web**

```bash
npx expo export:web
```

This creates a `web-build` folder with static files.

### **Step 2: Deploy to Netlify**

1. Go to https://netlify.com
2. Drag and drop `web-build` folder
3. Or connect GitHub repo and set:
   - **Build command:** `npx expo export:web`
   - **Publish directory:** `web-build`

### **Step 3: Deploy to Vercel**

```bash
npm install -g vercel
vercel --prod
```

### **Step 4: Custom Domain (Optional)**

1. Buy domain from Namecheap, GoDaddy, etc.
2. Add domain in Netlify/Vercel dashboard
3. Update DNS records as instructed

---

## 🔄 Continuous Deployment

### **GitHub Actions for Backend**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Render

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Trigger Render Deploy
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

Add `RENDER_DEPLOY_HOOK` in GitHub Secrets (get from Render dashboard).

### **Auto-build on Push**

Render automatically rebuilds when you push to GitHub (if connected).

---

## 📊 Monitoring & Logs

### **Render Logs**

1. Go to Render dashboard
2. Click your service
3. Click "Logs" tab
4. See real-time server logs

### **EAS Build Logs**

```bash
# View build logs
eas build:list

# View specific build
eas build:view [build-id]
```

### **App Analytics**

Consider adding:
- **Sentry:** Error tracking
- **Google Analytics:** User analytics
- **Firebase Analytics:** Mobile analytics

---

## 🔐 Environment Variables

### **Backend (Render)**

Set in Render dashboard:
```
NODE_ENV=production
PORT=3000
FIREBASE_API_KEY=your-key
```

### **Mobile App**

Create `.env` file:
```
EXPO_PUBLIC_API_URL=https://your-backend.onrender.com
EXPO_PUBLIC_FIREBASE_API_KEY=your-key
```

Access in code:
```javascript
const API_URL = process.env.EXPO_PUBLIC_API_URL;
```

---

## 🧪 Testing Before Deployment

### **Backend Testing**

```bash
# Run locally
cd backend
npm start

# Test endpoints
curl http://localhost:3000
curl http://localhost:3000/rooms
```

### **App Testing**

```bash
# Test on device
npx expo start

# Scan QR code with Expo Go app
```

### **Build Testing**

```bash
# Test preview build
eas build --platform android --profile preview

# Install and test on device
```

---

## 📋 Pre-Deployment Checklist

### **Backend**

- [ ] All dependencies in package.json
- [ ] Environment variables configured
- [ ] CORS settings correct
- [ ] Error handling implemented
- [ ] Logs configured
- [ ] Health check endpoint working

### **Mobile App**

- [ ] Backend URL updated
- [ ] Firebase config correct
- [ ] App icon and splash screen set
- [ ] Package name/bundle ID unique
- [ ] Version numbers updated
- [ ] Permissions configured
- [ ] Tested on real devices

### **Security**

- [ ] API keys not in code
- [ ] Environment variables used
- [ ] HTTPS enabled
- [ ] Authentication working
- [ ] Data validation implemented

---

## 🚨 Common Deployment Issues

### **Issue: Backend not starting on Render**

**Solution:**
- Check logs in Render dashboard
- Verify `package.json` start script
- Ensure all dependencies installed
- Check Node version compatibility

### **Issue: Socket.io connection fails**

**Solution:**
- Verify CORS settings
- Check backend URL in app
- Ensure WebSocket support enabled
- Test with curl first

### **Issue: EAS build fails**

**Solution:**
```bash
# Clear cache
eas build:clear-cache

# Update EAS CLI
npm install -g eas-cli@latest

# Check build logs
eas build:view [build-id]
```

### **Issue: APK won't install**

**Solution:**
- Enable "Unknown Sources" on Android
- Check package name is unique
- Verify APK is not corrupted
- Try uninstalling old version first

### **Issue: App crashes on launch**

**Solution:**
- Check Firebase configuration
- Verify all API keys correct
- Test backend connection
- Check device logs: `adb logcat`

---

## 📈 Scaling Considerations

### **Backend Scaling**

**Free Tier Limitations:**
- Render free tier sleeps after 15 min inactivity
- First request after sleep takes 30-60 seconds
- Limited to 750 hours/month

**Upgrade Options:**
- **Starter ($7/month):** No sleep, better performance
- **Standard ($25/month):** More resources, autoscaling
- **Pro ($85/month):** High performance, dedicated resources

### **Database Migration**

When you outgrow JSON file storage:

1. **MongoDB Atlas:**
```bash
npm install mongoose
```

2. **PostgreSQL:**
```bash
npm install pg
```

3. **Firebase Firestore:**
```bash
npm install firebase-admin
```

### **CDN for Files**

For better file sharing:
- **AWS S3:** Store files in cloud
- **Cloudinary:** Image/video hosting
- **Firebase Storage:** Easy integration

---

## 🎯 Production Best Practices

### **1. Use Environment Variables**

Never hardcode:
- API keys
- Database URLs
- Secret tokens

### **2. Enable HTTPS**

Render provides free SSL certificates automatically.

### **3. Set Up Monitoring**

```bash
# Add Sentry
npm install @sentry/react-native

# Initialize
Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
});
```

### **4. Implement Logging**

```javascript
// Use winston or pino
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### **5. Add Health Checks**

```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});
```

---

## 📱 App Store Submission

### **Google Play Store**

1. Create developer account ($25)
2. Build production APK
3. Create app listing
4. Upload APK
5. Fill out store listing
6. Submit for review (1-3 days)

### **Apple App Store**

1. Join Apple Developer Program ($99/year)
2. Build production IPA
3. Upload via App Store Connect
4. Fill out app information
5. Submit for review (1-7 days)

---

## 🎉 Post-Deployment

### **Monitor Performance**

- Check Render logs daily
- Monitor error rates
- Track user feedback
- Watch server resources

### **Update Strategy**

```bash
# Update backend
git push origin main  # Auto-deploys on Render

# Update mobile app
# 1. Update version in app.json
# 2. Build new version
eas build --platform android --profile production
# 3. Submit to store
```

### **Backup Strategy**

```bash
# Backup rooms-data.json regularly
# Set up automated backups on Render
# Or use database with automatic backups
```

---

## 📞 Support Resources

- **Render Docs:** https://render.com/docs
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Expo Forums:** https://forums.expo.dev
- **Stack Overflow:** Tag with `expo`, `react-native`

---

**Your app is now deployed and ready for users!** 🚀
