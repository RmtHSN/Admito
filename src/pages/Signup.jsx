import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Phone, Mail, Lock } from "lucide-react";
import AuthLayout, { Field, Notice, submitBtn } from "../components/AuthLayout";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const { confirmPassword: _confirm, ...payload } = formData;
      const res = await fetch(`${import.meta.env.VITE_API_URL}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Signup failed");
      }

      setSuccess("Account created! Redirecting...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // visual hint only: how many of 4 basic checks the password passes
  const pw = formData.password;
  const strength = pw
    ? [pw.length >= 8, /[A-Z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length
    : 0;
  const strengthColor = ["bg-slate-200", "bg-red-400", "bg-amber-400", "bg-lime-500", "bg-emerald-500"][strength];
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];

  const mismatch = formData.confirmPassword !== "" && formData.password !== formData.confirmPassword;
  const matches = formData.confirmPassword !== "" && formData.password === formData.confirmPassword;

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Sign up for your Admito account"
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-[#805827] hover:text-[#6b4620] hover:underline">
            Login
          </Link>
        </>
      }
    >
      <Notice error={error} success={success} />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Field label="Full name" icon={User} name="name" value={formData.name} onChange={handleChange} placeholder="Enter your name" autoComplete="name" required disabled={loading} />
        <Field label="Phone" icon={Phone} type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="Enter your phone number" autoComplete="tel" required disabled={loading} />
        <Field label="Email" icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" required disabled={loading} />
        <div>
          <Field label="Password" icon={Lock} type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Create a password" autoComplete="new-password" required disabled={loading} />
          {pw && (
            <div className="mt-2 flex items-center gap-2" aria-live="polite">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <span key={n} className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${n <= strength ? strengthColor : "bg-slate-200"}`} />
                ))}
              </div>
              <span className="w-12 text-right text-xs font-medium text-slate-500">{strengthLabel}</span>
            </div>
          )}
        </div>

        <div>
          <Field label="Confirm password" icon={Lock} type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Re-enter your password" autoComplete="new-password" required disabled={loading} />
          {mismatch && <p className="mt-1.5 text-xs font-medium text-red-600">Passwords do not match</p>}
          {matches && <p className="mt-1.5 text-xs font-medium text-emerald-600">Passwords match</p>}
        </div>

        <button type="submit" disabled={loading || mismatch} className={`${submitBtn} mt-2`}>
          {loading ? "Creating account..." : "Sign Up"}
        </button>
      </form>
    </AuthLayout>
  );
}
