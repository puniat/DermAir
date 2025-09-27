"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchWeatherData, fetchWeatherByCity, getCurrentLocation, reverseGeocode } from "@/lib/api/weather";
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

  // Generic refetch function
  const refetch = useCallback(async () => {
    if (profile?.location) {
      if (profile.location.latitude && profile.location.longitude) {
        await fetchByLocation(profile.location.latitude, profile.location.longitude);
      } else if (profile.location.city) {
        await fetchByCity(profile.location.city);
      }
    } else {
      await fetchByCurrentLocation();
    }
  }, [profile, fetchByLocation, fetchByCity, fetchByCurrentLocation]);

  // Auto-fetch weather data when profile changes
  useEffect(() => {
    if (profile?.location && !state.data && !state.loading) {
      refetch();
    }
  }, [profile, state.data, state.loading, refetch]);

  return {
    ...state,
    refetch,
    fetchByLocation,
    fetchByCity,
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
    // Only set up interval if we have data
    if (weather.data) {
      // Refresh every 30 minutes
      const interval = setInterval(() => {
        weather.refetch();
      }, 30 * 60 * 1000);

      return () => clearInterval(interval);
    }
    
    // Always return a cleanup function, even if it's empty
    return () => {};
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