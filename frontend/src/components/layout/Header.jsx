import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useSearch } from '../../contexts/SearchContext'
import { Bell, Settings, LogOut, Search, Command, X, Menu } from 'lucide-react'

const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const { setIsSearchOpen, searchQuery, handleSearch } = useSearch()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = () => {
    logout()
  }

  const openSearch = () => {
    setIsSearchOpen(true)
  }

  const handleNotifications = () => {
    setShowNotifications(!showNotifications)
  }

  const handleSettings = () => {
    navigate('/settings')
  }

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.role === 'clinic_admin') {
      return user?.adminName || user?.name || 'Clinic Admin'
    }
    return user?.firstName || 'User'
  }

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur border-b border-gray-100">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile Menu Button */}
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-all duration-200"
              >
                <Menu className="h-5 w-5" />
              </button>
              
              <h1 className="text-[18px] font-semibold text-gray-900">
                Welcome back, {getUserDisplayName()}
              </h1>
              <span className="text-xs text-gray-500">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="hidden md:flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-soft w-72 cursor-pointer hover:border-primary-300 transition-all duration-200"
                   onClick={openSearch}>
                <Search className="h-4 w-4 text-gray-400" />
                <input 
                  className="outline-none w-full text-sm placeholder-gray-400 cursor-pointer" 
                  placeholder="Search appointments, patients, settings..." 
                  readOnly
                />
                <div className="hidden sm:flex items-center gap-1 text-xs text-gray-400 bg-gray-100 rounded px-2 py-1">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </div>
              </div>

              {/* Mobile Search Button */}
              <button 
                onClick={openSearch}
                className="md:hidden p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-all duration-200"
              >
                <Search className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={handleNotifications}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-all duration-200 relative"
                >
                  <Bell className="h-5 w-5" />
                  {/* Notification badge */}
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-30">
                    <div className="p-4 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                        <button 
                          onClick={() => setShowNotifications(false)}
                          className="p-1 hover:bg-gray-100 rounded-full"
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {/* Sample notifications */}
                      <div className="p-3 hover:bg-gray-50 border-b border-gray-100">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">New appointment scheduled</p>
                            <p className="text-xs text-gray-500 mt-1">John Doe scheduled for tomorrow at 2:00 PM</p>
                            <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 hover:bg-gray-50 border-b border-gray-100">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Patient record updated</p>
                            <p className="text-xs text-gray-500 mt-1">Medical history updated for Jane Smith</p>
                            <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 hover:bg-gray-50">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">System maintenance</p>
                            <p className="text-xs text-gray-500 mt-1">Scheduled maintenance tonight at 11:00 PM</p>
                            <p className="text-xs text-gray-400 mt-1">3 hours ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border-t border-gray-100">
                      <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings */}
              <button 
                onClick={handleSettings}
                className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-all duration-200"
              >
                <Settings className="h-5 w-5" />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-20" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </>
  )
}

export default Header