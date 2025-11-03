"use client";

import React, { useState } from "react";
import "./Register.css";

const roles = [
  { value: "NORMALUSER", label: "Normal User" },
  { value: "COMPANYMEMBER", label: "Company Member" },
  { value: "ADMIN", label: "Admin" },
];

const Register = () => {
  const [form, setForm] = useState({
    email: "",
    username: "",
    password: "",
    role: "NORMALUSER",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      console.log("Submitting register form:", form);

      const res = await fetch("http://localhost:8001/api/v1/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      console.log("Backend response:", data);

      if (!res.ok) {
        setError(data?.message || "Failed to register");
      } else {
        setMessage(
          data?.message || "Registered successfully! Please verify your email."
        );
        setForm({ email: "", username: "", password: "", role: "NORMALUSER" });
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = "http://localhost:8001/api/v1/users/google";
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create Account</h2>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className="form-input"
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username
            </label>
            <input
              id="username"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
              autoComplete="username"
              className="form-input"
              placeholder="Choose a username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              className="form-input"
              placeholder="Create a password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">
              Account Type
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="form-select"
            >
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`submit-button ${loading ? "loading" : ""}`}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="divider">
          <hr className="divider-line" />
          <span className="divider-text">or</span>
          <hr className="divider-line" />
        </div>

        <button
          onClick={handleGoogleSignup}
          className="google-button"
          type="button"
        >
          <img src="/g-logo.png" alt="Google" className="google-icon" />
          Sign up with Google
        </button>

        {message && <div className="message success-message">{message}</div>}

        {error && <div className="message error-message">{error}</div>}
      </div>
    </div>
  );
};

export default Register;
