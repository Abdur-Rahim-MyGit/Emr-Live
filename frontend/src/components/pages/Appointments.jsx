import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  Search,
  Plus,
  Filter,
  CheckCircle,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Timer,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { appointmentsAPI } from "../../services/api";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  // default to empty to show all appointments unless a date is selected
  const [selectedDate, setSelectedDate] = useState("");

  // Fetch appointments from backend and map to local shape
  useEffect(() => {
    fetchAppointments();
    // re-fetch when date or status filter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, filterStatus]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDate) params.date = selectedDate;
      if (filterStatus && filterStatus !== "all") params.status = filterStatus;

      const res = await appointmentsAPI.getAll(params);
      console.log("appointmentsAPI response:", res?.data);
      if (res.data?.success) {
        const mapped = res.data.appointments.map((a) => ({
          id: a._id,
          appointmentId: a.appointmentId,
          patientId: a.patientId?.patientId || "",
          patientName: a.patientId?.patientId || "Unknown",
          doctorName: a.doctorId
            ? `Dr. ${a.doctorId.firstName || ""} ${
                a.doctorId.lastName || ""
              }`.trim()
            : "TBD",
          date: a.appointmentDate
            ? new Date(a.appointmentDate).toISOString().split("T")[0]
            : "",
          time: a.timeSlot?.start || "",
          duration: "",
          location: a.clinicId?.name || "",
          status: a.status || "scheduled",
          type: a.type || "",
          phone: "",
          email: "",
          department: a.doctorId?.specialization || "",
        }));

        setAppointments(mapped);
      } else {
        toast.error(res.data?.message || "Failed to fetch appointments");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.patientName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || appointment.status === filterStatus;
    const matchesDate = !selectedDate || appointment.date === selectedDate;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-primary-100 text-primary-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const AppointmentCard = ({ appointment }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-3 rounded-xl shadow-lg">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-bold text-gray-900">
              {appointment.patientName}
            </h3>
            <p className="text-sm text-gray-600">{appointment.type}</p>
          </div>
        </div>
        <div
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
            appointment.status
          )}`}
        >
          {getStatusIcon(appointment.status)}
          <span className="ml-1 capitalize">{appointment.status}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center text-gray-600">
          <User className="h-4 w-4 mr-2" />
          <span className="text-sm">{appointment.doctorName}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Clock className="h-4 w-4 mr-2" />
          <span className="text-sm">{appointment.time}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Phone className="h-4 w-4 mr-2" />
          <span className="text-sm">{appointment.phone}</span>
        </div>
        <div className="flex items-center text-gray-600">
          <Mail className="h-4 w-4 mr-2" />
          <span className="text-sm">{appointment.email}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-2">
        <button className="flex-1 bg-primary-50 text-primary-600 py-2 px-4 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium">
          Edit
        </button>
        <button className="flex-1 bg-green-50 text-green-600 py-2 px-4 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
          Confirm
        </button>
        <button className="flex-1 bg-red-50 text-red-600 py-2 px-4 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium">
          Cancel
        </button>
      </div>
    </div>
  );

  // action loading state per appointment
  const [actionLoading, setActionLoading] = useState({});

  const updateAppointmentStatus = async (id, newStatus) => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const res = await appointmentsAPI.update(id, { status: newStatus });
      if (res.data?.success) {
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, status: res.data.appointment.status } : a
          )
        );
        toast.success(res.data.message || `Appointment ${newStatus}`);
      } else {
        toast.error(res.data?.message || "Failed to update appointment");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update appointment");
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  const stats = {
    total: appointments.length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    pending: appointments.filter((a) => a.status === "pending").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Calendar className="h-8 w-8 mr-3 text-gray-700" />
          Appointments Management
        </h1>
        <p className="text-gray-600">
          Schedule and manage patient appointments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Confirmed</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.confirmed}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.pending}
              </p>
            </div>
            <AlertCircle className="h-8 w-8 text-orange-400" />
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-2xl font-bold text-primary-600">
                {stats.completed}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-primary-400" />
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by patient or doctor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-500 focus:border-gray-500"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Modern Table View */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-gray-600" />
            Appointments List ({filteredAppointments.length} appointments)
          </h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointment Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location & Doctor
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAppointments.map((appointment, index) => (
                  <tr
                    key={appointment.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-25"
                    }`}
                  >
                    {/* Patient Details */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-gray-100 h-10 w-10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.patientName}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {appointment.patientId}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center mt-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {appointment.phone}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Appointment Info */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {appointment.type}
                      </div>
                      <div className="text-sm text-gray-500">
                        {appointment.department}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center mt-1">
                        <Timer className="h-3 w-3 mr-1" />
                        Duration: {appointment.duration}
                      </div>
                    </td>

                    {/* Schedule */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                        {new Date(appointment.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-2 text-green-600" />
                        {appointment.time}
                      </div>
                    </td>

                    {/* Location & Doctor */}
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        <User className="h-4 w-4 mr-2 text-purple-600" />
                        {appointment.doctorName}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-2 text-orange-600" />
                        {appointment.location}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {getStatusIcon(appointment.status)}
                        <span className="ml-1 capitalize">
                          {appointment.status}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-primary-600 hover:text-primary-900 p-2 hover:bg-primary-50 rounded-lg transition-colors">
                          <Eye className="h-4 w-4" />
                        </button>
                        {appointment.status !== "confirmed" && (
                          <button
                            className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded-lg transition-colors"
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "confirmed"
                              )
                            }
                            disabled={!!actionLoading[appointment.id]}
                          >
                            {actionLoading[appointment.id] ? (
                              <span className="animate-spin inline-block w-4 h-4 border-b-2 border-green-600 rounded-full" />
                            ) : (
                              <Edit className="h-4 w-4" />
                            )}
                          </button>
                        )}
                        {appointment.status !== "cancelled" && (
                          <button
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            onClick={() =>
                              updateAppointmentStatus(
                                appointment.id,
                                "cancelled"
                              )
                            }
                            disabled={!!actionLoading[appointment.id]}
                          >
                            {actionLoading[appointment.id] ? (
                              <span className="animate-spin inline-block w-4 h-4 border-b-2 border-red-600 rounded-full" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredAppointments.length === 0 && !loading && (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No appointments found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or schedule a new appointment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
