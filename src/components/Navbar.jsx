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
  ClipboardDocumentIcon,
  BookmarkIcon
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
    <nav className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-indigo-100 shadow-sm fixed w-full z-30 top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center group">
              <BookmarkIcon className="h-8 w-8 text-indigo-600 group-hover:text-indigo-700 transition-colors duration-200" />
              <span className="ml-2 text-xl font-serif font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors duration-200">Perpus Digital</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 mx-1
                    ${isActive
                      ? 'bg-indigo-100 text-indigo-800 shadow-sm'
                      : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'}`}
                  title={item.description}
                >
                  <div className={`w-5 h-5 mr-2 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {item.icon}
                  </div>
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 ml-2"
              title="Keluar dari aplikasi"
            >
              <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
              Logout
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors duration-200"
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
        <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg rounded-b-lg mx-2 mt-1 border border-indigo-100">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center px-3 py-3 rounded-md text-base font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-indigo-50 text-indigo-800'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-700'}`}
                onClick={() => setIsOpen(false)}
              >
                <div className={`w-5 h-5 mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
                  {item.icon}
                </div>
                <div>
                  <div>{item.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
                </div>
              </Link>
            );
          })}
          <button
            onClick={() => {
              setIsOpen(false);
              handleLogout();
            }}
            className="flex items-center w-full px-3 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
          >
            <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
            <div>
              <div>Logout</div>
              <div className="text-xs text-gray-500 mt-0.5">Keluar dari aplikasi</div>
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
