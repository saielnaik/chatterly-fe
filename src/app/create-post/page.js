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
      const response = await axios.get(
        `https://api.opencagedata.com/geocode/v1/json`,
        {
          params: {
            q: form.locationName,
            key: '87e40b9381c74fc2b53b3eea0fda48f5',
          },
        }
      );

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
    <div className="container my-5" style={{ maxWidth: '600px' }}>
      <div className="card shadow-sm p-4">
        <h1 className="h4 mb-4 text-center">Create Post</h1>

        {message && (
          <div
            className={`alert ${
              message.toLowerCase().includes('error') || message.toLowerCase().includes('failed')
                ? 'alert-danger'
                : 'alert-info'
            }`}
            role="alert"
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <textarea
              name="text"
              value={form.text}
              onChange={handleChange}
              placeholder="What's on your mind?"
              required
              className="form-control"
              rows={4}
              maxLength={500}
              style={{ resize: 'vertical' }}
            />
            <small className="form-text text-muted">Max 500 characters</small>
          </div>

          <div className="mb-3">
            <select
              name="postType"
              value={form.postType}
              onChange={handleChange}
              className="form-select"
              aria-label="Select post type"
            >
              <option value="recommend">Recommend</option>
              <option value="help">Help</option>
              <option value="update">Update</option>
              <option value="event">Event</option>
            </select>
          </div>

          <div className="mb-3">
            <input
              name="locationName"
              value={form.locationName}
              onChange={handleChange}
              placeholder="Type location"
              className="form-control"
              autoComplete="off"
              aria-label="Location name"
            />
          </div>

          <div className="mb-3 d-grid">
            <button
              type="button"
              onClick={fetchCoordinates}
              disabled={loadingCoords}
              className="btn btn-outline-secondary"
            >
              {loadingCoords ? 'Fetching Coordinates...' : 'Get Coordinates'}
            </button>
          </div>

          {form.coordinates && (
            <div className="form-text mb-3 text-break text-secondary">
              Coordinates: {form.coordinates}
            </div>
          )}

          <div className="mb-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="form-control"
              aria-label="Upload image"
            />
          </div>

          <div className="d-grid">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
            >
              {loading ? 'Submitting...' : 'Submit Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}