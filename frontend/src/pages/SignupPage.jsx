import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
// import Header from '../components/Header';
import FooterSection from '../components/FooterSection';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const result = await signup(formData);

      if (result.success) {
        // Successfully signed up and logged in (handled by context)
        navigate('/');
      } else {
        setIsError(true);
        setMessage(result.message || "Signup failed.");
      }
    } catch (error) {
      console.error("Signup error:", error);
      setIsError(true);
      setMessage("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex justify-center items-center bg-cream text-dark-brown p-6 relative">
        <div className="bg-white shadow-xl rounded-xl p-10 max-w-md w-full">

          <h2 className="text-3xl font-serif mb-6 text-center">Create Account</h2>

          {message && (
            <div className={`p-3 rounded mb-4 text-sm border ${isError ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
              {message}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>

            <input
              name="name"
              placeholder="Full Name"
              className="w-full p-3 border-b border-dark-brown bg-transparent focus:outline-none focus:border-khaki transition-colors"
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-3 border-b border-dark-brown bg-transparent focus:outline-none focus:border-khaki transition-colors"
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="phone"
              placeholder="Phone Number"
              className="w-full p-3 border-b border-dark-brown bg-transparent focus:outline-none focus:border-khaki transition-colors"
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password (min 8 characters)"
              className="w-full p-3 border-b border-dark-brown bg-transparent focus:outline-none focus:border-khaki transition-colors"
              onChange={handleChange}
              required
            />

            <button
              className="w-full mt-4 py-3 bg-dark-brown text-cream rounded-md hover:bg-khaki transition disabled:opacity-70 disabled:cursor-not-allowed font-medium"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="text-center mt-4 text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="text-dark-brown underline hover:text-khaki transition">Login</a>
          </p>

        </div>
      </div>

      <FooterSection />
    </>
  );
}
