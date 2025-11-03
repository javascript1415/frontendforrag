"use client"
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import "./CreateCompanyForm.css";

export default function CreateCompanyForm() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({ name: "", allowedEmails: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setLoading(true);

    try {
      const emailList = formData.allowedEmails
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email.includes("@"));

      if (emailList.length === 0) {
        throw new Error("Please provide at least one valid email address");
      }

      const response = await fetch("http://localhost:8001/api/v1/company/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name,
          allowedEmails: emailList,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Company creation failed");
      }

      setSuccessMsg("Company created successfully!");
      setTimeout(() => router.push("/"), 1500);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/");
  };

  // Loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect if not authenticated (handled by useAuth hook)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="create-company-container">
      <div className="create-company-card">
        <div className="card-header">
          <h2 className="card-title">Setup Your Company</h2>
          <p className="card-subtitle">Register your company to start managing your team</p>
        </div>

        <form onSubmit={handleSubmit} className="company-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Company Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter your company name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="allowedEmails" className="form-label">
              Authorized Email Domains
            </label>
            <input
              id="allowedEmails"
              type="text"
              name="allowedEmails"
              value={formData.allowedEmails}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="admin@company.com, team@company.com"
            />
            <p className="form-help-text">
              Enter email addresses separated by commas. Only users with these emails can join your company.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}
          {successMsg && <div className="success-message">{successMsg}</div>}

          <div className="button-group">
            <button
              type="submit"
              disabled={loading}
              className="submit-button"
            >
              {loading ? "Creating Company..." : "Create Company"}
            </button>
            <button
              type="button"
              onClick={handleSkip}
              className="skip-button"
              disabled={loading}
            >
              Skip for now
            </button>
          </div>
        </form>

        <div className="form-footer">
          <p className="footer-text">
            You can always set up your company later from your profile settings.
          </p>
        </div>
      </div>
    </div>
  );
}
