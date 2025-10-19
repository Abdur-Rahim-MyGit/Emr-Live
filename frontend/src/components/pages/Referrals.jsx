import React, { useState, useEffect } from "react";
import {
  ArrowRightLeft,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Users,
  Building2,
  Phone,
  Mail,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { referralsAPI } from "../../services/api";

const Referrals = () => {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Fetch referrals data from API
  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const response = await referralsAPI.getAll();
      if (response.data.success) {
        setReferrals(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching referrals:", error);
      toast.error("Failed to fetch referrals data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  // Filter referrals based on search and filters
  const filteredReferrals = referrals.filter((referral) => {
    const matchesSearch =
      !searchTerm ||
      referral.patientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.specialistName
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      referral.specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      referral.reason?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || referral.status === filterStatus;
    const matchesUrgency =
      filterUrgency === "all" || referral.urgency === filterUrgency;

    return matchesSearch && matchesStatus && matchesUrgency;
  });

  // View referral details
  const viewReferralDetails = (referral) => {
    setSelectedReferral(referral);
    setShowModal(true);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no show":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "scheduled":
        return <Calendar className="h-4 w-4" />;
      case "pending":
        return <AlertCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      case "no show":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency?.toLowerCase()) {
      case "urgent":
      case "emergency":
        return "text-red-600 font-semibold";
      case "routine":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const stats = {
    total: referrals.length,
    pending: referrals.filter((r) => r.status?.toLowerCase() === "pending")
      .length,
    scheduled: referrals.filter((r) => r.status?.toLowerCase() === "scheduled")
      .length,
    completed: referrals.filter((r) => r.status?.toLowerCase() === "completed")
      .length,
    urgent: referrals.filter(
      (r) =>
        r.urgency?.toLowerCase() === "urgent" ||
        r.urgency?.toLowerCase() === "emergency"
    ).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Referrals</h1>
          <p className="text-gray-600">
            Manage patient referrals and specialist consultations
          </p>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Filter */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search referrals by patient, specialist, or reason..."
              className="form-input pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="min-w-[150px]">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input"
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Urgency Filter */}
          <div className="min-w-[150px]">
            <select
              value={filterUrgency}
              onChange={(e) => setFilterUrgency(e.target.value)}
              className="form-input"
            >
              <option value="all">All Urgency</option>
              <option value="Routine">Routine</option>
              <option value="Urgent">Urgent</option>
              <option value="Emergency">Emergency</option>
            </select>
          </div>

          {/* Filter Status */}
          {(searchTerm ||
            filterStatus !== "all" ||
            filterUrgency !== "all") && (
            <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
              <Filter className="h-4 w-4 mr-2" />
              Filtered
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                  setFilterUrgency("all");
                }}
                className="ml-2 text-blue-700 hover:text-blue-900"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From Specialist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  To Specialist
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Urgency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReferrals.map((referral) => (
                <tr
                  key={referral._id}
                  className="hover:bg-primary-50 cursor-pointer transition-colors"
                  onClick={() => viewReferralDetails(referral)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="bg-primary-100 h-10 w-10 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {referral.patientName
                              ? referral.patientName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .substring(0, 2)
                              : "P"}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {referral.patientName || "Unknown Patient"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {referral.reason || "No reason provided"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">
                        {referral.referringProvider?.name || "N/A"}
                      </div>
                      {referral.referringProvider?.phone && (
                        <div className="text-xs text-gray-500">
                          {referral.referringProvider.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">
                        {referral.specialistName}
                      </div>
                      <div className="text-gray-500">{referral.specialty}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {referral.specialistContact?.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-1" />
                        {referral.specialistContact.phone}
                      </div>
                    )}
                    {referral.specialistContact?.email && (
                      <div className="flex items-center text-gray-500 text-xs mt-1">
                        <Mail className="h-3 w-3 text-gray-400 mr-1" />
                        {referral.specialistContact.email}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                      <div>
                        {referral.referralDate &&
                        referral.referralDate !== "N/A" ? (
                          <div>
                            Referred: {formatDate(referral.referralDate)}
                          </div>
                        ) : null}
                        {referral.preferredDate && (
                          <div
                            className={
                              referral.referralDate &&
                              referral.referralDate !== "N/A"
                                ? "text-xs mt-1"
                                : ""
                            }
                          >
                            Preferred: {formatDate(referral.preferredDate)}
                          </div>
                        )}
                        {!referral.referralDate && !referral.preferredDate && (
                          <div>No date available</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(
                        referral.urgency
                      )}`}
                    >
                      {referral.urgency || "Routine"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        referral.status
                      )}`}
                    >
                      {getStatusIcon(referral.status)}
                      <span className="ml-1">
                        {referral.status || "Pending"}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredReferrals.length === 0 && (
          <div className="text-center py-12">
            <ArrowRightLeft className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No referrals found
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterStatus !== "all" || filterUrgency !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No referrals available."}
            </p>
          </div>
        )}
      </div>

      {/* Referral Details Modal */}
      {showModal && selectedReferral && (
        <ReferralModal
          referral={selectedReferral}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

// Referral Details Modal Component
const ReferralModal = ({ referral, isOpen, onClose }) => {
  if (!isOpen || !referral) return null;

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-50 text-green-700 border border-green-200";
      case "scheduled":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border border-red-200";
      case "no show":
        return "bg-gray-100 text-gray-600 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  const getStatusDotColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-500";
      case "scheduled":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      case "no show":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 relative overflow-hidden max-h-[90vh] border border-gray-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 relative">
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-xl">
              <ArrowRightLeft className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Referral #{referral._id?.slice(-8) || 'N/A'}
              </h2>
              <p className="text-gray-600">{referral.patientName || 'Unknown Patient'}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium ${getStatusColor(referral.status)}`}
            >
              <div
                className={`w-2 h-2 rounded-full mr-2 ${getStatusDotColor(referral.status)}`}
              ></div>
              {referral.status || 'Pending'}
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
                      {referral.patientName || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-gray-500">
                      Patient ID
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {referral.patientId?._id || referral.patientId || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-gray-500">
                      Reason for Referral
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {referral.reason || 'No reason provided'}
                    </p>
                  </div>
                  {referral.clinicalNotes && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-500">
                        Clinical Notes
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {referral.clinicalNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Referring Provider Information */}
              {(referral.referringProvider || referral.referringDoctor) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                    Referring Provider
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-500">
                        Provider Name
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {referral.referringProvider?.name || referral.referringDoctor?.name || referral.referringProvider || referral.referringDoctor || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Specialist Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                  Specialist Information
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-gray-500">
                      Specialist Name
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {referral.specialistName || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-gray-500">
                      Specialty
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {referral.specialty || 'N/A'}
                    </p>
                  </div>
                  {referral.specialistContact?.phone && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-500">
                        Phone Number
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {referral.specialistContact.phone}
                      </p>
                    </div>
                  )}
                  {referral.specialistContact?.email && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-500">
                        Email Address
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {referral.specialistContact.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointment Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                  Appointment Details
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-gray-500">
                      Referral Date
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {formatDate(referral.referralDate)}
                    </p>
                  </div>
                  {referral.preferredDate && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-500">
                        Preferred Date
                      </label>
                      <p className="text-gray-900 font-semibold">
                        {formatDate(referral.preferredDate)}
                      </p>
                    </div>
                  )}
                  {referral.appointmentDate && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="text-sm font-medium text-gray-500">
                        Appointment Date
                      </label>
                      <p className="text-blue-600 font-semibold">
                        {formatDate(referral.appointmentDate)}
                      </p>
                    </div>
                  )}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-gray-500">
                      Urgency Level
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {referral.urgency || 'Routine'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(referral.feedback || referral.outcome || referral.notes) && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                Additional Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {referral.outcome && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-gray-500">
                      Outcome
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {referral.outcome}
                    </p>
                  </div>
                )}
                {referral.feedback && (
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-gray-500">
                      Feedback
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {referral.feedback}
                    </p>
                  </div>
                )}
                {referral.notes && (
                  <div className="lg:col-span-2 bg-gray-50 p-4 rounded-xl">
                    <label className="text-sm font-medium text-gray-500">
                      Additional Notes
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {referral.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {referral.specialistContact?.address && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gray-400 rounded-full"></div>
                Contact Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-xl">
                <label className="text-sm font-medium text-gray-500">
                  Address
                </label>
                <p className="text-gray-900 font-semibold">
                  {referral.specialistContact.address}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-8 py-6">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Referrals;
