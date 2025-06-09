// Weather Calendar App Configuration
const API_KEY = 'PLGMfgAwOx4pWVJ2DgSQ1TnHjvpJ3UA4'; // AccuWeather API key
const BASE_URL = 'https://dataservice.accuweather.com';
const LOCATION_URL = `${BASE_URL}/locations/v1/cities/search`;
const FORECAST_URL = `${BASE_URL}/forecasts/v1/daily`;

// CORS Proxy options for AccuWeather API
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://cors-anywhere.herokuapp.com/'
];
let currentProxyIndex = 0;
const USE_CORS_PROXY = true; // Set to false if running from a proper backend

// Alternative: Use OpenWeatherMap as backup (supports CORS)
const OPENWEATHER_API_KEY = ''; // We'll use AccuWeather first
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const elements = {
    cityInput: document.getElementById('cityInput'),
    addCityForm: document.getElementById('addCityForm'),
    citiesList: document.getElementById('citiesList'),
    citiesCounter: document.getElementById('citiesCounter'),
    clearAllBtn: document.getElementById('clearAllBtn'),
    loadingSection: document.getElementById('loadingSection'),
    errorSection: document.getElementById('errorSection'),
    errorText: document.getElementById('errorText'),
    calendarGrid: document.getElementById('calendarGrid'),
    calendarRange: document.getElementById('calendarRange'),
    forecastPeriod: document.getElementById('forecastPeriod'),
    prevPeriod: document.getElementById('prevPeriod'),
    nextPeriod: document.getElementById('nextPeriod'),
    loadingOverlay: document.getElementById('loadingOverlay'),
    errorModal: document.getElementById('errorModal'),
    errorMessage: document.getElementById('errorMessage'),
    closeErrorBtn: document.getElementById('closeErrorBtn'),
    demoNotice: document.getElementById('demoNotice'),
    retryApiBtn: document.getElementById('retryApiBtn')
};

// State Management
let managedCities = ['London', 'Tokyo'];
let weatherData = {}; // { cityName: [{date, morning: {temp, weather}, evening: {temp, weather}}] }
let currentPeriodStart = new Date();
let selectedPeriod = 7; // Default to 7 days
let isLoading = false;

// AccuWeather icon mapping
const weatherIcons = {
    1: '☀️',   // Sunny
    2: '⛅',   // Mostly Sunny
    3: '⛅',   // Partly Sunny
    4: '☁️',   // Intermittent Clouds
    5: '☁️',   // Hazy Sunshine
    6: '☁️',   // Mostly Cloudy
    7: '☁️',   // Cloudy
    8: '☁️',   // Dreary
    11: '🌫️', // Fog
    12: '🌦️', // Showers
    13: '🌦️', // Mostly Cloudy w/ Showers
    14: '⛅',  // Partly Sunny w/ Showers
    15: '⛈️',  // T-Storms
    16: '⛈️',  // Mostly Cloudy w/ T-Storms
    17: '⛈️',  // Partly Sunny w/ T-Storms
    18: '🌧️', // Rain
    19: '❄️',  // Flurries
    20: '❄️',  // Mostly Cloudy w/ Flurries
    21: '❄️',  // Partly Sunny w/ Flurries
    22: '❄️',  // Snow
    23: '❄️',  // Mostly Cloudy w/ Snow
    24: '🌨️', // Ice
    25: '🌨️', // Sleet
    26: '🌨️', // Freezing Rain
    29: '🌨️', // Rain and Snow
    30: '🌡️', // Hot
    31: '🥶',  // Cold
    32: '💨',  // Windy
    33: '🌙',  // Clear (Night)
    34: '☁️',  // Mostly Clear (Night)
    35: '⛅',  // Partly Cloudy (Night)
    36: '☁️',  // Intermittent Clouds (Night)
    37: '☁️',  // Hazy Moonlight (Night)
    38: '☁️'   // Mostly Cloudy (Night)
};

