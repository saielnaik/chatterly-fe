// src/api/auth.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://chatterly-be-7tk3.onrender.com/api/auth', 
});

export const signup = (formData) => API.post('/signup', formData);
export const login = (formData) => API.post('/login', formData);