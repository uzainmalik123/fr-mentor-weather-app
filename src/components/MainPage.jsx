import React, { useState, useEffect } from "react";

import dropDownIcon from "../assets/icon-dropdown.svg";
import checkmarkIcon from "../assets/icon-checkmark.svg";
import searchIcon from "../assets/icon-search.svg";
import unitIcon from "../assets/icon-units.svg";
import logoIcon from "../assets/logo.svg";
import errorIcon from "../assets/icon-error.svg";
import retryIcon from "../assets/icon-retry.svg";

import sunnyIcon from "../assets/icon-sunny.webp";
import stormIcon from "../assets/icon-storm.webp";
import snowIcon from "../assets/icon-snow.webp";
import rainIcon from "../assets/icon-rain.webp";
import partlyCloudyIcon from "../assets/icon-partly-cloudy.webp";
import overcastIcon from "../assets/icon-overcast.webp";
import fogIcon from "../assets/icon-fog.webp";
import drizzleIcon from "../assets/icon-drizzle.webp";

const daysOfTheWeek = [
  { id: 0, day: "Monday" },
  { id: 1, day: "Tuesday" },
  { id: 2, day: "Wednesday" },
  { id: 3, day: "Thursday" },
  { id: 4, day: "Friday" },
  { id: 5, day: "Saturday" },
  { id: 6, day: "Sunday" },
];

const components = ["Temperature", "Wind", "Humidity", "Precipitation"];

