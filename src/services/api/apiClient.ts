import axios from 'axios';

// Note: In a real app, this would be loaded from settingsStore at runtime
// For the service initialization, we use the env default
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.1.100';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Update base URL dynamically
export const updateApiClientBaseUrl = (url: string) => {
  apiClient.defaults.baseURL = url;
};
