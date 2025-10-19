import React, { useState, useEffect } from 'react'
import {
  BarChart3,
  Plus,
  Search,
  TrendingUp,
  Activity,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  Building2,
  Filter,
  Eye,
  Edit,
  Trash2,
  Clock,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  Zap,
  PieChart,
  LineChart,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'

const ReportsAnalytics = () => {
  const { user } = useAuth()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('latest')

  // Enhanced search filters
  const [filters, setFilters] = useState({
    reportName: '',
    category: '',
    dateRange: '',
    department: '',
    status: '',
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    generated: 0,
    pending: 0,
    scheduled: 0,
    totalViews: 0,
    departments: 0,
  })

  // Empty data for demonstration
  const mockReports = []

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    setLoading(true)
    try {
      // Simulate API call
      setTimeout(() => {
        setReports(mockReports)
        calculateStats(mockReports)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching reports:', error)
      toast.error('Failed to fetch reports')
      setLoading(false)
    }
  }

  const calculateStats = (reportsData) => {
    const stats = {
      total: reportsData.length,
      generated: reportsData.filter((report) => report.status === 'generated').length,
      pending: reportsData.filter((report) => report.status === 'pending').length,
      scheduled: reportsData.filter((report) => report.status === 'scheduled').length,
      totalViews: reportsData.reduce((sum, report) => sum + (report.views || 0), 0),
      departments: [...new Set(reportsData.map((report) => report.department))].length,
    }

    setStats(stats)
  }

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.status?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === '' || report.status === statusFilter

    // Enhanced individual field filters
    const matchesReportName =
      !filters.reportName ||
      report.name?.toLowerCase().includes(filters.reportName.toLowerCase())

    const matchesCategory =
      !filters.category ||
      report.category?.toLowerCase().includes(filters.category.toLowerCase())

    const matchesDateRange =
      !filters.dateRange ||
      new Date(report.createdAt).toISOString().split('T')[0] === filters.dateRange

    const matchesDepartment =
      !filters.department ||
      report.department?.toLowerCase().includes(filters.department.toLowerCase())

    const matchesStatusFilter =
      !filters.status ||
      report.status?.toLowerCase().includes(filters.status.toLowerCase())

    return (
      matchesSearch &&
      matchesStatus &&
      matchesReportName &&
      matchesCategory &&
      matchesDateRange &&
      matchesDepartment &&
      matchesStatusFilter
    )
  })

  // Sort filtered reports
  const sortedReports = [...filteredReports].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt)
      case 'oldest':
        return new Date(a.createdAt || a.updatedAt) - new Date(b.createdAt || b.updatedAt)
      case 'name':
        return a.name.localeCompare(b.name)
      case 'views_desc':
        return (b.views || 0) - (a.views || 0)
      case 'views_asc':
        return (a.views || 0) - (b.views || 0)
      default:
        return 0
    }
  })

  const getStatusColor = (status) => {
    const colors = {
      generated: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    const icons = {
      generated: CheckCircle,
      pending: Clock,
      scheduled: Calendar,
      failed: XCircle,
    }
    return icons[status] || AlertCircle
  }

  const formatReportDate = (date) => {
    const reportDate = new Date(date)
    if (isToday(reportDate)) {
      return 'Today'
    } else if (isTomorrow(reportDate)) {
      return 'Tomorrow'
    } else if (isYesterday(reportDate)) {
      return 'Yesterday'
    } else {
      return format(reportDate, 'MMM dd, yyyy')
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
            <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-2">
              {user.role === 'patient'
                ? 'Your personal health reports and analytics'
                : 'Comprehensive reporting and analytics dashboard for healthcare insights'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchReports}
              className="bg-white/80 backdrop-blur text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-white transition-all flex items-center shadow-sm border border-gray-200"
            >
              <Activity className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
            {(user.role === 'super_master_admin' || user.role === 'clinic_admin') && (
              <button className="bg-gradient-to-r from-[#004D99] to-[#42A89B] text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-[#003d80] hover:to-[#3a7d92] transition-all flex items-center shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Generate Report
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Reports"
          value={stats.total}
          icon={FileText}
          color="bg-[#004D99]"
          description="All generated reports"
        />
        <StatCard
          title="Generated"
          value={stats.generated}
          icon={CheckCircle}
          color="bg-green-500"
          description="Successfully generated"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          color="bg-yellow-500"
          description="Awaiting generation"
        />
        <StatCard
          title="Total Views"
          value={stats.totalViews}
          icon={Eye}
          color="bg-purple-500"
          description="Report interactions"
        />
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-1 h-6 bg-[#004D99] rounded-full mr-3"></div>
            Report Status
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Generated</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.generated}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Pending</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Scheduled</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{stats.scheduled}</span>
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
              onClick={() => setStatusFilter('pending')}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <Clock className="h-4 w-4 mr-3 text-[#004D99]" />
              <span className="text-sm">View Pending Reports</span>
            </button>
            <button
              onClick={() => setStatusFilter('generated')}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <CheckCircle className="h-4 w-4 mr-3 text-[#004D99]" />
              <span className="text-sm">Generated Reports</span>
            </button>
            <button
              onClick={() => setStatusFilter('scheduled')}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <Calendar className="h-4 w-4 mr-3 text-[#004D99]" />
              <span className="text-sm">Scheduled Reports</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-1 h-6 bg-gradient-to-b from-[#004D99] to-[#42A89B] rounded-full mr-3"></div>
            Recent Activity
          </h3>
          <div className="space-y-3">
            {reports.slice(0, 3).map((report, index) => {
              const StatusIcon = getStatusIcon(report.status)
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#004D99] to-[#42A89B] rounded-full flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{report.name}</p>
                    <p className="text-xs text-gray-500">
                      {report.category} • Views: {report.views || 0}
                    </p>
                  </div>
                  <StatusIcon className="h-4 w-4 text-gray-400" />
                </div>
              )
            })}
            {reports.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No recent activity</p>
              </div>
            )}
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
              {(filters.reportName ||
                filters.category ||
                filters.dateRange ||
                filters.department ||
                filters.status) && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {[filters.reportName, filters.category, filters.dateRange, filters.department, filters.status].filter(Boolean).length}
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
              <option value="views_desc">Views (High to Low)</option>
              <option value="views_asc">Views (Low to High)</option>
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
              {/* Report Name Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="h-4 w-4 inline mr-1" />
                  Report Name
                </label>
                <input
                  type="text"
                  placeholder="Search by report name..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  value={filters.reportName}
                  onChange={(e) => setFilters((prev) => ({ ...prev, reportName: e.target.value }))}
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <BarChart3 className="h-4 w-4 inline mr-1" />
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

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Date Range
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  value={filters.dateRange}
                  onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: e.target.value }))}
                />
              </div>

              {/* Department Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="h-4 w-4 inline mr-1" />
                  Department
                </label>
                <input
                  type="text"
                  placeholder="Search by department..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  value={filters.department}
                  onChange={(e) => setFilters((prev) => ({ ...prev, department: e.target.value }))}
                />
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Activity className="h-4 w-4 inline mr-1" />
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  value={filters.status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                >
                  <option value="">All Status</option>
                  <option value="generated">Generated</option>
                  <option value="pending">Pending</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {filteredReports.length} of {reports.length} reports found
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFilters({
                      reportName: '',
                      category: '',
                      dateRange: '',
                      department: '',
                      status: '',
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

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-[#004D99] to-[#42A89B] rounded-full mr-3"></div>
              Reports List ({sortedReports.length})
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
                  : sortBy === 'views_desc'
                  ? 'Views (High to Low)'
                  : sortBy === 'views_asc'
                  ? 'Views (Low to High)'
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
                    <FileText className="h-4 w-4 mr-2 text-[#004D99]" />
                    Report
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2 text-[#004D99]" />
                    Category
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-[#004D99]" />
                    Department
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-[#004D99]" />
                    Generated Date
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Eye className="h-4 w-4 mr-2 text-[#004D99]" />
                    Views
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
              {sortedReports.map((report) => {
                const StatusIcon = getStatusIcon(report.status)
                return (
                  <tr
                    key={report._id}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 border-l-4 border-transparent hover:border-[#004D99]"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{report.name}</div>
                          <div className="text-xs text-gray-500">Report ID: {report.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <BarChart3 className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{report.category}</div>
                          <div className="text-xs text-gray-500">Analytics Category</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{report.department}</div>
                          <div className="text-xs text-gray-500">Department</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatReportDate(report.createdAt)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {format(new Date(report.createdAt), 'yyyy-MM-dd')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{report.views || 0}</div>
                      <div className="text-xs text-gray-500">Total views</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StatusIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {report.status.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-[#004D99] hover:text-[#003d80] transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-800 transition-colors">
                          <FileText className="h-4 w-4" />
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

        {sortedReports.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter
                ? 'Try adjusting your search filters or clear all filters to see all reports.'
                : 'No reports have been generated yet. Generate your first report to get started.'}
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

export default ReportsAnalytics
