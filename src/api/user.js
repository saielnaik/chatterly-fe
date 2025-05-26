import axios from 'axios';

const API = axios.create({
  baseURL: 'https://chatterly-be-7tk3.onrender.com/api/user',
});

export const getUserDetails = () =>
  API.get(`/getUser`, {
    headers: {  Authorization: `Bearer ${localStorage.getItem('token')}`, },
  });

export const updateUserDetails = (data) =>
  API.put(`/updateUser`, data, {
    headers: {  Authorization: `Bearer ${localStorage.getItem('token')}`, },
  });