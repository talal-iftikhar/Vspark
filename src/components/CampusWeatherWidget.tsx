'use client';

import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Wind, RefreshCw, MapPin, AlertCircle } from 'lucide-react';
import { fetchCampusWeather, CITY_COORDINATES } from '@/lib/weather';
import { CampusWeather } from '@/types';

export const CampusWeatherWidget: React.FC = () => {
  const [selectedCity, setSelectedCity] = useState<string>('Karachi');
  const [weather, setWeather] = useState<CampusWeather | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = async (city: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCampusWeather(city);
      setWeather(data);
    } catch (err) {
      console.error(err);
      setError('Unable to fetch live meteorological data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(selectedCity);
  }, [selectedCity]);

  const getWeatherIcon = (condition: string = '') => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('drizzle')) return <CloudRain className="w-5 h-5 text-sky-500" />;
    if (c.includes('cloud') || c.includes('overcast')) return <Cloud className="w-5 h-5 text-slate-500" />;
    return <Sun className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="rounded-xl border border-indigo-100 bg-gradient-to-r from-indigo-50/70 via-sky-50/50 to-white dark:border-indigo-950 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-900 p-4 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        {/* Left Side: Badge & City Select */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-600/30">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Live Campus Weather
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Live API
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Synchronized with educational zone meteorological sensors
            </p>
          </div>
        </div>

        {/* Right Side: City Picker + Weather Display */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="text-xs font-medium bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {Object.keys(CITY_COORDINATES).map((city) => (
              <option key={city} value={city}>
                {city} Campus
              </option>
            ))}
          </select>

          {loading ? (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>Updating...</span>
            </div>
          ) : error ? (
            <div className="flex items-center gap-1.5 text-xs text-rose-500">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>API Offline</span>
              <button
                onClick={() => loadWeather(selectedCity)}
                className="underline hover:text-rose-700 ml-1"
              >
                Retry
              </button>
            </div>
          ) : weather ? (
            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
              {getWeatherIcon(weather.condition)}
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {weather.temperature}°C
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {weather.condition}
                </span>
              </div>
              <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 pl-2 border-l border-slate-200 dark:border-slate-700">
                <Wind className="w-3 h-3 text-slate-400" />
                <span>{weather.windSpeed} km/h</span>
              </div>
              <button
                onClick={() => loadWeather(selectedCity)}
                title="Refresh Weather API"
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
