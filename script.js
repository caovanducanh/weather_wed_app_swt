const apiKey = config.apiKey;
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const weatherCard = document.getElementById('weather-card');
const suggestionsList = document.getElementById('suggestions');

// Danh sách các thành phố mẫu (bạn có thể mở rộng danh sách này)
const cities = [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'Tokyo', 'New York', 'London', 'Paris', 'Berlin', 'Moscow',
    'Beijing', 'Sydney', 'Rio de Janeiro', 'Cairo', 'Bangkok'
];

searchButton.addEventListener('click', getWeather);
searchInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        getWeather();
    }
});

function getWeather() {
    const city = searchInput.value;
    if (city) {
        document.getElementById('loading').classList.remove('hidden');
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('City not found');
                }
                return response.json();
            })
            .then(data => {
                displayWeather(data);
                saveRecentCity(data.name);
                loadRecentCities();
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Không tìm thấy thành phố hoặc có lỗi xảy ra. Vui lòng thử lại.');
            })
            .finally(() => {
                document.getElementById('loading').classList.add('hidden');
            });
    }
}

function displayWeather(data) {
    const { name } = data;
    const { icon, description } = data.weather[0];
    const { temp, humidity, pressure, temp_min, temp_max } = data.main;
    const { speed } = data.wind;
    const visibility = data.visibility / 1000; // Convert to km

    document.getElementById('city-name').textContent = name;
    document.getElementById('temperature').textContent = Math.round(temp);
    document.getElementById('weather-icon').innerHTML = `<i class="${getWeatherIcon(icon)}"></i>`;
    document.getElementById('weather-description').textContent = description;
    document.getElementById('humidity').textContent = humidity;
    document.getElementById('wind-speed').textContent = speed;
    document.getElementById('temp-min').textContent = Math.round(temp_min);
    document.getElementById('temp-max').textContent = Math.round(temp_max);
    document.getElementById('pressure').textContent = pressure;
    document.getElementById('visibility').textContent = visibility.toFixed(1);
}

function getWeatherIcon(iconCode) {
    const iconMap = {
        '01d': 'fas fa-sun',
        '01n': 'fas fa-moon',
        '02d': 'fas fa-cloud-sun',
        '02n': 'fas fa-cloud-moon',
        '03d': 'fas fa-cloud',
        '03n': 'fas fa-cloud',
        '04d': 'fas fa-cloud',
        '04n': 'fas fa-cloud',
        '09d': 'fas fa-cloud-showers-heavy',
        '09n': 'fas fa-cloud-showers-heavy',
        '10d': 'fas fa-cloud-sun-rain',
        '10n': 'fas fa-cloud-moon-rain',
        '11d': 'fas fa-bolt',
        '11n': 'fas fa-bolt',
        '13d': 'fas fa-snowflake',
        '13n': 'fas fa-snowflake',
        '50d': 'fas fa-smog',
        '50n': 'fas fa-smog'
    };

    return iconMap[iconCode] || 'fas fa-question';
}

searchInput.addEventListener('input', function() {
    const inputValue = this.value.toLowerCase();
    const filteredCities = cities.filter(city => 
        city.toLowerCase().includes(inputValue)
    );

    displaySuggestions(filteredCities);
});

function displaySuggestions(filteredCities) {
    suggestionsList.innerHTML = '';
    if (filteredCities.length > 0) {
        filteredCities.forEach(city => {
            const li = document.createElement('li');
            li.textContent = city;
            li.addEventListener('click', () => {
                searchInput.value = city;
                suggestionsList.style.display = 'none';
                getWeather();
            });
            suggestionsList.appendChild(li);
        });
        suggestionsList.style.display = 'block';
    } else {
        suggestionsList.style.display = 'none';
    }
}

// Ẩn danh sách gợi ý khi click ra ngoài
document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !suggestionsList.contains(e.target)) {
        suggestionsList.style.display = 'none';
    }
});

function saveRecentCity(city) {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    recentCities = recentCities.filter(c => c !== city);
    recentCities.unshift(city);
    recentCities = recentCities.slice(0, 5);
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
}

function loadRecentCities() {
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    const recentCitiesList = document.getElementById('recent-cities');
    recentCitiesList.innerHTML = '';
    recentCities.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.addEventListener('click', () => {
            searchInput.value = city;
            getWeather();
        });
        recentCitiesList.appendChild(li);
    });
}

// Gọi loadRecentCities khi trang web được tải
document.addEventListener('DOMContentLoaded', loadRecentCities);
