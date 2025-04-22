const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const UNSPLASH_API_KEY = import.meta.env.VITE_UNSPLASH_API_KEY;

const form = document.getElementById('search-form');
const searchInput = document.getElementById('search');
const locationName = document.getElementById('location');
const temperature = document.getElementById('temperature');
const feelLikeTemperature = document.getElementById('feel-like');
const appContainer = document.getElementById('container')
const weatherInfoContainer = document.querySelector('.weather-info');
const loadAnimation = document.querySelector('.loader');
const weatherIcon = document.getElementById('icon');
const description = document.getElementById('weather-description');

// Global variables for acces in other functions
let weatherDescription;
let currentTempCelsius;
let feelsLikeCelsius;
let isCelsius = true;

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

    if (!input) return;
         
    try {
        displayLoader();

        const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${input}&appid=${OPENWEATHER_API_KEY}`);
        
        if (!geoResponse.ok) {
            throw new Error(`Geocoding API error: ${geoResponse.status}`);
        }

        const geoData = await geoResponse.json();

        if (!geoData || geoData.length === 0) {
            hideLoader();
            displayErrorMessage();
            return;
        } else {
            const { name: location, lat: latitude, lon: longitude } = geoData[0];
            await fetchTemperatureData(latitude, longitude, location);
        }

    } catch (error) {
        alert(`Error: ${error.message}`);
        hideLoader();
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
        currentTempCelsius = Math.round(weatherData.main.temp);
        feelsLikeCelsius = Math.round(weatherData.main.feels_like);
        const country = weatherData.sys.country;
        const apiIcon = weatherData.weather[0].icon;

        weatherIcon.src = `https://openweathermap.org/img/wn/${apiIcon}@2x.png`;
        locationName.textContent = `${location}, ${country}`;
        description.textContent = weatherDescription;
        temperature.textContent = `${currentTempCelsius}ºC`;
        feelLikeTemperature.textContent = `Feels like ${feelsLikeCelsius}ºC`;
        animateWeatherInfo();

        await updateBackground();
        hideLoader();
        searchInput.value = '';

    } catch (error) {
        alert(`Error: ${error.message}`);
        hideLoader();
    }
}

// Display loader animation
function displayLoader() {
    weatherInfoContainer.style.display = 'none';
    loadAnimation.style.display = 'block';
}

// Hide loader animation
function hideLoader() {
    loadAnimation.style.display = 'none';
    weatherInfoContainer.style.display = 'block';
}

// Get current date
function getCurrentDate() {
    const date = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

// Create a nice entrance animation
function animateWeatherInfo() {
    const weatherInfo = document.querySelector('.weather-info');
    weatherInfo.style.opacity = '0';
    weatherInfo.style.transform = 'translateY(20px)';
    weatherInfo.style.display = 'block';
    // Trigger reflow
    weatherInfo.offsetHeight;
    
    weatherInfo.style.transition = 'opacity 1s ease, transform 1s ease';
    weatherInfo.style.opacity = '1';
    weatherInfo.style.transform = 'translateY(0)';
  }

  function toggleTemperatures() {
    if (isCelsius) {
      // Convert Celsius to Fahrenheit and update display
      let currentTempF = Math.round((currentTempCelsius * 9 / 5) + 32);
      let feelsLikeF = Math.round((feelsLikeCelsius * 9 / 5) + 32);
      temperature.textContent = `${currentTempF}ºF`;
      feelLikeTemperature.textContent = `Feels like ${feelsLikeF}ºF`;
  
      // Toggle to Fahrenheit state
      isCelsius = false;
    } else {
      // Display temperature in Celsius
      temperature.textContent = `${currentTempCelsius}ºC`;
      feelLikeTemperature.textContent = `Feels like ${feelsLikeCelsius}ºC`;
  
      // Toggle back to Celsius state
      isCelsius = true;
    }
  }

function displayErrorMessage() {

    const existingMessage = document.querySelector('.toast');
    if (existingMessage) {
        existingMessage.remove();
    }
    const div = document.createElement('div');
    div.className = 'toast toast-error';
    const message = document.createTextNode('Enter valid location');
    div.appendChild(message);
    appContainer.appendChild(div);

    setTimeout(() => div.classList.add('show'), 10);
    
    setTimeout(() => {
        div.classList.remove('show');
        setTimeout(() => div.remove(), 300);
    }, 3000); 
}

function preventFormSubmission(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        fetchLocationCoordinates();
    }
}

btn.addEventListener('click', fetchLocationCoordinates);
searchInput.addEventListener('keypress', preventFormSubmission);
temperature.addEventListener('click', toggleTemperatures)
