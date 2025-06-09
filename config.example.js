// Weather App Configuration Template
// Copy this file to 'config.js' and add your real API keys

const CONFIG = {
    // OpenWeatherMap API Configuration
    // Get your free API key at: https://openweathermap.org/api
    OPENWEATHER_API_KEY: 'your_openweathermap_api_key_here',
    OPENWEATHER_BASE_URL: 'https://api.openweathermap.org/data/2.5',
    
    // AccuWeather API Configuration (backup)
    // Get your free API key at: https://developer.accuweather.com/
    ACCUWEATHER_API_KEY: 'your_accuweather_api_key_here',
    ACCUWEATHER_BASE_URL: 'https://dataservice.accuweather.com',
    
    // API Settings
    USE_OPENWEATHER: true, // Primary: OpenWeatherMap (better free tier)
    USE_CORS_PROXY: false  // OpenWeatherMap supports CORS directly
};

// Make config available globally
window.WEATHER_CONFIG = CONFIG; 