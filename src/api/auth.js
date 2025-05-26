// src/api/auth.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000/api/auth', // Update to your backend URL
});

export const signup = (formData) => API.post('/signup', formData);
export const login = (formData) => API.post('/login', formData);