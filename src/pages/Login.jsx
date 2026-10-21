import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import AuthLayout, { Field, Notice, submitBtn } from "../components/AuthLayout";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/";
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      setSuccess("Login successful!");
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);
      window.dispatchEvent(new Event("auth-change"));
      setLoading(false);

      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 1500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Login to your Admito account"
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-[#805827] hover:text-[#6b4620] hover:underline">
            Sign Up
          </Link>
        </>
      }
    >
      <Notice error={error} success={success} />

      <form className="space-y-5" onSubmit={handleSubmit}>
        <Field
          label="Email"
          icon={Mail}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
          required
          disabled={loading || success}
        />
        <Field
          label="Password"
          icon={Lock}
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
          disabled={loading || success}
        />

        <button type="submit" disabled={loading || success} className={submitBtn}>
          {loading ? "Logging in..." : success ? "Redirecting..." : "Login"}
        </button>
      </form>
    </AuthLayout>
  );
}