// Utility Functions
const showLoading = () => {
    elements.loadingSection.style.display = 'block';
    isLoading = true;
};

const hideLoading = () => {
    elements.loadingSection.style.display = 'none';
    isLoading = false;
};

const showError = (message) => {
    elements.errorText.textContent = message;
    elements.errorSection.style.display = 'block';
    setTimeout(() => {
        elements.errorSection.style.display = 'none';
    }, 5000);
};

const kelvinToCelsius = (kelvin) => Math.round(kelvin - 273.15);

const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
    });
};

const formatDayNumber = (date, periodLength) => {
    if (periodLength <= 7) {
        // For week view: show day and month (e.g., "01 Jan")
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short'
        });
    } else if (periodLength <= 30) {
        // For month view: show day and month (e.g., "01 Jan")
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short'
        });
    } else {
        // For extended view: show day, month, year (e.g., "01 Jan 2025")
        return date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    }
};

const getWeatherIcon = (iconCode) => {
    return weatherIcons[iconCode] || '🌤️';
};

// Robust fetch with multiple CORS proxy fallbacks
const fetchWithCORS = async (url, maxRetries = 3) => {
    let lastError;
    
    for (let i = 0; i < maxRetries; i++) {
        try {
            let finalUrl = url;
            
            if (USE_CORS_PROXY) {
                const proxy = CORS_PROXIES[currentProxyIndex % CORS_PROXIES.length];
                finalUrl = `${proxy}${encodeURIComponent(url)}`;
                console.log(`Attempt ${i + 1} using proxy ${currentProxyIndex + 1}:`, finalUrl);
            }
            
            const response = await fetch(finalUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                mode: 'cors'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('API response successful:', data);
            return data;
            
        } catch (error) {
            console.warn(`Fetch attempt ${i + 1} failed:`, error.message);
            lastError = error;
            
            // Try next proxy on next attempt
            if (USE_CORS_PROXY) {
                currentProxyIndex = (currentProxyIndex + 1) % CORS_PROXIES.length;
            }
            
            // Add delay between retries
            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
            }
        }
    }
    
    throw lastError;
};

// Get AccuWeather location key for a city
const getLocationKey = async (cityName) => {
    try {
        const url = `${LOCATION_URL}?apikey=${API_KEY}&q=${encodeURIComponent(cityName)}&language=en-us`;
        console.log('Searching for location:', cityName);
        
        const data = await fetchWithCORS(url);
        
        if (data && data.length > 0) {
            const result = {
                key: data[0].Key,
                name: `${data[0].LocalizedName}, ${data[0].Country.LocalizedName}`
            };
            console.log('Location found:', result);
            return result;
        }
        throw new Error(`Location "${cityName}" not found`);
    } catch (error) {
        console.error('Error getting location key:', error);
        throw error;
    }
};

// Set week start to Monday
const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
};

