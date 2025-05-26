'use client';
import { useState } from 'react';
import axios from 'axios';
import { createPost } from '@/api/post';
import { useRouter } from 'next/navigation';

export default function CreatePost() {
  const router = useRouter();
  const [form, setForm] = useState({
    text: '',
    postType: 'recommend',
    locationName: '',
    coordinates: '',
  });
  const [image, setImage] = useState(null);
  const [message, setMessage] = useState('');
  const [loadingCoords, setLoadingCoords] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const fetchCoordinates = async () => {
    if (!form.locationName.trim()) {
      setMessage('Please enter a location name first');
      return;
    }
    setLoadingCoords(true);
    setMessage('');
    try {
      const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json`, {
        params: {
          q: form.locationName,
          key: '87e40b9381c74fc2b53b3eea0fda48f5',
        },
      });

      const result = response.data.results[0];
      if (result) {
        const coords = [result.geometry.lng, result.geometry.lat];
        setForm((prev) => ({ ...prev, coordinates: JSON.stringify(coords) }));
        setMessage(`Coordinates found: ${coords.join(', ')}`);
      } else {
        setMessage('No coordinates found for that location');
        setForm((prev) => ({ ...prev, coordinates: '' }));
      }
    } catch {
      setMessage('Error fetching coordinates');
      setForm((prev) => ({ ...prev, coordinates: '' }));
    } finally {
      setLoadingCoords(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!form.coordinates) {
      setMessage('Please fetch coordinates first');
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append('text', form.text);
    formData.append('postType', form.postType);
    formData.append('coordinates', form.coordinates);
    if (image) formData.append('image', image);

    try {
      await createPost(formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setMessage('Post created successfully!');
      setForm({ text: '', postType: 'recommend', locationName: '', coordinates: '' });
      setImage(null);
      router.push('/');
    } catch (err) {
      setMessage(err.response?.data?.message || err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-8 p-6 bg-[#0F0F0F] text-white rounded-xl shadow-lg border border-gray-800">
      <h1 className="text-2xl font-bold text-center text-[#CF0F47] mb-6">Create Post</h1>

      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm ${
            message.toLowerCase().includes('error') || message.toLowerCase().includes('failed')
              ? 'bg-red-800 text-red-200'
              : 'bg-[#222] text-[#CF0F47]'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <textarea
            name="text"
            value={form.text}
            onChange={handleChange}
            placeholder="What's on your mind?"
            required
            rows={4}
            maxLength={500}
            className="w-full bg-[#1F1F1F] text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#CF0F47]"
          />
          <p className="text-sm text-gray-500 mt-1">Max 500 characters</p>
        </div>

        <select
          name="postType"
          value={form.postType}
          onChange={handleChange}
          className="w-full bg-[#1F1F1F] text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#CF0F47]"
        >
          <option value="recommend">Recommend</option>
          <option value="help">Help</option>
          <option value="update">Update</option>
          <option value="event">Event</option>
        </select>

        <input
          name="locationName"
          value={form.locationName}
          onChange={handleChange}
          placeholder="Type location"
          className="w-full bg-[#1F1F1F] text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#CF0F47]"
        />

        <button
          type="button"
          onClick={fetchCoordinates}
          disabled={loadingCoords}
          className="w-full bg-transparent border border-gray-600 text-white p-2 rounded-lg hover:bg-[#CF0F47] hover:text-white transition"
        >
          {loadingCoords ? 'Fetching Coordinates...' : 'Get Coordinates'}
        </button>

        {form.coordinates && (
          <p className="text-sm text-gray-400">Coordinates: {form.coordinates}</p>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full bg-[#1F1F1F] text-gray-300 p-2 rounded-lg border border-gray-700 file:bg-[#CF0F47] file:text-white file:border-0 file:rounded-lg file:px-4 file:py-2"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#CF0F47] hover:bg-[#FF0B55] text-white p-3 rounded-lg transition font-semibold"
        >
          {loading ? 'Submitting...' : 'Submit Post'}
        </button>
      </form>
    </div>
  );
}