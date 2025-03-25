"use client";
import React, { useState, ChangeEvent } from "react";
import createClient from "@/utils/supabase/client";

interface FormData {
  name: string;
  email: string;
  inquiryType: string;
  phoneNo: string;
  websiteRequirements: string;
  file: File | null;
}

export default function CustomWebTemplate() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    inquiryType: "",
    phoneNo: "",
    websiteRequirements: "",
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  // Handle input changes
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input changes
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type and size
      const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        setError("Only JPEG, PNG, and PDF files are allowed.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB.");
        return;
      }
      setFormData((prev) => ({ ...prev, file }));
      setError(null); // Clear any previous errors
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate required fields
      if (
        !formData.name ||
        !formData.email ||
        !formData.inquiryType ||
        !formData.websiteRequirements
      ) {
        throw new Error("Please fill out all required fields.");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error("Please enter a valid email address.");
      }

      let filePath = null;
      if (formData.file) {
        // Sanitize file name to avoid invalid characters
        const sanitizedFileName = formData.file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        );
        filePath = `Navbar/Services/WebTemplate/Custom/${sanitizedFileName}`;

        // Upload file to Supabase Storage
        const { error: fileError } = await supabase.storage
          .from("Images")
          .upload(filePath, formData.file);

        if (fileError) {
          console.error("File upload error details:", fileError);
          throw new Error("Failed to upload file. Please try again.");
        }
      }

      // Insert data into the custom_website_inquiries table
      const { error: insertError } = await supabase
        .from("custom_website_inquiries")
        .insert([
          {
            name: formData.name,
            email: formData.email,
            inquiry_type: formData.inquiryType,
            phone_no: formData.phoneNo,
            website_requirements: formData.websiteRequirements,
            file_path: filePath,
          },
        ]);

      if (insertError) {
        throw new Error("Failed to submit form. Please try again.");
      }

      // Reset form and show success message
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        inquiryType: "",
        phoneNo: "",
        websiteRequirements: "",
        file: null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-11/12 mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          Get a Fully Customized Website
        </h1>
        <p className="mb-6 text-gray-600">
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry&apos;s standard when an
          unknown printer took a galley of type and scrambled it to make a type
          specimen book.
        </p>
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 text-green-700 rounded-md">
            Form submitted successfully!
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name*
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email*
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Inquiry Type*
            </label>
            <select
              name="inquiryType"
              value={formData.inquiryType}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Select</option>
              <option value="General">General</option>
              <option value="Support">Support</option>
              <option value="Sales">Sales</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone No.
            </label>
            <input
              type="tel"
              name="phoneNo"
              value={formData.phoneNo}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Website Requirements*
            </label>
            <textarea
              name="websiteRequirements"
              value={formData.websiteRequirements}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Attach files (JPEG, PNG, PDF, max 5MB)
            </label>
            <input
              type="file"
              name="file"
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer focus:outline-none"
            />
          </div>
        </div>
        <div className="mt-6 flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
          <button
            type="button"
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Book A Call
          </button>
        </div>
      </form>
    </div>
  );
}
