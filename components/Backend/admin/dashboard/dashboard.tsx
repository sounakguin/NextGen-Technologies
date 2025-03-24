"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  LayoutDashboard,
  BookOpen,
  Users,
  Mail,
  Home,
  Menu,
  X,
  Folder,
  ImageIcon,
  FormInput,
  FileType2,
  Info,
} from "lucide-react";
import Header from "../globalheader/header";
import createClient from "@/utils/supabase/client";

interface NavItem {
  icon: React.ElementType;
  label: string;
  href?: string;
  children?: NavItem[];
}

interface ProfileSettings {
  realname: string;
  panelname: string;
  profileimage: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard" },

  { icon: LayoutDashboard, label: "Banner", href: "/admin/banners" },
  { icon: LayoutDashboard, label: "Clientels", href: "/admin/clientel" },
  {
    icon: Home,
    label: "About",
    children: [
      {
        icon: Folder,
        label: "Text Section",
        href: "/admin/about/textsection",
      },
      {
        icon: Folder,
        label: "Workflow",
        href: "/admin/about/workflow",
      },
    ],
  },

  {
    icon: BookOpen,
    label: "Template",
    children: [
      {
        icon: FileType2,
        label: "Text Section",
        href: "/admin/template/templatetext",
      },
      {
        icon: BookOpen,
        label: "Images",
        href: "/admin/template/templateimages",
      },
    ],
  },

  {
    icon: Users,
    label: "Services",
    children: [
      {
        icon: Folder,
        label: "Text Section",
        href: "/admin/services/servicetextsection",
      },
      {
        icon: Folder,
        label: "What Make Us Different",
        href: "/admin/services/whatmakeusdifferent",
      },
      {
        icon: Folder,
        label: "Cards",
        href: "/admin/services/servicecards",
      },
    ],
  },

  {
    icon: Mail,
    label: "Testimonial",
    children: [
      {
        icon: ImageIcon,
        label: "Text Section",
        href: "/admin/testimonials/testimonialstextsection",
      },
      {
        icon: FormInput,
        label: "Cards",
        href: "/admin/testimonials/testimonialscards",
      },
    ],
  },

  {
    icon: Mail,
    label: "Pricing",
    children: [
      {
        icon: ImageIcon,
        label: "Text Section",
        href: "/admin/pricing/pricingtext",
      },
      {
        icon: FormInput,
        label: "Cards",
        href: "/admin/pricing/pricingcards",
      },
    ],
  },

  {
    icon: Mail,
    label: "Blogs",
    children: [
      {
        icon: ImageIcon,
        label: "Text Section",
        href: "/admin/blogs/blogtextsection",
      },
      {
        icon: FormInput,
        label: "Cards",
        href: "/admin/blogs/blogdetails",
      },
    ],
  },

  { icon: LayoutDashboard, label: "Faqs", href: "/admin/faqs" },
  { icon: LayoutDashboard, label: "Contactus", href: "/admin/contactus" },
  { icon: LayoutDashboard, label: "Get In Touch", href: "/admin/getintouch" },
];

async function fetchTotalServices() {
  const supabase = createClient();

  try {
    const { count, error } = await supabase
      .from("services")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching total services:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error fetching total services:", error);
    return 0;
  }
}

async function fetchTotalBlogs() {
  const supabase = createClient();

  try {
    const { count, error } = await supabase
      .from("blogs")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching total blogs:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error fetching total blogs:", error);
    return 0;
  }
}

