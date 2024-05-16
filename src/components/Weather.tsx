import React from 'react';
import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import '../assests/weather.css';
import { applicationConst } from '../utils/constant';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface allchartData {
  forecast: {
    forecastday: {
      date: string;
      date_epoch: number;
      day: {
        avgtemp_c: number;
      };
    }[];
  };
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    tz_id: string;
  };
  country: string;
  lat: number;
  localtime: string;
  localtime_epoch: number;
  lon: number;
  name: string;
  region: string;
  tz_id: string;
}

interface particularData{
  date: string;
  day: {
    avgtemp_c: number;
  };
}

const Weather = () => {
  const [inputCity, setInputCity] = useState<string>();
  const [isInputEmpty, setIsInputEmpty] = useState<boolean>(false);
  const [data, setData] = useState<allchartData | null>(null); 
  const [isDataLoading, setIsDataLoading] = useState<boolean>(false);
  const [error, setError] = useState<AxiosError | null>(null);

  const getWeatherDetails = async () => {
    const apiURL = `${process.env.REACT_APP_BASE_URL}?key=${process.env.REACT_APP_API_KEY}&q=${inputCity}&days=7`;
    try {
      setIsDataLoading(true);
      const res = await axios.get(apiURL);
      if (res.data) {
        setData(res.data);
        setIsDataLoading(false);
        setError(null);
      }
    } catch (err) {
      setError(err as AxiosError);
      setIsDataLoading(false);
      setData(null);
    }
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputCity(e.target.value);
  };

  const handleSearch = () => {
    if (inputCity) {
      setData(null);
      getWeatherDetails();
      setInputCity('');
    } else {
      setIsInputEmpty(true);
    }
  };

  const onInputFocusHandler = () => {
    setIsInputEmpty(false);
    setError(null);
  };

  // Chart Functionality
  const extractChartData = () => {
    if (data && Object.keys(data).length) {
      return data?.forecast.forecastday.map((apiData: particularData) => {
        return {
          date: apiData.date,
          temp: apiData.day.avgtemp_c
        };
      });
    }
    return [];
  };

  return (
    <div className="mt-5 mb-5">
      <center>
        <div className="container">
          <h2 className="heading">{applicationConst.project_name}</h2>
          <div className="d-grid gap-3 col-4 mt-4">
            <input
              type="text"
              placeholder="Enter Your city name"
              className="form-control"
              value={inputCity}
              onFocus={onInputFocusHandler}
              onChange={handleChangeInput}
            />
            {isInputEmpty && <div className="color-red">{applicationConst.error}</div>}
            <button className="btn btn-primary mb-1" type="button" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>

        {!isDataLoading ? (
          <div>
            {data && Object.keys(data).length > 0 && (
              <>
                <h2 className="mt-2 mb-3">
                  {applicationConst.city_name}:{data.location.name}
                </h2>
                <BarChart width={900} height={400} data={extractChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis dataKey="temp" />
                  <Tooltip cursor={false} />
                  <Legend />
                  <Bar dataKey="temp" fill="#8884d8" />
                </BarChart>
              </>
            )}
          </div>
        ) : (
          <div className="spinner-border" role="status">
            <span className="visually-hidden">{applicationConst.loader}</span>
          </div>
        )}
        {error && <h2 className="color-red">{applicationConst.api_error}</h2>}
      </center>
    </div>
  );
};

export default Weather;
