import React, { useState, useEffect } from "react";
import { usersAPI, clinicsAPI, nursesAPI } from "../../services/api";
import { toast } from "react-hot-toast";
import {
  Search,
  UserCheck,
  Users,
  Activity,
  Building2,
  Mail,
  Phone,
  MapPin,
  Award,
  Filter,
  Eye,
  Edit,
} from "lucide-react";

const NurseManagement = () => {
  const [nurses, setNurses] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalNurses: 0,
    activeNurses: 0,
    inactiveNurses: 0,
    clinics: [],
  });

  const [filterClinic, setFilterClinic] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNurse, setSelectedNurse] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchData();
    fetchClinics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await nursesAPI.getAll();
      let nursesData = [];
      if (res?.data?.success && res.data.nurses) nursesData = res.data.nurses;
      else if (res?.data?.data) nursesData = res.data.data;
      else if (Array.isArray(res?.data)) nursesData = res.data;

      // Debug log to see the structure of nurses data
      console.log("Nurses data structure:", nursesData?.[0]);

      setNurses(nursesData || []);
      const active = (nursesData || []).filter((n) => n.isActive).length;
      setStats({
        totalNurses: (nursesData || []).length,
        activeNurses: active,
        inactiveNurses: (nursesData || []).length - active,
        clinics: [
          ...new Set(
            (nursesData || []).map((n) => n.clinic?.name).filter(Boolean)
          ),
        ],
      });
    } catch (err) {
      console.error("Error fetching nurses:", err);
      toast.error("Failed to fetch nurses");
    } finally {
      setLoading(false);
    }
  };

  const fetchClinics = async () => {
    try {
      const r = await clinicsAPI.getAll();
      let clinicsData = [];
      if (r?.data?.success && r.data.clinics) clinicsData = r.data.clinics;
      else if (Array.isArray(r?.data)) clinicsData = r.data;
      setClinics(clinicsData || []);
    } catch (e) {
      console.error("Error fetching clinics:", e);
    }
  };

  // Filter nurses based on search and filters
  const filteredNurses = (() => {
    let list = nurses || [];

    // Apply clinic filter
    if (filterClinic !== "all") {
      list = list.filter(
        (n) => (n.clinic?._id || n.clinicId?._id || n.clinicId) === filterClinic
      );
    }

    // Apply status filter
    if (filterStatus !== "all") {
      list = list.filter((n) =>
        filterStatus === "active" ? n.isActive : !n.isActive
      );
    }

    // Apply search filter
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      list = list.filter((nurse) => {
        // Get the full name properly
        const fullName =
          nurse.fullName ||
          `${nurse.firstName || ""} ${nurse.lastName || ""}`.trim() ||
          nurse.displayName ||
          "";

        // Search in various fields
        const searchFields = [
          fullName,
          nurse.firstName || "",
          nurse.lastName || "",
          nurse.email || "",
          nurse.phone || "",
          nurse.specialization || "",
          nurse.licenseNumber || "",
        ];

        return searchFields.some((field) =>
          field.toLowerCase().includes(searchLower)
        );
      });
    }

    // Debug log for search results
    if (searchTerm) {
      console.log("Search term:", searchTerm);
      console.log("Total nurses:", nurses.length);
      console.log("Filtered results:", list.length);
      console.log("Sample nurse for debugging:", nurses[0]);
    }

    return list;
  })();

  // View nurse details
  const viewNurseDetails = (nurse) => {
    setSelectedNurse(nurse);
    setShowModal(true);
  };

  // Get clinic name
  const getClinicName = (nurse) => {
    return (
      nurse.clinicId?.name ||
      nurse.clinic?.name ||
      nurse.clinicName ||
      "Unassigned"
    );
  };

  // Format nurse name
  const getNurseName = (nurse) => {
    return (
      nurse.fullName ||
      `${nurse.firstName || ""} ${nurse.lastName || ""}`.trim() ||
      nurse.displayName ||
      "Unnamed"
    );
  };

  // Get nurse profile image with fallback
  const getNurseImage = (nurse) => {
    return nurse.profileImage || nurse.profilePicture || nurse.avatar || null;
  };

  // Get nurse initials
  const getNurseInitials = (nurse) => {
    return getNurseName(nurse)
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Nurse Details Modal Component
  const NurseModal = ({ nurse, isOpen, onClose }) => {
    if (!isOpen || !nurse) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Nurse Details
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Profile Section */}
              <div className="md:col-span-1">
                <div className="text-center">
                  {getNurseImage(nurse) ? (
                    <img
                      src={getNurseImage(nurse)}
                      alt={getNurseName(nurse)}
                      className="h-24 w-24 rounded-full mx-auto object-cover border-4 border-primary-100"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`bg-primary-100 h-24 w-24 rounded-full flex items-center justify-center mx-auto ${
                      getNurseImage(nurse) ? "hidden" : ""
                    }`}
                  >
                    <span className="text-primary-600 font-bold text-2xl">
                      {getNurseInitials(nurse)}
                    </span>
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                    {getNurseName(nurse)}
                  </h3>
                  <p className="text-gray-600">
                    {nurse.specialization || "General Nursing"}
                  </p>
                  {nurse.licenseNumber && (
                    <p className="text-sm text-gray-500 mt-1">
                      License: {nurse.licenseNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Details Section */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Contact Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{nurse.email || "N/A"}</span>
                      </div>
                      {nurse.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{nurse.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Professional Info
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{nurse.specialization || "General Nursing"}</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        <span>
                          {nurse.experience
                            ? `${nurse.experience} years experience`
                            : "Experience not specified"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{getClinicName(nurse)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Status</h4>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                      nurse.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {nurse.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {nurse.clinic?.address && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Clinic Address
                    </h4>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">
                        {nurse.clinic.address}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nurses</h1>
          <p className="text-gray-600">
            Manage nursing staff records and information
          </p>
        </div>
      </div>

      <div className="card">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search Filter */}
          <div className="relative flex-1 max-w-lg">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                searchTerm ? "text-blue-500" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              placeholder="Search nurses by name, email, or specialization..."
              className={`form-input pl-10 ${
                searchTerm ? "border-blue-300 ring-1 ring-blue-200" : ""
              }`}
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                console.log("Search term changed:", value);
                setSearchTerm(value);
              }}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
          {/* Clinic Filter */}
          <div className="min-w-[200px]">
            <select
              value={filterClinic}
              onChange={(e) => setFilterClinic(e.target.value)}
              className="form-input"
            >
              <option value="all">All Clinics</option>
              {clinics.map((clinic) => (
                <option key={clinic._id} value={clinic._id}>
                  {clinic.name}
                </option>
              ))}
            </select>
          </div>{" "}
          {/* Status Filter */}
          <div className="min-w-[150px]">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="form-input"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          {/* Filter Status */}
          {(searchTerm || filterClinic !== "all" || filterStatus !== "all") && (
            <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
              <Filter className="h-4 w-4 mr-2" />
              {filteredNurses.length} of {nurses.length} nurses
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterClinic("all");
                  setFilterStatus("all");
                }}
                className="ml-2 text-blue-700 hover:text-blue-900 font-medium"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nurse
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Experience
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clinic
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNurses.map((nurse) => (
                <tr
                  key={nurse._id}
                  className="hover:bg-primary-50 cursor-pointer transition-colors"
                  onClick={() => viewNurseDetails(nurse)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {getNurseImage(nurse) ? (
                          <img
                            src={getNurseImage(nurse)}
                            alt={getNurseName(nurse)}
                            className="h-10 w-10 rounded-full object-cover border-2 border-primary-100"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextSibling.style.display = "flex";
                            }}
                          />
                        ) : null}
                        <div
                          className={`bg-primary-100 h-10 w-10 rounded-full flex items-center justify-center ${
                            getNurseImage(nurse) ? "hidden" : ""
                          }`}
                        >
                          <span className="text-primary-600 font-medium">
                            {getNurseInitials(nurse)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {getNurseName(nurse)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {nurse.email || "No email"}
                        </div>
                        {nurse.licenseNumber && (
                          <div className="text-xs text-gray-400">
                            License: {nurse.licenseNumber}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <Award className="h-4 w-4 text-gray-400 mr-2" />
                        {nurse.specialization || "General Nursing"}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {nurse.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-1" />
                        {nurse.phone}
                      </div>
                    )}
                    <div className="flex items-center text-gray-500 text-xs mt-1">
                      <Mail className="h-3 w-3 text-gray-400 mr-1" />
                      {nurse.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {nurse.experience ? `${nurse.experience} years` : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        nurse.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {nurse.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                      <div>
                        <div className="text-gray-800 font-medium">
                          {getClinicName(nurse)}
                        </div>
                        {(nurse.clinicId?.address || nurse.clinic?.address) && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {nurse.clinicId?.address || nurse.clinic?.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredNurses.length === 0 && (
          <div className="text-center py-12">
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No nurses found
            </h3>
            <p className="text-gray-500">
              {searchTerm || filterClinic !== "all" || filterStatus !== "all"
                ? "Try adjusting your search or filter criteria."
                : "No nurses available."}
            </p>
          </div>
        )}
      </div>

      {/* Nurse Details Modal */}
      {showModal && selectedNurse && (
        <NurseModal
          nurse={selectedNurse}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default NurseManagement;
