"use client";
import type React from "react";
import { useCallback, useState } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "basegame" | "green";
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({
  variant = "primary",
  children,
  className = "",
  onClick,
  ...props
}: ButtonProps) {
  const [isDebouncing, setIsDebouncing] = useState(false);

  const baseStyle =
    "px-4 py-2 rounded-lg transition duration-300 flex items-center justify-center";
  const variantStyles = {
    primary: "bg-sky-500 text-white hover:bg-sky-600",
    secondary: "bg-orange-500 text-white hover:bg-orange-600",
    danger: "bg-red-500 text-white hover:bg-red-600",
    basegame:
      "border border-gray-700 hover:bg-gray-500 hover:text-white text-black",
    green:
      "bg-[#2FD31D] text-black hover:border hover:border-[#2FD31D] hover:text-white hover:bg-transparent", // Added new green variant
  };

  const combinedClassName = `${baseStyle} ${
    variantStyles[variant]
  } ${className} ${isDebouncing ? "opacity-50 cursor-not-allowed" : ""}`;

  const handleClick = useCallback(() => {
    if (!isDebouncing && onClick) {
      setIsDebouncing(true);
      onClick();
      setTimeout(() => setIsDebouncing(false), 4000);
    }
  }, [isDebouncing, onClick]);

  return (
    <button
      className={combinedClassName}
      onClick={handleClick}
      disabled={isDebouncing}
      {...props}
    >
      {children}
    </button>
  );
}
