import React, { useState, useEffect } from 'react'
import {
  Pill,
  Plus,
  Search,
  Package,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Building2,
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  Calendar,
  User,
  ShoppingCart,
  AlertTriangle,
  Zap,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'

const PharmacyManagement = () => {
  const { user } = useAuth()
  const [medications, setMedications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('latest')

  // Enhanced search filters
  const [filters, setFilters] = useState({
    medicationName: '',
    category: '',
    stockLevel: '',
    expiryDate: '',
    supplier: '',
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    expiringSoon: 0,
    totalValue: 0,
    categories: 0,
  })

  // Mock data for demonstration
  const mockMedications = [
    {
      _id: '1',
      name: 'Paracetamol 500mg',
      category: 'Pain Relief',
      stock: 150,
      minStock: 50,
      expiryDate: '2025-12-15',
      supplier: 'MediCorp',
      price: 25,
      status: 'inStock',
    },
    {
      _id: '2',
      name: 'Amoxicillin 250mg',
      category: 'Antibiotic',
      stock: 30,
      minStock: 50,
      expiryDate: '2025-08-20',
      supplier: 'PharmaPlus',
      price: 45,
      status: 'lowStock',
    },
    {
      _id: '3',
      name: 'Insulin Glargine',
      category: 'Diabetes',
      stock: 0,
      minStock: 20,
      expiryDate: '2025-06-10',
      supplier: 'DiabeticCare',
      price: 1200,
      status: 'outOfStock',
    },
    {
      _id: '4',
      name: 'Metformin 500mg',
      category: 'Diabetes',
      stock: 80,
      minStock: 30,
      expiryDate: '2025-03-15',
      supplier: 'DiabeticCare',
      price: 35,
      status: 'expiringSoon',
    },
    {
      _id: '5',
      name: 'Omeprazole 20mg',
      category: 'Gastrointestinal',
      stock: 120,
      minStock: 40,
      expiryDate: '2025-11-30',
      supplier: 'GutHealth',
      price: 55,
      status: 'inStock',
    },
  ]

  useEffect(() => {
    fetchMedications()
  }, [])

  const fetchMedications = async () => {
    setLoading(true)
    try {
      // Simulate API call
      setTimeout(() => {
        setMedications(mockMedications)
        calculateStats(mockMedications)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching medications:', error)
      toast.error('Failed to fetch medications')
      setLoading(false)
    }
  }

  const calculateStats = (medicationsData) => {
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    const stats = {
      total: medicationsData.length,
      inStock: medicationsData.filter((med) => med.status === 'inStock').length,
      lowStock: medicationsData.filter((med) => med.status === 'lowStock').length,
      outOfStock: medicationsData.filter((med) => med.status === 'outOfStock').length,
      expiringSoon: medicationsData.filter((med) => {
        const expiryDate = new Date(med.expiryDate)
        return expiryDate <= thirtyDaysFromNow && expiryDate > today
      }).length,
      totalValue: medicationsData.reduce((sum, med) => sum + (med.stock * med.price), 0),
      categories: [...new Set(medicationsData.map((med) => med.category))].length,
    }

    setStats(stats)
  }

  const filteredMedications = medications.filter((medication) => {
    const matchesSearch =
      medication.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.supplier?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.status?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === '' || medication.status === statusFilter

    // Enhanced individual field filters
    const matchesMedicationName =
      !filters.medicationName ||
      medication.name?.toLowerCase().includes(filters.medicationName.toLowerCase())

    const matchesCategory =
      !filters.category ||
      medication.category?.toLowerCase().includes(filters.category.toLowerCase())

    const matchesStockLevel = () => {
      if (!filters.stockLevel) return true
      switch (filters.stockLevel) {
        case 'high':
          return medication.stock > medication.minStock * 2
        case 'normal':
          return medication.stock > medication.minStock && medication.stock <= medication.minStock * 2
        case 'low':
          return medication.stock <= medication.minStock && medication.stock > 0
        case 'out':
          return medication.stock === 0
        default:
          return true
      }
    }

    const matchesExpiryDate =
      !filters.expiryDate ||
      new Date(medication.expiryDate).toISOString().split('T')[0] === filters.expiryDate

    const matchesSupplier =
      !filters.supplier ||
      medication.supplier?.toLowerCase().includes(filters.supplier.toLowerCase())

    return (
      matchesSearch &&
      matchesStatus &&
      matchesMedicationName &&
      matchesCategory &&
      matchesStockLevel() &&
      matchesExpiryDate &&
      matchesSupplier
    )
  })

  // Sort filtered medications
  const sortedMedications = [...filteredMedications].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt)
      case 'oldest':
        return new Date(a.createdAt || a.updatedAt) - new Date(b.createdAt || b.updatedAt)
      case 'name':
        return a.name.localeCompare(b.name)
      case 'stock_desc':
        return b.stock - a.stock
      case 'stock_asc':
        return a.stock - b.stock
      case 'expiry':
        return new Date(a.expiryDate) - new Date(b.expiryDate)
      case 'price_desc':
        return b.price - a.price
      case 'price_asc':
        return a.price - b.price
      default:
        return 0
    }
  })

  const getStatusColor = (status) => {
    const colors = {
      inStock: 'bg-green-100 text-green-800',
      lowStock: 'bg-yellow-100 text-yellow-800',
      outOfStock: 'bg-red-100 text-red-800',
      expiringSoon: 'bg-orange-100 text-orange-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    const icons = {
      inStock: CheckCircle,
      lowStock: AlertTriangle,
      outOfStock: XCircle,
      expiringSoon: Clock,
    }
    return icons[status] || AlertCircle
  }

  const formatMedicationDate = (date) => {
    const medicationDate = new Date(date)
    if (isToday(medicationDate)) {
      return 'Today'
    } else if (isTomorrow(medicationDate)) {
      return 'Tomorrow'
    } else if (isYesterday(medicationDate)) {
      return 'Yesterday'
    } else {
      return format(medicationDate, 'MMM dd, yyyy')
    }
  }

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-[#004D99]/20">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color} shadow-sm`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004D99]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Work Under Progress Banner */}
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-orange-900">
              Work Under Progress
            </h3>
            <p className="text-orange-700 text-sm">
              This feature is currently being developed and will be available soon.
            </p>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-gradient-to-r from-[#e6f0ff] to-[#e6f7f5] rounded-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pharmacy Management</h1>
            <p className="text-gray-600 mt-2">
              {user.role === 'patient'
                ? 'Your medication history and prescriptions'
                : 'Comprehensive pharmacy inventory and medication management system'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchMedications}
              className="bg-white/80 backdrop-blur text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-white transition-all flex items-center shadow-sm border border-gray-200"
            >
              <Activity className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
            {(user.role === 'super_master_admin' || user.role === 'clinic_admin') && (
              <button className="bg-gradient-to-r from-[#004D99] to-[#42A89B] text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-[#003d80] hover:to-[#3a7d92] transition-all flex items-center shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Medications"
          value={stats.total}
          icon={Pill}
          color="bg-[#004D99]"
          description="All medications in inventory"
        />
        <StatCard
          title="In Stock"
          value={stats.inStock}
          icon={CheckCircle}
          color="bg-green-500"
          description="Adequate stock levels"
        />
        <StatCard
          title="Low Stock"
          value={stats.lowStock}
          icon={AlertTriangle}
          color="bg-yellow-500"
          description="Need reordering"
        />
        <StatCard
          title="Total Value"
          value={`₹${stats.totalValue.toLocaleString()}`}
          icon={Package}
          color="bg-purple-500"
          description="Inventory value"
        />
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-1 h-6 bg-[#004D99] rounded-full mr-3"></div>
            Stock Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">In Stock</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.inStock}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Low Stock</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.lowStock}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Out of Stock</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.outOfStock}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Expiring Soon</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.expiringSoon}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-1 h-6 bg-[#42A89B] rounded-full mr-3"></div>
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setStatusFilter('lowStock')}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <AlertTriangle className="h-4 w-4 mr-3 text-[#004D99]" />
              <span className="text-sm">View Low Stock Items</span>
            </button>
            <button
              onClick={() => setStatusFilter('outOfStock')}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <XCircle className="h-4 w-4 mr-3 text-[#004D99]" />
              <span className="text-sm">Out of Stock Items</span>
            </button>
            <button
              onClick={() => setStatusFilter('expiringSoon')}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <Clock className="h-4 w-4 mr-3 text-[#004D99]" />
              <span className="text-sm">Expiring Soon</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-1 h-6 bg-gradient-to-b from-[#004D99] to-[#42A89B] rounded-full mr-3"></div>
            Recent Activity
          </h3>
          <div className="space-y-3">
            {medications.slice(0, 3).map((medication, index) => {
              const StatusIcon = getStatusIcon(medication.status)
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#004D99] to-[#42A89B] rounded-full flex items-center justify-center">
                    <Pill className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{medication.name}</p>
                    <p className="text-xs text-gray-500">
                      {medication.category} • Stock: {medication.stock}
                    </p>
                  </div>
                  <StatusIcon className="h-4 w-4 text-gray-400" />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
        {/* Quick Search */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Quick search across all fields..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-3 border border-gray-200 rounded-lg transition-all flex items-center ${
                showAdvancedFilters
                  ? 'bg-[#004D99] text-white border-[#004D99]'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
              {(filters.medicationName ||
                filters.category ||
                filters.stockLevel ||
                filters.expiryDate ||
                filters.supplier) && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {[filters.medicationName, filters.category, filters.stockLevel, filters.expiryDate, filters.supplier].filter(Boolean).length}
                </span>
              )}
            </button>

            <select
              className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name (A-Z)</option>
              <option value="stock_desc">Stock (High to Low)</option>
              <option value="stock_asc">Stock (Low to High)</option>
              <option value="expiry">Expiry Date</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="price_asc">Price (Low to High)</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters - Collapsible */}
        {showAdvancedFilters && (
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Filter className="h-5 w-5 mr-2 text-[#004D99]" />
              Advanced Search Filters
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {/* Medication Name Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Pill className="h-4 w-4 inline mr-1" />
                  Medication Name
                </label>
                <input
                  type="text"
                  placeholder="Search by medication name..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  value={filters.medicationName}
                  onChange={(e) => setFilters((prev) => ({ ...prev, medicationName: e.target.value }))}
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Package className="h-4 w-4 inline mr-1" />
                  Category
                </label>
                <input
                  type="text"
                  placeholder="Search by category..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  value={filters.category}
                  onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
                />
              </div>

              {/* Stock Level Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TrendingUp className="h-4 w-4 inline mr-1" />
                  Stock Level
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  value={filters.stockLevel}
                  onChange={(e) => setFilters((prev) => ({ ...prev, stockLevel: e.target.value }))}
                >
                  <option value="">All Stock Levels</option>
                  <option value="high">High Stock</option>
                  <option value="normal">Normal Stock</option>
                  <option value="low">Low Stock</option>
                  <option value="out">Out of Stock</option>
                </select>
              </div>

              {/* Expiry Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Expiry Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  value={filters.expiryDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, expiryDate: e.target.value }))}
                />
              </div>

              {/* Supplier Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="h-4 w-4 inline mr-1" />
                  Supplier
                </label>
                <input
                  type="text"
                  placeholder="Search by supplier..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  value={filters.supplier}
                  onChange={(e) => setFilters((prev) => ({ ...prev, supplier: e.target.value }))}
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {filteredMedications.length} of {medications.length} medications found
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFilters({
                      medicationName: '',
                      category: '',
                      stockLevel: '',
                      expiryDate: '',
                      supplier: '',
                    })
                    setSearchTerm('')
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowAdvancedFilters(false)}
                  className="px-4 py-2 text-sm bg-[#004D99] text-white rounded-lg hover:bg-[#003d80] transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        )}
        </div>

      {/* Medications Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-[#004D99] to-[#42A89B] rounded-full mr-3"></div>
              Medications List ({sortedMedications.length})
            </h3>
            <div className="text-sm text-gray-600">
              Sorted by:{' '}
              <span className="font-medium text-[#004D99]">
                {sortBy === 'latest'
                  ? 'Latest First'
                  : sortBy === 'oldest'
                  ? 'Oldest First'
                  : sortBy === 'name'
                  ? 'Name (A-Z)'
                  : sortBy === 'stock_desc'
                  ? 'Stock (High to Low)'
                  : sortBy === 'stock_asc'
                  ? 'Stock (Low to High)'
                  : sortBy === 'expiry'
                  ? 'Expiry Date'
                  : sortBy === 'price_desc'
                  ? 'Price (High to Low)'
                  : sortBy === 'price_asc'
                  ? 'Price (Low to High)'
                  : 'Latest First'}
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Pill className="h-4 w-4 mr-2 text-[#004D99]" />
                    Medication
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-2 text-[#004D99]" />
                    Category
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-[#004D99]" />
                    Stock Level
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-[#004D99]" />
                    Supplier
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-[#004D99]" />
                    Expiry Date
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-[#004D99]" />
                    Status
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-2 text-[#004D99]" />
                    Actions
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedMedications.map((medication) => {
                const StatusIcon = getStatusIcon(medication.status)
                return (
                  <tr
                    key={medication._id}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 border-l-4 border-transparent hover:border-[#004D99]"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                          <Pill className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{medication.name}</div>
                          <div className="text-xs text-gray-500">₹{medication.price} per unit</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Package className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{medication.category}</div>
                          <div className="text-xs text-gray-500">Medical Category</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{medication.stock} units</div>
                      <div className="text-xs text-gray-500">Min: {medication.minStock} units</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Value: ₹{(medication.stock * medication.price).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{medication.supplier}</div>
                          <div className="text-xs text-gray-500">Supplier</div>
      </div>
    </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatMedicationDate(medication.expiryDate)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {format(new Date(medication.expiryDate), 'yyyy-MM-dd')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StatusIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            medication.status
                          )}`}
                        >
                          {medication.status.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-[#004D99] hover:text-[#003d80] transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-800 transition-colors">
                          <ShoppingCart className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {sortedMedications.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Pill className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No medications found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter
                ? 'Try adjusting your search filters or clear all filters to see all medications.'
                : 'No medications have been added yet. Add your first medication to get started.'}
            </p>
            {(searchTerm || statusFilter) && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('')
                }}
                className="bg-[#004D99] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#003d80] transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default PharmacyManagement