async function fetchTotalEnquiries() {
  const supabase = createClient();

  try {
    const { count, error } = await supabase
      .from("contactformdata")
      .select("*", { count: "exact", head: true });

    if (error) {
      console.error("Error fetching total enquiries:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("Error fetching total enquiries:", error);
    return 0;
  }
}

async function fetchProfileSettings() {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from("profilesettings")
      .select("realname, panelname, profileimage")
      .single();

    if (error) {
      console.error("Error fetching profile settings:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error fetching profile settings:", error);
    return null;
  }
}

export default function Dashboard({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [openItems, setOpenItems] = useState<{ [key: string]: boolean }>({});
  const [totalServices, setTotalServices] = useState(0);
  const [totalBlogs, setTotalBlogs] = useState(0);
  const [totalEnquiries, setTotalEnquiries] = useState(0);
  const [profileSettings, setProfileSettings] =
    useState<ProfileSettings | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function fetchData() {
      const services = await fetchTotalServices();
      setTotalServices(services);

      const blogs = await fetchTotalBlogs();
      setTotalBlogs(blogs);

      const enquiries = await fetchTotalEnquiries();
      setTotalEnquiries(enquiries);

      const settings = await fetchProfileSettings();
      setProfileSettings(settings);
    }

    fetchData();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleItem = (label: string) => {
    setOpenItems((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const renderNavItems = (items: NavItem[], level = 0) => {
    return items.map((item, index) => (
      <li key={item.label + index}>
        {item.href ? (
          <Link href={item.href}>
            <span
              className={`flex items-center gap-3 px-4 py-2 hover:bg-gray-800 rounded-lg transition duration-200 ${
                pathname === item.href ? "bg-gray-800" : ""
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </span>
          </Link>
        ) : (
          <>
            <button
              onClick={() => toggleItem(item.label)}
              className="flex items-center justify-between w-full text-left px-4 py-2 hover:bg-gray-800 rounded-lg transition duration-200"
            >
              <span className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span className="text-sm">{item.label}</span>
              </span>
              <ChevronDown
                className={`h-5 w-5 transition-transform ${
                  openItems[item.label] ? "rotate-180" : ""
                }`}
              />
            </button>
            {item.children && openItems[item.label] && (
              <ul className={`pl-${4 + level * 2} mt-2 space-y-2`}>
                {renderNavItems(item.children, level + 1)}
              </ul>
            )}
          </>
        )}
      </li>
    ));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="md:hidden bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-50">
        <button
          onClick={toggleSidebar}
          className="text-gray-500 hover:text-gray-700"
        >
          {isSidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
        <div className="relative flex items-center gap-3 pl-4 border-l group">
          <div className="text-right">
            <div className="text-sm font-medium">
              {profileSettings?.realname}
            </div>
            <div className="text-xs text-gray-500">
              {profileSettings?.panelname}
            </div>
          </div>
          <div className="h-9 w-9 rounded-full overflow-hidden">
            <Image
              src={profileSettings?.profileimage || "/placeholder.svg"}
              alt="User avatar"
              width={36}
              height={36}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Dropdown Menu */}
          <div className="absolute top-[42px] right-0 hidden mt-2 w-48 bg-white rounded-md  group-hover:block shadow-xl">
            <div className="p-2">
              <Link
                href="/admin/profilesettings"
                className="block text-sm text-gray-700 py-1 px-4 hover:bg-gray-100"
              >
                Profile Settings
              </Link>
              <a
                href="/admin/adminsettings"
                className="block text-sm text-gray-700 py-1 px-4 hover:bg-gray-100"
              >
                Account Settings
              </a>
              <a
                href="/admin/login"
                className="block text-sm text-gray-700 py-1 px-4 hover:bg-gray-100"
              >
                Logout
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`bg-[#1a1f2c] text-gray-300 w-80 flex-shrink-0 overflow-y-scroll overflow-x-hidden transition-all duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:static fixed top-14 bottom-0 left-0 z-40 flex flex-col scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent`}
        >
          <div className=" mt-3 p-4 hidden md:block ">
            <div className="flex items-center justify-between">
              <Image
                src="/others/logox.jpg"
                alt="logo"
                width={100}
                height={100}
                className="h-14 w-auto rounded-full"
              />
              <p className="text-[30px] text-center pr-10 italic">Agency</p>
            </div>
          </div>
          <div className="border border-b-white w-[90%] mx-auto"></div>
          <nav className="mt-5 flex-grow ">
            <ul className="space-y-2">{renderNavItems(navItems)}</ul>
          </nav>
          <div className="mt-auto p-4 text-[15px] text-gray-500">
            <div className="flex items-center mb-2">
              <Info className="w-4 h-4 mr-2" />
              <span>Version 1.14.4</span>
            </div>
            <div>Designed and Developed by Mactriq</div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden pt-14 md:pt-0">
          <div className="hidden md:block">
            <Header />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {children || (
              <div>
                <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-medium mb-2">Total Services</h2>
                    <p className="text-3xl font-bold">{totalServices}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-medium mb-2">Total Blogs</h2>
                    <p className="text-3xl font-bold">{totalBlogs}</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-lg font-medium mb-2">
                      Total Enquiries
                    </h2>
                    <p className="text-3xl font-bold">{totalEnquiries}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
