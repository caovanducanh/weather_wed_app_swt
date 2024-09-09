const apiKey = 'd4f8eabdb5c59fe510ed0fdda5dc0bb7'; // Replace with your OpenWeatherMap API key
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const weatherCard = document.getElementById('weather-card');

searchBtn.addEventListener('click', getWeather);
cityInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        getWeather();
    }
});

function getWeather() {
    const city = cityInput.value;
    if (city) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                displayWeather(data);
            })
            .catch(error => {
                console.error('Error:', error);
                alert('City not found. Please try again.');
            });
    }
}

function displayWeather(data) {
    const { name } = data;
    const { icon, description } = data.weather[0];
    const { temp, humidity } = data.main;
    const { speed } = data.wind;

    document.querySelector('.city-name').textContent = name;
    document.querySelector('.weather-icon').innerHTML = `<i class="fas fa-${getWeatherIcon(icon)}"></i>`;
    document.querySelector('.temperature').textContent = `${Math.round(temp)}°C`;
    document.querySelector('.description').textContent = description;
    document.querySelector('.humidity').textContent = `Humidity: ${humidity}%`;
    document.querySelector('.wind-speed').textContent = `Wind: ${speed} m/s`;

    weatherCard.classList.remove('hidden');
}

function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'sun',
        '01n': 'moon',
        '02d': 'cloud-sun',
        '02n': 'cloud-moon',
        '03d': 'cloud',
        '03n': 'cloud',
        '04d': 'cloud',
        '04n': 'cloud',
        '09d': 'cloud-showers-heavy',
        '09n': 'cloud-showers-heavy',
        '10d': 'cloud-sun-rain',
        '10n': 'cloud-moon-rain',
        '11d': 'bolt',
        '11n': 'bolt',
        '13d': 'snowflake',
        '13n': 'snowflake',
        '50d': 'smog',
        '50n': 'smog'
    };

    return iconMap[iconCode] || 'question';
}

// Add autocomplete functionality here 
