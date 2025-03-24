"use client";

import React, { useState } from "react";
import Image from "next/image";
import createClient from "@/utils/supabase/client";

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    message?: string;
  }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const newErrors: { name?: string; email?: string; message?: string } = {};

    if (!/^[A-Za-z\s]+$/.test(formData.name)) {
      newErrors.name = "Name should only contain letters and spaces.";
      isValid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
      isValid = false;
    }
    if (formData.message.length < 10) {
      newErrors.message = "Message should be at least 10 characters long.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const supabase = createClient();
      const { error } = await supabase.from("contact_us").insert([formData]);
      if (error) throw error;

      setIsSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between relative xl:mb-64 mt-16 p-4">
      <div className="w-full md:w-1/2 space-y-4 px-4 md:px-16">
        <h1 className="text-3xl font-bold">Contact Us</h1>
        <p className="text-gray-600">Connect with Us:</p>
        <h2 className="text-2xl font-semibold">
          Let&apos;s Discuss Your Needs
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {isSubmitted && (
            <div className="text-green-600 text-sm">
              Form successfully submitted! We will contact you soon.
            </div>
          )}

          {Object.entries(formData).map(([key, value]) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {key}
              </label>
              {key === "message" ? (
                <textarea
                  name={key}
                  value={value}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                  rows={4}
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <input
                  type={key === "email" ? "email" : "text"}
                  name={key}
                  value={value}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                  className="mt-1 p-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
                />
              )}
              {errors[key as keyof typeof errors] && (
                <p className="text-red-500 text-sm">
                  {errors[key as keyof typeof errors]}
                </p>
              )}
            </div>
          ))}

          <button
            type="submit"
            className="bg-green-500 rounded-lg px-5 py-3 font-semibold text-white hover:border hover:border-green-500 hover:text-green-500 hover:bg-transparent transition"
          >
            Send Message
          </button>
        </form>
        {isSubmitted && (
          <div className="text-green-600 mt-4">
            Form data successfully submitted! We will contact you in 2-3
            business days.
          </div>
        )}
      </div>

      <div className="w-full md:w-1/2 flex justify-end relative overflow-hidden">
        <div className="w-1/2 h-full">
          <Image
            src="/Others/circle.png"
            alt="Decorative Image"
            width={200}
            height={200}
            className="rounded-lg object-cover h-full w-full transform translate-x-32"
          />
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
