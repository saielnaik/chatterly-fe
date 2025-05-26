import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000/api/posts',
});

export const createPost = (formData, config = {}) => API.post('/create', formData, config);

export const replyToPost = (postId, formData, config = {}) =>
  API.post(`/reply/${postId}`, formData, config);

export const reactToPost = (postId, data, config) =>
  API.post(`/react/${postId}`, data, config);

export const fetchReplies = (postId, config = {}) =>
  API.get(`/replies/${postId}`, config);

export const getPost = (params = {}, config = {}) =>
  API.get('/', { params, ...config });