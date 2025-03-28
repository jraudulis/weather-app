// 1 on buttom click fetch data from api with specific  from input
// 2 display data on display

// dom selectors
const form = document.getElementById('search-form');
const searchInput = document.getElementById('search');
const btn = document.getElementById('btn');
const locationName = document.getElementById('location');
const temperature = document.getElementById('temperature');
const feelLikeTemperature = document.getElementById('feel-like');
const appContainer = document.getElementById('container')
const weatherInfoContainer = document.querySelector('.weather-info');
const loadAnimation = document.querySelector('.loader');
const weatherIcon = document.getElementById('icon');
const description = document.getElementById('weather-description');

const OPENWEATHER_API_KEY = '08ff5bfd6bbd0c08f59cd1c0c38d242b';
const UNSPLASH_API_KEY = 'so2V6iCiqSgz7kgwSsRCx9r_Xb7S0z04bUZvTV8wIMs';

let weatherDescription;

async function updateBackground() {
    try {
        if (!weatherDescription) return;

        const response = await fetch(`https://api.unsplash.com/search/photos?query=${weatherDescription}&client_id=${UNSPLASH_API_KEY}`);
        
        if (!response.ok) {
            console.error('Unsplash API response not OK', response.status);
            return;
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const image = data.results[Math.floor(Math.random() * data.results.length)].urls.regular;
            appContainer.style.backgroundImage = `url(${image})`;
        }
    } catch (error) {
        console.error('Background update failed:', error);
    }
}

async function fetchLocationCoordinates() {
    const input = searchInput.value.trim();

    if (!input) {
        searchInput.style.border = '1px solid red';
        return;
    }   
    try {
        weatherInfoContainer.style.display = 'none';
        loadAnimation.style.display = 'block';

        const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${input}&appid=${OPENWEATHER_API_KEY}`);
        
        if (!geoResponse.ok) {
            throw new Error(`Geocoding API error: ${geoResponse.status}`);
        }

        const geoData = await geoResponse.json();
        console.log(geoData);

        if (!geoData || geoData.length === 0) {
            alert('Enter a valid location');
            loadAnimation.style.display = 'none';
            return;
        }

        const { name: location, lat: latitude, lon: longitude } = geoData[0];
        await fetchTemperatureData(latitude, longitude, location);

    } catch (error) {
        alert(`Error: ${error.message}`);
        loadAnimation.style.display = 'none';
        weatherInfoContainer.style.display = 'block';
    }
}

async function fetchTemperatureData(latitude, longitude, location) {
    try {
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}&units=metric`);
        
        if (!weatherResponse.ok) {
            throw new Error(`Weather API error: ${weatherResponse.status}`);
        }

        const weatherData = await weatherResponse.json();

        if (!weatherData.main) {
            alert('Server error');
            return;
        }

        weatherDescription = weatherData.weather[0].description.toLowerCase();
        const tempData = Math.round(weatherData.main.temp);
        const feelLikeTempData = Math.round(weatherData.main.feels_like);
        const country = weatherData.sys.country;
        const apiIcon = weatherData.weather[0].icon;

        weatherIcon.src = `https://openweathermap.org/img/wn/${apiIcon}@2x.png`;
        locationName.textContent = `${location}, ${country}`;
        description.textContent = weatherDescription;
        temperature.textContent = `${tempData}ºC`;
        feelLikeTemperature.textContent = `Feels like ${feelLikeTempData}ºC`;

        loadAnimation.style.display = 'none';
        weatherInfoContainer.style.display = 'block';

        await updateBackground();
        searchInput.value = '';

    } catch (error) {
        alert(`Error: ${error.message}`);
        loadAnimation.style.display = 'none';
        weatherInfoContainer.style.display = 'block';
    }
}

function preventFormSubmission(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        fetchLocationCoordinates();
    }
}

btn.addEventListener('click', fetchLocationCoordinates);
searchInput.addEventListener('keypress', preventFormSubmission);