// Fetch weather data from AccuWeather API
const fetchWeatherForCity = async (city) => {
    console.log(`Fetching AccuWeather data for: ${city}`);
    
    try {
        // First, get the location key
        const locationData = await getLocationKey(city);
        console.log(`Location key for ${city}: ${locationData.key}`);
        
        // Determine forecast period (AccuWeather max is 15 days)
        const forecastDays = Math.min(selectedPeriod, 15);
        let forecastEndpoint = '5day'; // Default
        
        if (forecastDays <= 1) forecastEndpoint = '1day';
        else if (forecastDays <= 5) forecastEndpoint = '5day';
        else if (forecastDays <= 10) forecastEndpoint = '10day';
        else forecastEndpoint = '15day';
        
        // Fetch forecast data
        const forecastUrl = `${FORECAST_URL}/${forecastEndpoint}/${locationData.key}?apikey=${API_KEY}&details=true&metric=true`;
        console.log(`Fetching ${forecastEndpoint} forecast for location key: ${locationData.key}`);
        
        const forecastData = await fetchWithCORS(forecastUrl);
        console.log('Forecast data received:', forecastData);
        
        // Validate forecast data structure
        if (!forecastData || !forecastData.DailyForecasts) {
            throw new Error('Invalid forecast data structure received from AccuWeather');
        }
        
        // Parse AccuWeather data into our format
        const forecast = forecastData.DailyForecasts.map(day => {
            const date = new Date(day.Date).toISOString().split('T')[0];
            return {
                date: date,
                morning: {
                    temp: Math.round(day.Temperature.Maximum.Value),
                    weather: getWeatherIcon(day.Day.Icon)
                },
                evening: {
                    temp: Math.round(day.Temperature.Minimum.Value),
                    weather: getWeatherIcon(day.Night.Icon)
                }
            };
        });
        
        // ✅ SUCCESS: Hide demo notice if it was showing
        if (elements.demoNotice && elements.demoNotice.style.display !== 'none') {
            elements.demoNotice.style.display = 'none';
            console.log('✅ Real AccuWeather data successfully retrieved!');
        }
        
        console.log(`✅ Real weather data for ${city}:`, forecast.length, 'days');
        return forecast;
        
    } catch (error) {
        console.error(`❌ Failed to fetch real weather data for ${city}:`, error);
        
        // Only show demo notice for specific network/CORS errors
        if (error.message.includes('CORS') || error.message.includes('Failed to fetch') || 
            error.message.includes('NetworkError') || error.message.includes('TypeError')) {
            console.warn('🔧 Network/CORS issue detected - using demo data as fallback');
            
            // Show demo notice to user
            if (elements.demoNotice) {
                elements.demoNotice.style.display = 'block';
            }
            
            // Update demo notice with specific error info
            if (elements.demoNotice) {
                const noticeText = elements.demoNotice.querySelector('p');
                if (noticeText) {
                    noticeText.innerHTML = `<strong>🔧 Demo Mode:</strong> API connection failed (${error.message.substring(0, 50)}...). Using sample weather data. <br><small>This usually resolves itself - try refreshing the page.</small>`;
                }
            }
        } else {
            // For other errors, show error message
            showError(`Failed to get weather for ${city}: ${error.message}`);
        }
        
        // Fallback to demo data
        console.log(`📊 Using demo data for ${city} due to: ${error.message}`);
        return generateDemoData(city);
    }
};

// Fallback demo data generator
const generateDemoData = (city) => {
    const forecast = [];
    const maxDays = Math.min(selectedPeriod, 15);
    
    for (let i = 0; i < maxDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const baseTemp = 20 + Math.sin((i / 365) * Math.PI * 2) * 10;
        const morningTemp = Math.round(baseTemp + (Math.random() - 0.5) * 6);
        const eveningTemp = morningTemp - Math.floor(Math.random() * 8) - 2;
        
        const weatherIcons = [1, 2, 3, 4, 6, 12, 15, 18];
        const morningIcon = weatherIcons[Math.floor(Math.random() * weatherIcons.length)];
        const eveningIcon = weatherIcons[Math.floor(Math.random() * weatherIcons.length)];
        
        forecast.push({
            date: date.toISOString().split('T')[0],
            morning: {
                temp: morningTemp,
                weather: getWeatherIcon(morningIcon)
            },
            evening: {
                temp: eveningTemp,
                weather: getWeatherIcon(eveningIcon)
            }
        });
    }
    
    return forecast;
};

// City Management Functions
const addCity = (cityName) => {
    if (!cityName || cityName.trim() === '') return;
    
    const trimmedCity = cityName.trim();
    if (managedCities.includes(trimmedCity)) {
        showError('City already added');
        return;
    }
    
    // Optional: Add a reasonable limit (can be removed if you want unlimited)
    const MAX_CITIES = 50; // Generous limit
    if (managedCities.length >= MAX_CITIES) {
        showError(`Maximum ${MAX_CITIES} cities allowed. Remove some cities to add new ones.`);
        return;
    }
    
    managedCities.push(trimmedCity);
    updateCitiesList();
    fetchWeatherForAllCities();
    elements.cityInput.value = '';
};

