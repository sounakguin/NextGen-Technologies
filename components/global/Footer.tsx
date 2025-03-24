import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#111204] text-white py-8 pt-[200px]">
      <div className="container mx-auto px-4 w-11/12 ">
        {/* Top Navigation and Logo */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          {/* Logo */}
          <div className="mb-6 md:mb-0">
            <Link href="/" className="inline-block">
              <div className="flex items-center">
                <Image
                  src="/Others/logo.png"
                  alt="WEBMINIS Logo"
                  width={170}
                  height={170}
                  className="h-full w-full"
                />
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-6 md:mb-0">
            <Link
              href="/about-us"
              className="hover:text-green-400 transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/templates"
              className="hover:text-green-400 transition-colors"
            >
              Templates
            </Link>
            <Link
              href="/services"
              className="hover:text-green-400 transition-colors"
            >
              Services
            </Link>
            <Link
              href="/pricing"
              className="hover:text-green-400 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/blog"
              className="hover:text-green-400 transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/faq"
              className="hover:text-green-400 transition-colors"
            >
              FAQ
            </Link>
          </nav>

          {/* Social Media Icons */}
          <div className="flex space-x-4">
            <Link href="#" className="hover:text-green-400 transition-colors">
              <Facebook size={20} />
              <span className="sr-only">Facebook</span>
            </Link>
            <Link href="#" className="hover:text-green-400 transition-colors">
              <Instagram size={20} />
              <span className="sr-only">Instagram</span>
            </Link>
            <Link href="#" className="hover:text-green-400 transition-colors">
              <Linkedin size={20} />
              <span className="sr-only">LinkedIn</span>
            </Link>
            <Link href="#" className="hover:text-green-400 transition-colors">
              <Youtube size={20} />
              <span className="sr-only">YouTube</span>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col md:flex-row justify-between items-center text-center lg:text-left lg:items-start mb-10">
          {/* Left Side - Info */}
          <div className="mb-8 md:mb-0 max-w-md">
            <p className="text-sm mb-6">
              WebMinis, India&apos;s leading Business
              <br />
              WebBuilder Platform
            </p>

            {/* Contact Info */}
            <div className="space-y-2 ">
              <div className="flex items-center justify-center md:justify-start text-center lg:text-left   gap-3">
                <Mail size={18} className="text-white opacity-80" />
                <Link
                  href="mailto:contact@mactriq.com"
                  className="hover:text-green-400 transition-colors text-sm"
                >
                  contact@mactriq.com
                </Link>
              </div>
              <div className="flex justify-center md:justify-start  items-center gap-3">
                <Phone size={18} className="text-white opacity-80" />
                <Link
                  href="tel:+15551234567"
                  className="hover:text-green-400 transition-colors text-sm"
                >
                  +91 76002 45497
                </Link>
              </div>
            </div>
          </div>

          {/* Right Side - QR Code */}
          <div className="w-full md:w-auto">
            <Image
              src="/Others/upi.png"
              alt="QR Code"
              width={400}
              height={400}
              className="mx-auto h-full w-full"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 mb-6"></div>

        {/* Copyright */}
        <div>
          <p className="text-center text-sm text-gray-400">
            ©{" "}
            <a
              href="https://www.mactriq.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-orange-500 transition-colors duration-200"
            >
              Mactriq Technologies
            </a>{" "}
            - All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
