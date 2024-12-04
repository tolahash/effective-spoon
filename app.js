// Constants for APIs
const OPEN_METEO_API = "https://api.open-meteo.com/v1/forecast";
const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1/search";

// DOM Elements
const elements = {
  getCurrentLocation: document.getElementById("getCurrentLocation"),
  locationInput: document.getElementById("locationInput"),
  searchLocation: document.getElementById("searchLocation"),
  locationName: document.getElementById("locationName"),
  currentTemp: document.getElementById("currentTemp"),
  humidity: document.getElementById("humidity"),
  windSpeed: document.getElementById("windSpeed"),
  feelsLike: document.getElementById("feelsLike"),
  forecastChart: document.getElementById("forecastChart"),
  forecastCards: document.getElementById("forecastCards"),
  loadingSpinner: document.getElementById("loadingSpinner"),
  errorMessage: document.getElementById("errorMessage"),
};

// Chart.js instance
let weatherChart;

// Utility Functions
const showLoading = () => (elements.loadingSpinner.style.display = "block");
const hideLoading = () => (elements.loadingSpinner.style.display = "none");
const showError = (message) => {
  elements.errorMessage.textContent = message;
  elements.errorMessage.style.display = "block";
};
const hideError = () => {
  elements.errorMessage.textContent = "";
  elements.errorMessage.style.display = "none";
};

// Validate coordinates
const validateCoordinates = (latitude, longitude) => {
  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);
  return (
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
};

// Geolocation Utility
const getCurrentPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });

