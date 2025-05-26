'use client';
import React, { useState, useEffect } from 'react';
import { login } from '../../api/auth';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const router = useRouter();

   useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
        router.push('/');
      }
    }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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
    <div
      className="d-flex align-items-center justify-content-center min-vh-100 bg-gradient"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1rem',
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{
          maxWidth: '400px',
          width: '100%',
          borderRadius: '1rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        }}
      >
        <h2 className="text-center mb-4 fw-bold" style={{ color: '#4a4a4a' }}>
          Sign In to Your Account
        </h2>
        {error && (
          <div
            className="alert alert-danger text-center py-2"
            style={{ borderRadius: '0.5rem', fontWeight: '500' }}
          >
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label fw-semibold">
              Email address
            </label>
            <input
              name="email"
              type="email"
              id="email"
              className="form-control form-control-lg"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              style={{ borderRadius: '0.5rem' }}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="form-label fw-semibold">
              Password
            </label>
            <input
              name="password"
              type="password"
              id="password"
              className="form-control form-control-lg"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
              style={{ borderRadius: '0.5rem' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary w-100 btn-lg fw-bold"
            style={{ borderRadius: '0.75rem' }}
          >
            Log In
          </button>
        </form>
        <p className="mt-4 text-center text-muted small">
          Don’t have an account?{' '}
          <a href="/signup" className="fw-semibold" style={{ color: '#764ba2' }}>
            Register
          </a>
        </p>
      </div>
    </div>
  );
}