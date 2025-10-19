import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { SearchProvider } from '../../contexts/SearchContext'
import SearchResults from '../search/SearchResults'
import { Menu, X } from 'lucide-react'

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <SearchProvider>
      <div className="flex h-screen app-surface">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
        
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 scroll-area animate-fadeIn">
            {children}
          </main>
        </div>
        <SearchResults />
      </div>
    </SearchProvider>
  )
}

export default DashboardLayout