import React from 'react'
import Sidebar from '../components/Navbar'
import { Outlet } from 'react-router-dom'

export default function Template() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow p-6 sm:p-8 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200">
          <div className="max-w-7xl mx-auto py-4 px-6 sm:px-8 lg:px-10">
            <p className="text-center text-sm text-gray-600">
              &copy; {new Date().getFullYear()} <span className="font-semibold">Library</span>. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
