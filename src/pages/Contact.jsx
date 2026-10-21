import { API_URL } from "../utils/config";
import { useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [status, setStatus] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${API_URL}/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus("Message sent successfully!");
        setFormData({
          name: "",
          email: "",
          message: ""
        });
      } else {
        setStatus(data.message || "Failed to send message.");
      }
    } catch (error) {
      setStatus("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="min-h-screen bg-stone-200 py-10 px-4 sm:py-16">
      <div className="max-w-screen-xl mx-auto">

        <div className="text-center mb-12">
          <h1 className="text-3xl font-semibold text-slate-800 sm:text-4xl md:text-5xl">
            Contact Us
          </h1>

          <p className="mt-4 text-slate-500 text-lg">
            How to reach out to us
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">

          {/* Contact Information */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-800 mb-4">
              Get in Touch
            </h2>

            <p className="text-slate-500 mb-8">
              Have a question about your admission? Reach out to us and
              we’ll be happy to help.
            </p>

            <div className="space-y-6">

              {/* Email */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[#805827]/10">
                  <Mail className="w-5 h-5 text-[#805827]" />
                </div>

                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium text-slate-800">
                    admito@gmail.com
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[#805827]/10">
                  <Phone className="w-5 h-5 text-[#805827]" />
                </div>

                <div>
                  <p className="text-sm text-slate-500">Phone</p>
                  <p className="font-medium text-slate-800">
                    +880 1712-345678
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-11 h-11 rounded-full bg-[#805827]/10">
                  <MapPin className="w-5 h-5 text-[#805827]" />
                </div>

                <div>
                  <p className="text-sm text-slate-500">Location</p>
                  <p className="font-medium text-slate-800">
                    Dhaka, Bangladesh
                  </p>
                </div>
              </div>

            </div>

            {/* Social Media */}
            <div className="mt-10">
              <p className="text-sm font-medium text-slate-700 mb-4">
                Follow us
              </p>

              <div className="flex gap-3">

                {/* Facebook */}
                <a
                  href="https://www.facebook.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#805827]/10 text-[#805827] hover:bg-[#805827] hover:text-white transition"
                >
                  <i className="fa-brands fa-facebook-f"></i>
                </a>

                {/* Instagram */}
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#805827]/10 text-[#805827] hover:bg-[#805827] hover:text-white transition"
                >
                  <i className="fa-brands fa-instagram"></i>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://www.linkedin.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#805827]/10 text-[#805827] hover:bg-[#805827] hover:text-white transition"
                >
                  <i className="fa-brands fa-linkedin-in"></i>
                </a>

                {/* X / Twitter */}
                <a
                  href="https://twitter.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#805827]/10 text-[#805827] hover:bg-[#805827] hover:text-white transition"
                >
                  <i className="fa-brands fa-x-twitter"></i>
                </a>

              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-800 outline-none focus:border-[#805827] focus:ring-1 focus:ring-[#805827]"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-800 outline-none focus:border-[#805827] focus:ring-1 focus:ring-[#805827]"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block mb-2 text-sm font-medium text-slate-700">
                  Message
                </label>

                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Write your message..."
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-800 outline-none resize-none focus:border-[#805827] focus:ring-1 focus:ring-[#805827]"
                ></textarea>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full rounded-lg bg-[#805827] px-5 py-3 font-medium text-white transition hover:bg-[#6b481f]"
              >
                Send Message
              </button>

              {status && (
                <p className="text-center text-sm text-slate-600">
                  {status}
                </p>
              )}

            </form>
          </div>

        </div>
      </div>
    </section>
  );
}