if (!config || !config.apiKey) {
    console.error('API key không được cấu hình đúng cách');
}

const apiKey = config.apiKey;
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const weatherCard = document.getElementById('weather-card');
const suggestionsList = document.getElementById('suggestions');

// Mở rộng danh sách các thành phố
const cities = [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'Tokyo', 'New York', 'London', 'Paris', 'Berlin', 'Moscow',
    'Beijing', 'Sydney', 'Rio de Janeiro', 'Cairo', 'Bangkok',
    'Seoul', 'Toronto', 'Dubai', 'Singapore', 'Mumbai', 'Los Angeles',
    'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio',
    'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville',
    'San Francisco', 'Columbus', 'Fort Worth', 'Indianapolis',
    'Charlotte', 'Seattle', 'Denver', 'Washington', 'Boston'
];

// Không thể thực hiện push lên Git trực tiếp từ JavaScript.
// Thay vào đó, bạn cần sử dụng terminal hoặc command prompt để thực hiện các lệnh Git.
// Dưới đây là các bước bạn cần thực hiện:

// 1. Mở terminal hoặc command prompt
// 2. Di chuyển đến thư mục dự án: cd C:\Users\caova\weather-app
// 3. Thêm tất cả các thay đổi: git add .
// 4. Commit các thay đổi: git commit -m "Update weather app"
// 5. Push lên GitHub: git push origin main

// Lưu ý: Đảm bảo bạn đã cài đặt Git và đã cấu hình đúng remote repository.

searchButton.addEventListener('click', () => getWeather());
searchInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        getWeather();
    }
});

function getWeather(city = null) {
    const searchCity = city || searchInput.value;
    if (!searchCity) {
        console.error('Không có tên thành phố được nhập');
        return;
    }
    document.getElementById('loading').classList.remove('hidden');
    const matchedCity = cities.find(c => removeAccents(c.toLowerCase()) === removeAccents(searchCity.toLowerCase()));
    const cityToSearch = matchedCity || searchCity;
    
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityToSearch}&units=metric&appid=${apiKey}&lang=vi`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            displayWeather(data);
            saveRecentCity(data.name);
            displaySuggestions([]);
        })
        .catch(error => {
            console.error('Lỗi khi lấy dữ liệu thời tiết:', error);
            alert('Không tìm thấy thành phố hoặc có lỗi xảy ra. Vui lòng thử lại.');
        })
        .finally(() => {
            document.getElementById('loading').classList.add('hidden');
        });
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
    const visibility = data.visibility / 1000; // Convert to km

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

    // Thay đổi UI dựa trên thời tiết
    changeUIBasedOnWeather(main, icon);
}

function changeUIBasedOnWeather(weatherMain, iconCode) {
    const body = document.body;
    const weatherCard = document.querySelector('.weather-card');
    
    // Reset classes
    body.className = '';
    weatherCard.className = 'weather-card';

    // Thêm class mới dựa trên thời tiết
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

    // Thay đổi icon dựa trên mã icon
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

searchInput.addEventListener('input', function() {
    const inputValue = this.value.toLowerCase();
    const filteredCities = cities.filter(city => 
        removeAccents(city.toLowerCase()).includes(removeAccents(inputValue))
    );
    displaySuggestions(filteredCities);
});

function displaySuggestions(filteredCities) {
    suggestionsList.innerHTML = '';
    const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
    
    const allSuggestions = [...new Set([...recentCities, ...filteredCities])].slice(0, 5); // Giới hạn số lượng gợi ý
    allSuggestions.forEach(city => {
        addSuggestionItem(city, recentCities.includes(city));
    });

    suggestionsList.style.display = (allSuggestions.length > 0 && searchInput.value.trim() !== '') ? 'block' : 'none';
    console.log('Hiển thị gợi ý:', allSuggestions);
}

function addSuggestionItem(city, isRecent) {
    const li = document.createElement('li');
    li.textContent = city;
    if (isRecent) {
        li.innerHTML = `<i class="fas fa-history"></i> ${city}`; // Chỉ thêm biểu tượng lịch sử, không có chữ "thành phố gần đây"
    }
    li.addEventListener('click', () => {
        searchInput.value = city;
        suggestionsList.style.display = 'none';
        getWeather(city);
    });
    suggestionsList.appendChild(li);
}

// Thêm event listener cho phím mũi tên và Enter
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

// Xóa hàm loadRecentCities vì không cần thiết nữa

// Cập nhật hàm loadDefaultWeather
function loadDefaultWeather() {
    if (cities.includes('Hà Nội')) {
        getWeather('Hà Nội');
    } else {
        console.error('Không tìm thấy thành phố mặc định trong danh sách');
        // Có thể thêm một thông báo cho người dùng ở đây
    }
}

// Thêm hàm updateWeather để cập nhật thời tiết tự động
function updateWeather() {
    const currentCity = document.getElementById('city-name').textContent;
    if (currentCity) {
        getWeather(currentCity);
    }
}

// Gọi loadDefaultWeather và loadRecentCities khi trang web được tải
document.addEventListener('DOMContentLoaded', () => {
    loadDefaultWeather();
    // Xóa loadRecentCities();
});

// Thêm interval để cập nhật thời tiết mỗi 5 phút
setInterval(updateWeather, 300000); // 300000 ms = 5 phút

// Thêm hàm để loại bỏ dấu
function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

console.log(removeAccents('Hà Nội')); // Nên in ra "Ha Noi"
