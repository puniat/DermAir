"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWeatherData, fetchWeatherByCity, fetchWeatherByZipcode, getCurrentLocation, reverseGeocode } from "@/lib/api/weather";
import type { WeatherData, UserProfile } from "@/types";

export interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export interface UseWeatherResult extends WeatherState {
  refetch: () => Promise<void>;
  fetchByLocation: (lat: number, lon: number) => Promise<void>;
  fetchByCity: (city: string) => Promise<void>;
  fetchByZipcode: (zipcode: string, countryCode?: string) => Promise<void>;
  fetchByCurrentLocation: () => Promise<void>;
}

/**
 * Custom hook for managing weather data
 * Supports fetching by coordinates, city name, or current location
 */
export function useWeather(profile?: UserProfile | null): UseWeatherResult {
  const [state, setState] = useState<WeatherState>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  // Helper function to update state
  const updateState = useCallback((updates: Partial<WeatherState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Fetch weather by coordinates
  const fetchByLocation = useCallback(async (latitude: number, longitude: number) => {
    updateState({ loading: true, error: null });
    
    try {
      const weatherData = await fetchWeatherData(latitude, longitude);
      updateState({
        data: weatherData,
        loading: false,
        lastUpdated: new Date(),
      });
    } catch (error) {
      updateState({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch weather data",
      });
    }
  }, [updateState]);

  // Fetch weather by city name
  const fetchByCity = useCallback(async (city: string) => {
    updateState({ loading: true, error: null });
    
    try {
      const weatherData = await fetchWeatherByCity(city);
      updateState({
        data: weatherData,
        loading: false,
        lastUpdated: new Date(),
      });
    } catch (error) {
      updateState({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch weather data",
      });
    }
  }, [updateState]);

  // Fetch weather using browser geolocation
  const fetchByCurrentLocation = useCallback(async () => {
    updateState({ loading: true, error: null });
    
    try {
      const location = await getCurrentLocation();
      await fetchByLocation(location.latitude, location.longitude);
    } catch (error) {
      updateState({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to get current location",
      });
    }
  }, [fetchByLocation, updateState]);

  // Fetch weather by zipcode
  const fetchByZipcode = useCallback(async (zipcode: string, countryCode: string = 'US') => {
    updateState({ loading: true, error: null });
    
    try {
      const weatherData = await fetchWeatherByZipcode(zipcode, countryCode);
      updateState({
        data: weatherData,
        loading: false,
        lastUpdated: new Date(),
      });
    } catch (error) {
      updateState({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch weather by zipcode",
      });
    }
  }, [updateState]);

  // Generic refetch function - FIXED to prevent circular dependencies
  const refetch = useCallback(async () => {
    if (profile?.location) {
      // Prioritize zipcode for better accuracy
      if (profile.location.zipcode) {
        await fetchByZipcode(profile.location.zipcode, profile.location.country || 'US');
      } else if (profile.location.latitude && profile.location.longitude) {
        await fetchByLocation(profile.location.latitude, profile.location.longitude);
      } else if (profile.location.city) {
        // Check if city might be a zipcode
        if (/^\d{5}(-\d{4})?$/.test(profile.location.city)) {
          console.warn(`Detected zipcode format in city field: ${profile.location.city}`);
          await fetchByZipcode(profile.location.city, profile.location.country || 'US');
        } else {
          await fetchByCity(profile.location.city);
        }
      }
    } else {
      await fetchByCurrentLocation();
    }
  }, [profile?.location?.zipcode, profile?.location?.city, profile?.location?.latitude, profile?.location?.longitude]); // Only depend on actual location data

  // Auto-fetch weather data when profile changes - FIXED dependency array
  useEffect(() => {
    if (profile?.location && !state.data && !state.loading) {
      // Call refetch directly without including it in dependencies
      if (profile.location.zipcode) {
        fetchByZipcode(profile.location.zipcode, profile.location.country || 'US');
      } else if (profile.location.latitude && profile.location.longitude) {
        fetchByLocation(profile.location.latitude, profile.location.longitude);
      } else if (profile.location.city) {
        // Check if city might be a zipcode
        if (/^\d{5}(-\d{4})?$/.test(profile.location.city)) {
          fetchByZipcode(profile.location.city, profile.location.country || 'US');
        } else {
          fetchByCity(profile.location.city);
        }
      } else {
        fetchByCurrentLocation();
      }
    }
  }, [profile?.location?.zipcode, profile?.location?.city, profile?.location?.latitude, profile?.location?.longitude, state.data, state.loading]); // Stable dependencies

  return {
    ...state,
    refetch,
    fetchByLocation,
    fetchByCity,
    fetchByZipcode,
    fetchByCurrentLocation,
  };
}

/**
 * Hook for weather data with automatic refresh
 * Refreshes data every 30 minutes
 */
export function useWeatherWithRefresh(profile?: UserProfile | null) {
  const weather = useWeather(profile);
  
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (weather.data) {
      // Refresh every 30 minutes
      interval = setInterval(() => {
        weather.refetch();
      }, 30 * 60 * 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [weather.data, weather.refetch]);

  return weather;
}

/**
 * Hook to get weather data for a specific location
 * Useful for one-time fetches without state management
 */
export function useWeatherLocation(latitude?: number, longitude?: number) {
  const [state, setState] = useState<WeatherState>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      const fetchData = async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        try {
          const weatherData = await fetchWeatherData(latitude, longitude);
          setState({
            data: weatherData,
            loading: false,
            error: null,
            lastUpdated: new Date(),
          });
        } catch (error) {
          setState(prev => ({
            ...prev,
            loading: false,
            error: error instanceof Error ? error.message : "Failed to fetch weather data",
          }));
        }
      };

      fetchData();
    }
  }, [latitude, longitude]);

  return state;
}