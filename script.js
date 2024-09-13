const apiKey = 'd4f8eabdb5c59fe510ed0fdda5dc0bb7';
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const weatherInfo = document.getElementById('weather-info');
const suggestionList = document.createElement('ul');
suggestionList.id = 'suggestions';

let vietnamCities = [];

// Thêm một đối tượng ánh xạ tên thành phố
const cityMapping = {
    'hồ chí minh': 'Ho Chi Minh City',
    'ho chi minh': 'Ho Chi Minh City',
    'sài gòn': 'Ho Chi Minh City',
    'saigon': 'Ho Chi Minh City',
    'hà nội': 'Hanoi',
    'ha noi': 'Hanoi',
};

async function fetchVietnamCities() {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/find?lat=16&lon=106&cnt=200&appid=${apiKey}`);
        const data = await response.json();
        vietnamCities = data.list.map(city => city.name);
        // Thêm các tên thành phố từ cityMapping nếu chưa có
        Object.values(cityMapping).forEach(city => {
            if (!vietnamCities.includes(city)) {
                vietnamCities.push(city);
            }
        });
        console.log('Danh sách thành phố đã được cập nhật:', vietnamCities);
    } catch (error) {
        console.error('Lỗi khi lấy danh sách thành phố:', error);
    }
}

// Gọi hàm để lấy danh sách thành phố khi trang web được tải
fetchVietnamCities();

searchButton.addEventListener('click', searchWeather);
searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchWeather();
    }
});

searchInput.addEventListener('input', showSuggestions);

function showSuggestions() {
    const inputValue = searchInput.value.toLowerCase();
    const filteredCities = vietnamCities.filter(city => 
        city.toLowerCase().includes(inputValue)
    );

    suggestionList.innerHTML = '';
    filteredCities.forEach(city => {
        const li = document.createElement('li');
        li.textContent = city;
        li.addEventListener('click', () => {
            searchInput.value = city;
            suggestionList.innerHTML = '';
            searchWeather();
        });
        suggestionList.appendChild(li);
    });

    if (filteredCities.length > 0) {
        searchInput.parentNode.appendChild(suggestionList);
    } else {
        suggestionList.remove();
    }
}

function searchWeather() {
    let city = searchInput.value.toLowerCase().trim();

    // Kiểm tra xem có trong cityMapping không
    for (let key in cityMapping) {
        if (city.includes(key)) {
            city = cityMapping[key];
            break;
        }
    }

    if (city) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},vn&appid=${apiKey}&units=metric&lang=vi`)
            .then(response => response.json())
            .then(data => {
                if (data.cod === 200) {
                    displayWeather(data);
                } else {
                    weatherInfo.innerHTML = `<p>Không tìm thấy thông tin thời tiết cho ${city}. Vui lòng kiểm tra lại tên thành phố.</p>`;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                weatherInfo.innerHTML = '<p>Đã xảy ra lỗi khi tìm kiếm thông tin thời tiết. Vui lòng thử lại sau.</p>';
            });
    }
    suggestionList.innerHTML = '';
}

// Hàm displayWeather giữ nguyên như cũ
function displayWeather(data) {
    const { name, main, weather } = data;
    const temperature = main.temp;
    const description = weather[0].description;
    const icon = weather[0].icon;

    weatherInfo.innerHTML = `
        <h2>${name}</h2>
        <img src="http://openweathermap.org/img/wn/${icon}.png" alt="${description}">
        <p>Nhiệt độ: ${temperature}°C</p>
        <p>Thời tiết: ${description}</p>
    `;
}