// Fetch Weather Data
const fetchWeatherData = async (latitude, longitude) => {
  try {
    // Validate coordinates before making the API call
    if (!validateCoordinates(latitude, longitude)) {
      throw new Error("Invalid coordinates provided");
    }

    const params = new URLSearchParams({
      latitude: latitude.toFixed(6),
      longitude: longitude.toFixed(6),
      hourly:
        "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m",
      daily: "temperature_2m_max,temperature_2m_min,weathercode",
      timezone: "auto",
      forecast_days: "7", // Explicitly request 7 days of forecast
    });

    const response = await fetch(`${OPEN_METEO_API}?${params}`);

    if (!response.ok) {
      throw new Error(
        `Weather API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Validate the response data structure
    if (!data || !data.hourly || !data.daily) {
      throw new Error("Invalid weather data format received");
    }

    // Validate required data fields
    const requiredHourlyFields = [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "wind_speed_10m",
    ];
    const requiredDailyFields = [
      "temperature_2m_max",
      "temperature_2m_min",
      "weathercode",
    ];

    for (const field of requiredHourlyFields) {
      if (!data.hourly[field] || !Array.isArray(data.hourly[field])) {
        throw new Error(`Missing or invalid hourly field: ${field}`);
      }
    }

    for (const field of requiredDailyFields) {
      if (!data.daily[field] || !Array.isArray(data.daily[field])) {
        throw new Error(`Missing or invalid daily field: ${field}`);
      }
    }

    return data;
  } catch (error) {
    console.error("Weather data fetch error:", error);
    throw new Error(`Failed to fetch weather data: ${error.message}`);
  }
};

// Geocode Location
const geocodeLocation = async (location) => {
  try {
    if (!location || typeof location !== "string") {
      alert("Invalid location query");
      return null; // Return null if the location is invalid
    }

    const response = await fetch(
      `${GEOCODING_API}?name=${encodeURIComponent(location.trim())}&count=1`
    );

    if (!response.ok) {
      alert(`Geocoding API error: ${response.status} ${response.statusText}`);
      return null; // Return null if the API response is not OK
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      alert("Location not found");
      return null; // Return null if no location is found
    }

    const result = data.results[0];
    return {
      latitude: result.latitude,
      longitude: result.longitude,
      name: `${result.name}${result.country ? `, ${result.country}` : ""}`,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    alert(`Failed to geocode location: ${error.message}`);
    return null; // Return null in case of an error
  }
};

// Update Current Weather
const updateCurrentWeather = (data) => {
  try {
    const currentHour = new Date().getHours();

    elements.currentTemp.textContent = `${Math.round(
      data.hourly.temperature_2m[currentHour] || 0
    )}`;
    elements.humidity.textContent = `${Math.round(
      data.hourly.relative_humidity_2m[currentHour] || 0
    )}`;
    elements.windSpeed.textContent = `${Math.round(
      data.hourly.wind_speed_10m[currentHour] || 0
    )}`;
    elements.feelsLike.textContent = `${Math.round(
      data.hourly.apparent_temperature[currentHour] || 0
    )}`;
  } catch (error) {
    console.error("Error updating current weather:", error);
    throw new Error("Failed to update current weather display");
  }
};

// Update Forecast Chart
const updateForecastChart = (data) => {
  try {
    if (!elements.forecastChart || !elements.forecastChart.getContext) {
      throw new Error("Forecast chart canvas not available");
    }

    const ctx = elements.forecastChart.getContext("2d");
    if (weatherChart) {
      weatherChart.destroy();
    }

    const labels = data.daily.time.map((date) =>
      new Date(date).toLocaleDateString("en-US", { weekday: "short" })
    );

    weatherChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Max Temperature (°C)",
            data: data.daily.temperature_2m_max,
            borderColor: "#ff6384",
            backgroundColor: "rgba(255, 99, 132, 0.2)",
            tension: 0.4,
          },
          {
            label: "Min Temperature (°C)",
            data: data.daily.temperature_2m_min,
            borderColor: "#36a2eb",
            backgroundColor: "rgba(54, 162, 235, 0.2)",
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "top",
            labels: {
              color: "#ffffff",
            },
          },
        },
        scales: {
          y: {
            ticks: { color: "#ffffff" },
            grid: { color: "rgba(255, 255, 255, 0.1)" },
          },
          x: {
            ticks: { color: "#ffffff" },
            grid: { color: "rgba(255, 255, 255, 0.1)" },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error updating forecast chart:", error);
    throw new Error("Failed to update forecast chart");
  }
};

// Weather codes mapping
const weatherIcons = {
  0: "☀️", // Clear sky
  1: "🌤️", // Partly cloudy
  2: "☁️", // Cloudy
  3: "☁️", // Overcast
  45: "🌫️", // Foggy
  48: "🌫️", // Depositing rime fog
  51: "🌧️", // Light drizzle
  53: "🌧️", // Moderate drizzle
  55: "🌧️", // Dense drizzle
  61: "🌧️", // Slight rain
  63: "🌧️", // Moderate rain
  65: "🌧️", // Heavy rain
  71: "🌨️", // Slight snow
  73: "🌨️", // Moderate snow
  75: "🌨️", // Heavy snow
  77: "🌨️", // Snow grains
  80: "🌧️", // Slight rain showers
  81: "🌧️", // Moderate rain showers
  82: "🌧️", // Violent rain showers
  85: "🌨️", // Slight snow showers
  86: "🌨️", // Heavy snow showers
  95: "⛈️", // Thunderstorm
  96: "⛈️", // Thunderstorm with slight hail
  99: "⛈️", // Thunderstorm with heavy hail
};

// Update Forecast Cards
const updateForecastCards = (data) => {
  try {
    if (!elements.forecastCards) {
      throw new Error("Forecast cards container not found");
    }

    elements.forecastCards.innerHTML = data.daily.time
      .map((date, index) => {
        const weatherCode = data.daily.weathercode[index];
        const weatherIcon = weatherIcons[weatherCode] || "❓";
        return `
        <div class="forecast-card">
          <h4>${new Date(date).toLocaleDateString("en-US", {
            weekday: "short",
          })}</h4>
          <div class="weather-icon">${weatherIcon}</div>
          <p>Max: ${Math.round(data.daily.temperature_2m_max[index])}°C</p>
          <p>Min: ${Math.round(data.daily.temperature_2m_min[index])}°C</p>
        </div>
      `;
      })
      .join("");
  } catch (error) {
    console.error("Error updating forecast cards:", error);
    throw new Error("Failed to update forecast cards");
  }
};

// Fetch and Display Weather
const fetchAndDisplayWeather = async (latitude, longitude) => {
  try {
    showLoading();
    hideError();

    const data = await fetchWeatherData(latitude, longitude);
    updateCurrentWeather(data);
    updateForecastChart(data);
    updateForecastCards(data);
  } catch (error) {
    console.error("Error in fetchAndDisplayWeather:", error);
    showError(
      error.message || "Error fetching weather data. Please try again later."
    );
  } finally {
    hideLoading();
  }
};

// Event Handlers
const handleGetCurrentLocation = async () => {
  try {
    showLoading();
    hideError();

    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;

    // Add reverse geocoding
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}`
      );
      const data = await response.json();
      const locationName = data.city || data.locality || "Unknown Location";
      elements.locationName.textContent = locationName;
    } catch (geocodeError) {
      console.error("Error getting location name:", geocodeError);
      elements.locationName.textContent = "Location Found"; // Fallback if geocoding fails
    }

    await fetchAndDisplayWeather(latitude, longitude);
  } catch (error) {
    console.error("Error getting current location:", error);
    showError(error.message || "Failed to get your location.");
  } finally {
    hideLoading();
  }
};

const handleSearchLocation = async () => {
  try {
    const location = elements.locationInput?.value?.trim();
    if (!location) {
      showError("Please enter a location");
      return;
    }

    showLoading();
    hideError();

    const geocoded = await geocodeLocation(location);
    if (geocoded) {
      elements.locationName.textContent = geocoded.name;
      await fetchAndDisplayWeather(geocoded.latitude, geocoded.longitude);
    }
  } catch (error) {
    console.error("Error searching location:", error);
    showError(error.message || "Failed to find location.");
  } finally {
    hideLoading();
  }
};

// Add event listeners
elements.getCurrentLocation?.addEventListener(
  "click",
  handleGetCurrentLocation
);
elements.searchLocation?.addEventListener("click", handleSearchLocation);

// Optional: Add enter key listener for search
elements.locationInput?.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    handleSearchLocation();
  }
});
