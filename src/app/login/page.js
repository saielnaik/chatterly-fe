'use client';
import React, { useState, useEffect } from 'react';
import { login } from '../../api/auth';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) router.push('/');
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form);
      localStorage.setItem('token', res.data.token);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F0F0F] px-4">
      <div className="w-full max-w-md bg-[#1A1A1A] p-8 rounded-xl shadow-xl border border-gray-800 text-white">
        <h2 className="text-2xl font-bold text-center text-[#CF0F47] mb-6">Sign In to Your Account</h2>

        {error && (
          <div className="bg-red-800 text-red-200 p-3 mb-4 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-semibold">
              Email
            </label>
            <input
              name="email"
              type="email"
              id="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="w-full bg-[#1F1F1F] text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#CF0F47]"
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-semibold">
              Password
            </label>
            <input
              name="password"
              type="password"
              id="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full bg-[#1F1F1F] text-white p-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#CF0F47]"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#CF0F47] hover:bg-[#FF0B55] text-white p-3 rounded-lg font-semibold transition"
          >
            Log In
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-400">
          Don’t have an account?{' '}
          <a href="/signup" className="text-[#CF0F47] font-medium hover:underline">
            Register
          </a>
        </p>
      </div>
    </div>
  );
}