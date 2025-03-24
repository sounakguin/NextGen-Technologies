"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Phone, X } from "lucide-react";
import createClient from "@/utils/supabase/client"; // Updated import

const supabase = createClient(); // Initialize Supabase client

interface BookCallPopupProps {
  onClose: () => void;
  month_plan: string; // Added prop for the selected plan
  slug: string; // Added prop for the slug
}

export const BookCallPopup: React.FC<BookCallPopupProps> = ({
  onClose,
  month_plan,
  slug,
}) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2025, 2)); // March 2025
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    time: "",
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<td key={`empty-${i}`} className="p-0"></td>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <td key={day} className="text-center p-0">
          <button
            type="button"
            onClick={() => setSelectedDate(day)}
            className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-sm ${
              selectedDate === day
                ? "bg-green-500 text-white"
                : "hover:bg-gray-100"
            }`}
          >
            {day}
          </button>
        </td>
      );
    }

    return days;
  };

  const generateCalendarWeeks = () => {
    const days = generateCalendarDays();
    const weeks = [];
    let week = [];

    for (let i = 0; i < days.length; i++) {
      week.push(days[i]);

      if ((i + 1) % 7 === 0 || i === days.length - 1) {
        while (week.length < 7) {
          week.push(<td key={`empty-end-${week.length}`} className="p-0"></td>);
        }

        weeks.push(
          <tr key={`week-${weeks.length}`} className="h-9">
            {week}
          </tr>
        );
        week = [];
      }
    }

    return weeks;
  };

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!selectedDate) {
      newErrors.date = "Please select a date";
    }

    if (!formData.time) {
      newErrors.time = "Please select a time";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.message) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const formattedDate = selectedDate
        ? `${currentMonth.getFullYear()}-${(currentMonth.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${selectedDate.toString().padStart(2, "0")}`
        : "";

      const { error } = await supabase.from("scheduled_calls").insert([
        {
          date: formattedDate,
          time: formData.time,
          name: formData.name,
          email: formData.email,
          message: formData.message,
          month_plan: month_plan, // Include month_plan
          slug: slug, // Include slug
        },
      ]);

      if (error) {
        console.error("Error inserting data:", error);
      } else {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          onClose();
        }, 2000);
      }
    }
  };

  const monthName = currentMonth.toLocaleString("default", { month: "long" });
  const year = currentMonth.getFullYear();

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 text-black ">
      <div className="bg-white rounded-lg shadow-lg w-11/12 lg:w-full max-w-4xl overflow-hidden h-[700px] overflow-y-auto md:h-auto">
        <div className="flex flex-col md:flex-row">
          <div className="p-6 md:w-1/2 border-r border-gray-100">
            <div className="flex items-start mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <Phone className="text-green-500 w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Schedule a call</h2>
                <p className="text-gray-600">15-minute call</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="md:hidden p-1 rounded-full hover:bg-gray-100 ml-auto"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Please fill all the information to book a call at a convenient
              date and time.
            </p>

            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="font-medium">
                {monthName} {year}
              </div>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-xs font-normal text-gray-500 p-1">Su</th>
                  <th className="text-xs font-normal text-gray-500 p-1">Mo</th>
                  <th className="text-xs font-normal text-gray-500 p-1">Tu</th>
                  <th className="text-xs font-normal text-gray-500 p-1">We</th>
                  <th className="text-xs font-normal text-gray-500 p-1">Th</th>
                  <th className="text-xs font-normal text-gray-500 p-1">Fr</th>
                  <th className="text-xs font-normal text-gray-500 p-1">Sa</th>
                </tr>
              </thead>
              <tbody>{generateCalendarWeeks()}</tbody>
            </table>
          </div>

          <div className="p-6 md:w-1/2 relative">
            <button
              type="button"
              onClick={onClose}
              className="hidden md:block absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  Select a time
                </label>
                <div className="relative">
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg pl-4"
                    placeholder="hh-mm-ss"
                  />
                </div>
                {errors.time && (
                  <p className="text-red-500 text-xs mt-1">{errors.time}</p>
                )}
                {errors.date && (
                  <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Name"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Email"
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Message*
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                  rows={4}
                  placeholder="Message"
                  required
                />
                {errors.message && (
                  <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="bg-[#2FD31D] rounder-2xl px-5 py-3 font-semibold text-black hover:border hover:border-[#2FD31D] hover:text-white hover:bg-transparent"
              >
                Submit
              </button>
            </form>

            {showSuccess && (
              <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-lg">
                Your call is booked. You will receive the meeting details on
                your email.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
