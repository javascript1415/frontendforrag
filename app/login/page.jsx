"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./LoginPage.css";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ identifier: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const routeByRole = (user) => {
    const { role, companyId } = user;

    if (role === "ADMIN" && !companyId) {
      router.push("/create-company");
      return;
    }

    if (role === "ADMIN" && companyId) {
      router.push("/");
      return;
    }

    if (role === "COMPANYMEMBER") {
      router.push("/");
      return;
    }

    if (role === "SUPERADMIN") {
      router.push("/superadmin/dashboard");
      return;
    }

    if (role === "NORMALUSER") {
      router.push("/");
      return;
    }

    router.push("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { identifier, password } = formData;
      const loginPayload = identifier.includes("@")
        ? { email: identifier, password }
        : { username: identifier, password };

      const res = await fetch("http://localhost:8001/api/v1/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(loginPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      const user = data.data?.user;

      if (!user) {
        throw new Error("User info missing from login response");
      }

      console.log("Logged in user:", user);
      routeByRole(user);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:8001/api/v1/users/google";
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-subtitle">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="identifier" className="form-label">
              Email or Username
            </label>
            <input
              id="identifier"
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your email or username"
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
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="submit-button"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="divider">
          <hr className="divider-line" />
          <span className="divider-text">or</span>
          <hr className="divider-line" />
        </div>

        <button onClick={handleGoogleLogin} className="google-button" type="button">
          <svg className="google-icon" viewBox="0 0 24 24">
            {/* Google icon SVG - Add your SVG here or use image */}
          </svg>
          Sign in with Google
        </button>

        <div className="login-footer">
          <p className="footer-text">
            Don't have an account?{" "}
            <Link href="/register" className="footer-link">
              Sign up
            </Link>
          </p>
          <Link href="/forgot-password" className="forgot-password-link">
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
}
