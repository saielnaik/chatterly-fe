'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUserDetails, updateUserDetails } from '@/api/user';

const UserProfile = () => {
  const router = useRouter();

  const [user, setUser] = useState({ username: '', email: '', bio: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'danger'

  const fetchUser = async () => {
    try {
      const res = await getUserDetails();
      setUser(res.data);
    } catch (err) {
      console.error('Error fetching user:', err);
      setMessage('Failed to load user');
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');
    try {
      const updatePayload = {
        username: user.username,
        email: user.email,
        bio: user.bio,
      };

      const res = await updateUserDetails(updatePayload);
      setUser(res.data);
      setMessage('Profile updated successfully!');
      setMessageType('success');
    } catch (err) {
      console.error('Error updating user:', err);
      const msg = err.response?.data?.message || 'Failed to update profile';
      setMessage(msg);
      setMessageType('danger');
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="text-[#CF0F47] text-xl animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 flex justify-center">
      <div className="w-full max-w-xl bg-[#1a1a1a] rounded-2xl p-6 shadow-lg relative">
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 text-sm text-[#FF0B55] hover:underline"
        >
          ← Back
        </button>

        <button
          onClick={() => {
            localStorage.removeItem('token');
            router.push('/login');
          }}
          className="absolute top-4 right-4 text-sm text-gray-400 hover:text-[#FF0B55] transition"
        >
          Logout
        </button>

        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-[#FFDEDE] text-[#FF0B55] flex items-center justify-center text-3xl font-bold mb-3">
            {user.username
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase()}
          </div>
          <h2 className="text-2xl font-semibold text-white mb-1">
            {user.username}
          </h2>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>

        {message && (
          <div
            className={`mb-4 px-4 py-2 rounded-lg text-sm ${messageType === 'success'
                ? 'bg-[#FFDEDE] text-[#FF0B55]'
                : 'bg-red-500 text-white'
              }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={user.username}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-black border border-[#CF0F47] focus:outline-none focus:ring-2 focus:ring-[#CF0F47]"
              required
              minLength={3}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={user.email}
              onChange={handleChange}
              className="w-full p-2 rounded-md bg-black border border-[#CF0F47] focus:outline-none focus:ring-2 focus:ring-[#CF0F47]"
              required
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={user.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell us something about yourself..."
              className="w-full p-2 rounded-md bg-black border border-[#CF0F47] focus:outline-none focus:ring-2 focus:ring-[#CF0F47]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-md bg-[#CF0F47] hover:bg-[#FF0B55] transition text-white font-semibold"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;