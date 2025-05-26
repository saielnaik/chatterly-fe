"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserDetails, updateUserDetails } from "@/api/user";

const UserProfile = () => {
  const router = useRouter();

  const [user, setUser] = useState({ username: "", email: "", bio: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'danger'

  const fetchUser = async () => {
    try {
      const res = await getUserDetails();
      setUser(res.data);
    } catch (err) {
      console.error("Error fetching user:", err);
      setMessage("Failed to load user");
      setMessageType("danger");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    try {
      const updatePayload = {
        username: user.username,
        email: user.email,
        bio: user.bio,
      };

      const res = await updateUserDetails(updatePayload);
      setUser(res.data);
      setMessage("Profile updated successfully!");
      setMessageType("success");
    } catch (err) {
      console.error("Error updating user:", err);
      const msg = err.response?.data?.message || "Failed to update profile";
      setMessage(msg);
      setMessageType("danger");
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center mt-5">
        <div className="spinner-border" role="status" aria-label="Loading">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  return (
    <div className="container mt-4" style={{ maxWidth: "600px" }}>
      <button
        type="button"
        className="btn btn-secondary mb-4"
        onClick={() => router.back()}
      >
        &larr; Back
      </button>

      <h2 className="mb-4 text-center">User Profile</h2>

      {message && (
        <div
          className={`alert alert-${messageType} alert-dismissible fade show`}
          role="alert"
        >
          {message}
          <button
            type="button"
            className="btn-close"
            aria-label="Close"
            onClick={() => setMessage("")}
          ></button>
        </div>
      )}

      <form onSubmit={handleUpdate} noValidate>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">
            Username:
          </label>
          <input
            id="username"
            type="text"
            name="username"
            className="form-control"
            value={user.username}
            onChange={handleChange}
            required
            minLength={3}
            autoComplete="username"
            aria-describedby="usernameHelp"
          />
          <div id="usernameHelp" className="form-text">
            Minimum 3 characters
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email:
          </label>
          <input
            id="email"
            type="email"
            name="email"
            className="form-control"
            value={user.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="bio" className="form-label">
            Bio:
          </label>
          <textarea
            id="bio"
            name="bio"
            className="form-control"
            value={user.bio}
            onChange={handleChange}
            rows={4}
            placeholder="Tell us something about yourself..."
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default UserProfile;