const ComponentBoxes = ({
  componentBoxName,
  componentBoxVal,
  convertTemp,
  convertPrecipitation,
  convertWind,
  unitSystem,
  tempUnit,
  windUnit,
  precipitationUnit,
  isLoading,
}) => {
  const evaluateUnit = () => {
    switch (componentBoxName) {
      case "Wind":
        return windUnit;
      case "Precipitation":
        return precipitationUnit;
      case "Temperature":
        return "°" + tempUnit;
      case "Humidity":
        return "%";
      default:
        return null;
    }
  };

  const getComponentValue = () => {
    switch (componentBoxName) {
      case "Wind":
        return convertWind(componentBoxVal, unitSystem);
      case "Precipitation":
        return convertPrecipitation(componentBoxVal, unitSystem);
      case "Temperature":
        return convertTemp(componentBoxVal, unitSystem);
      case "Humidity":
        return componentBoxVal;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col basis-39 px-4 py-2 gap-5 rounded-lg border border-neutral-700 bg-neutral-600/45 max-[480px]:basis-36">
      <p className="text-neutral-300">{componentBoxName}</p>
      {!isLoading ? (
        <h3 className="text-3xl font-light">
          {getComponentValue()} {evaluateUnit()}
        </h3>
      ) : (
        <p className="text-2xl">-</p>
      )}
    </div>
  );
};

const DailyForecastBox = ({
  dailyForecastDay,
  dailyForecastIcon,
  dailyForecastCurrTemp,
  dailyForecastMinTemp,
  convertTemp,
  units,
  unitSystem,
  isLoading,
}) => {
  return (
    <div
      className="flex flex-col justify-between basis-20.5 h-36.25 px-2 py-3 gap-4 items-center w-[12%] rounded-md border border-neutral-700 bg-neutral-600/45
    
      "
    >
      {!isLoading ? (
        <>
          <p>{dailyForecastDay}</p>
          <img src={dailyForecastIcon} alt="day-icon" className="w-11 h-11" />
          <div className="flex w-full justify-between">
            <p className="text-foreground text-sm">
              {convertTemp(dailyForecastCurrTemp, unitSystem)}
              {units.temp}
            </p>
            <p className="text-neutral-200 text-sm">
              {convertTemp(dailyForecastMinTemp, unitSystem)}
              {units.temp}
            </p>
          </div>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

const HourlyForecastBox = ({
  hourlyForecastIcon,
  hourlyForecastTime,
  hourlyForecastTemp,
  convertTemp,
  units,
  unitSystem,
  isLoading,
}) => {
  return (
    <div className="flex items-center w-[95%] min-h-14 bg-neutral-400/10 border border-neutral-700 rounded-md p-2 pr-4 gap-3">
      {!isLoading ? (
        <>
          <img src={hourlyForecastIcon} alt="day-icon" className="w-10 h-10" />
          <p className="text-lg">{hourlyForecastTime}</p>
          <p className="ml-auto text-neutral-100">
            {convertTemp(hourlyForecastTemp, unitSystem)}
            {units.temp}
          </p>
        </>
      ) : (
        ""
      )}
    </div>
  );
};

const SettingsComponent = ({
  settingCompName,
  settingCompValOne,
  settingCompValTwo,
  unitOne,
  unitTwo,
  onValueChange,
  currentValue,
}) => {
  const handleOptionClick = (unitValue) => {
    if (unitValue !== currentValue) {
      onValueChange(settingCompName, unitValue);
    }
  };

  return (
    <div className="flex flex-col gap-0.5">
      <p className="pl-2 text-neutral-400 text-sm">{settingCompName}</p>
      <button
        onClick={() => handleOptionClick(unitOne)}
        style={{
          backgroundColor:
            currentValue === unitOne ? "rgba(100, 100, 100, 0.3)" : "",
        }}
        className="p-2 justify-between items-center flex transition-all rounded-md cursor-pointer hover:bg-neutral-500/15"
      >
        {settingCompValOne}
        {currentValue === unitOne && (
          <img className="w-4 h-4" src={checkmarkIcon} alt="checkmark" />
        )}
      </button>
      <button
        onClick={() => handleOptionClick(unitTwo)}
        style={{
          backgroundColor:
            currentValue === unitTwo ? "rgba(100, 100, 100, 0.3)" : "",
        }}
        className="p-2 justify-between items-center flex transition-all rounded-md cursor-pointer hover:bg-neutral-500/15"
      >
        {settingCompValTwo}
        {currentValue === unitTwo && (
          <img className="w-4 h-4" src={checkmarkIcon} alt="checkmark" />
        )}
      </button>
    </div>
  );
};

const MainPage = (props) => {
  const [weekDaysPopUp, setWeekDaysPopUp] = useState(false);
  const [settingsPopUp, setSettingsPopUp] = useState(false);
  const [weekDay, setWeekDay] = useState(
    daysOfTheWeek[new Date().getDay() - 1].day
  );
  const [hourlyArr, setHourlyArr] = useState(null);
  const [unitSystem, setUnitSystem] = useState("Metric");
  const [tempUnit, setTempUnit] = useState("C");
  const [windUnit, setWindUnit] = useState("km/h");
  const [precipitationUnit, setPrecipitationUnit] = useState("mm");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const settingCompData = [
    {
      id: 0,
      name: "Temperature",
      valOne: "Celsius (°C)",
      valTwo: "Fahrenheit (°F)",
      unitOne: "C",
      unitTwo: "F",
    },
    {
      id: 1,
      name: "Wind Speed",
      valOne: "km/h",
      valTwo: "mph",
      unitOne: "km/h",
      unitTwo: "mph",
    },
    {
      id: 2,
      name: "Precipitation",
      valOne: "Millimeters (mm)",
      valTwo: "Inches (in)",
      unitOne: "mm",
      unitTwo: "in",
    },
  ];

  const convertTemp = (tempC, system) => {
    if (system === "Imperial" || tempUnit === "F") {
      return Math.round((tempC * 9) / 5 + 32);
    }
    return Math.round(tempC);
  };

  const convertWind = (kmh, system) => {
    if (system === "Imperial" || windUnit === "mph") {
      return Math.round(kmh * 0.621371);
    }
    return Math.round(kmh);
  };

  const convertPrecipitation = (mm, system) => {
    const value = Number(mm) || 0;
    if (system === "Imperial" || tempUnit === "in") {
      return (value * 0.0393701).toFixed(1);
    }
    return value.toFixed(1);
  };

  const getUnits = (system) => ({
    temp: system === "Metric" ? "°" : "°",
    wind: system === "Metric" ? " km/h" : " mph",
    precipitation: system === "Metric" ? " mm" : " in",
  });

  const units = getUnits(unitSystem);

  const handleUnitSwitch = () => {
    unitSystem === "Metric"
      ? setUnitSystem("Imperial")
      : setUnitSystem("Metric");
  };

  const handleWeekDayPopUp = () => {
    setWeekDaysPopUp(!weekDaysPopUp);
  };

  const handleSettingsPopUp = () => {
    setSettingsPopUp(!settingsPopUp);
  };

  const handleSetWeekDay = (day) => {
    setWeekDay(day);
    setWeekDaysPopUp(false);
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case "Sunny":
        return sunnyIcon;
      case "Partly Cloudy":
        return partlyCloudyIcon;
      case "Storm":
        return stormIcon;
      case "Overcast":
        return overcastIcon;
      case "Rain":
        return rainIcon;
      case "Snow":
        return snowIcon;
      case "Fog":
        return fogIcon;
      case "Drizzle":
        return drizzleIcon;
      default:
        return null;
    }
  };

  const handleValueChange = (settingCompName, newValue) => {
    switch (settingCompName) {
      case "Temperature":
        setTempUnit(newValue);
        break;
      case "Precipitation":
        setPrecipitationUnit(newValue);
        break;
      case "Wind Speed":
        setWindUnit(newValue);
        break;
      default:
        break;
    }
  };

  const getCurrentValue = (name) => {
    switch (name) {
      case "Temperature":
        return tempUnit;
      case "Wind Speed":
        return windUnit;
      case "Precipitation":
        return precipitationUnit;
      default:
        return "";
    }
  };

  const handleOnBlur = () => {
    setTimeout(() => setIsInputFocused(false), 200);
  };

  const handleCityClick = (city) => {
    props.handleCitySelect(city);
    setIsInputFocused(false);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    console.log(data)
  };

  useEffect(() => {
    if (props.isLoading || !props.weatherData) {
      setHourlyArr([]);
      return;
    }

    const firstIndex = props.weatherData.hourly.findIndex(
      (item) => item.day === weekDay
    );

    if (firstIndex === -1) {
      setHourlyArr([]);
      return;
    }

    const filtered = [];
    for (let i = firstIndex; i < props.weatherData.hourly.length; i++) {
      if (props.weatherData.hourly[i].day === weekDay) {
        filtered.push(props.weatherData.hourly[i]);
      } else {
        break;
      }
    }

    setHourlyArr(filtered);
  }, [weekDay, props.weatherData, props.isLoading]);

  useEffect(() => {
    if (unitSystem === "Metric") {
      setTempUnit("C");
      setWindUnit("km/h");
      setPrecipitationUnit("mm");
    } else {
      setTempUnit("F");
      setWindUnit("mph");
      setPrecipitationUnit("in");
    }
  }, [unitSystem]);

  return (
    <main className="w-[clamp(300px,100%,1920px)] h-full flex justify-center bg-background p-8.5">
      <div className="w-280 h-full flex flex-col items-center gap-12">
        <nav className="flex w-full justify-between">
          <img src={logoIcon} alt="logo" width={142} height={68} />
          <div className="relative">
            <button
              onClick={handleSettingsPopUp}
              className="flex items-center gap-2.5 px-3.5 p-2 rounded-md bg-neutral-600/45
            text-neutral-200 cursor-pointer border-2 border-transparent transition-all focus:outline-2
            focus:border-(--background) focus:outline-white hover:transition-all hover:bg-neutral-300/30"
            >
              <img className="w-4 h-4" src={unitIcon} alt="day-icon" />
              <p>Units</p>
              <img
                className={`${
                  settingsPopUp ? "rotate-180" : ""
                } transition-all w-3.5 h-3.5`}
                src={dropDownIcon}
                alt="day-icon"
              />
            </button>
            {settingsPopUp && (
              <div className="flex flex-col absolute w-57 py-1.5 px-1 gap-2 bg-[#25253f] z-1 border border-neutral-400/25 top-13 right-0 rounded-md">
                <button
                  onClick={handleUnitSwitch}
                  className="font-light text-start w-full pl-2 p-2 cursor-pointer transition-all rounded-md hover:bg-neutral-500/15"
                >
                  Switch to {unitSystem === "Metric" ? "Imperial" : "Metric"}
                </button>
                {settingCompData.map((item) => (
                  <>
                    <SettingsComponent
                      key={item.id}
                      settingCompName={item.name}
                      settingCompValOne={item.valOne}
                      settingCompValTwo={item.valTwo}
                      unitOne={item.unitOne}
                      unitTwo={item.unitTwo}
                      currentValue={getCurrentValue(item.name)}
                      onValueChange={handleValueChange}
                    />
                    <hr
                      className={`${
                        item.id === 2 ? "hidden" : "block"
                      } mx-1 bg-neutral-500/30 h-px border-none`}
                    />
                  </>
                ))}
              </div>
            )}
          </div>
        </nav>
        <h1 className="text-5xl font-bold font-bricolage-grotesque text-center leading-14 max-[480px]:w-80">
          How&apos;s the sky looking today?
        </h1>
        <form
          className="flex gap-4 max-[480px]:flex-col max-[480px]:gap-2"
          onSubmit={handleFormSubmit}
        >
          <div className="relative">
            <input
              type="search"
              onChange={(e) => props.setSearchInput(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={handleOnBlur}
              placeholder="Search for a place..."
              className="w-92.75 pl-11 px-5 py-2 rounded-md bg-neutral-600/45 placeholder-neutral-300 border-2 border-transparent focus:outline-2 focus:border-(--background) focus:outline-white max-[480px]:w-75"
            />
            <img
              className="absolute top-1/2 left-4 w-4 h-4 -translate-y-1/2 text-neutral-500"
              src={searchIcon}
              alt="search-icon"
            />
            {isInputFocused && props.searchInput.length >= 2 && (
              <div className="flex flex-col items-start absolute w-full p-2 z-1 bg-[#25253f] top-13 right-0 rounded-md">
                {props.citiesLoading ? (
                  <p>Searching...</p>
                ) : (
                  props.citySuggestions.map((item) => (
                    <button
                      key={item.id}
                      onMouseDown={() => handleCityClick(item)}
                      className="p-2.5 w-full text-start rounded-md transition-all hover:bg-neutral-500/15 hover:transition-all"
                    >
                      {item.displayName}
                    </button>
                  ))
                )}
                {!props.citiesLoading && props.citySuggestions.length === 0 && (
                  <p>No cities found.</p>
                )}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="px-4 rounded-md bg-(--blue-500) cursor-pointer border-2 border-transparent transition-all focus:outline-2 focus:border-(--background) focus:outline-(--blue-500) hover:bg-(--blue-700) hover:transition-all max-[480px]:py-2.5"
          >
            Search
          </button>
        </form>
        {!props.isError && (
          <section className="flex flex-wrap w-full gap-6 justify-center">
            <div className="flex flex-col basis-174 gap-6 max-[480px]:items-center">
              <div
                className={`flex items-center justify-between w-full h-50 px-4 py-5 ${
                  props.isLoading && "bg-neutral-600/45"
                } ${
                  !props.isLoading && `bg-[url('./assets/bg-today-large.svg')]`
                } bg-no-repeat bg-center bg-cover rounded-2xl
              max-[480px]:w-75 max-[480px]:flex-col ${
                !props.isLoading &&
                `max-[480px]:bg-[url('./assets/bg-today-large.svg')]`
              }
              ${props.isLoading && "justify-center"}
              `}
              >
                {!props.isLoading && (
                  <>
                    <div className="flex flex-col gap-1.5 max-[480px]:items-center">
                      <h3 className="text-foreground text-xl font-bold">
                        {props.weatherData.current.location}
                      </h3>
                      <p className="text-[13px] text-neutral-300">
                        {props.weatherData.current.time}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <img
                        className="w-22.5 h-22.5"
                        src={getIcon(props.weatherData.current.weather_code)}
                        alt="day-icon"
                      />
                      <h2 className="flex items-center justify-end text-7xl font-semibold italic">
                        {convertTemp(
                          props.weatherData.current.details[0].value,
                          unitSystem
                        )}
                        {units.temp}
                      </h2>
                    </div>
                  </>
                )}
                {props.isLoading && (
                  <>
                    <div className="flex flex-col gap-2 items-center">
                      <div className="flex gap-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-white ball-1"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-white ball-2"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-white ball-3"></div>
                      </div>
                      <p>Loading...</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-6 max-[480px]:gap-3 max-[480px]:justify-center">
                {!props.isLoading
                  ? props.weatherData.current.details.map((item) => (
                      <ComponentBoxes
                        key={item.id}
                        componentBoxName={item.label}
                        componentBoxVal={item.value}
                        convertTemp={convertTemp}
                        convertPrecipitation={convertPrecipitation}
                        convertWind={convertWind}
                        unitSystem={unitSystem}
                        tempUnit={tempUnit}
                        windUnit={windUnit}
                        precipitationUnit={precipitationUnit}
                        isLoading={props.isLoading}
                      />
                    ))
                  : components.map((item, index) => (
                      <ComponentBoxes
                        key={index}
                        isLoading={props.isLoading}
                        componentBoxName={item}
                      />
                    ))}
              </div>
              <div className="flex flex-col mt-2.5 gap-2 max-[825px]:items-center">
                <p>Daily forecast</p>
                <div className="flex flex-wrap gap-5 justify-center max-[480px]:gap-3">
                  {!props.isLoading
                    ? props.weatherData.daily.map((item) => {
                        const icon = getIcon(item.weather_code);
                        return (
                          <DailyForecastBox
                            key={item.id}
                            dailyForecastDay={item.time}
                            dailyForecastIcon={icon}
                            dailyForecastCurrTemp={item.temperature_2m_max}
                            dailyForecastMinTemp={item.temperature_2m_min}
                            convertTemp={convertTemp}
                            unitSystem={unitSystem}
                            units={units}
                            isLoading={props.isLoading}
                          />
                        );
                      })
                    : daysOfTheWeek.map((item) => (
                        <DailyForecastBox
                          key={item.id}
                          isLoading={props.isLoading}
                        />
                      ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col basis-100 h-137 pl-6 py-6 gap-4 rounded-2xl bg-neutral-600/45">
              <div className="flex justify-between pr-6 items-center">
                <p className="text-lg">Hourly Forecast</p>
                <div className="relative">
                  <button
                    onClick={handleWeekDayPopUp}
                    className="py-1.5 pr-9 pl-4.25 rounded-md bg-neutral-200/15 transition-all hover:transition-all hover:bg-neutral-300/30"
                  >
                    {props.isLoading ? "-" : weekDay}
                    <img
                      className={`absolute top-1/2 right-3.5 w-3 h-3 -translate-y-1/2 transition-all text-neutral-500 ${
                        weekDaysPopUp ? "rotate-180" : ""
                      }`}
                      src={dropDownIcon}
                      alt="dropdown-icon"
                    />
                  </button>
                  {weekDaysPopUp && (
                    <div className="flex flex-col items-start gap-0.5 absolute w-55 p-2 z-1 bg-[#25253f] border border-neutral-400/25 top-12 right-2 rounded-md">
                      {daysOfTheWeek.map((item) => (
                        <>
                          <button
                            onClick={() => handleSetWeekDay(item.day)}
                            style={{
                              backgroundColor:
                                weekDay === item.day && !props.isLoading
                                  ? "rgba(100, 100, 100, 0.3)"
                                  : "",
                            }}
                            key={item.id}
                            className="p-2.5 w-full cursor-pointer text-start rounded-md transition-all hover:bg-neutral-500/15 hover:transition-all"
                          >
                            {item.day}
                          </button>
                        </>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="custom-scroll flex flex-col gap-3 overflow-y-scroll overflow-x-hidden">
                {hourlyArr &&
                  !props.isLoading &&
                  hourlyArr.map((item) => {
                    const icon = getIcon(item.weather_code);

                    return (
                      <HourlyForecastBox
                        key={item.id}
                        hourlyForecastIcon={icon}
                        hourlyForecastTime={item.time}
                        hourlyForecastTemp={item.temperature_2m}
                        convertTemp={convertTemp}
                        unitSystem={unitSystem}
                        units={units}
                      />
                    );
                  })}
                {props.isLoading &&
                  [
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                    18, 19, 20, 21, 22, 23, 24,
                  ].map((item) => (
                    <HourlyForecastBox key={item} isLoading={props.isLoading} />
                  ))}
              </div>
            </div>
          </section>
        )}
        {props.isError && (
          <>
            <div className="flex flex-col items-center gap-4 text-center">
              <img src={errorIcon} alt="error icon" className="w-8 h-8" />
              <h1 className="text-5xl font-bold font-bricolage-grotesque text-center leading-14 max-[480px]:w-80">
                Something went wrong
              </h1>
              <p className="max-w-120">
                We couldn't connect to the server (API error). Please try again
                in a few moments
              </p>
              <button
                onClick={() => props.retryFetch()}
                className="flex items-center gap-2.5 px-3.5 p-2 rounded-md bg-neutral-600/45
            text-neutral-200 cursor-pointer border-2 border-transparent transition-all focus:outline-2
            focus:border-(--background) focus:outline-white hover:transition-all hover:bg-neutral-300/30"
              >
                <img src={retryIcon} alt="retry" />
                Retry
              </button>
            </div>
          </>
        )}
        {!props.weatherData && !props.isLoading && (
          <>
            <h3 className="text-2xl font-bold">No search result found!</h3>
          </>
        )}
      </div>
    </main>
  );
};

export default MainPage;
