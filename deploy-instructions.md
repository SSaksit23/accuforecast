# Weather Forecast App - Google Cloud Deployment Guide

## 🚀 Option 1: Firebase Hosting (Recommended for Static Sites)

### Prerequisites:
- Google account
- Node.js installed
- Firebase CLI installed

### Step-by-Step Instructions:

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Create a new Firebase project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project"
   - Enter project name (e.g., "weather-forecast-app")
   - Follow the setup wizard

4. **Initialize Firebase in your project folder:**
   ```bash
   firebase init hosting
   ```
   - Select your project
   - Set public directory to: `.` (current directory)
   - Configure as single-page app: `No`
   - Don't overwrite index.html

5. **Update .firebaserc file:**
   - Replace "your-project-id-here" with your actual Firebase project ID

6. **Deploy your site:**
   ```bash
   firebase deploy
   ```

7. **Your site will be live at:**
   ```
   https://your-project-id.web.app
   ```

### Benefits:
- ✅ Free tier available (generous limits)
- ✅ Global CDN
- ✅ SSL/HTTPS included
- ✅ Custom domains supported
- ✅ Easy rollbacks
- ✅ Preview deployments

---

## 🌐 Option 2: Google Cloud Storage Static Website

### Step-by-Step Instructions:

1. **Create a Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project

2. **Enable Cloud Storage API:**
   - In the console, go to APIs & Services
   - Enable Cloud Storage API

3. **Create a Storage Bucket:**
   ```bash
   gsutil mb gs://your-unique-bucket-name
   ```

4. **Upload your files:**
   ```bash
   gsutil -m cp -r * gs://your-unique-bucket-name
   ```

5. **Configure for static website:**
   ```bash
   gsutil web set -m index.html -e index.html gs://your-unique-bucket-name
   ```

6. **Make bucket public:**
   ```bash
   gsutil iam ch allUsers:objectViewer gs://your-unique-bucket-name
   ```

7. **Access your site at:**
   ```
   https://storage.googleapis.com/your-unique-bucket-name/index.html
   ```

### Benefits:
- ✅ Very cost-effective
- ✅ Simple setup
- ✅ Good for basic hosting
- ❌ No built-in CDN (requires Cloud CDN setup)

---

## ⚡ Option 3: Google App Engine

### Step-by-Step Instructions:

1. **Create app.yaml:**
   ```yaml
   runtime: python39
   
   handlers:
   - url: /
     static_files: index.html
     upload: index.html
   
   - url: /(.*)
     static_files: \1
     upload: (.*)
   ```

2. **Deploy:**
   ```bash
   gcloud app deploy
   ```

### Benefits:
- ✅ Serverless
- ✅ Auto-scaling
- ✅ Custom domains
- ✅ SSL included
- ❌ More expensive than static hosting

---

## 🔧 Before Deployment - Production Optimizations

### 1. Update API Key (if using real weather data):
- Get OpenWeatherMap API key
- Update `script.js` line 2:
  ```javascript
  const API_KEY = 'your_real_api_key_here';
  ```

### 2. Optimize for Production:
- Minify CSS/JS (optional)
- Compress images
- Enable gzip compression

### 3. Set up Custom Domain (Optional):
- Purchase domain
- Configure DNS settings
- Add domain in Firebase/Cloud console

---

## 📊 Cost Comparison:

| Option | Free Tier | Paid Pricing | Best For |
|--------|-----------|--------------|----------|
| Firebase Hosting | 10GB/month | $0.026/GB | Static sites |
| Cloud Storage | 5GB/month | $0.020/GB | Simple hosting |
| App Engine | Limited hours | $0.05/hour | Dynamic apps |

---

## 🚀 Quick Deploy Commands (Firebase):

```bash
# One-time setup
npm install -g firebase-tools
firebase login
firebase init hosting

# Deploy (run this each time you update)
firebase deploy

# View logs
firebase hosting:channel:list
```

---

## 🔗 Useful Links:

- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
- [OpenWeatherMap API](https://openweathermap.org/api)

---

## 📝 Notes:

- **Firebase Hosting** is recommended for most users
- **Cloud Storage** is good for minimal cost
- **App Engine** is overkill for static sites
- All options support HTTPS by default
- Custom domains available on all platforms 