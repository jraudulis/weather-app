// 1 on buttom click fetch data from api with specific  from input
// 2 display data on display

// dom selectors
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
const unsplashKey = 'so2V6iCiqSgz7kgwSsRCx9r_Xb7S0z04bUZvTV8wIMs';

let weatherDescription;

async function updateBackground() {

    let data = await fetch(`https://api.unsplash.com/search/photos?query=${weatherDescription}&client_id=${unsplashKey}`);
    let resp = await data.json();
    console.log(resp);
    let image = resp.results[Math.floor(Math.random() * resp.results.length)].urls.regular;
    appContainer.style.backgroundImage = `url(${image})`;
};

async function fetchLocationCoordinates() {
    let input = searchInput.value;

    if (!input) {
        return alert('Enter location');
    } else {
        try {
            weatherInfoContainer.style.display = 'none';
            loadAnimation.style.display = 'block';
            let data = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${input}&appid=08ff5bfd6bbd0c08f59cd1c0c38d242b`);
            let resp = await data.json();

                if (!resp || resp.length === 0) {
                    loadAnimation.style.display = 'none';
                    weatherInfoContainer.style.display = 'block';
                    return alert('Enter valid locaton');
                } else {
                    const location = resp[0].name;
                    const latitude = resp[0].lat;
                    const longitude = resp[0].lon;
                    fetchTemperatureData(latitude, longitude, location);
                }  
            } catch(err) {
                loadAnimation.style.display = 'none';
                alert(`Error occured while getting data: ${err.message}`);
            }
    }
}

async function fetchTemperatureData(latitude, longitude, location){
    try{
     let data = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=08ff5bfd6bbd0c08f59cd1c0c38d242b&units=metric`);
     let resp = await data.json();
     console.log(resp);

    if (!resp.main) return alert('Server error');
    else {
        weatherDescription = resp.weather[0].description.toLowerCase();
        let tempData = Math.round(resp.main.temp);
        let feelLikeTempData = Math.round(resp.main.feels_like);
        let country = resp.sys.country;
        let apiIcon = resp.weather[0].icon;

        loadAnimation.style.display = 'none';
        weatherInfoContainer.style.display = 'block';
        weatherIcon.src = `https://openweathermap.org/img/wn/${apiIcon}@2x.png`;
        locationName.textContent = `${location}, ${country}`;
        description.textContent = `${weatherDescription}`;
        temperature.textContent = `${tempData}ºC`;
        feelLikeTemperature.textContent = `Feels like ${feelLikeTempData}`;
        updateBackground();
        searchInput.value = '';  
    }
     } catch(err) {
            alert(`Error while recieving temperature data: ${err.message}`);
        } finally {
            loadAnimation.style.display = 'none';
            weatherInfoContainer.style.display = 'block';
        }
}


btn.addEventListener('click', fetchLocationCoordinates);