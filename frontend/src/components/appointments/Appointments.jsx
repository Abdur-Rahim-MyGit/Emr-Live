import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Search,
  Clock,
  User,
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
} from "lucide-react";
import { appointmentsAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-hot-toast";
import { format, isToday, isTomorrow, isYesterday, parseISO } from "date-fns";

const Appointments = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [appointmentTypeFilter, setAppointmentTypeFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("latest");

  // Enhanced search filters
  const [filters, setFilters] = useState({
    patientName: "",
    clinic: "",
    doctor: "",
    specificDate: "",
    priority: "",
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const response = await appointmentsAPI.getAll();
      if (response.data.success) {
        const appointmentsData = response.data.appointments || [];
        setAppointments(appointmentsData);
        calculateStats(appointmentsData);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (appointmentsData) => {
    const today = new Date();
    const todayStr = today.toISOString().split("T")[0];

    const stats = {
      total: appointmentsData.length,
      scheduled: appointmentsData.filter((apt) => apt.status === "Pending")
        .length,
      confirmed: appointmentsData.filter((apt) => apt.status === "Confirmed")
        .length,
      completed: appointmentsData.filter((apt) => apt.status === "Completed")
        .length,
      cancelled: appointmentsData.filter(
        (apt) => apt.status === "Cancelled" || apt.status === "No Show"
      ).length,
      todayAppointments: appointmentsData.filter((apt) => {
        const aptDate = new Date(apt.date).toISOString().split("T")[0];
        return aptDate === todayStr;
      }).length,
      upcomingAppointments: appointmentsData.filter((apt) => {
        const aptDate = new Date(apt.date);
        return (
          aptDate > today &&
          (apt.status === "Pending" || apt.status === "Confirmed")
        );
      }).length,
    };

    setStats(stats);
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      (appointment.patientId?.fullName || appointment.patientName || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.doctorId?.fullName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.clinicId?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.reason?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.appointmentType
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "" || appointment.status === statusFilter;

    const matchesType =
      appointmentTypeFilter === "" ||
      appointment.appointmentType === appointmentTypeFilter;

    const matchesDate = () => {
      if (dateFilter === "") return true;
      const appointmentDate = new Date(appointment.date);
      const today = new Date();

      switch (dateFilter) {
        case "today":
          return isToday(appointmentDate);
        case "tomorrow":
          return isTomorrow(appointmentDate);
        case "yesterday":
          return isYesterday(appointmentDate);
        case "upcoming":
          return appointmentDate > today;
        case "past":
          return appointmentDate < today;
        default:
          return true;
      }
    };

    // Enhanced individual field filters
    const matchesPatientName =
      !filters.patientName ||
      (appointment.patientId?.fullName || appointment.patientName || "")
        .toLowerCase()
        .includes(filters.patientName.toLowerCase());

    const matchesClinic =
      !filters.clinic ||
      appointment.clinicId?.name
        ?.toLowerCase()
        .includes(filters.clinic.toLowerCase());

    const matchesDoctor =
      !filters.doctor ||
      appointment.doctorId?.fullName
        ?.toLowerCase()
        .includes(filters.doctor.toLowerCase());

    const matchesSpecificDate =
      !filters.specificDate ||
      new Date(appointment.date).toISOString().split("T")[0] ===
        filters.specificDate;

    const matchesPriority =
      !filters.priority ||
      filters.priority === "all" ||
      (appointment.priority || "low").toLowerCase() ===
        filters.priority.toLowerCase();

    return (
      matchesSearch &&
      matchesStatus &&
      matchesType &&
      matchesDate() &&
      matchesPatientName &&
      matchesClinic &&
      matchesDoctor &&
      matchesSpecificDate &&
      matchesPriority
    );
  });

  // Sort filtered appointments
  const sortedAppointments = [...filteredAppointments].sort((a, b) => {
    switch (sortBy) {
      case "latest":
        // Sort by creation date (latest first), then by appointment date (latest first)
        const createdAtDiff =
          new Date(b.createdAt || b.updatedAt) -
          new Date(a.createdAt || a.updatedAt);
        if (createdAtDiff !== 0) return createdAtDiff;
        return new Date(b.date) - new Date(a.date);

      case "oldest":
        // Sort by creation date (oldest first), then by appointment date (oldest first)
        const createdAtDiffOld =
          new Date(a.createdAt || a.updatedAt) -
          new Date(b.createdAt || b.updatedAt);
        if (createdAtDiffOld !== 0) return createdAtDiffOld;
        return new Date(a.date) - new Date(b.date);

      case "appointment_date_asc":
        // Sort by appointment date (earliest first)
        return new Date(a.date) - new Date(b.date);

      case "appointment_date_desc":
        // Sort by appointment date (latest first)
        return new Date(b.date) - new Date(a.date);

      case "patient_name":
        // Sort by patient name alphabetically
        const nameA = a.patientId?.fullName || a.patientName || "";
        const nameB = b.patientId?.fullName || b.patientName || "";
        return nameA.localeCompare(nameB);

      case "status":
        // Sort by status
        return (a.status || "").localeCompare(b.status || "");

      default:
        return 0;
    }
  });

  const getStatusColor = (status) => {
    const colors = {
      Pending: "bg-blue-100 text-blue-800",
      Confirmed: "bg-green-100 text-green-800",
      "In Progress": "bg-yellow-100 text-yellow-800",
      Completed: "bg-gray-100 text-gray-800",
      Cancelled: "bg-red-100 text-red-800",
      "No Show": "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      normal: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const formatAppointmentDate = (date) => {
    const appointmentDate = new Date(date);
    if (isToday(appointmentDate)) {
      return "Today";
    } else if (isTomorrow(appointmentDate)) {
      return "Tomorrow";
    } else if (isYesterday(appointmentDate)) {
      return "Yesterday";
    } else {
      return format(appointmentDate, "MMM dd, yyyy");
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 hover:border-[#004D99]/20">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color} shadow-sm`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004D99]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#e6f0ff] to-[#e6f7f5] rounded-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Appointments Management
            </h1>
            <p className="text-gray-600 mt-2">
              {user.role === "patient"
                ? "Your appointment history and upcoming visits"
                : "Comprehensive appointment management system"}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={fetchAppointments}
              className="bg-white/80 backdrop-blur text-gray-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-white transition-all flex items-center shadow-sm border border-gray-200"
            >
              <Activity className="h-4 w-4 mr-2" />
              Refresh Data
            </button>
            {(user.role === "patient" ||
              user.role === "super_master_admin" ||
              user.role === "clinic_admin") && (
              <button className="bg-gradient-to-r from-[#004D99] to-[#42A89B] text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-[#003d80] hover:to-[#3a7d92] transition-all flex items-center shadow-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Appointments"
          value={stats.total}
          icon={Calendar}
          color="bg-[#004D99]"
          description="All appointments in system"
        />
        <StatCard
          title="Today's Appointments"
          value={stats.todayAppointments}
          icon={Clock}
          color="bg-blue-500"
          description="Scheduled for today"
        />
        <StatCard
          title="Upcoming"
          value={stats.upcomingAppointments}
          icon={TrendingUp}
          color="bg-green-500"
          description="Future appointments"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={CheckCircle}
          color="bg-gray-500"
          description="Successfully completed"
        />
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-1 h-6 bg-[#004D99] rounded-full mr-3"></div>
            Status Overview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Scheduled</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {stats.scheduled}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Confirmed</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {stats.confirmed}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Completed</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {stats.completed}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm text-gray-600">Cancelled/No Show</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {stats.cancelled}
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
              onClick={() => setDateFilter("today")}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <Clock className="h-4 w-4 mr-3 text-[#004D99]" />
              <span className="text-sm">View Today's Appointments</span>
            </button>
            <button
              onClick={() => setStatusFilter("Scheduled")}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <AlertCircle className="h-4 w-4 mr-3 text-[#004D99]" />
              <span className="text-sm">Pending Confirmations</span>
            </button>
            <button
              onClick={() => setDateFilter("upcoming")}
              className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <TrendingUp className="h-4 w-4 mr-3 text-[#004D99]" />
              <span className="text-sm">Upcoming Appointments</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <div className="w-1 h-6 bg-gradient-to-b from-[#004D99] to-[#42A89B] rounded-full mr-3"></div>
            Recent Activity
          </h3>
          <div className="space-y-3">
            {appointments.slice(0, 3).map((appointment, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-[#004D99] to-[#42A89B] rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {appointment.patientId?.fullName ||
                      appointment.patientName ||
                      "Unknown Patient"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatAppointmentDate(appointment.date)} •{" "}
                    {appointment.time}
                  </p>
                </div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    appointment.status
                  )}`}
                >
                  {appointment.status}
                </span>
              </div>
            ))}
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
                  ? "bg-[#004D99] text-white border-[#004D99]"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
              {(filters.patientName ||
                filters.clinic ||
                filters.doctor ||
                filters.specificDate ||
                filters.priority) && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {
                    [
                      filters.patientName,
                      filters.clinic,
                      filters.doctor,
                      filters.specificDate,
                      filters.priority,
                    ].filter(Boolean).length
                  }
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
              <option value="appointment_date_desc">
                Appointment Date (Latest)
              </option>
              <option value="appointment_date_asc">
                Appointment Date (Earliest)
              </option>
              <option value="patient_name">Patient Name (A-Z)</option>
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
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      patientName: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Clinic Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="h-4 w-4 inline mr-1" />
                  Clinic
                </label>
                <input
                  type="text"
                  placeholder="Search by clinic name..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  value={filters.clinic}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, clinic: e.target.value }))
                  }
                />
              </div>

              {/* Doctor Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Doctor
                </label>
                <input
                  type="text"
                  placeholder="Search by doctor name..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  value={filters.doctor}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, doctor: e.target.value }))
                  }
                />
              </div>

              {/* Specific Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Specific Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  value={filters.specificDate}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      specificDate: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Activity className="h-4 w-4 inline mr-1" />
                  Priority
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#004D99] focus:border-transparent transition-all"
                  value={filters.priority}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {filteredAppointments.length} of {appointments.length}{" "}
                appointments found
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFilters({
                      patientName: "",
                      clinic: "",
                      doctor: "",
                      specificDate: "",
                      priority: "",
                    });
                    setSearchTerm("");
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

      {/* Appointments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-[#004D99] to-[#42A89B] rounded-full mr-3"></div>
              Appointments List ({sortedAppointments.length})
            </h3>
            <div className="text-sm text-gray-600">
              Sorted by:{" "}
              <span className="font-medium text-[#004D99]">
                {sortBy === "latest"
                  ? "Latest First"
                  : sortBy === "oldest"
                  ? "Oldest First"
                  : sortBy === "appointment_date_desc"
                  ? "Appointment Date (Latest)"
                  : sortBy === "appointment_date_asc"
                  ? "Appointment Date (Earliest)"
                  : sortBy === "patient_name"
                  ? "Patient Name (A-Z)"
                  : sortBy === "status"
                  ? "Status"
                  : "Latest First"}
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
                    Patient
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Building2 className="h-4 w-4 mr-2 text-[#004D99]" />
                    Clinic
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-[#004D99]" />
                    Doctor
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-[#004D99]" />
                    Date & Time
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-[#004D99]" />
                    Priority
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedAppointments.map((appointment) => (
                <tr
                  key={appointment._id}
                  className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-all duration-200 border-l-4 border-transparent hover:border-[#004D99]"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
                        {appointment.patientId?.imageUrl ? (
                          <img
                            src={appointment.patientId.imageUrl}
                            alt={appointment.patientId?.fullName || "Patient"}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              // Fallback to initials if image fails to load
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <span
                          className="text-blue-600 font-medium text-sm"
                          style={{
                            display: appointment.patientId?.imageUrl
                              ? "none"
                              : "flex",
                          }}
                        >
                          {appointment.patientId?.fullName
                            ? appointment.patientId.fullName
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)
                            : "P"}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.patientId?.fullName ||
                            appointment.patientName ||
                            "Unknown Patient"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Age {appointment.patientId?.age || "N/A"} •{" "}
                          {appointment.patientId?.gender || "N/A"}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {appointment.patientId?.phone ||
                            appointment.patientId?.attenderMobile ||
                            "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.clinicId?.name || "Unknown Clinic"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {appointment.clinicId?.type || "Cardiology"} •{" "}
                          {appointment.clinicId?.city || "Bangalore"},{" "}
                          {appointment.clinicId?.state || "Karnataka"}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {appointment.clinicId?.phone || "+91756749"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.doctorId?.fullName
                            ? `Dr. ${appointment.doctorId.fullName}`
                            : "Unknown Doctor"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {appointment.doctorId?.specialty ||
                            "General Practice"}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {appointment.doctorId?.phone || "+91754247432"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatAppointmentDate(appointment.date)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {appointment.time || "17:30"} (
                      {appointment.duration || "30"}min)
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(
                        appointment.priority || "low"
                      )}`}
                    >
                      {(appointment.priority || "LOW").toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {sortedAppointments.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No appointments found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || statusFilter || appointmentTypeFilter || dateFilter
                ? "Try adjusting your search filters or clear all filters to see all appointments."
                : "No appointments have been scheduled yet. Create your first appointment to get started."}
            </p>
            {(searchTerm ||
              statusFilter ||
              appointmentTypeFilter ||
              dateFilter) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("");
                  setAppointmentTypeFilter("");
                  setDateFilter("");
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
  );
};

export default Appointments;
