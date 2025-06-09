# Weather Forecast Calendar App 🌤️

A beautiful, modern weather forecast application powered by **AccuWeather API** built with HTML, CSS, and JavaScript. Features a calendar-style layout for viewing weather across multiple cities for 5, 7, 10, or 15-day periods.

![Weather App Preview](https://via.placeholder.com/800x400/667eea/ffffff?text=Weather+Forecast+App)

## ✨ Features

- **Calendar-Style Layout**: Weather data displayed in an intuitive calendar grid
- **Multi-City Support**: Add and manage up to 50 cities simultaneously  
- **AccuWeather Integration**: Professional-grade weather accuracy from AccuWeather API
- **Multiple Forecast Periods**: Choose from 5, 7, 10, or 15-day forecasts
- **Adaptive Display**: Interface adjusts based on number of cities and forecast period
- **City Management**: Add/remove cities with validation and bulk operations
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Modern UI**: Beautiful styling with custom scrollbars and hover effects
- **Smart Fallback**: Demo data when API limits are reached

## 🚀 Quick Start

1. **Clone or Download** the files to your computer
2. **Open `index.html`** in your web browser
3. **Start using** the app immediately (demo mode with sample data)

✅ **AccuWeather API is already configured** - no additional setup needed!

## 🛠️ Setup Instructions

### Option 1: Basic Setup (Demo Mode)
1. Download all files (`index.html`, `styles.css`, `script.js`, `README.md`)
2. Open `index.html` in any modern web browser
3. The app will work with demo data

### Option 2: Full Setup (AccuWeather API - Already Configured!)
✅ **The app is already configured with AccuWeather API** and ready to use with real weather data!

- Professional-grade accuracy from AccuWeather
- Up to 15-day forecasts available
- Location-based weather lookups
- Automatic city validation

## 📁 Project Structure

```
weather-app/
├── index.html          # Main HTML file
├── styles.css          # Styling and animations
├── script.js           # JavaScript functionality
└── README.md          # Documentation
```

## 🌐 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## 🎨 Design Features

- **Glassmorphism Effects**: Modern translucent cards
- **Gradient Backgrounds**: Beautiful color transitions
- **Smooth Animations**: Hover effects and transitions
- **Responsive Grid**: Adaptive layout for all screen sizes
- **Font Awesome Icons**: Professional weather icons
- **Google Fonts**: Poppins font family for modern typography

## 📊 Weather Data Includes

### Current Weather:
- Temperature (°C)
- Feels like temperature
- Weather description
- Humidity percentage
- Wind speed (km/h)
- Atmospheric pressure (hPa)
- Visibility (km)
- Cloudiness percentage
- UV Index (simulated)

### 5-Day Forecast:
- Daily high/low temperatures
- Weather conditions
- Weather icons
- Day of the week

## 🔧 Customization

### Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --primary-color: #4f46e5;
    --secondary-color: #7c3aed;
    --accent-color: #06b6d4;
    /* ... more variables */
}
```

### Default City
Change the default city in `script.js`:
```javascript
loadWeatherData('Your City Name');
```

## 🌍 API Information

This app uses the [OpenWeatherMap API](https://openweathermap.org/api):
- **Free Tier**: 1,000 calls/day
- **Rate Limit**: 60 calls/minute
- **Data**: Current weather + 5-day forecast
- **Coverage**: Worldwide

## 📱 Mobile Features

- Touch-friendly interface
- Swipe gestures support
- Responsive typography
- Optimized button sizes
- Mobile-first design

## 🔒 Privacy & Security

- No personal data stored
- Location data used only for weather lookup
- API calls made directly to OpenWeatherMap
- No third-party tracking

## 🐛 Troubleshooting

### Common Issues:

1. **"API key not found"**: Make sure you've replaced the placeholder API key
2. **"City not found"**: Check spelling and try with country code (e.g., "London, UK")
3. **Location access denied**: Enable location permissions in browser settings
4. **No internet connection**: Check your network connection

### Debug Mode:
Open browser Developer Tools (F12) to see detailed error messages in the console.

## 🤝 Contributing

Feel free to contribute to this project:
1. Fork the repository
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](https://opensource.org/licenses/MIT).

## 🙏 Acknowledgments

- [OpenWeatherMap](https://openweathermap.org/) for weather data API
- [Font Awesome](https://fontawesome.com/) for icons
- [Google Fonts](https://fonts.google.com/) for typography
- Inspiration from modern weather apps

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Ensure you have a stable internet connection
4. Verify your API key is correct and active

---

**Enjoy forecasting the weather! 🌈** 