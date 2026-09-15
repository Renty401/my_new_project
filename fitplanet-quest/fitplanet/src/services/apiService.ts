
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001/api'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

export const apiService = {
  // Get all hiking trails
  getAllTrails: async () => {
    const response = await api.get('/trails');
    return response.data;
  },

  // Get single trail
  getTrailById: async (id: number) => {
    const response = await api.get(`/trails/${id}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get('/trails/statistics');
    return response.data;
  },

  // Get weather for a trail
  getTrailWeather: async (id: number) => {
    const response = await api.get(`/trails/${id}/weather`);
    return response.data;
  }
};