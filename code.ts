import React, { useState, useEffect, useCallback } from 'react';

// === Helper Components (for a clean UI) ===

// A simple Icon component
const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
);

// A loading spinner component
const Spinner = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
);

// === Main Application ===

// Mock API function to simulate fetching weather data.
// Now includes separate morning and evening forecasts.
const fetchWeatherForCity = async (city) => {
    console.log(`Fetching weather for: ${city}`);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 750));

    // Return mock data for demonstration purposes
    // This creates a 7-day forecast with morning and evening data
    const today = new Date();
    const forecast = Array(7).fill(0).map((_, i) => {
        const date = new Date();
        date.setDate(today.getDate() + i);
        const morningTemp = Math.floor(Math.random() * 10) + 18; // Temp between 18°C and 28°C
        const eveningTemp = morningTemp - (Math.floor(Math.random() * 5) + 2); // Evening is cooler
        const weatherIcons = ['☀️', '☁️', '🌦️', '🌧️', '💨'];
        return {
            date: date.toISOString().split('T')[0],
            morning: {
                temp: morningTemp,
                weather: weatherIcons[Math.floor(Math.random() * weatherIcons.length)]
            },
            evening: {
                temp: eveningTemp,
                weather: weatherIcons[Math.floor(Math.random() * weatherIcons.length)]
            }
        };
    });
    return forecast;
};

const App = () => {
    // === State Management ===
    const [cities, setCities] = useState(['London', 'Tokyo']);
    const [weatherData, setWeatherData] = useState({}); // { 'London': [{...}], 'Tokyo': [{...}] }
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const autocompleteRef = React.useRef(null);
    const inputRef = React.useRef(null);

    // === API Key ===
    // IMPORTANT: This is a CLIENT-SIDE key for Google Places Autocomplete.
    // It's generally safe for this purpose but should be restricted in Google Cloud Console.
    const GOOGLE_PLACES_API_KEY = "AIzaSyDgKAdVD0alQT_wav3sZ7_XjCLS8SONkj0"; // <-- API Key has been inserted

    // === Effects ===

    // Load Google Places API script
    useEffect(() => {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}&libraries=places`;
        script.async = true;
        script.onload = () => initAutocomplete();
        document.head.appendChild(script);

        return () => {
            // Check if the script is still in the document head before trying to remove it
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, [GOOGLE_PLACES_API_KEY]);

    // Initialize Google Places Autocomplete
    const initAutocomplete = () => {
        if (window.google && inputRef.current) {
            autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                types: ['(cities)'],
            });
            autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
        }
    };

    // Fetch weather data for all cities on initial load or when cities change
    const fetchAllWeatherData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const allData = {};
            // Using Promise.all for concurrent fetching
            const promises = cities.map(city => fetchWeatherForCity(city).then(forecast => ({ city, forecast })));
            const results = await Promise.all(promises);
            results.forEach(({city, forecast}) => {
                allData[city] = forecast;
            });
            setWeatherData(allData);
        } catch (err) {
            setError('Failed to fetch weather data. Please try again later.');
            console.error(err);
        }
        setIsLoading(false);
    }, [cities]);
    
    useEffect(() => {
        if(cities.length > 0) {
            fetchAllWeatherData();
        } else {
            setWeatherData({});
            setIsLoading(false);
        }
    }, [cities, fetchAllWeatherData]);


    // === Event Handlers ===

    const handlePlaceSelect = async () => {
        const place = autocompleteRef.current.getPlace();
        if (place && place.name) {
            const newCity = place.name;
            if (!cities.includes(newCity)) {
                setCities(prevCities => [...prevCities, newCity]);
            }
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        }
    };

    const handleAddCity = (e) => {
        e.preventDefault();
        const newCity = inputRef.current.value;
        if (newCity && !cities.includes(newCity)) {
             setCities(prevCities => [...prevCities, newCity]);
             inputRef.current.value = '';
        }
    };

    const handleRemoveCity = (cityToRemove) => {
        setCities(cities.filter(c => c !== cityToRemove));
    };

    // === Rendering ===

    const renderCalendar = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);

        const daysInMonth = [];
        let currentDate = new Date(startDate);
        
        const startingDay = (startDate.getDay() === 0) ? 6 : startDate.getDay() - 1; // Adjust to make Monday first day
        for (let i = 0; i < startingDay; i++) {
            daysInMonth.push(<div key={`empty-start-${i}`} className="border rounded-lg p-2 min-h-[8rem] bg-gray-50"></div>);
        }

        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            daysInMonth.push(
                <div key={dateStr} className="border rounded-lg p-2 min-h-[8rem] flex flex-col bg-white">
                    <span className="font-bold self-start">{currentDate.getDate()}</span>
                    <div className="mt-1 space-y-2 overflow-y-auto text-xs flex-grow">
                       {Object.entries(weatherData).map(([city, forecasts]) => {
                           const forecast = forecasts.find(f => f.date === dateStr);
                           if (forecast) {
                               return (
                                   <div key={`${city}-${dateStr}`} className="bg-gray-100 p-1.5 rounded-md">
                                       <strong className="text-blue-800">{city}</strong>
                                       <div className="flex justify-between mt-1 text-gray-700">
                                           <span>Morn: {forecast.morning.temp}° {forecast.morning.weather}</span>
                                           <span>Eve: {forecast.evening.temp}° {forecast.evening.weather}</span>
                                       </div>
                                   </div>
                               );
                           }
                           return null;
                       })}
                    </div>
                </div>
            );
            currentDate.setDate(currentDate.getDate() + 1);
        }

        const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        return (
            <div className="bg-white p-4 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-4">{today.toLocaleString('default', { month: 'long' })} {year}</h2>
                <div className="grid grid-cols-7 gap-2 text-center font-semibold mb-2 text-gray-600">
                    {weekdays.map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {daysInMonth}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-100 min-h-screen font-sans p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Weather Calendar</h1>
                    <p className="text-gray-600 mt-1">View morning and evening temperature forecasts for your favorite cities.</p>
                </header>
                
                <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Left Panel: Controls */}
                    <aside className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-4 rounded-xl shadow-lg">
                            <h2 className="text-xl font-semibold mb-3">Add City</h2>
                            <form onSubmit={handleAddCity} className="flex items-center space-x-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Enter a city name..."
                                    className="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                <button type="submit" className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors">
                                    <Icon path="M12 4.5v15m7.5-7.5h-15" />
                                </button>
                            </form>
                        </div>

                        <div className="bg-white p-4 rounded-xl shadow-lg">
                            <h2 className="text-xl font-semibold mb-3">Managed Cities</h2>
                            {isLoading && cities.length > 0 && <div className="flex justify-center"><Spinner /></div>}
                            {error && <p className="text-red-500">{error}</p>}
                            <ul className="space-y-2">
                                {cities.map(city => (
                                    <li key={city} className="flex items-center justify-between bg-gray-100 p-2 rounded-lg">
                                        <span className="font-medium">{city}</span>
                                        <button onClick={() => handleRemoveCity(city)} className="text-red-500 hover:text-red-700">
                                            <Icon path="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.548 0A48.094 48.094 0 016.34 5.4m-1.578 0l-1.096-1.096a1.5 1.5 0 012.121-2.121l1.096 1.096m1.578 0l-1.578-1.578" className="w-5 h-5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </aside>

                    {/* Right Panel: Calendar */}
                    <div className="lg:col-span-3">
                       {renderCalendar()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
