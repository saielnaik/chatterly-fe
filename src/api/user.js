import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000/api/user',
});

// No uuid param needed anymore, backend uses token to identify user
export const getUserDetails = () =>
  API.get(`/getUser`, {
    headers: {  Authorization: `Bearer ${localStorage.getItem('token')}`, },
  });

export const updateUserDetails = (data) =>
  API.put(`/updateUser`, data, {
    headers: {  Authorization: `Bearer ${localStorage.getItem('token')}`, },
  });