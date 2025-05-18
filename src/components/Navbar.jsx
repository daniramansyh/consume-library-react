import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  BookOpenIcon,
  UsersIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BanknotesIcon,
  ClipboardDocumentIcon
} from "@heroicons/react/24/outline";

const menuItems = [
  {
    label: "Home",
    to: "/dashboard",
    icon: <HomeIcon className="w-6 h-6" />,
    description: "Halaman Utama"
  },
  {
    label: "Member",
    to: "/dashboard/member",
    icon: <UsersIcon className="w-6 h-6" />,
    description: "Kelola Data Member"
  },
  {
    label: "Buku",
    to: "/dashboard/buku",
    icon: <BookOpenIcon className="w-6 h-6" />,
    description: "Kelola Data Buku"
  },
  {
    label: "Peminjaman",
    to: "/dashboard/peminjaman",
    icon: <ClipboardDocumentIcon className="w-6 h-6" />,
    description: "Kelola Data Peminjaman"
  },
  {
    label: "Denda",
    to: "/dashboard/denda",
    icon: <BanknotesIcon className="w-6 h-6" />,
    description: "Kelola Data Denda"
  }
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    sessionStorage.setItem('just_logged_out', 'true');
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <span className="ml-2 text-xl font-semibold text-gray-800">Perpus Digital</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
                    ${isActive
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <div className="w-5 h-5 mr-2">
                    {item.icon}
                  </div>
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              aria-expanded="false"
            >
              {isOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-b border-gray-200">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center px-3 py-2 rounded-md text-base font-medium
                  ${isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                onClick={() => setIsOpen(false)}
              >
                <div className="w-5 h-5 mr-2">
                  {item.icon}
                </div>
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
