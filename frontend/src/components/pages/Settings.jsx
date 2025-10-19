import React, { useState, useEffect } from 'react'
import { 
  Settings as SettingsIcon, 
  Save, 
  RefreshCw, 
  Shield, 
  Bell, 
  Database, 
  Globe, 
  Users, 
  Lock, 
  Eye, 
  EyeOff,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  TrendingUp,
  BarChart3,
  FileText,
  Download,
  Upload,
  Key,
  Server,
  Zap,
  Monitor,
  Smartphone,
  Tablet,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../../contexts/AuthContext'

const Settings = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [showPassword, setShowPassword] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [userFilter, setUserFilter] = useState('')
  
  // User management states
  const [users, setUsers] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [showUserModal, setShowUserModal] = useState(false)
  
  const [settings, setSettings] = useState({
    profile: {
      firstName: user?.firstName || 'John',
      lastName: user?.lastName || 'Doe',
      email: user?.email || 'admin@smarthealthcare.com',
      phone: '+1 (555) 123-4567',
      role: user?.role || 'super_master_admin',
      department: 'Administration',
      employeeId: 'EMP001',
      joinDate: '2024-01-01',
      lastLogin: '2024-01-20 10:30:00',
      status: 'active',
      avatar: null
    },
    general: {
      hospitalName: 'Smart Health Care',
      hospitalAddress: '123 Medical Center Drive, Healthcare City, HC 12345',
      hospitalPhone: '+1 (555) 123-4567',
      hospitalEmail: 'info@smarthealthcare.com',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      currency: 'USD',
      language: 'English',
      theme: 'light'
    },
    security: {
      passwordPolicy: 'strong',
      sessionTimeout: 30,
      twoFactorAuth: true,
      loginAttempts: 3,
      passwordExpiry: 90,
      auditLogging: true,
      ipWhitelist: false,
      deviceManagement: true
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      appointmentReminders: true,
      systemAlerts: true,
      maintenanceNotices: true,
      emergencyAlerts: true,
      weeklyReports: true,
      monthlyReports: false
    },
    system: {
      maintenanceMode: false,
      autoLogout: true,
      sessionTimeout: 30,
      maxConcurrentUsers: 100,
      dataRetention: 365,
      logLevel: 'info',
      performanceMonitoring: true,
      errorReporting: true
    },
    database: {
      backupFrequency: 'daily',
      retentionPeriod: 365,
      autoBackup: true,
      compressionEnabled: true,
      encryptionEnabled: true,
      lastBackup: '2024-01-20 02:00:00',
      backupLocation: 'Cloud Storage',
      backupSize: '2.5 GB'
    },
    integration: {
      apiEnabled: true,
      webhooksEnabled: false,
      thirdPartyIntegrations: true,
      labIntegration: true,
      pharmacyIntegration: false,
      insuranceIntegration: true,
      paymentGateway: true,
      smsGateway: false
    }
  })

  // Mock Super Master Admin users data
  const mockUsers = [
    {
      _id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@smarthealthcare.com',
      phone: '+1 (555) 123-4567',
      role: 'super_master_admin',
      department: 'Administration',
      employeeId: 'EMP001',
      joinDate: '2024-01-01',
      lastLogin: '2024-01-20 10:30:00',
      status: 'active',
      avatar: null
    },
    {
      _id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@smarthealthcare.com',
      phone: '+1 (555) 123-4568',
      role: 'super_master_admin',
      department: 'Administration',
      employeeId: 'EMP002',
      joinDate: '2024-01-02',
      lastLogin: '2024-01-20 09:15:00',
      status: 'active',
      avatar: null
    },
    {
      _id: '3',
      firstName: 'Michael',
      lastName: 'Wilson',
      email: 'michael.wilson@smarthealthcare.com',
      phone: '+1 (555) 123-4569',
      role: 'super_master_admin',
      department: 'Administration',
      employeeId: 'EMP003',
      joinDate: '2024-01-03',
      lastLogin: '2024-01-19 16:45:00',
      status: 'active',
      avatar: null
    },
    {
      _id: '4',
      firstName: 'Emily',
      lastName: 'Davis',
      email: 'emily.davis@smarthealthcare.com',
      phone: '+1 (555) 123-4570',
      role: 'super_master_admin',
      department: 'Administration',
      employeeId: 'EMP004',
      joinDate: '2024-01-04',
      lastLogin: '2024-01-18 14:20:00',
      status: 'inactive',
      avatar: null
    }
  ]

  useEffect(() => {
    setUsers(mockUsers)
  }, [])

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Settings saved successfully!')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  const handleUserEdit = (user) => {
    setEditingUser(user)
    setShowUserModal(true)
  }

  const handleUserSave = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('User updated successfully!')
      setShowUserModal(false)
      setEditingUser(null)
    } catch (error) {
      toast.error('Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleUserDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setUsers(users.filter(u => u._id !== userId))
        toast.success('User deleted successfully!')
      } catch (error) {
        toast.error('Failed to delete user')
      } finally {
        setLoading(false)
      }
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = userFilter === '' || user.status === userFilter
    
    return matchesSearch && matchesFilter
  })

  const getRoleColor = (role) => {
    const colors = {
      super_master_admin: 'bg-purple-100 text-purple-800',
      super_admin: 'bg-blue-100 text-blue-800',
      doctor: 'bg-green-100 text-green-800',
      nurse: 'bg-yellow-100 text-yellow-800',
      billing_staff: 'bg-orange-100 text-orange-800',
      pharmacy_staff: 'bg-pink-100 text-pink-800',
      patient: 'bg-gray-100 text-gray-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const getStatusColor = (status) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800'
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'users', label: 'Super Master Admins', icon: Users },
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'system', label: 'System', icon: Monitor },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'integration', label: 'Integration', icon: Globe }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
              <SettingsIcon className="h-6 w-6 mr-3 text-gray-600" />
              Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Configure system preferences and manage Super Master Admin users
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-[#004D99] text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-[#003d80] transition-colors flex items-center disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-[#004D99] text-[#004D99]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Profile Settings
              </h3>
              
              <div className="grid grid-cols-1 gap-6">
                {/* Profile Form */}
                <div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={settings.profile.firstName}
                        onChange={(e) => handleSettingChange('profile', 'firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={settings.profile.lastName}
                        onChange={(e) => handleSettingChange('profile', 'lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="text"
                        value={settings.profile.phone}
                        onChange={(e) => handleSettingChange('profile', 'phone', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <input
                        type="text"
                        value={settings.profile.department}
                        onChange={(e) => handleSettingChange('profile', 'department', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                  
                  {/* Password Change */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Change Password</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                        <input
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                        />
                      </div>
                    </div>
                    <button className="mt-4 bg-[#004D99] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#003d80] transition-all">
                      <Key className="h-4 w-4 mr-2 inline" />
                      Update Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Super Master Admin Management */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-[#004D99]" />
                    Super Master Admin Management
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Manage Super Master Admin users and their permissions
                  </p>
                </div>
                <div className="flex gap-3">
                  <button className="bg-[#004D99] text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-[#003d80] transition-colors flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Super Master Admin
                  </button>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="bg-gray-50 rounded-md p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search Super Master Admins..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Super Master Admins Table */}
              <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Super Master Admin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Login
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-[#004D99] flex items-center justify-center">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.department}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.lastLogin}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(user.status)}`}>
                              {user.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleUserEdit(user)}
                                className="text-[#004D99] hover:text-[#003d80] transition-colors"
                                title="Edit Super Master Admin"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleUserDelete(user._id)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                                title="Delete Super Master Admin"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                General Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Name</label>
                  <input
                    type="text"
                    value={settings.general.hospitalName}
                    onChange={(e) => handleSettingChange('general', 'hospitalName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={settings.general.hospitalPhone}
                    onChange={(e) => handleSettingChange('general', 'hospitalPhone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hospital Address</label>
                  <textarea
                    value={settings.general.hospitalAddress}
                    onChange={(e) => handleSettingChange('general', 'hospitalAddress', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.general.hospitalEmail}
                    onChange={(e) => handleSettingChange('general', 'hospitalEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={settings.general.timezone}
                    onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="Asia/Kolkata">India Standard Time</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                  <select
                    value={settings.general.language}
                    onChange={(e) => handleSettingChange('general', 'language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  >
                    <option value="English">English</option>
                    <option value="Spanish">Spanish</option>
                    <option value="French">French</option>
                    <option value="German">German</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                  <select
                    value={settings.general.theme}
                    onChange={(e) => handleSettingChange('general', 'theme', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Security Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password Policy</label>
                  <select
                    value={settings.security.passwordPolicy}
                    onChange={(e) => handleSettingChange('security', 'passwordPolicy', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  >
                    <option value="basic">Basic (8 characters)</option>
                    <option value="strong">Strong (12 characters, mixed case, numbers, symbols)</option>
                    <option value="enterprise">Enterprise (16 characters, complex requirements)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings.security.sessionTimeout}
                    onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactorAuth}
                    onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Enable Two-Factor Authentication</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.auditLogging}
                    onChange={(e) => handleSettingChange('security', 'auditLogging', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Enable Audit Logging</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.deviceManagement}
                    onChange={(e) => handleSettingChange('security', 'deviceManagement', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Device Management</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.security.ipWhitelist}
                    onChange={(e) => handleSettingChange('security', 'ipWhitelist', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">IP Whitelist</label>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Notification Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                    <p className="text-sm text-gray-500">Receive notifications via email</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.emailNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                    <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.smsNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                    <p className="text-sm text-gray-500">Receive push notifications on mobile devices</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.pushNotifications}
                    onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Appointment Reminders</h4>
                    <p className="text-sm text-gray-500">Send reminders for upcoming appointments</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.appointmentReminders}
                    onChange={(e) => handleSettingChange('notifications', 'appointmentReminders', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">System Alerts</h4>
                    <p className="text-sm text-gray-500">Receive system status and error alerts</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications.systemAlerts}
                    onChange={(e) => handleSettingChange('notifications', 'systemAlerts', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                System Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Concurrent Users</label>
                  <input
                    type="number"
                    value={settings.system.maxConcurrentUsers}
                    onChange={(e) => handleSettingChange('system', 'maxConcurrentUsers', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Data Retention (days)</label>
                  <input
                    type="number"
                    value={settings.system.dataRetention}
                    onChange={(e) => handleSettingChange('system', 'dataRetention', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
                  <select
                    value={settings.system.logLevel}
                    onChange={(e) => handleSettingChange('system', 'logLevel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  >
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.system.maintenanceMode}
                    onChange={(e) => handleSettingChange('system', 'maintenanceMode', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Maintenance Mode</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.system.performanceMonitoring}
                    onChange={(e) => handleSettingChange('system', 'performanceMonitoring', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Performance Monitoring</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.system.errorReporting}
                    onChange={(e) => handleSettingChange('system', 'errorReporting', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Error Reporting</label>
                </div>
              </div>
            </div>
          )}

          {/* Database Settings */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Database Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                  <select
                    value={settings.database.backupFrequency}
                    onChange={(e) => handleSettingChange('database', 'backupFrequency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Retention Period (days)</label>
                  <input
                    type="number"
                    value={settings.database.retentionPeriod}
                    onChange={(e) => handleSettingChange('database', 'retentionPeriod', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.database.autoBackup}
                    onChange={(e) => handleSettingChange('database', 'autoBackup', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Enable Automatic Backup</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={settings.database.encryptionEnabled}
                    onChange={(e) => handleSettingChange('database', 'encryptionEnabled', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Enable Database Encryption</label>
                </div>
              </div>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg">
                <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                  <Database className="h-5 w-5 mr-2 text-[#004D99]" />
                  Backup Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Last Backup</p>
                    <p className="text-sm font-medium text-gray-900">{settings.database.lastBackup}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Backup Size</p>
                    <p className="text-sm font-medium text-gray-900">{settings.database.backupSize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Backup Location</p>
                    <p className="text-sm font-medium text-gray-900">{settings.database.backupLocation}</p>
                  </div>
                </div>
                <button className="mt-4 bg-[#004D99] text-white px-4 py-2 rounded-lg hover:bg-[#003d80] transition-colors flex items-center text-sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run Backup Now
                </button>
              </div>
            </div>
          )}

          {/* Integration Settings */}
          {activeTab === 'integration' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Integration Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">API Access</h4>
                    <p className="text-sm text-gray-500">Enable REST API for third-party integrations</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.integration.apiEnabled}
                    onChange={(e) => handleSettingChange('integration', 'apiEnabled', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Laboratory Integration</h4>
                    <p className="text-sm text-gray-500">Connect with external laboratory systems</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.integration.labIntegration}
                    onChange={(e) => handleSettingChange('integration', 'labIntegration', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Pharmacy Integration</h4>
                    <p className="text-sm text-gray-500">Connect with pharmacy management systems</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.integration.pharmacyIntegration}
                    onChange={(e) => handleSettingChange('integration', 'pharmacyIntegration', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Insurance Integration</h4>
                    <p className="text-sm text-gray-500">Connect with insurance verification systems</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.integration.insuranceIntegration}
                    onChange={(e) => handleSettingChange('integration', 'insuranceIntegration', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Payment Gateway</h4>
                    <p className="text-sm text-gray-500">Enable payment processing integration</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.integration.paymentGateway}
                    onChange={(e) => handleSettingChange('integration', 'paymentGateway', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">SMS Gateway</h4>
                    <p className="text-sm text-gray-500">Enable SMS notifications integration</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.integration.smsGateway}
                    onChange={(e) => handleSettingChange('integration', 'smsGateway', e.target.checked)}
                    className="h-4 w-4 text-[#004D99] focus:ring-[#004D99] border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Super Master Admin Edit Modal */}
      {showUserModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Super Master Admin</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  defaultValue={editingUser.firstName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  defaultValue={editingUser.lastName}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue={editingUser.email}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  defaultValue={editingUser.role}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                >
                  <option value="super_master_admin">Super Master Admin</option>
                  <option value="super_admin">Super Admin</option>
                  <option value="doctor">Doctor</option>
                  <option value="nurse">Nurse</option>
                  <option value="billing_staff">Billing Staff</option>
                  <option value="pharmacy_staff">Pharmacy Staff</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                <input
                  type="text"
                  defaultValue={editingUser.department}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowUserModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUserSave}
                disabled={loading}
                className="px-4 py-2 bg-[#004D99] text-white rounded-lg hover:bg-[#003d80] transition-all disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