const removeCity = (cityName) => {
    managedCities = managedCities.filter(city => city !== cityName);
    delete weatherData[cityName];
    updateCitiesList();
    updateCalendar();
};

const updateCitiesList = () => {
    elements.citiesList.innerHTML = '';
    
    // Update counter
    const count = managedCities.length;
    elements.citiesCounter.textContent = `${count} ${count === 1 ? 'city' : 'cities'}`;
    
    // Show/hide clear all button
    elements.clearAllBtn.style.display = count > 1 ? 'flex' : 'none';
    
    if (managedCities.length === 0) {
        elements.citiesList.innerHTML = '<li class="city-item"><span class="city-name">No cities added yet</span></li>';
        return;
    }
    
    managedCities.forEach((city, index) => {
        const listItem = document.createElement('li');
        listItem.className = 'city-item';
        listItem.innerHTML = `
            <span class="city-name">${city}</span>
            <button class="remove-btn" onclick="removeCity('${city}')" title="Remove ${city}">
                <i class="fas fa-trash"></i>
            </button>
        `;
        elements.citiesList.appendChild(listItem);
    });
};

// Weather Data Functions
const fetchWeatherForAllCities = async () => {
    if (managedCities.length === 0) {
        weatherData = {};
        updateCalendar();
        return;
    }
    
    showLoading();
    elements.errorSection.style.display = 'none';
    
    try {
        // Fetch weather for all cities concurrently
        const promises = managedCities.map(async city => {
            try {
                const forecast = await fetchWeatherForCity(city);
                return { city, forecast };
            } catch (error) {
                console.error(`Failed to fetch weather for ${city}:`, error);
                return { city, forecast: null };
            }
        });
        
        const results = await Promise.all(promises);
        
        // Update weather data
        results.forEach(({ city, forecast }) => {
            if (forecast) {
                weatherData[city] = forecast;
            }
        });
        
        updateCalendar();
        
    } catch (error) {
        console.error('Error fetching weather data:', error);
        showError('Failed to fetch weather data. Please try again.');
    } finally {
        hideLoading();
    }
};

