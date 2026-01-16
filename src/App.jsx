import React, { useState, useEffect } from "react";
import "./App.css";

import { fetchWeatherApi } from "openmeteo";

import MainPage from "./components/MainPage";

function App() {
  const [params, setParams] = useState({
    latitude: 24.8546842,
    longitude: 67.0207055,
    daily: ["weather_code", "temperature_2m_max", "temperature_2m_min"],
    hourly: ["temperature_2m", "weather_code"],
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
    ],
    timezone: "auto",
  });
  const [weatherData, setWeatherData] = useState(null);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [searchQuery, setSearchQuery] = useState("Karachi");

  useEffect(() => {
    const fetchData = async (params) => {
      try {
        setLoading(true);
        setError(null);

        const url = "https://api.open-meteo.com/v1/forecast";
        const responses = await fetchWeatherApi(url, params);

        const response = responses[0];

        if (!responses || responses.length === 0) {
          setError("No data received");
          return;
        }

        const utcOffsetSeconds = response.utcOffsetSeconds();
        const current = response.current();
        const hourly = response.hourly();
        const daily = response.daily();

        const getWeatherDescription = (code) => {
          const weatherCodes = {
            0: "Sunny",
            1: "Sunny",
            2: "Partly Cloudy",
            3: "Overcast",
            45: "Fog",
            48: "Fog",
            51: "Drizzle",
            53: "Drizzle",
            55: "Drizzle",
            56: "Drizzle",
            57: "Drizzle",
            61: "Rain",
            63: "Rain",
            65: "Rain",
            66: "Rain",
            67: "Rain",
            71: "Snow",
            73: "Snow",
            75: "Snow",
            77: "Snow",
            80: "Rain",
            81: "Rain",
            82: "Rain",
            85: "Snow",
            86: "Snow",
            95: "Storm",
            96: "Storm",
            99: "Storm",
          };
          return weatherCodes[code] || "Unknown";
        };

        const getLocation = async (latitude, longitude) => {
          try {
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await response.json();
            return `${data.city || data.locality || "Unknown"}, ${
              data.countryName || "Unknown"
            }`;
          } catch (error) {
            console.error("Error fetching location:", error);
            return "Unknown Location";
          }
        };

        const location = await getLocation(
          response.latitude(),
          response.longitude()
        );

        setWeatherData({
          current: {
            time: new Date(
              (Number(current.time()) + utcOffsetSeconds) * 1000
            ).toLocaleDateString("en-US", {
              weekday: "long",
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            location: location,
            details: [
              {
                id: 0,
                label: "Temperature",
                value: Math.round(current.variables(0).value()),
                unit: "°C",
              },
              {
                id: 1,
                label: "Humidity",
                value: Math.round(current.variables(1).value()),
                unit: "%",
              },
              {
                id: 2,
                label: "Wind",
                value: Math.round(current.variables(4).value()),
                unit: "km/h",
              },
              {
                id: 3,
                label: "Precipitation",
                value: current.variables(2).value().toFixed(1),
                unit: "mm",
              },
            ],
            weather_code: getWeatherDescription(current.variables(3).value()),
          },
          hourly: Array.from(
            {
              length:
                (Number(hourly.timeEnd()) - Number(hourly.time())) /
                hourly.interval(),
            },
            (_, i) => {
              const date = new Date(
                (Number(hourly.time()) +
                  i * hourly.interval() +
                  utcOffsetSeconds) *
                  1000
              );
              const hours = date.getHours();
              const period = hours >= 12 ? " PM" : " AM";
              const displayHours = hours % 12 || 12;
              const time = `${displayHours}${period}`;
              const dayOfWeek = date.toLocaleDateString("en-US", {
                weekday: "long",
              });

              return {
                id: i,
                day: dayOfWeek,
                time: time,
                temperature_2m: Math.round(
                  hourly.variables(0).valuesArray()[i]
                ),
                weather_code: getWeatherDescription(
                  hourly.variables(1).valuesArray()[i]
                ),
              };
            }
          ),
          daily: Array.from(
            {
              length:
                (Number(daily.timeEnd()) - Number(daily.time())) /
                daily.interval(),
            },
            (_, i) => {
              const date = new Date(
                (Number(daily.time()) +
                  i * daily.interval() +
                  utcOffsetSeconds) *
                  1000
              );
              const dayOfWeek = date.toLocaleDateString("en-US", {
                weekday: "short",
              });

              return {
                id: i,
                time: dayOfWeek,
                weather_code: getWeatherDescription(
                  daily.variables(0).valuesArray()[i]
                ),
                temperature_2m_max: Math.round(
                  daily.variables(1).valuesArray()[i]
                ),
                temperature_2m_min: Math.round(
                  daily.variables(2).valuesArray()[i]
                ),
              };
            }
          ),
        });

        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch weather data");
        setLoading(false);
      }
    };

    fetchData(params);
  }, [params]);

  useEffect(() => {
    if (searchInput.length < 2) {
      setCitySuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setCitiesLoading(true);
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${searchInput}&limit=4&appid=60afdc0a6e696d68c440a0f3ef15cef5`
        );
        const data = await response.json();

        const suggestions = data.map((city, index) => ({
          id: index,
          name: city.name,
          country: city.country,
          state: city.state || "",
          latitude: city.lat,
          longitude: city.lon,
          displayName: city.state
            ? `${city.name}, ${city.state}, ${city.country}`
            : `${city.name}, ${city.country}`,
        }));

        setCitySuggestions(suggestions);
        setCitiesLoading(false);
      } catch (err) {
        console.log("Error fetching cities:", err);
        setCitySuggestions([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    const fetchData = async (searchQuery) => {
      try {
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${searchQuery}&limit=4&appid=60afdc0a6e696d68c440a0f3ef15cef5`
        );

        const data = await response.json();

        const suggestions = data.map((city, index) => ({
          id: index,
          name: city.name,
          country: city.country,
          state: city.state || "",
          latitude: city.lat,
          longitude: city.lon,
          displayName: `${city.name}, ${city.country}`
        }));
        
        if (suggestions.length > 0) {
          setNotFound(false)
          handleCitySelect(suggestions[0])
        } else {
          setNotFound(true)
        }
      } catch (err) {
        console.log("Error fetching cities:", err);
        setNotFound(true);
      }
    };

    fetchData(searchQuery);
  }, [searchQuery]);

  const handleCitySelect = (city) => {
    setSearchInput(city.displayName);
    setParams((prev) => ({
      ...prev,
      latitude: city.latitude,
      longitude: city.longitude,
    }));
  };

  const retryFetch = () => {
    setParams((prev) => ({
      ...prev,
    }));
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();

    setSearchQuery(searchInput);
  };

  return (
    <>
      <MainPage
        weatherData={weatherData}
        isLoading={loading}
        isError={error}
        notFound={notFound}
        citiesLoading={citiesLoading}
        citySuggestions={citySuggestions}
        searchInput={searchInput}
        setSearchInput={setSearchInput}
        handleCitySelect={handleCitySelect}
        retryFetch={retryFetch}
        handleFormSubmit={handleFormSubmit}
      />
    </>
  );
}

export default App;
