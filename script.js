// 1 on buttom click fetch data from api with specific  from input
// 2 display data on display

// dom selectors
const searchInput = document.getElementById('search');
const btn = document.getElementById('btn');
const locationName = document.getElementById('location');
const temperature = document.getElementById('temperature');
const appContainer = document.getElementById('container')
const weatherInfoContainer = document.querySelector('.weather-info');
const loadAnimation = document.querySelector('.loader');

let weatherDescription;

function updateBackground() {

    appContainer.className = '';
    
    switch(weatherDescription) {
        case 'few clouds':
        case 'clear sky':
        case 'overcast clouds':
        appContainer.classList.add('clear');
        break;
    case 'scattered clouds':
    case 'broken clouds':
        appContainer.classList.add('cloudy');
        break;
    case 'shower rain':
    case 'rain':
        appContainer.classList.add('rain');
        break;
    case 'thunderstorm':
        appContainer.classList.add('lightning');
        break;
    case 'mist':
    case 'fog':
        appContainer.classList.add('fog');
        break;
    }
};

async function fetchLocationCoordinates() {
    let input = searchInput.value;

    if (!input) {
        return alert('Enter location');
    } else {
        try {
            weatherInfoContainer.style.display = 'none';
            loadAnimation.style.display = 'block';
            let data = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${input}&appid=08ff5bfd6bbd0c08f59cd1c0c38d242b`);
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
    console.log(resp.weather[0].description);
    weatherDescription = resp.weather[0].description.toLowerCase();

    if (!resp.main) return alert('Server error');
    else {
        let temperatureData = Math.round(resp.main.temp);
        loadAnimation.style.display = 'none';
        weatherInfoContainer.style.display = 'block';
        locationName.textContent = `${location}`;
        temperature.textContent = `${temperatureData}ºC`;
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