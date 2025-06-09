// Weather Calendar App Configuration
// Using OpenWeatherMap API (more reliable free tier, supports CORS)
const OPENWEATHER_API_KEY = 'f4c8c1d6e8797e3c9b4a2b1c8e9f5d3a'; // Demo API key - replace with your own
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

// AccuWeather backup (has daily limits)
const ACCUWEATHER_API_KEY = 'PLGMfgAwOx4pWVJ2DgSQ1TnHjvpJ3UA4';
const ACCUWEATHER_BASE_URL = 'https://dataservice.accuweather.com';

// Primary API settings
const USE_OPENWEATHER = true; // Primary: OpenWeatherMap (better free tier)
const USE_CORS_PROXY = false; // OpenWeatherMap supports CORS directly

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

// OpenWeatherMap icon mapping
const weatherIcons = {
    '01d': '☀️', '01n': '🌙',  // Clear sky
    '02d': '⛅', '02n': '☁️',  // Few clouds
    '03d': '☁️', '03n': '☁️',  // Scattered clouds
    '04d': '☁️', '04n': '☁️',  // Broken clouds
    '09d': '🌧️', '09n': '🌧️', // Shower rain
    '10d': '🌦️', '10n': '🌧️', // Rain
    '11d': '⛈️', '11n': '⛈️',  // Thunderstorm
    '13d': '❄️', '13n': '❄️',  // Snow
    '50d': '🌫️', '50n': '🌫️'  // Mist/Fog
};

// AccuWeather icon mapping (backup)
const accuWeatherIcons = {
    1: '☀️', 2: '⛅', 3: '⛅', 4: '☁️', 5: '☁️', 6: '☁️', 7: '☁️', 8: '☁️',
    11: '🌫️', 12: '🌦️', 13: '🌦️', 14: '⛅', 15: '⛈️', 16: '⛈️', 17: '⛈️',
    18: '🌧️', 19: '❄️', 20: '❄️', 21: '❄️', 22: '❄️', 23: '❄️', 24: '🌨️',
    25: '🌨️', 26: '🌨️', 29: '🌨️', 30: '🌡️', 31: '🥶', 32: '💨',
    33: '🌙', 34: '☁️', 35: '⛅', 36: '☁️', 37: '☁️', 38: '☁️'
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

const getWeatherIcon = (iconCode, isAccuWeather = false) => {
    if (isAccuWeather) {
        return accuWeatherIcons[iconCode] || '🌤️';
    }
    return weatherIcons[iconCode] || '🌤️';
};

// Simplified demo data generation
const getRandomWeatherIcon = () => {
    const icons = ['01d', '02d', '03d', '04d', '09d', '10d', '11d', '13d', '50d'];
    return icons[Math.floor(Math.random() * icons.length)];
};

// Set week start to Monday
const getWeekStart = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
};

// Fetch weather data using OpenWeatherMap API
const fetchWeatherForCity = async (city) => {
    console.log(`🌤️ Fetching weather data for: ${city}`);
    
    try {
        if (USE_OPENWEATHER) {
            return await fetchOpenWeatherData(city);
        } else {
            return await fetchAccuWeatherData(city);
        }
    } catch (error) {
        console.error(`❌ Failed to fetch real weather data for ${city}:`, error);
        
        // Show demo notice for API errors
        if (elements.demoNotice) {
            elements.demoNotice.style.display = 'block';
            const noticeText = elements.demoNotice.querySelector('p');
            if (noticeText) {
                noticeText.innerHTML = `<strong>🔧 Demo Mode:</strong> API error for ${city}. Using sample data. <br><small>Error: ${error.message}</small>`;
            }
        }
        
        // Fallback to demo data
        console.log(`📊 Using demo data for ${city} due to: ${error.message}`);
        return generateDemoData(city);
    }
};

// OpenWeatherMap API implementation
const fetchOpenWeatherData = async (city) => {
    console.log(`🌍 Using OpenWeatherMap API for: ${city}`);
    
    // Get current weather for city coordinates
    const currentWeatherUrl = `${OPENWEATHER_BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    const currentResponse = await fetch(currentWeatherUrl);
    if (!currentResponse.ok) {
        throw new Error(`OpenWeatherMap current weather failed: ${currentResponse.status} - ${currentResponse.statusText}`);
    }
    
    const currentData = await currentResponse.json();
    console.log('Current weather data:', currentData);
    
    // Get 5-day forecast using coordinates
    const { lat, lon } = currentData.coord;
    const forecastUrl = `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    
    const forecastResponse = await fetch(forecastUrl);
    if (!forecastResponse.ok) {
        throw new Error(`OpenWeatherMap forecast failed: ${forecastResponse.status} - ${forecastResponse.statusText}`);
    }
    
    const forecastData = await forecastResponse.json();
    console.log('Forecast data received:', forecastData);
    
    // Process OpenWeatherMap 5-day forecast (3-hour intervals)
    const dailyForecasts = {};
    
    forecastData.list.forEach(item => {
        const date = new Date(item.dt * 1000).toISOString().split('T')[0];
        const hour = new Date(item.dt * 1000).getHours();
        
        if (!dailyForecasts[date]) {
            dailyForecasts[date] = {
                morning: null,
                evening: null,
                temps: []
            };
        }
        
        dailyForecasts[date].temps.push(item.main.temp);
        
        // Assign morning (6-12) and evening (18-24) data
        if (hour >= 6 && hour <= 12 && !dailyForecasts[date].morning) {
            dailyForecasts[date].morning = {
                temp: Math.round(item.main.temp),
                weather: getWeatherIcon(item.weather[0].icon)
            };
        } else if (hour >= 18 && hour <= 23 && !dailyForecasts[date].evening) {
            dailyForecasts[date].evening = {
                temp: Math.round(item.main.temp),
                weather: getWeatherIcon(item.weather[0].icon)
            };
        }
    });
    
    // Convert to our format and fill missing data
    const forecast = Object.keys(dailyForecasts).slice(0, Math.min(selectedPeriod, 5)).map(date => {
        const day = dailyForecasts[date];
        const temps = day.temps;
        const maxTemp = Math.round(Math.max(...temps));
        const minTemp = Math.round(Math.min(...temps));
        
        return {
            date: date,
            morning: day.morning || {
                temp: maxTemp,
                weather: getWeatherIcon('01d') // Default sunny
            },
            evening: day.evening || {
                temp: minTemp,
                weather: getWeatherIcon('01n') // Default clear night
            }
        };
    });
    
    // ✅ SUCCESS: Hide demo notice
    if (elements.demoNotice && elements.demoNotice.style.display !== 'none') {
        elements.demoNotice.style.display = 'none';
        console.log('✅ Real OpenWeatherMap data successfully retrieved!');
    }
    
    console.log(`✅ Real weather data for ${city}:`, forecast.length, 'days');
    return forecast;
};

// Fallback demo data generator
const generateDemoData = (city) => {
    const forecast = [];
    const maxDays = Math.min(selectedPeriod, 5); // OpenWeatherMap gives 5 days max
    
    for (let i = 0; i < maxDays; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        
        const baseTemp = 20 + Math.sin((i / 365) * Math.PI * 2) * 10;
        const morningTemp = Math.round(baseTemp + (Math.random() - 0.5) * 6);
        const eveningTemp = morningTemp - Math.floor(Math.random() * 8) - 2;
        
        forecast.push({
            date: date.toISOString().split('T')[0],
            morning: {
                temp: morningTemp,
                weather: getWeatherIcon(getRandomWeatherIcon())
            },
            evening: {
                temp: eveningTemp,
                weather: getWeatherIcon(getRandomWeatherIcon())
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