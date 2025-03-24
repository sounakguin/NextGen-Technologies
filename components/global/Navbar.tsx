"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Globe, Menu, X } from "lucide-react";
import ServiceDropDown from "./ServiceDropDown/ServiceDropDown";

interface NavItem {
  title: string;
  href: string;
  dropdown?: boolean;
}

const navItems: NavItem[] = [
  { title: "About Us", href: "#about" },
  { title: "Templates", href: "#templates" },
  { title: "Services", href: "#services", dropdown: true },
  { title: "Pricing", href: "#pricing" },
  { title: "Blog", href: "#blog" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(
    null
  );

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setActiveDropdown(null);
  };

  const toggleDropdown = (title: string) => {
    setActiveDropdown(activeDropdown === title ? null : title);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-black text-white">
      <div className="w-11/12 mx-auto flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/Others/logo.png"
            alt="WEBMINIS Logo"
            width={120}
            height={40}
            className="h-full w-full object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <div key={item.title} className="relative group">
              {item.dropdown ? (
                <button
                  onClick={() => toggleDropdown(item.title)}
                  className="text-lg font-semibold hover:text-gray-400 cursor-pointer flex items-center"
                >
                  {item.title}
                  <ChevronDown
                    className={`ml-1 h-4 w-4 transition-transform duration-200 ${
                      activeDropdown === item.title ? "rotate-180" : ""
                    }`}
                  />
                </button>
              ) : (
                <Link
                  href={item.href}
                  className="text-lg font-semibold hover:text-gray-400"
                >
                  {item.title}
                </Link>
              )}

              {/* Dropdown Content */}
              {item.dropdown && activeDropdown === item.title && (
                <div className="absolute top-14 -left-150 w-[1300px] bg-white text-black shadow-lg rounded-lg opacity-100 visible transition-all duration-300 transform translate-y-0">
                  <div className="py-4 h-[400px] overflow-y-auto">
                    <ServiceDropDown />
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Language & Contact */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-1 cursor-pointer hover:text-gray-400">
            <Globe className="h-5 w-5" />
            <span className="text-lg font-semibold">ENGLISH</span>
          </div>
          <Link
            href="#contact"
            className="bg-[#2FD31D] rounded-2xl px-4 py-2 font-semibold text-black hover:border hover:border-[#2FD31D] hover:text-white hover:bg-transparent transition-colors duration-300"
          >
            Contact Us
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-white"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`lg:hidden ${
          isMobileMenuOpen ? "block" : "hidden"
        } bg-black border-t border-gray-800`}
      >
        <nav className="px-6 py-4">
          {navItems.map((item) => (
            <div key={item.title} className="py-2">
              {item.dropdown ? (
                <button
                  className="w-full text-left flex items-center justify-between text-lg font-semibold hover:text-gray-400"
                  onClick={() => toggleDropdown(item.title)}
                >
                  <span>{item.title}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      activeDropdown === item.title ? "rotate-180" : ""
                    }`}
                  />
                </button>
              ) : (
                <Link
                  href={item.href}
                  className="text-lg font-semibold hover:text-gray-400 block"
                >
                  {item.title}
                </Link>
              )}

              {/* Dropdown Content */}
              {item.dropdown && activeDropdown === item.title && (
                <div className="mt-2 bg-gray-900 rounded-lg p-4">
                  <ServiceDropDown />
                </div>
              )}
            </div>
          ))}

          <div className="flex items-center gap-4 py-4 border-t border-gray-800 mt-4">
            <div className="flex items-center gap-1 cursor-pointer hover:text-gray-400">
              <Globe className="h-5 w-5" />
              <span className="text-lg font-semibold">ENGLISH</span>
            </div>
            <Link
              href="#contact"
              className="bg-[#2FD31D] rounded-2xl px-4 py-2 font-semibold text-black hover:border hover:border-[#2FD31D] hover:text-white hover:bg-transparent transition-colors duration-300"
            >
              Contact Us
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
