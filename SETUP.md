# Weather App Setup Guide 🔐

This guide explains how to securely configure the weather app with your API keys.

## 🚨 Security Note

API keys are **NOT** included in the public repository for security reasons. You need to create your own configuration file.

## 📋 Quick Setup

1. **Copy the configuration template:**
   ```bash
   cp config.example.js config.js
   ```

2. **Get your API keys:**
   - **OpenWeatherMap** (Primary): https://openweathermap.org/api
     - Sign up for free
     - Get your API key from dashboard
     - Free tier: 1,000 calls/day
   
   - **AccuWeather** (Backup): https://developer.accuweather.com/
     - Sign up for free  
     - Get your API key from dashboard
     - Free tier: 50 calls/day

3. **Update config.js with your keys:**
   ```javascript
   const CONFIG = {
       OPENWEATHER_API_KEY: 'your_actual_openweather_key_here',
       ACCUWEATHER_API_KEY: 'your_actual_accuweather_key_here',
       // ... other settings
   };
   ```

4. **Test the app:**
   - Open `index.html` in your browser
   - Check browser console for any errors
   - Add a city to test API calls

## 🔒 Security Features

- ✅ **API keys separated** from main code
- ✅ **config.js excluded** from git repository  
- ✅ **Example template** provided for setup
- ✅ **Fallback handling** if config is missing
- ✅ **Clear error messages** for missing configuration

## 📁 File Structure

```
weather-app/
├── index.html          # Main app
├── script.js           # App logic (NO API keys)
├── config.js           # Your API keys (NOT in git)
├── config.example.js   # Template (safe to commit)
├── SETUP.md           # This guide
└── .gitignore         # Excludes config.js
```

## 🚀 Deployment

### Local Development
1. Follow setup steps above
2. Open `index.html` in browser

### Production Deployment
- **Firebase Hosting**: Use environment variables or Firebase config
- **Netlify**: Use environment variables in build settings
- **Other platforms**: Follow their environment variable documentation

## ⚠️ Important Notes

- **Never commit** `config.js` to git
- **Always use** `config.example.js` as template
- **Test locally** before deploying
- **Monitor API usage** to avoid quota limits

## 🔧 Troubleshooting

### "Configuration not loaded" error:
- Make sure `config.js` exists
- Check that API keys are properly set
- Verify file is loaded before `script.js`

### API quota exceeded:
- Check your OpenWeatherMap dashboard
- Consider upgrading to paid tier if needed
- Switch to AccuWeather backup if available

### CORS errors:
- OpenWeatherMap supports CORS directly
- No proxy needed for this app

## 📞 Support

If you encounter issues:
1. Check browser console for error messages
2. Verify API keys are valid and active
3. Test API keys directly in browser or Postman
4. Check API provider documentation 