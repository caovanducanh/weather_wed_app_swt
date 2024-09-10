function getWeather(city = null) {
    const searchCity = city || searchInput.value.trim();
    if (!searchCity) {
        showError('Vui lòng nhập tên thành phố');
        return;
    }

    document.getElementById('loading').classList.remove('hidden');
    
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&units=metric&appid=${config.apiKey}&lang=vi`)
        .then(response => {
            if (!response.ok) throw new Error('City not found');
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            saveRecentCity(data.name);
            displaySuggestions([]);
            searchInput.value = ''; // Xóa nội dung ô tìm kiếm sau khi tìm thành công
        })
        .catch(error => {
            console.error('Error:', error);
            showError('Không tìm thấy thành phố hoặc có lỗi xảy ra. Vui lòng thử lại.');
        })
        .finally(() => {
            document.getElementById('loading').classList.add('hidden');
        });
}

function displaySuggestions(filteredCities) {
    suggestionsList.innerHTML = '';
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    const inputValue = searchInput.value.toLowerCase().trim();

    const allSuggestions = [...new Set([...recentCities, ...filteredCities])];
    
    allSuggestions.forEach(city => {
        if (removeAccents(city.toLowerCase()).includes(removeAccents(inputValue))) {
            addSuggestionItem(city, recentCities.includes(city));
        }
    });

    suggestionsList.style.display = allSuggestions.length > 0 && inputValue !== '' ? 'block' : 'none';
}

// Đảm bảo rằng các phần tử DOM đã được định nghĩa
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const suggestionsList = document.getElementById('suggestions');

// Thêm event listener cho nút tìm kiếm
searchButton.addEventListener('click', () => {
    getWeather();
    suggestionsList.style.display = 'none';
});

// Sửa event listener cho input
searchInput.addEventListener('input', function() {
    const inputValue = this.value.toLowerCase().trim();
    const filteredCities = cities.filter(city => 
        removeAccents(city.toLowerCase()).includes(removeAccents(inputValue))
    );
    displaySuggestions(filteredCities);
});

searchInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        getWeather();
        suggestionsList.style.display = 'none';
    }
});

function hideError() {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (!errorElement) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'error-message';
        errorDiv.style.color = 'red';
        errorDiv.style.marginTop = '10px';
        document.querySelector('.container').appendChild(errorDiv);
    }
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
}

function displayWeather(data) {
    if (!data || !data.weather || data.weather.length === 0) {
        console.error('Dữ liệu thời tiết không hợp lệ', data);
        return;
    }
    const { name } = data;
    const { icon, description, main } = data.weather[0];
    const { temp, humidity, pressure, temp_min, temp_max } = data.main;
    const { speed } = data.wind;
    const visibility = data.visibility / 1000;

    document.getElementById('city-name').textContent = name;
    document.getElementById('temperature').textContent = Math.round(temp);
    document.getElementById('weather-icon').innerHTML = `<i class="${getWeatherIcon(icon)}"></i>`;
    document.getElementById('weather-description').textContent = description;
    document.getElementById('humidity').textContent = humidity;
    document.getElementById('wind-speed').textContent = speed.toFixed(1);
    document.getElementById('temp-min').textContent = Math.round(temp_min);
    document.getElementById('temp-max').textContent = Math.round(temp_max);
    document.getElementById('pressure').textContent = pressure;
    document.getElementById('visibility').textContent = visibility.toFixed(1);

    changeUIBasedOnWeather(main, icon);
}

function changeUIBasedOnWeather(weatherMain, iconCode) {
    const body = document.body;
    const weatherCard = document.querySelector('.weather-card');
    
    body.className = '';
    weatherCard.className = 'weather-card';

    switch(weatherMain.toLowerCase()) {
        case 'clear':
            body.classList.add('clear-sky');
            weatherCard.classList.add('clear-card');
            break;
        case 'clouds':
            body.classList.add('cloudy');
            weatherCard.classList.add('cloudy-card');
            break;
        case 'rain':
        case 'drizzle':
            body.classList.add('rainy');
            weatherCard.classList.add('rainy-card');
            break;
        case 'thunderstorm':
            body.classList.add('stormy');
            weatherCard.classList.add('stormy-card');
            break;
        case 'snow':
            body.classList.add('snowy');
            weatherCard.classList.add('snowy-card');
            break;
        default:
            body.classList.add('default');
            weatherCard.classList.add('default-card');
    }

    const weatherIcon = document.getElementById('weather-icon');
    weatherIcon.innerHTML = `<i class="${getWeatherIcon(iconCode)}"></i>`;
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

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

const debouncedDisplaySuggestions = debounce(displaySuggestions, 300);

searchInput.addEventListener('input', function() {
    const inputValue = this.value.toLowerCase().trim();
    const filteredCities = cities.filter(city => 
        removeAccents(city.toLowerCase()).includes(removeAccents(inputValue))
    );
    debouncedDisplaySuggestions(filteredCities);
});

function addSuggestionItem(city, isRecent) {
    const li = document.createElement('li');
    li.textContent = city;
    if (isRecent) {
        li.innerHTML = `<i class="fas fa-history"></i> ${city}`;
    }
    li.addEventListener('click', () => {
        searchInput.value = city;
        suggestionsList.style.display = 'none';
        getWeather(city);
    });
    suggestionsList.appendChild(li);
}

searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const suggestions = suggestionsList.querySelectorAll('li');
        const currentIndex = Array.from(suggestions).findIndex(li => li === document.activeElement);
        let nextIndex;

        if (e.key === 'ArrowDown') {
            nextIndex = currentIndex < suggestions.length - 1 ? currentIndex + 1 : 0;
        } else {
            nextIndex = currentIndex > 0 ? currentIndex - 1 : suggestions.length - 1;
        }

        suggestions[nextIndex].focus();
    } else if (e.key === 'Enter') {
        if (document.activeElement.tagName === 'LI') {
            document.activeElement.click();
        } else {
            getWeather();
        }
    }
});

function saveRecentCity(city) {
    let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    recentCities = recentCities.filter(c => c !== city);
    recentCities.unshift(city);
    recentCities = recentCities.slice(0, 5);
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
    console.log('Các thành phố gần đây:', JSON.parse(localStorage.getItem('recentCities')));
}

function loadDefaultWeather() {
    if (cities.includes('Hà Nội')) {
        getWeather('Hà Nội');
    } else {
        getWeather('London');
    }
}

window.onerror = function(message, source, lineno, colno, error) {
    console.error('Lỗi:', message, 'tại', source, 'dòng', lineno);
    showError('Đã xảy ra lỗi khi tải trang. Vui lòng thử lại sau.');
};

document.addEventListener('DOMContentLoaded', () => {
    loadDefaultWeather();
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    displaySuggestions(recentCities);
});

function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const style = document.createElement('style');
style.textContent = `
    #search-container {
        position: relative;
    }
    #suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.18);
        max-height: 200px;
        overflow-y: auto;
        z-index: 1000;
        border-radius: 0 0 15px 15px;
        scrollbar-width: none;
        -ms-overflow-style: none;
    }
    #suggestions::-webkit-scrollbar {
        display: none;
    }
    #suggestions li {
        padding: 10px;
        cursor: pointer;
        color: #fff;
    }
    #suggestions li:hover {
        background-color: rgba(255, 255, 255, 0.2);
    }
`;
document.head.appendChild(style);

document.addEventListener('click', function(event) {
    if (!event.target.closest('#search-container')) {
        suggestionsList.style.display = 'none';
    }
});

searchInput.addEventListener('focus', function() {
    if (this.value.trim() !== '') {
        const inputValue = this.value.toLowerCase().trim();
        const filteredCities = cities.filter(city => 
            removeAccents(city.toLowerCase()).includes(removeAccents(inputValue))
        );
        displaySuggestions(filteredCities);
    }
});

function updateWeather() {
    const currentCity = document.getElementById('city-name').textContent;
    if (currentCity) {
        getWeather(currentCity);
    }
}

setInterval(updateWeather, 300000);
