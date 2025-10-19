import React, { useState, useEffect } from 'react'
import {
  CreditCard,
  Plus,
  Search,
  DollarSign,
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
  Receipt,
  AlertTriangle,
  Zap,
  Download,
  X,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { format, isToday, isTomorrow, isYesterday, parseISO } from 'date-fns'
import { invoicesAPI, clinicsAPI } from '../../services/api'
import * as XLSX from 'xlsx'

const BillingInsurance = () => {
  const { user } = useAuth()
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('latest')
  const [clinics, setClinics] = useState([])
  const [paymentMethods, setPaymentMethods] = useState([])
  const [selectedBill, setSelectedBill] = useState(null)
  const [showBillModal, setShowBillModal] = useState(false)

  // Enhanced search filters
  const [filters, setFilters] = useState({
    patientName: '',
    clinic: '',
    amountRange: '',
    billDate: '',
    paymentMethod: '',
  })
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    totalRevenue: 0,
    clinics: 0,
  })

  // Mock data for demonstration
  const mockBills = [
    {
      _id: '1',
      patientName: 'John Doe',
      patientId: 'P001',
      clinic: 'City Medical Center',
      amount: 1500,
      paidAmount: 1500,
      billDate: '2025-01-15',
      dueDate: '2025-01-20',
      paymentMethod: 'Insurance',
      status: 'paid',
      services: ['Consultation', 'Lab Test'],
    },
    {
      _id: '2',
      patientName: 'Jane Smith',
      patientId: 'P002',
      clinic: 'City Medical Center',
      amount: 2500,
      paidAmount: 0,
      billDate: '2025-01-14',
      dueDate: '2025-01-19',
      paymentMethod: 'Self Pay',
      status: 'pending',
      services: ['Consultation', 'X-Ray'],
    },
    {
      _id: '3',
      patientName: 'Mike Johnson',
      patientId: 'P003',
      clinic: 'City Medical Center',
      amount: 800,
      paidAmount: 0,
      billDate: '2025-01-10',
      dueDate: '2025-01-15',
      paymentMethod: 'Insurance',
      status: 'overdue',
      services: ['Consultation'],
    },
    {
      _id: '4',
      patientName: 'Sarah Wilson',
      patientId: 'P004',
      clinic: 'City Medical Center',
      amount: 3200,
      paidAmount: 1600,
      billDate: '2025-01-12',
      dueDate: '2025-01-17',
      paymentMethod: 'Insurance',
      status: 'partially_paid',
      services: ['Consultation', 'Lab Test', 'MRI'],
    },
    {
      _id: '5',
      patientName: 'David Brown',
      patientId: 'P005',
      clinic: 'City Medical Center',
      amount: 1200,
      paidAmount: 1200,
      billDate: '2025-01-13',
      dueDate: '2025-01-18',
      paymentMethod: 'Self Pay',
      status: 'paid',
      services: ['Consultation', 'Prescription'],
    },
  ]

  useEffect(() => {
    fetchBills()
    fetchClinics()
    extractPaymentMethods()
  }, [])

  const fetchBills = async () => {
    setLoading(true)
    try {
      // Fetch real invoices data from API
      const response = await invoicesAPI.getAll()
      console.log('Invoices API Response:', response?.data)
      
      if (response?.data?.success) {
        const invoicesData = response.data.invoices || response.data.data || response.data
        
        // Map invoice data to our component format with all database fields
        const mappedBills = Array.isArray(invoicesData) ? invoicesData.map(invoice => ({
          _id: invoice._id,
          patientId: invoice.patientId,
          patientName: invoice.patientName || 'Unknown Patient',
          clinicId: invoice.clinicId,
          clinic: invoice.clinicName || invoice.clinic?.name || 'Unknown Clinic',
          lineItems: invoice.lineItems || [],
          total: invoice.total || 0,
          amount: invoice.totalAmount || invoice.amount || invoice.total || 0,
          paidAmount: invoice.paidAmount || invoice.paid || 0,
          date: invoice.date || invoice.invoiceDate || invoice.billDate || new Date().toISOString().split('T')[0],
          invoiceNo: invoice.invoiceNo || invoice.invoiceNumber || invoice._id,
          invoiceNumber: invoice.invoiceNo || invoice.invoiceNumber || invoice._id,
          address: invoice.address || {},
          phone: invoice.phone || 'N/A',
          email: invoice.email || 'N/A',
          remarks: invoice.remarks || '',
          discount: invoice.discount || 0,
          tax: invoice.tax || 0,
          shipping: invoice.shipping || 0,
          status: invoice.status || 'pending',
          createdAt: invoice.createdAt || new Date().toISOString(),
          approvedAt: invoice.approvedAt || null,
          approvedBy: invoice.approvedBy || null,
          paymentMethod: invoice.paymentMethod || invoice.paymentType || 'Not Specified',
          services: invoice.services || invoice.serviceItems || ['General Service'],
          description: invoice.description || invoice.notes || 'No description',
          billDate: invoice.date || invoice.invoiceDate || invoice.billDate || new Date().toISOString(),
          dueDate: invoice.dueDate || invoice.paymentDueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })) : []
        
        console.log('Mapped bills data:', mappedBills)
        setBills(mappedBills)
        calculateStats(mappedBills)
        // Extract payment methods from the new bills data
        const methods = [...new Set(mappedBills.map(bill => bill.paymentMethod).filter(Boolean))]
        setPaymentMethods(methods)
        
        if (mappedBills.length > 0) {
          toast.success(`Loaded ${mappedBills.length} invoices`)
      } else {
          toast('No invoices found in the database', { icon: 'ℹ️' })
        }
        } else {
        console.error('API response not successful:', response?.data)
        toast.error(response?.data?.message || 'Failed to load invoices')
        // Fallback to mock data if API fails
        setBills(mockBills)
        calculateStats(mockBills)
      }
    } catch (error) {
      console.error('Error fetching invoices:', error)
      setError(error.message || 'Failed to fetch invoices')
      if (error.response) {
        console.error('Error response:', error.response.data)
        toast.error(error.response.data.message || 'Failed to load invoices data')
      } else {
        toast.error('Network error: Failed to connect to server')
      }
      // Fallback to mock data on error
      setBills(mockBills)
      calculateStats(mockBills)
    } finally {
      setLoading(false)
    }
  }

  const fetchClinics = async () => {
    try {
      const response = await clinicsAPI.getAll()
      if (response?.data?.success) {
        const clinicsData = response.data.clinics || response.data.data || response.data
        setClinics(Array.isArray(clinicsData) ? clinicsData : [])
      }
    } catch (error) {
      console.error('Error fetching clinics:', error)
      // Set default clinics if API fails
      setClinics([
        { _id: '1', name: 'City Medical Center' },
        { _id: '2', name: 'Downtown Medical Center' },
        { _id: '3', name: 'Westside Health Clinic' },
        { _id: '4', name: 'Central Medical Group' }
      ])
    }
  }

  const extractPaymentMethods = () => {
    // Extract unique payment methods from bills data
    const methods = [...new Set(bills.map(bill => bill.paymentMethod).filter(Boolean))]
    setPaymentMethods(methods)
  }

  const handleViewBill = (bill) => {
    console.log('Opening bill modal for:', bill)
    setSelectedBill(bill)
    setShowBillModal(true)
  }

  const downloadInvoice = (bill) => {
    try {
      // Create invoice data for Excel
      const invoiceData = [
        ['Invoice Details'],
        ['Invoice Number:', bill.invoiceNumber],
        ['Patient Name:', bill.patientName],
        ['Patient ID:', bill.patientId],
        ['Clinic:', bill.clinic],
        [''],
        ['Billing Information'],
        ['Total Amount:', `₹${bill.amount}`],
        ['Paid Amount:', `₹${bill.paidAmount}`],
        ['Balance:', `₹${bill.amount - bill.paidAmount}`],
        ['Payment Method:', bill.paymentMethod],
        ['Status:', bill.status.toUpperCase()],
        [''],
        ['Dates'],
        ['Bill Date:', format(new Date(bill.billDate), 'dd/MM/yyyy')],
        ['Due Date:', format(new Date(bill.dueDate), 'dd/MM/yyyy')],
        [''],
        ['Services'],
        ...bill.services.map(service => [service]),
        [''],
        ['Description:', bill.description]
      ]

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(invoiceData)
      
      // Set column widths
      ws['!cols'] = [{ width: 20 }, { width: 30 }]
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Invoice')
      
      // Generate filename
      const filename = `Invoice_${bill.invoiceNumber}_${bill.patientName.replace(/\s+/g, '_')}.xlsx`
      
      // Download the file
      XLSX.writeFile(wb, filename)
      
      toast.success(`Invoice ${bill.invoiceNumber} downloaded successfully`)
    } catch (error) {
      console.error('Error downloading invoice:', error)
      toast.error('Failed to download invoice')
    }
  }

  const calculateStats = (billsData) => {
    const stats = {
      total: billsData.length,
      paid: billsData.filter((bill) => bill.status === 'paid').length,
      pending: billsData.filter((bill) => bill.status === 'pending').length,
      overdue: billsData.filter((bill) => bill.status === 'overdue').length,
      totalRevenue: billsData.reduce((sum, bill) => sum + bill.paidAmount, 0),
      clinics: [...new Set(billsData.map((bill) => bill.clinic))].length,
    }

    setStats(stats)
  }

  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.clinic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bill.status?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === '' || bill.status === statusFilter

    // Enhanced individual field filters
    const matchesPatientName =
      !filters.patientName ||
      bill.patientName?.toLowerCase().includes(filters.patientName.toLowerCase())

    const matchesClinic =
      !filters.clinic ||
      bill.clinic?.toLowerCase().includes(filters.clinic.toLowerCase())

    const matchesAmountRange = () => {
      if (!filters.amountRange) return true
      switch (filters.amountRange) {
        case 'low':
          return bill.amount < 1000
        case 'medium':
          return bill.amount >= 1000 && bill.amount < 3000
        case 'high':
          return bill.amount >= 3000
        default:
          return true
      }
    }

    const matchesBillDate =
      !filters.billDate ||
      new Date(bill.billDate).toISOString().split('T')[0] === filters.billDate

    const matchesPaymentMethod =
      !filters.paymentMethod ||
      bill.paymentMethod?.toLowerCase().includes(filters.paymentMethod.toLowerCase())

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPatientName &&
      matchesClinic &&
      matchesAmountRange() &&
      matchesBillDate &&
      matchesPaymentMethod
    )
  })

  // Sort filtered bills
  const sortedBills = [...filteredBills].sort((a, b) => {
    switch (sortBy) {
      case 'latest':
        return new Date(b.billDate) - new Date(a.billDate)
      case 'oldest':
        return new Date(a.billDate) - new Date(b.billDate)
      case 'patient':
        return a.patientName.localeCompare(b.patientName)
      case 'amount_desc':
        return b.amount - a.amount
      case 'amount_asc':
        return a.amount - b.amount
      case 'due_date':
        return new Date(a.dueDate) - new Date(b.dueDate)
      case 'status':
        return a.status.localeCompare(b.status)
      default:
        return 0
    }
  })

  const getStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      partially_paid: 'bg-blue-100 text-blue-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusIcon = (status) => {
    const icons = {
      paid: CheckCircle,
      pending: Clock,
      overdue: AlertTriangle,
      partially_paid: AlertCircle,
    }
    return icons[status] || AlertCircle
  }

  const formatBillDate = (date) => {
    const billDate = new Date(date)
    if (isToday(billDate)) {
      return 'Today'
    } else if (isTomorrow(billDate)) {
      return 'Tomorrow'
    } else if (isYesterday(billDate)) {
      return 'Yesterday'
    } else {
      return format(billDate, 'MMM dd, yyyy')
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-blue-50/20 to-indigo-50/10 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004D99] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading billing data...</p>
            </div>
          </div>
        </div>
            </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50/80 via-blue-50/20 to-indigo-50/10 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={() => {
                  setError(null)
                  fetchBills()
                }}
                className="bg-[#004D99] text-white px-4 py-2 rounded-lg hover:bg-[#003d80] transition-colors"
              >
                Try Again
              </button>
          </div>
        </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#e6f0ff] to-[#e6f7f5] rounded-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Insurance Management</h1>
            <p className="text-gray-600 mt-2">
              {user.role === 'patient'
                ? 'Your billing history and insurance claims'
                : 'Comprehensive billing and insurance management system'}
              </p>
            </div>
          <div className="flex gap-3">
            <button
              onClick={fetchBills}
              className="bg-white/80 backdrop-blur text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-white transition-all flex items-center shadow-sm border border-gray-200"
            >
              <Activity className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
            {(user.role === 'super_master_admin' || user.role === 'clinic_admin') && (
              <button className="bg-gradient-to-r from-[#004D99] to-[#42A89B] text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-[#003d80] hover:to-[#3a7d92] transition-all flex items-center shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bills"
          value={stats.total}
          icon={CreditCard}
          color="bg-[#004D99]"
          description="All bills in system"
        />
        <StatCard
          title="Paid Bills"
          value={stats.paid}
          icon={CheckCircle}
          color="bg-green-500"
          description="Successfully paid"
        />
        <StatCard
          title="Pending Bills"
          value={stats.pending}
          icon={AlertTriangle}
          color="bg-yellow-500"
          description="Awaiting payment"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          color="bg-purple-500"
          description="Collected amount"
        />
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
              {(filters.patientName ||
                filters.clinic ||
                filters.amountRange ||
                filters.billDate ||
                filters.paymentMethod) && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {[filters.patientName, filters.clinic, filters.amountRange, filters.billDate, filters.paymentMethod].filter(Boolean).length}
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
              <option value="patient">Patient Name (A-Z)</option>
              <option value="amount_desc">Amount (High to Low)</option>
              <option value="amount_asc">Amount (Low to High)</option>
              <option value="due_date">Due Date</option>
              <option value="status">Status</option>
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
              {/* Patient Name Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Patient Name
                </label>
                <input
                  type="text"
                  placeholder="Search by patient name..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  value={filters.patientName}
                  onChange={(e) => setFilters((prev) => ({ ...prev, patientName: e.target.value }))}
                />
          </div>

              {/* Clinic Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="h-4 w-4 inline mr-1" />
                  Clinic
                </label>
          <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  value={filters.clinic}
                  onChange={(e) => setFilters((prev) => ({ ...prev, clinic: e.target.value }))}
                >
                  <option value="">All Clinics</option>
                  {clinics.map((clinic) => (
                    <option key={clinic._id} value={clinic.name}>
                      {clinic.name}
                    </option>
                  ))}
          </select>
                        </div>

              {/* Amount Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Amount Range
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  value={filters.amountRange}
                  onChange={(e) => setFilters((prev) => ({ ...prev, amountRange: e.target.value }))}
                >
                  <option value="">All Amounts</option>
                  <option value="low">Low (₹0 - ₹1,000)</option>
                  <option value="medium">Medium (₹1,000 - ₹3,000)</option>
                  <option value="high">High (₹3,000+)</option>
                </select>
                          </div>

              {/* Bill Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Bill Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  value={filters.billDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, billDate: e.target.value }))}
                />
                      </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="h-4 w-4 inline mr-1" />
                  Payment Method
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  value={filters.paymentMethod}
                  onChange={(e) => setFilters((prev) => ({ ...prev, paymentMethod: e.target.value }))}
                >
                  <option value="">All Payment Methods</option>
                  {paymentMethods.map((method, index) => (
                    <option key={index} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
                      </div>
                      </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {filteredBills.length} of {bills.length} bills found
              </div>
              <div className="flex gap-2">
                        <button
                  onClick={() => {
                    setFilters({
                      patientName: '',
                      clinic: '',
                      amountRange: '',
                      billDate: '',
                      paymentMethod: '',
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

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-1 h-6 bg-[#004D99] rounded-full mr-3"></div>
            Payment Status
            </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Paid</span>
          </div>
              <span className="text-sm font-semibold text-gray-900">{stats.paid}</span>
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
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Overdue</span>
            </div>
              <span className="text-sm font-semibold text-gray-900">{stats.overdue}</span>
                  </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Partially Paid</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {bills.filter((bill) => bill.status === 'partially_paid').length}
                    </span>
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
              <span className="text-sm">View Pending Bills</span>
            </button>
            <button
              onClick={() => setStatusFilter('overdue')}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <AlertTriangle className="h-4 w-4 mr-3 text-[#004D99]" />
              <span className="text-sm">Overdue Bills</span>
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <CheckCircle className="h-4 w-4 mr-3 text-[#004D99]" />
              <span className="text-sm">Paid Bills</span>
            </button>
                </div>
                  </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-1 h-6 bg-gradient-to-b from-[#004D99] to-[#42A89B] rounded-full mr-3"></div>
            Recent Activity
          </h3>
          <div className="space-y-3">
            {bills.slice(0, 3).map((bill, index) => {
              const StatusIcon = getStatusIcon(bill.status)
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#004D99] to-[#42A89B] rounded-full flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{bill.patientName}</p>
                    <p className="text-xs text-gray-500">
                      {bill.clinic} • ₹{bill.amount}
                    </p>
                  </div>
                  <StatusIcon className="h-4 w-4 text-gray-400" />
                </div>
              )
            })}
                  </div>
        </div>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-[#004D99] to-[#42A89B] rounded-full mr-3"></div>
              Bills List ({sortedBills.length})
          </h3>
            <div className="text-sm text-gray-600">
              Sorted by:{' '}
              <span className="font-medium text-[#004D99]">
                {sortBy === 'latest'
                  ? 'Latest First'
                  : sortBy === 'oldest'
                  ? 'Oldest First'
                  : sortBy === 'patient'
                  ? 'Patient Name (A-Z)'
                  : sortBy === 'amount_desc'
                  ? 'Amount (High to Low)'
                  : sortBy === 'amount_asc'
                  ? 'Amount (Low to High)'
                  : sortBy === 'due_date'
                  ? 'Due Date'
                  : sortBy === 'status'
                  ? 'Status'
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
                    <User className="h-4 w-4 mr-2 text-[#004D99]" />
                    Patient Details
                  </div>
                  </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-[#004D99]" />
                    Clinic & Services
                </div>
                  </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2 text-[#004D99]" />
                    Amount Details
              </div>
                  </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-[#004D99]" />
                    Dates
                  </div>
                  </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 text-[#004D99]" />
                    Payment Method
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
              {sortedBills.map((bill) => {
                const StatusIcon = getStatusIcon(bill.status)
                return (
                  <tr
                    key={bill._id}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 border-l-4 border-transparent hover:border-[#004D99] cursor-pointer"
                    onClick={() => handleViewBill(bill)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{bill.patientName}</div>
                          <div className="text-xs text-gray-500">ID: {bill.patientId}</div>
                          <div className="text-xs text-gray-400">Invoice: {bill.invoiceNumber}</div>
                          </div>
                          </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-green-600" />
                          </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{bill.clinic}</div>
                          <div className="text-xs text-gray-500">{bill.services.join(', ')}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">₹{bill.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">Paid: ₹{bill.paidAmount.toLocaleString()}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Balance: ₹{(bill.amount - bill.paidAmount).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                        {formatBillDate(bill.billDate)}
                          </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Due: {format(new Date(bill.dueDate), 'MMM dd, yyyy')}
                          </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-purple-600" />
                      </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{bill.paymentMethod}</div>
                          <div className="text-xs text-gray-500">Payment Type</div>
                      </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <StatusIcon className="h-4 w-4 mr-2 text-gray-400" />
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          bill.status
                          )}`}
                      >
                          {bill.status.replace(/([A-Z])/g, ' $1').trim().toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewBill(bill);
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadInvoice(bill);
                          }}
                          className="text-[#004D99] hover:text-[#003d80] transition-colors"
                          title="Download Invoice"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              </tbody>
            </table>
          </div>

        {sortedBills.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter
                ? 'Try adjusting your search filters or clear all filters to see all bills.'
                : 'No bills have been created yet. Create your first bill to get started.'}
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

      {/* Bill Details Modal */}
      {showBillModal && selectedBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 relative overflow-hidden max-h-[90vh] border border-gray-100">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-6 relative">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                onClick={() => setShowBillModal(false)}
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-xl">
                  <CreditCard className="h-8 w-8 text-gray-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Invoice #{selectedBill.invoiceNo || selectedBill.invoiceNumber || 'N/A'}
                  </h2>
                  <p className="text-gray-600">{selectedBill.patientName || 'Unknown Patient'}</p>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Status Badge */}
              <div className="mb-6">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                    selectedBill.status === 'paid' || selectedBill.status === 'Approved'
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : selectedBill.status === 'pending'
                      ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      selectedBill.status === 'paid' || selectedBill.status === 'Approved'
                        ? "bg-green-500"
                        : selectedBill.status === 'pending'
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                    }`}
                  ></div>
                  {selectedBill.status === 'Approved' ? 'Approved' : (selectedBill.status || 'Unknown').toUpperCase()}
                </span>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Patient Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                      Patient Information
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-500">
                          Patient Name
                        </label>
                        <p className="text-gray-900 font-semibold">
                          {selectedBill.patientName || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-500">
                          Patient ID
                        </label>
                        <p className="text-gray-900 font-semibold">
                          {selectedBill.patientId || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-500">
                          Phone
                        </label>
                        <p className="text-gray-900 font-semibold">
                          {selectedBill.phone || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-500">
                          Email
                        </label>
                        <p className="text-gray-900 font-semibold">
                          {selectedBill.email || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  {selectedBill.address && Object.keys(selectedBill.address).length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                        Address Information
                      </h3>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <label className="text-sm font-medium text-gray-500">
                            Address
                          </label>
                          <p className="text-gray-900 font-semibold">
                            {selectedBill.address.line1 || 'N/A'}
                          </p>
                          {selectedBill.address.line2 && (
                            <p className="text-gray-600 text-sm">
                              {selectedBill.address.line2}
                            </p>
                          )}
                          <p className="text-gray-600 text-sm">
                            {selectedBill.address.city || 'N/A'}, {selectedBill.address.state || 'N/A'} {selectedBill.address.zipCode || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Invoice Information */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                      Invoice Details
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-500">
                          Invoice Number
                        </label>
                        <p className="text-gray-900 font-semibold">
                          {selectedBill.invoiceNo || selectedBill.invoiceNumber || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-500">
                          Clinic
                        </label>
                        <p className="text-gray-900 font-semibold">
                          {selectedBill.clinic || 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-500">
                          Date
                        </label>
                        <p className="text-gray-900 font-semibold">
                          {selectedBill.date ? format(new Date(selectedBill.date), 'dd/MM/yyyy') : 'N/A'}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-500">
                          Payment Method
                        </label>
                        <p className="text-gray-900 font-semibold">
                          {selectedBill.paymentMethod || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                      Financial Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-500">
                          Total Amount
                        </label>
                        <p className="text-gray-900 font-semibold text-lg">
                          ₹{selectedBill.total || selectedBill.amount || 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-500">
                          Paid Amount
                        </label>
                        <p className="text-green-600 font-semibold">
                          ₹{selectedBill.paidAmount || 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-xl">
                        <label className="text-sm font-medium text-gray-500">
                          Balance
                        </label>
                        <p className="text-red-600 font-semibold">
                          ₹{(selectedBill.total || selectedBill.amount || 0) - (selectedBill.paidAmount || 0)}
                        </p>
                      </div>
                      {(selectedBill.discount || 0) > 0 && (
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <label className="text-sm font-medium text-gray-500">
                            Discount
                          </label>
                          <p className="text-green-600 font-semibold">
                            -₹{selectedBill.discount}
                          </p>
                        </div>
                      )}
                      {(selectedBill.tax || 0) > 0 && (
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <label className="text-sm font-medium text-gray-500">
                            Tax
                          </label>
                          <p className="text-gray-900 font-semibold">
                            ₹{selectedBill.tax}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              {selectedBill.lineItems && selectedBill.lineItems.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                    Line Items
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 font-medium text-gray-600">Description</th>
                            <th className="text-left py-3 font-medium text-gray-600">Quantity</th>
                            <th className="text-left py-3 font-medium text-gray-600">Unit Price</th>
                            <th className="text-left py-3 font-medium text-gray-600">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedBill.lineItems.map((item, index) => (
                            <tr key={index} className="border-b border-gray-100">
                              <td className="py-3 text-gray-900 font-medium">{item.description || 'N/A'}</td>
                              <td className="py-3 text-gray-900">{item.qty || 0}</td>
                              <td className="py-3 text-gray-900">₹{item.unitPrice || 0}</td>
                              <td className="py-3 text-gray-900 font-semibold">₹{(item.qty || 0) * (item.unitPrice || 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-gray-500">
                      Created At
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {selectedBill.createdAt ? format(new Date(selectedBill.createdAt), 'dd/MM/yyyy HH:mm') : 'N/A'}
                    </p>
                  </div>
                  {selectedBill.approvedAt && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-500">
                        Approved At
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {format(new Date(selectedBill.approvedAt), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  )}
                  {selectedBill.remarks && (
                    <div className="lg:col-span-2 bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-500">
                        Remarks
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {selectedBill.remarks}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-8 py-6">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowBillModal(false)}
                  className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    downloadInvoice(selectedBill)
                    setShowBillModal(false)
                  }}
                  className="px-6 py-2 bg-[#004D99] text-white rounded-lg hover:bg-[#003d80] transition-colors flex items-center font-medium"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BillingInsurance