// Calendar Functions
const updateCalendar = () => {
    const periodStart = new Date(currentPeriodStart);
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodStart.getDate() + selectedPeriod - 1);
    
    // Update calendar range display
    elements.calendarRange.textContent = `${formatDate(periodStart)} - ${formatDate(periodEnd)}`;
    
    // Clear calendar grid
    elements.calendarGrid.innerHTML = '';
    
    // Determine calendar layout based on period
    let gridClass = 'week-view';
    let showHeaders = true;
    let columnsPerWeek = 7;
    
    if (selectedPeriod <= 7) {
        gridClass = 'week-view';
    } else if (selectedPeriod <= 30) {
        gridClass = 'month-view';
    } else {
        gridClass = 'extended-view';
        columnsPerWeek = 10; // More columns for longer periods
    }
    
    elements.calendarGrid.className = `calendar-grid ${gridClass}`;
    
    // Add day headers for week/month view
    if (selectedPeriod <= 30 && showHeaders) {
        const dayHeaders = selectedPeriod <= 7 ? 
            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] :
            ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            
        dayHeaders.forEach(day => {
            const headerElement = document.createElement('div');
            headerElement.className = 'calendar-day header';
            headerElement.textContent = day;
            elements.calendarGrid.appendChild(headerElement);
        });
    }
    
    // Calculate how many days to show
    const daysToShow = Math.min(selectedPeriod, 60);
    
    // Add calendar days
    for (let i = 0; i < daysToShow; i++) {
        const currentDate = new Date(periodStart);
        currentDate.setDate(periodStart.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        
        // Use the new date formatting function
        dayNumber.textContent = formatDayNumber(currentDate, selectedPeriod);
        
        dayElement.appendChild(dayNumber);
        
        const weatherContainer = document.createElement('div');
        const cityCount = Object.keys(weatherData).length;
        
        // Add classes based on number of cities
        if (cityCount > 10) {
            weatherContainer.className = 'day-weather many-cities';
            dayElement.classList.add('many-cities');
        } else if (cityCount > 5) {
            weatherContainer.className = 'day-weather';
            dayElement.classList.add('compact-mode');
        } else {
            weatherContainer.className = 'day-weather';
        }
        
        // Add weather entries for each city
        Object.entries(weatherData).forEach(([city, forecasts]) => {
            const forecast = forecasts.find(f => f.date === dateStr);
            if (forecast) {
                const weatherEntry = document.createElement('div');
                weatherEntry.className = 'weather-entry';
                
                // Adjust display based on period length and city count
                if (selectedPeriod <= 15 && cityCount <= 10) {
                    weatherEntry.innerHTML = `
                        <div class="weather-city">${city}</div>
                        <div class="weather-temps">
                            <span>Morn: ${forecast.morning.temp}° ${forecast.morning.weather}</span>
                            <span>Eve: ${forecast.evening.temp}° ${forecast.evening.weather}</span>
                        </div>
                    `;
                } else {
                    // Compact view for longer periods or many cities
                    const shortCity = city.length > 8 ? city.substring(0, 8) + '...' : city;
                    weatherEntry.innerHTML = `
                        <div class="weather-city">${shortCity}</div>
                        <div class="weather-temps">
                            <span>${forecast.morning.temp}°/${forecast.evening.temp}° ${forecast.morning.weather}</span>
                        </div>
                    `;
                }
                weatherContainer.appendChild(weatherEntry);
            }
        });
        
        dayElement.appendChild(weatherContainer);
        elements.calendarGrid.appendChild(dayElement);
    }
};

// Event Handlers
const handleAddCity = (e) => {
    e.preventDefault();
    const cityName = elements.cityInput.value;
    addCity(cityName);
};

const handlePeriodChange = () => {
    selectedPeriod = parseInt(elements.forecastPeriod.value);
    updateCalendar();
};

const handlePrevPeriod = () => {
    currentPeriodStart.setDate(currentPeriodStart.getDate() - selectedPeriod);
    updateCalendar();
};

const handleNextPeriod = () => {
    currentPeriodStart.setDate(currentPeriodStart.getDate() + selectedPeriod);
    updateCalendar();
};

const handleClearAllCities = () => {
    if (confirm(`Are you sure you want to remove all ${managedCities.length} cities?`)) {
        managedCities = [];
        weatherData = {};
        updateCitiesList();
        updateCalendar();
    }
};

const handleRetryApi = () => {
    console.log('🔄 User manually retrying API calls...');
    
    // Hide demo notice
    if (elements.demoNotice) {
        elements.demoNotice.style.display = 'none';
    }
    
    // Reset proxy index to try different proxies
    currentProxyIndex = 0;
    
    // Clear existing weather data and refetch
    weatherData = {};
    fetchWeatherForAllCities();
};

// Initialize the app
const initializeApp = () => {
    // Set up event listeners
    elements.addCityForm.addEventListener('submit', handleAddCity);
    elements.forecastPeriod.addEventListener('change', handlePeriodChange);
    elements.prevPeriod.addEventListener('click', handlePrevPeriod);
    elements.nextPeriod.addEventListener('click', handleNextPeriod);
    elements.clearAllBtn.addEventListener('click', handleClearAllCities);
    elements.retryApiBtn.addEventListener('click', handleRetryApi);
    
    // Set current period start to beginning of current week
    currentPeriodStart = getWeekStart(new Date());
    selectedPeriod = parseInt(elements.forecastPeriod.value);
    
    // Initialize UI
    updateCitiesList();
    fetchWeatherForAllCities();
    
    console.log('Weather Calendar App initialized');
};

// Global function for remove button onclick
window.removeCity = removeCity;

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp); 