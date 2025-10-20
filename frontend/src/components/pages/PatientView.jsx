import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  CreditCard,
  History,
  FileText,
  Camera,
  Users,
  Pill,
  Stethoscope,
  ClipboardList,
  Activity,
  Brain,
  UserCheck,
  Building,
  Video,
  Clock,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";
import {
  patientsAPI,
  appointmentsAPI,
  referralsAPI,
  billingAPI,
} from "../../services/api";

const PatientView = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [billingRecords, setBillingRecords] = useState([]);
  const [loadingAdditionalData, setLoadingAdditionalData] = useState(false);

  // Fetch patient data from API
  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true);
      try {
        const response = await patientsAPI.getById(patientId);
        if (response.data.success) {
          const backendPatient = response.data.patient;

          // Transform backend data to match frontend structure
          const transformedPatient = {
            pid: backendPatient.uhid || backendPatient._id,
            uhid: backendPatient.uhid,
            firstName: backendPatient.fullName.split(" ")[0],
            lastName: backendPatient.fullName.split(" ").slice(1).join(" "),
            fullName: backendPatient.fullName,
            gender: backendPatient.gender,
            dateOfBirth: backendPatient.dateOfBirth,
            age:
              backendPatient.age ||
              new Date().getFullYear() -
                new Date(backendPatient.dateOfBirth).getFullYear(),
            phone: backendPatient.phone,
            email: backendPatient.email,
            bloodGroup: backendPatient.bloodGroup,
            occupation: backendPatient.occupation,
            referringDoctor: backendPatient.referringDoctor,
            referredClinic: backendPatient.referredClinic,
            governmentId: backendPatient.governmentId,
            idNumber: backendPatient.idNumber,
            governmentDocument: backendPatient.governmentDocument,
            address: {
              street: backendPatient.address?.street || "",
              city: backendPatient.address?.city || "",
              state: backendPatient.address?.state || "",
              zipCode: backendPatient.address?.zipCode || "",
              country: backendPatient.address?.country || "",
            },
            emergencyContact: {
              name: backendPatient.emergencyContact?.name || "",
              relationship: backendPatient.emergencyContact?.relationship || "",
              phone: backendPatient.emergencyContact?.phone || "",
            },
            insurance: {
              provider: backendPatient.insurance?.provider || "",
              policyNumber: backendPatient.insurance?.policyNumber || "",
              groupNumber: backendPatient.insurance?.groupNumber || "",
            },
            medicalHistory: {
              conditions: backendPatient.medicalHistory?.conditions || [],
              allergies: backendPatient.medicalHistory?.allergies || [],
              medications: backendPatient.medicalHistory?.medications || [],
              surgeries: backendPatient.medicalHistory?.surgeries || [],
            },
            assignedDoctors: backendPatient.assignedDoctors || [],
            status: backendPatient.status || "Active",
            lastVisit: backendPatient.lastVisit,
            photo: backendPatient.profileImage,
            notes: backendPatient.notes || "",
            createdAt: backendPatient.createdAt,
            updatedAt: backendPatient.updatedAt,
            // Legacy fields for backward compatibility
            wallets: {
              general: backendPatient.wallet?.general || 0,
              pharmacy: backendPatient.wallet?.pharmacy || 0,
            },
            categoryHistory: {
              old: "-",
              new: "General",
              date: backendPatient.createdAt,
            },
            visits:
              backendPatient.checkInHistory?.map((visit) => ({
                clinicName: visit.clinicName,
                clinicCode: visit.clinicType,
                checkIn: visit.checkedInOn,
                checkOut: visit.checkOut || null,
              })) || [],
            payments: {
              credits:
                backendPatient.paymentCreditHistory?.map((credit) => ({
                  mode: credit.payMode,
                  reference: credit.reference,
                  createdBy: credit.creditedBy,
                  createdAt: credit.creditedOn,
                  amount: credit.amount,
                })) || [],
              debits:
                backendPatient.paymentDebitHistory?.map((debit) => ({
                  mode: debit.payType,
                  reference: debit.reference,
                  details: debit.details,
                  debitedOn: debit.debitedOn,
                  amount: debit.amount,
                })) || [],
            },
          };
          setPatient(transformedPatient);
        }
      } catch (error) {
        console.error("Error fetching patient:", error);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchPatient();
      fetchAdditionalData();
    }
  }, [patientId]);

  // Fetch additional real-time data
  const fetchAdditionalData = async () => {
    setLoadingAdditionalData(true);
    try {
      // Fetch appointments for this patient
      const appointmentsResponse = await appointmentsAPI.getAll({ patientId });
      if (appointmentsResponse.data.success) {
        setAppointments(appointmentsResponse.data.appointments || []);
      }

      // Fetch referrals for this patient
      const referralsResponse = await referralsAPI.getAll({ patientId });
      if (referralsResponse.data.success) {
        setReferrals(referralsResponse.data.referrals || []);
      }

      // Fetch billing records for this patient
      const billingResponse = await billingAPI.getAll({ patientId });
      if (billingResponse.data.success) {
        setBillingRecords(billingResponse.data.billingRecords || []);
      }
    } catch (error) {
      console.error("Error fetching additional data:", error);
    } finally {
      setLoadingAdditionalData(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Patient Profile", icon: User },
    { id: "case-log", label: "Case Log", icon: FileText },
    { id: "diagnosis", label: "Diagnosis History", icon: Stethoscope },
    { id: "investigations", label: "Investigation History", icon: Activity },
    { id: "treatment", label: "Treatment History", icon: ClipboardList },
    { id: "progress", label: "Progress History", icon: Brain },
    { id: "referrals", label: "Referral", icon: Users },
    { id: "image-gallery", label: "Image Gallery", icon: Camera },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004D99]"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Patient not found
          </h2>
          <button
            onClick={() => navigate("/patients")}
            className="mt-4 px-4 py-2 bg-gradient-to-r from-[#004D99] to-[#42A89B] text-white rounded-lg hover:from-[#003d80] hover:to-[#3a7d92]"
          >
            Back to Patients
          </button>
        </div>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <PatientProfileTab
            patient={patient}
            appointments={appointments}
            referrals={referrals}
            billingRecords={billingRecords}
            loadingAdditionalData={loadingAdditionalData}
          />
        );
      case "case-log":
        return <CaseLogTab patient={patient} appointments={appointments} />;
      case "diagnosis":
        return <DiagnosisHistoryTab patient={patient} />;
      case "treatment":
        return <TreatmentPlanTab patient={patient} />;
      case "investigations":
        return <InvestigationHistoryTab patient={patient} />;
      case "progress":
        return <ProgressHistoryTab patient={patient} />;
      case "referrals":
        return <ReferralTab patient={patient} referrals={referrals} />;
      // removed: admission, nurse-notes, family-history, drug-history
      case "image-gallery":
        return <ImageGalleryTab patient={patient} />;
      default:
        return <PatientProfileTab patient={patient} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur border-b border-gray-100">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left section - Logo and Patient IDs */}
            <div className="flex items-center space-x-6">
              {/* MIAS Logo */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#004D99] to-[#42A89B] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">SM</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  SMAART HEALTHCARE
                </span>
              </div>

              {/* Status Badge */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  patient.status === "Active"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {patient.status}
              </span>
            </div>

            {/* Right section - Wallet Balances */}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-t">
          <div className="px-6">
            <div className="flex space-x-1 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? "border-primary-600 text-primary-700"
                        : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-200"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white min-h-[calc(100vh-200px)]">
        {renderTabContent()}
      </div>
    </div>
  );
};

// Investigation History Tab Component (table view like reference)
const InvestigationHistoryTab = ({ patient }) => {
  // Sample structure resembling the reference screenshot
  const rows = [
    {
      id: 1,
      source: "Ward 1 - Plastic Surgery",
      lab: "Blood Centre - Transfusion Medicine",
      test: "Prothrombin Time (PT) with INR",
      cost: 200,
      createdBy: "Tarun V Puvdri varma Pinnamraju",
      createdOn: "May 17 2024 6:13PM",
      submittedOn: "May 17 2024 7:27PM",
      approvedOn: "May 18 2024 9:30AM",
      status: "approved",
    },
    {
      id: 2,
      source: "Ward 1 - Plastic Surgery",
      lab: "Blood Centre - Transfusion Medicine",
      test: "Activated Partial Thromboplastin Time (APTT)",
      cost: 200,
      createdBy: "Tarun V Puvdri varma Pinnamraju",
      createdOn: "May 17 2024 6:13PM",
      submittedOn: "May 17 2024 7:27PM",
      approvedOn: "May 18 2024 9:30AM",
      status: "approved",
    },
    {
      id: 3,
      source: "Ward 1 - Plastic Surgery",
      lab: "Microbiology Lab",
      test: "HIV",
      cost: 175,
      createdBy: "Tarun V Puvdri varma Pinnamraju",
      createdOn: "May 17 2024 6:13PM",
      submittedOn: "May 17 2024 9:27PM",
      approvedOn: "May 17 2024 10:18PM",
      status: "approved",
    },
    {
      id: 4,
      source: "Ward 1 - Plastic Surgery",
      lab: "Microbiology Lab",
      test: "HBsAG",
      cost: 150,
      createdBy: "Tarun V Puvdri varma Pinnamraju",
      createdOn: "May 17 2024 6:13PM",
      submittedOn: "May 17 2024 9:27PM",
      approvedOn: "May 17 2024 10:19PM",
      status: "approved",
    },
    {
      id: 5,
      source: "Ward 1 - Plastic Surgery",
      lab: "Microbiology Lab",
      test: "HCV",
      cost: 250,
      createdBy: "Tarun V Puvdri varma Pinnamraju",
      createdOn: "May 17 2024 6:13PM",
      submittedOn: "May 17 2024 9:27PM",
      approvedOn: "May 17 2024 10:19PM",
      status: "approved",
    },
    {
      id: 6,
      source: "Ward 1 - Plastic Surgery",
      lab: "Hematology Lab",
      test: "Complete Blood Count (CBC)",
      cost: 100,
      createdBy: "Tarun V Puvdri varma Pinnamraju",
      createdOn: "May 17 2024 6:13PM",
      submittedOn: "May 17 2024 7:15PM",
      approvedOn: "May 17 2024 8:59PM",
      status: "approved",
    },
    {
      id: 7,
      source: "EMERGENCY WARD - 1",
      lab: "Radiology Centre",
      test: "X-RAY HAND AP / LATERAL - LEFT",
      cost: 75,
      createdBy: "HRITHIK SHYAM",
      createdOn: "May 17 2024 5:07PM",
      submittedOn: "null",
      approvedOn: "null",
      status: "pending",
    },
  ];

  const statusClass = (s) =>
    s === "approved"
      ? "bg-green-100 text-green-700"
      : s === "pending"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-100 text-gray-700";

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Investigation History
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3 font-medium text-gray-600">Seq</th>
              <th className="text-left p-3 font-medium text-gray-600">
                Source
              </th>
              <th className="text-left p-3 font-medium text-gray-600">Lab</th>
              <th className="text-left p-3 font-medium text-gray-600">
                Test Name
              </th>
              <th className="text-left p-3 font-medium text-gray-600">Cost</th>
              <th className="text-left p-3 font-medium text-gray-600">
                Created By
              </th>
              <th className="text-left p-3 font-medium text-gray-600">
                Created On
              </th>
              <th className="text-left p-3 font-medium text-gray-600">
                Lab Submitted On
              </th>
              <th className="text-left p-3 font-medium text-gray-600">
                Approved On
              </th>
              <th className="text-left p-3 font-medium text-gray-600">
                Status
              </th>
              <th className="text-left p-3 font-medium text-gray-600">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.id}</td>
                <td className="p-3 text-primary-700">{r.source}</td>
                <td className="p-3 text-primary-700">{r.lab}</td>
                <td className="p-3">{r.test}</td>
                <td className="p-3">{r.cost}</td>
                <td className="p-3">{r.createdBy}</td>
                <td className="p-3">{r.createdOn}</td>
                <td className="p-3">{r.submittedOn}</td>
                <td className="p-3">{r.approvedOn}</td>
                <td className="p-3">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusClass(
                      r.status
                    )}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td className="p-3">
                  <button className="text-primary-600 hover:underline">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Progress History Tab Component
const ProgressHistoryTab = ({ patient }) => {
  const milestones = [
    {
      id: 1,
      date: "2024-01-25",
      title: "BP Improved",
      detail: "Avg BP 132/82 over 7 days",
      status: "on_track",
    },
    {
      id: 2,
      date: "2024-01-22",
      title: "Rehab Session #3",
      detail: "ROM knee +10°",
      status: "on_track",
    },
    {
      id: 3,
      date: "2024-01-18",
      title: "Weight",
      detail: "−1.2 kg since last visit",
      status: "attention",
    },
  ];

  const chip = (s) =>
    s === "on_track"
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Progress History
      </h2>
      <div className="space-y-4">
        {milestones.map((m) => (
          <div
            key={m.id}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {m.title}
                </h3>
                <p className="text-sm text-gray-600">{m.detail}</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-2">{m.date}</div>
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${chip(
                    m.status
                  )}`}
                >
                  {m.status.replace("_", " ")}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Referral Tab Component
const ReferralTab = ({ patient, referrals = [] }) => {
  const statusClass = (s) => {
    switch (s) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in_progress":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Referral</h2>
      {referrals.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-3 font-medium text-gray-600">
                  Date
                </th>
                <th className="text-left p-3 font-medium text-gray-600">
                  Type
                </th>
                <th className="text-left p-3 font-medium text-gray-600">
                  Referred To
                </th>
                <th className="text-left p-3 font-medium text-gray-600">
                  Referred By
                </th>
                <th className="text-left p-3 font-medium text-gray-600">
                  Reason
                </th>
                <th className="text-left p-3 font-medium text-gray-600">
                  Urgency
                </th>
                <th className="text-left p-3 font-medium text-gray-600">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((referral, index) => (
                <tr
                  key={referral._id || index}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3">
                    {referral.referralDate
                      ? format(new Date(referral.referralDate), "MMM dd, yyyy")
                      : format(new Date(referral.createdAt), "MMM dd, yyyy")}
                  </td>
                  <td className="p-3">{referral.referralType || "General"}</td>
                  <td className="p-3">{referral.referredTo || "N/A"}</td>
                  <td className="p-3">{referral.referredBy || "N/A"}</td>
                  <td className="p-3">{referral.reason || "N/A"}</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        referral.urgency === "high"
                          ? "bg-red-100 text-red-800"
                          : referral.urgency === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {referral.urgency || "Normal"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${statusClass(
                        referral.status
                      )}`}
                    >
                      {referral.status || "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No referrals found
          </h3>
          <p className="text-gray-600">
            Patient referrals will appear here when created.
          </p>
        </div>
      )}
    </div>
  );
};

// Patient Profile Tab Component
const PatientProfileTab = ({
  patient,
  appointments = [],
  referrals = [],
  billingRecords = [],
  loadingAdditionalData = false,
}) => {
  const getAgeFromDOB = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM dd, yyyy");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Patient Profile Section */}
      <div className="bg-gradient-to-r from-[#e6f0ff] to-[#e6f7f5] rounded-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Patient Profile
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Photo and Basic IDs */}
          <div className="flex flex-col items-center space-y-4">
            {patient.photo ? (
              <img
                src={patient.photo}
                alt="Patient"
                className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
              />
            ) : (
              <div className="h-32 w-32 rounded-full bg-gradient-to-r from-[#cce0ff] to-[#ccebf0] flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-[#004D99] font-bold text-4xl">
                  {patient.firstName ? patient.firstName[0].toUpperCase() : "P"}
                </span>
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-[#004D99]" /> Basic Information
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">UHID:</span>
                <span className="ml-2 text-gray-900">
                  {patient.uhid || patient.pid}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Full Name:
                </span>
                <span className="ml-2 text-gray-900">{patient.fullName}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Gender:
                </span>
                <span className="ml-2 text-gray-900">{patient.gender}</span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">
                  DOB / Age:
                </span>
                <span className="ml-2 text-gray-900">
                  {format(new Date(patient.dateOfBirth), "dd/MM/yyyy")} →{" "}
                  {getAgeFromDOB(patient.dateOfBirth)} Y
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Mobile:
                </span>
                <span className="ml-2 text-gray-900">{patient.phone}</span>
              </div>
              {patient.email && (
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Email:
                  </span>
                  <span className="ml-2 text-gray-900">{patient.email}</span>
                </div>
              )}
            </div>
          </div>

          {/* Address & Insurance */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-[#004D99]" /> Address &
              Insurance
            </h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Address:
                </span>
                <div className="text-gray-900 text-sm mt-1">
                  {patient.address.street}
                  <br />
                  {patient.address.city}
                  <br />
                  {patient.address.zipCode}
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">
                  Insurance:
                </span>
                <span className="ml-2 text-gray-900">
                  {patient.insurance?.provider || "(empty)"}
                </span>
              </div>
              {patient.bloodGroup && (
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Blood Group:
                  </span>
                  <span className="ml-2 text-gray-900">
                    {patient.bloodGroup}
                  </span>
                </div>
              )}
              {patient.occupation && (
                <div>
                  <span className="text-sm font-medium text-gray-600">
                    Occupation:
                  </span>
                  <span className="ml-2 text-gray-900">
                    {patient.occupation}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Information */}
      {(patient.wallets?.general > 0 || patient.wallets?.pharmacy > 0) && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-[#004D99]" />
            Wallet Balance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  General Wallet
                </span>
                <span className="text-lg font-bold text-green-600">
                  ₹{patient.wallets.general || 0}
                </span>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">
                  Pharmacy Wallet
                </span>
                <span className="text-lg font-bold text-blue-600">
                  ₹{patient.wallets.pharmacy || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Visit History */}
      {patient.visits && patient.visits.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Building className="h-5 w-5 mr-2 text-[#004D99]" />
            Recent Visits
          </h3>
          <div className="space-y-3">
            {patient.visits.slice(0, 3).map((visit, index) => (
              <div
                key={index}
                className="border-l-4 border-blue-200 bg-blue-50 p-4 rounded-r-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {visit.clinicName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Type: {visit.clinicCode}
                    </p>
                    <p className="text-xs text-gray-500">
                      Check-in: {formatDate(visit.checkIn)}
                    </p>
                  </div>
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    Visit #{index + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History Summary */}
      {(patient.payments?.credits?.length > 0 ||
        patient.payments?.debits?.length > 0) && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-[#004D99]" />
            Recent Payment Activity
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Credits */}
            {patient.payments.credits &&
              patient.payments.credits.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-600 mb-3">
                    Recent Credits
                  </h4>
                  <div className="space-y-2">
                    {patient.payments.credits
                      .slice(0, 3)
                      .map((credit, index) => (
                        <div key={index} className="bg-green-50 p-3 rounded-lg">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">
                              {credit.mode}
                            </span>
                            <span className="font-medium text-green-600">
                              +₹{credit.amount}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            {formatDate(credit.createdAt)}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* Debits */}
            {patient.payments.debits && patient.payments.debits.length > 0 && (
              <div>
                <h4 className="font-medium text-red-600 mb-3">Recent Debits</h4>
                <div className="space-y-2">
                  {patient.payments.debits.slice(0, 3).map((debit, index) => (
                    <div key={index} className="bg-red-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">
                          {debit.mode}
                        </span>
                        <span className="font-medium text-red-600">
                          -₹{debit.amount}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatDate(debit.debitedOn)}
                      </p>
                      {debit.details && (
                        <p className="text-xs text-gray-600 mt-1">
                          {debit.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Clinic Category History */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <History className="h-5 w-5 mr-2 text-[#004D99]" />
          Clinic Category History
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-600">Old Category:</span>
            <p className="text-gray-900">{patient.categoryHistory.old}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">New Category:</span>
            <p className="text-gray-900">{patient.categoryHistory.new}</p>
          </div>
          <div>
            <span className="font-medium text-gray-600">Dated On:</span>
            <p className="text-gray-900">
              {formatDate(patient.categoryHistory.date)}
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Contact Information */}
      {(patient.emergencyContact?.name || patient.emergencyContact?.phone) && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Phone className="h-5 w-5 mr-2 text-[#004D99]" />
            Emergency Contact
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 rounded-lg p-4">
              <span className="text-sm font-medium text-gray-600">Name</span>
              <p className="text-lg font-semibold text-gray-900">
                {patient.emergencyContact.name || "N/A"}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <span className="text-sm font-medium text-gray-600">
                Relationship
              </span>
              <p className="text-lg font-semibold text-gray-900">
                {patient.emergencyContact.relationship || "N/A"}
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <span className="text-sm font-medium text-gray-600">Phone</span>
              <p className="text-lg font-semibold text-gray-900">
                {patient.emergencyContact.phone || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Insurance Details */}
      {(patient.insurance?.provider || patient.insurance?.policyNumber) && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-[#004D99]" />
            Insurance Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <span className="text-sm font-medium text-gray-600">
                Provider
              </span>
              <p className="text-lg font-semibold text-gray-900">
                {patient.insurance.provider || "N/A"}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <span className="text-sm font-medium text-gray-600">
                Policy Number
              </span>
              <p className="text-lg font-semibold text-gray-900">
                {patient.insurance.policyNumber || "N/A"}
              </p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <span className="text-sm font-medium text-gray-600">
                Group Number
              </span>
              <p className="text-lg font-semibold text-gray-900">
                {patient.insurance.groupNumber || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Government ID Information */}
      {(patient.governmentId || patient.idNumber) && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-[#004D99]" />
            Government ID
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-yellow-50 rounded-lg p-4">
              <span className="text-sm font-medium text-gray-600">ID Type</span>
              <p className="text-lg font-semibold text-gray-900">
                {patient.governmentId || "N/A"}
              </p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <span className="text-sm font-medium text-gray-600">
                ID Number
              </span>
              <p className="text-lg font-semibold text-gray-900">
                {patient.idNumber || "N/A"}
              </p>
            </div>
            {patient.governmentDocument && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <span className="text-sm font-medium text-gray-600">
                  Document
                </span>
                <a
                  href={patient.governmentDocument}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm"
                >
                  View Document
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Medical History */}
      {(patient.medicalHistory?.conditions?.length > 0 ||
        patient.medicalHistory?.allergies?.length > 0 ||
        patient.medicalHistory?.medications?.length > 0 ||
        patient.medicalHistory?.surgeries?.length > 0) && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Heart className="h-5 w-5 mr-2 text-[#004D99]" />
            Medical History
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {patient.medicalHistory.conditions?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Medical Conditions
                </h4>
                <div className="space-y-1">
                  {patient.medicalHistory.conditions.map((condition, index) => (
                    <span
                      key={index}
                      className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-2 mb-1"
                    >
                      {condition}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patient.medicalHistory.allergies?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Allergies</h4>
                <div className="space-y-1">
                  {patient.medicalHistory.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full mr-2 mb-1"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {patient.medicalHistory.medications?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Current Medications
                </h4>
                <div className="space-y-1">
                  {patient.medicalHistory.medications.map(
                    (medication, index) => (
                      <span
                        key={index}
                        className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2 mb-1"
                      >
                        {medication}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {patient.medicalHistory.surgeries?.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Previous Surgeries
                </h4>
                <div className="space-y-1">
                  {patient.medicalHistory.surgeries.map((surgery, index) => (
                    <span
                      key={index}
                      className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-2 mb-1"
                    >
                      {surgery}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Referral Information */}
      {(patient.referringDoctor || patient.referredClinic) && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-[#004D99]" />
            Referral Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-indigo-50 rounded-lg p-4">
              <span className="text-sm font-medium text-gray-600">
                Referring Doctor
              </span>
              <p className="text-lg font-semibold text-gray-900">
                {patient.referringDoctor || "N/A"}
              </p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4">
              <span className="text-sm font-medium text-gray-600">
                Referred Clinic
              </span>
              <p className="text-lg font-semibold text-gray-900">
                {patient.referredClinic || "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Patient Status & Registration Info */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 mr-2 text-[#004D99]" />
          Patient Status & Timeline
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <span className="text-sm font-medium text-gray-600">
              Current Status
            </span>
            <p className="text-lg font-semibold text-green-600">
              {patient.status || "Active"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <span className="text-sm font-medium text-gray-600">
              Patient ID (UHID)
            </span>
            <p className="text-lg font-semibold text-gray-900">
              {patient.uhid || patient.pid}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <span className="text-sm font-medium text-gray-600">
              Registration Date
            </span>
            <p className="text-sm text-gray-900">
              {formatDate(patient.createdAt)}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <span className="text-sm font-medium text-gray-600">
              Last Visit
            </span>
            <p className="text-sm text-gray-900">
              {patient.lastVisit ? formatDate(patient.lastVisit) : "N/A"}
            </p>
          </div>
        </div>
        {patient.notes && (
          <div className="mt-4 bg-blue-50 rounded-lg p-4">
            <span className="text-sm font-medium text-gray-600">Notes</span>
            <p className="text-sm text-gray-900 mt-1">{patient.notes}</p>
          </div>
        )}
      </div>

      {/* Real-Time Appointments */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-[#004D99]" />
          Recent Appointments
          {loadingAdditionalData && (
            <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-[#004D99]"></div>
          )}
        </h3>
        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.slice(0, 5).map((appointment, index) => (
              <div
                key={index}
                className="border-l-4 border-green-200 bg-green-50 p-4 rounded-r-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {appointment.appointmentType || "General Consultation"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Doctor:{" "}
                      {appointment.doctorName ||
                        "Dr. " + (appointment.doctorId || "N/A")}
                    </p>
                    <p className="text-xs text-gray-500">
                      Date: {formatDate(appointment.appointmentDate)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Time: {appointment.appointmentTime || "N/A"}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      appointment.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : appointment.status === "confirmed"
                        ? "bg-blue-100 text-blue-800"
                        : appointment.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {appointment.status || "Scheduled"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No appointments found</p>
        )}
      </div>

      {/* Real-Time Referrals */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 mr-2 text-[#004D99]" />
          Recent Referrals
          {loadingAdditionalData && (
            <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-[#004D99]"></div>
          )}
        </h3>
        {referrals.length > 0 ? (
          <div className="space-y-3">
            {referrals.slice(0, 5).map((referral, index) => (
              <div
                key={index}
                className="border-l-4 border-purple-200 bg-purple-50 p-4 rounded-r-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {referral.referralType || "Specialist Referral"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      To: {referral.referredTo || "Specialist"}
                    </p>
                    <p className="text-sm text-gray-600">
                      From: {referral.referredBy || "Primary Care"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Date:{" "}
                      {formatDate(referral.referralDate || referral.createdAt)}
                    </p>
                    {referral.reason && (
                      <p className="text-xs text-gray-600 mt-1">
                        Reason: {referral.reason}
                      </p>
                    )}
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      referral.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : referral.status === "in_progress"
                        ? "bg-blue-100 text-blue-800"
                        : referral.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {referral.status || "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No referrals found</p>
        )}
      </div>

      {/* Real-Time Billing Summary */}
      {billingRecords.length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="font-semibent text-gray-900 mb-4 flex items-center">
            <CreditCard className="h-5 w-5 mr-2 text-[#004D99]" />
            Recent Billing Records
            {loadingAdditionalData && (
              <div className="ml-2 animate-spin rounded-full h-4 w-4 border-b-2 border-[#004D99]"></div>
            )}
          </h3>
          <div className="space-y-3">
            {billingRecords.slice(0, 3).map((record, index) => (
              <div
                key={index}
                className="border-l-4 border-orange-200 bg-orange-50 p-4 rounded-r-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {record.description || "Medical Service"}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Amount: ₹{record.amount || "0"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Date: {formatDate(record.billingDate || record.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      record.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : record.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {record.status || "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
const ImageGalleryTab = ({ patient }) => {
  // Sample medical images data
  const medicalImages = [
    {
      id: 1,
      title: "Chest X-Ray",
      type: "X-Ray",
      date: "2024-01-15",
      doctor: "Dr. Sarah Wilson",
      description: "PA and lateral chest X-ray for evaluation of chest pain",
      findings:
        "Normal cardiac silhouette, clear lung fields, no acute abnormalities",
      imageUrl: "/api/placeholder/400/300", // Placeholder for actual image
      category: "Radiology",
    },
    {
      id: 2,
      title: "ECG - Resting",
      type: "ECG",
      date: "2024-01-15",
      doctor: "Dr. Sarah Wilson",
      description: "12-lead resting electrocardiogram",
      findings: "Normal sinus rhythm, no ST-T changes, normal axis",
      imageUrl: "/api/placeholder/400/300",
      category: "Cardiology",
    },
    {
      id: 3,
      title: "Blood Pressure Chart",
      type: "Chart",
      date: "2024-01-20",
      doctor: "Nurse Johnson",
      description: "Ambulatory blood pressure monitoring results",
      findings: "Average BP 138/86 mmHg, good diurnal variation",
      imageUrl: "/api/placeholder/400/300",
      category: "Vital Signs",
    },
    {
      id: 4,
      title: "Knee MRI",
      type: "MRI",
      date: "2023-06-20",
      doctor: "Dr. Orthopedic Team",
      description: "MRI of right knee pre-operative evaluation",
      findings:
        "Degenerative changes in medial compartment, intact cruciate ligaments",
      imageUrl: "/api/placeholder/400/300",
      category: "Orthopedics",
    },
    {
      id: 5,
      title: "Dermatology Photo",
      type: "Clinical Photo",
      date: "2023-08-05",
      doctor: "Dr. Lisa Anderson",
      description: "Skin lesion on left forearm",
      findings: "Benign nevus, no malignant features",
      imageUrl: "/api/placeholder/400/300",
      category: "Dermatology",
    },
    {
      id: 6,
      title: "Lab Results Chart",
      type: "Lab Report",
      date: "2024-01-15",
      doctor: "Dr. Michael Brown",
      description: "Lipid panel and metabolic profile",
      findings: "Total cholesterol 245 mg/dL, HDL 45 mg/dL, LDL 165 mg/dL",
      imageUrl: "/api/placeholder/400/300",
      category: "Laboratory",
    },
  ];

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case "radiology":
        return "bg-blue-100 text-blue-800";
      case "cardiology":
        return "bg-red-100 text-red-800";
      case "orthopedics":
        return "bg-green-100 text-green-800";
      case "dermatology":
        return "bg-purple-100 text-purple-800";
      case "laboratory":
        return "bg-yellow-100 text-yellow-800";
      case "vital signs":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Medical Image Gallery
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {medicalImages.map((image) => (
          <div
            key={image.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="aspect-w-4 aspect-h-3 bg-gray-200 relative">
              <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <Camera className="h-12 w-12 text-gray-400" />
              </div>
              <div className="absolute top-2 right-2">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                    image.category
                  )}`}
                >
                  {image.category}
                </span>
              </div>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {image.title}
              </h3>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {image.date}
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {image.doctor}
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  {image.type}
                </div>
              </div>

              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Description:
                </h4>
                <p className="text-sm text-gray-700">{image.description}</p>
              </div>

              <div className="mt-3">
                <h4 className="text-sm font-medium text-gray-900 mb-1">
                  Key Findings:
                </h4>
                <p className="text-sm text-gray-700">{image.findings}</p>
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex-1 bg-primary-50 text-primary-600 py-2 px-4 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium">
                  View Full Size
                </button>
                <button className="flex-1 bg-gray-50 text-gray-600 py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                  Download
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {medicalImages.length === 0 && (
        <div className="text-center py-12">
          <Camera className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No medical images
          </h3>
          <p className="text-gray-600">
            Medical images and reports will appear here as they are added to the
            patient's record.
          </p>
        </div>
      )}
    </div>
  );
};

// Drug History Tab Component
const DrugHistoryTab = ({ patient }) => {
  // Sample drug history data
  const drugHistory = [
    {
      id: 1,
      medication: "Lisinopril",
      genericName: "Lisinopril",
      dosage: "10mg",
      frequency: "Once daily",
      startDate: "2024-01-20",
      endDate: null,
      prescribingDoctor: "Dr. Sarah Wilson",
      indication: "Hypertension",
      status: "active",
      sideEffects: "None reported",
      effectiveness: "Good blood pressure control",
    },
    {
      id: 2,
      medication: "Atorvastatin",
      genericName: "Atorvastatin Calcium",
      dosage: "20mg",
      frequency: "Once daily",
      startDate: "2024-01-15",
      endDate: null,
      prescribingDoctor: "Dr. Michael Brown",
      indication: "Hyperlipidemia",
      status: "active",
      sideEffects: "Mild muscle aches (resolved)",
      effectiveness: "Cholesterol reduced by 25%",
    },
    {
      id: 3,
      medication: "Amlodipine",
      genericName: "Amlodipine",
      dosage: "5mg",
      frequency: "Once daily",
      startDate: "2024-01-20",
      endDate: null,
      prescribingDoctor: "Dr. Sarah Wilson",
      indication: "Hypertension (added to regimen)",
      status: "active",
      sideEffects: "Mild ankle swelling",
      effectiveness: "Improved blood pressure control",
    },
    {
      id: 4,
      medication: "Acetaminophen",
      genericName: "Acetaminophen",
      dosage: "500mg",
      frequency: "Every 6 hours as needed",
      startDate: "2023-11-10",
      endDate: "2023-11-17",
      prescribingDoctor: "Dr. Emergency Team",
      indication: "Pain relief (Acute Bronchitis)",
      status: "discontinued",
      sideEffects: "None",
      effectiveness: "Effective pain relief",
    },
    {
      id: 5,
      medication: "Loratadine",
      genericName: "Loratadine",
      dosage: "10mg",
      frequency: "Once daily as needed",
      startDate: "2023-08-05",
      endDate: null,
      prescribingDoctor: "Dr. Lisa Anderson",
      indication: "Allergic Rhinitis",
      status: "as_needed",
      sideEffects: "None",
      effectiveness: "Good symptom control",
    },
    {
      id: 6,
      medication: "Ibuprofen",
      genericName: "Ibuprofen",
      dosage: "400mg",
      frequency: "Every 8 hours as needed",
      startDate: "2023-06-20",
      endDate: "2023-07-05",
      prescribingDoctor: "Dr. Orthopedic Team",
      indication: "Post-surgical pain",
      status: "discontinued",
      sideEffects: "Mild stomach upset",
      effectiveness: "Effective pain management",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "discontinued":
        return "bg-red-100 text-red-800";
      case "as_needed":
        return "bg-yellow-100 text-yellow-800";
      case "on_hold":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEffectivenessColor = (effectiveness) => {
    if (
      effectiveness.toLowerCase().includes("good") ||
      effectiveness.toLowerCase().includes("effective")
    ) {
      return "text-green-600";
    } else if (effectiveness.toLowerCase().includes("moderate")) {
      return "text-yellow-600";
    } else {
      return "text-gray-600";
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Drug History</h2>

      <div className="space-y-4">
        {drugHistory.map((drug) => (
          <div
            key={drug.id}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {drug.medication}
                  </h3>
                  <span className="text-sm text-gray-500">
                    ({drug.genericName})
                  </span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      drug.status
                    )}`}
                  >
                    {drug.status.replace("_", " ")}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">Dosage:</span> {drug.dosage}
                  </div>
                  <div>
                    <span className="font-medium">Frequency:</span>{" "}
                    {drug.frequency}
                  </div>
                  <div>
                    <span className="font-medium">Prescribed by:</span>{" "}
                    {drug.prescribingDoctor}
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                  <span className="font-medium">Indication:</span>{" "}
                  {drug.indication}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">
                      Start Date:
                    </span>{" "}
                    {drug.startDate}
                    {drug.endDate && (
                      <>
                        <br />
                        <span className="font-medium text-gray-900">
                          End Date:
                        </span>{" "}
                        {drug.endDate}
                      </>
                    )}
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">
                      Effectiveness:
                    </span>
                    <span
                      className={`ml-1 ${getEffectivenessColor(
                        drug.effectiveness
                      )}`}
                    >
                      {drug.effectiveness}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Side Effects:
                  </h4>
                  <p className="text-gray-700">{drug.sideEffects}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">Notes:</h4>
                  <p className="text-gray-700">{drug.effectiveness}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {drugHistory.length === 0 && (
        <div className="text-center py-12">
          <Pill className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No drug history
          </h3>
          <p className="text-gray-600">
            Medication history will appear here as prescriptions are added to
            the patient's record.
          </p>
        </div>
      )}
    </div>
  );
};

// Family History Tab Component
const FamilyHistoryTab = ({ patient }) => {
  // Sample family history data
  const familyHistory = [
    {
      id: 1,
      relationship: "Father",
      name: "John Doe Sr.",
      age: 68,
      livingStatus: "Alive",
      conditions: [
        "Hypertension",
        "Type 2 Diabetes",
        "Coronary Artery Disease",
      ],
      ageOfOnset: [45, 52, 60],
      notes:
        "Father had heart bypass surgery at age 60. Well controlled on medications.",
    },
    {
      id: 2,
      relationship: "Mother",
      name: "Jane Doe",
      age: 65,
      livingStatus: "Alive",
      conditions: ["Osteoarthritis", "Hypothyroidism"],
      ageOfOnset: [55, 58],
      notes:
        "Mother has joint pain but manages well with physical therapy and medications.",
    },
    {
      id: 3,
      relationship: "Brother",
      name: "Michael Doe",
      age: 42,
      livingStatus: "Alive",
      conditions: ["Hypertension"],
      ageOfOnset: [38],
      notes:
        "Brother diagnosed with hypertension during routine check-up. No complications.",
    },
    {
      id: 4,
      relationship: "Sister",
      name: "Sarah Doe",
      age: 35,
      livingStatus: "Alive",
      conditions: ["Migraine Headaches"],
      ageOfOnset: [25],
      notes:
        "Sister experiences occasional migraines, well controlled with preventive medications.",
    },
    {
      id: 5,
      relationship: "Paternal Grandfather",
      name: "Robert Doe",
      age: 72,
      livingStatus: "Deceased",
      conditions: ["Myocardial Infarction", "Stroke"],
      ageOfOnset: [65, 70],
      notes:
        "Grandfather passed away from complications of heart disease and stroke.",
    },
    {
      id: 6,
      relationship: "Maternal Grandmother",
      name: "Mary Smith",
      age: 78,
      livingStatus: "Alive",
      conditions: ["Breast Cancer", "Osteoporosis"],
      ageOfOnset: [68, 72],
      notes:
        "Grandmother survived breast cancer and manages osteoporosis with medications and exercise.",
    },
  ];

  const getLivingStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "alive":
        return "bg-green-100 text-green-800";
      case "deceased":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRelationshipColor = (relationship) => {
    switch (relationship.toLowerCase()) {
      case "father":
      case "mother":
        return "bg-blue-100 text-blue-800";
      case "brother":
      case "sister":
        return "bg-green-100 text-green-800";
      case "paternal grandfather":
      case "paternal grandmother":
      case "maternal grandfather":
      case "maternal grandmother":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Family History</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {familyHistory.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {member.name}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRelationshipColor(
                      member.relationship
                    )}`}
                  >
                    {member.relationship}
                  </span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getLivingStatusColor(
                      member.livingStatus
                    )}`}
                  >
                    {member.livingStatus}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">
                  Age: {member.age}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Medical Conditions:
                </h4>
                {member.conditions.length > 0 ? (
                  <div className="space-y-2">
                    {member.conditions.map((condition, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-700">{condition}</span>
                        <span className="text-gray-500">
                          Onset: {member.ageOfOnset[index]} years
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No known conditions</p>
                )}
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Notes:
                </h4>
                <p className="text-sm text-gray-700">{member.notes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {familyHistory.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No family history
          </h3>
          <p className="text-gray-600">
            Family medical history will appear here as it is documented in the
            patient's record.
          </p>
        </div>
      )}
    </div>
  );
};

// Nurse Notes Tab Component
const NurseNotesTab = ({ patient }) => {
  // Sample nurse notes data
  const nurseNotes = [
    {
      id: 1,
      date: "2024-01-20",
      time: "09:30 AM",
      nurse: "Nurse Johnson",
      shift: "Morning",
      category: "Vital Signs",
      notes:
        "BP 142/88, HR 72, RR 16, Temp 98.6°F, O2 Sat 98% RA. Patient reports mild headache, no chest pain. Medication administered as ordered.",
      followUp: "Monitor BP q2h, assess pain level",
    },
    {
      id: 2,
      date: "2024-01-20",
      time: "14:15 PM",
      nurse: "Nurse Smith",
      shift: "Afternoon",
      category: "Assessment",
      notes:
        "Patient resting comfortably. Incision site clean and dry, no signs of infection. Pain level 3/10. Ambulated 50 feet with minimal assistance. Voided 300cc clear yellow urine.",
      followUp: "Continue pain management, encourage ambulation",
    },
    {
      id: 3,
      date: "2024-01-19",
      time: "22:00 PM",
      nurse: "Nurse Davis",
      shift: "Night",
      category: "Medication",
      notes:
        "Administered scheduled medications: Lisinopril 10mg PO, Atorvastatin 20mg PO. Patient tolerated well, no adverse reactions noted. BP pre-med 148/92, post-med 138/84.",
      followUp: "Monitor for medication effectiveness",
    },
    {
      id: 4,
      date: "2024-01-19",
      time: "06:45 AM",
      nurse: "Nurse Wilson",
      shift: "Morning",
      category: "Education",
      notes:
        "Patient educated on medication regimen and importance of adherence. Demonstrated proper technique for BP monitoring at home. Provided written instructions and medication schedule.",
      followUp: "Reinforce teaching as needed",
    },
    {
      id: 5,
      date: "2024-01-18",
      time: "16:30 PM",
      nurse: "Nurse Brown",
      shift: "Afternoon",
      category: "Discharge Planning",
      notes:
        "Discussed discharge plan with patient and family. Arranged for home health nursing visits. Confirmed follow-up appointment with primary care provider. Provided medication reconciliation.",
      followUp: "Ensure all discharge instructions understood",
    },
  ];

  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case "vital signs":
        return "bg-blue-100 text-blue-800";
      case "assessment":
        return "bg-green-100 text-green-800";
      case "medication":
        return "bg-purple-100 text-purple-800";
      case "education":
        return "bg-yellow-100 text-yellow-800";
      case "discharge planning":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getShiftColor = (shift) => {
    switch (shift.toLowerCase()) {
      case "morning":
        return "bg-yellow-100 text-yellow-800";
      case "afternoon":
        return "bg-orange-100 text-orange-800";
      case "night":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Nurse Notes</h2>

      <div className="space-y-4">
        {nurseNotes.map((note) => (
          <div
            key={note.id}
            className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-gray-100 h-10 w-10 rounded-full flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {note.nurse}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span>
                      {note.date} at {note.time}
                    </span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getShiftColor(
                        note.shift
                      )}`}
                    >
                      {note.shift}
                    </span>
                  </div>
                </div>
              </div>
              <span
                className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(
                  note.category
                )}`}
              >
                {note.category}
              </span>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Notes:</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {note.notes}
              </p>
            </div>

            {note.followUp && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Follow-up Actions:
                </h4>
                <p className="text-sm text-gray-700">{note.followUp}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {nurseNotes.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No nurse notes
          </h3>
          <p className="text-gray-600">
            Nurse documentation will appear here as care is provided to the
            patient.
          </p>
        </div>
      )}
    </div>
  );
};

// Admission History Tab Component
const AdmissionHistoryTab = ({ patient }) => {
  // Sample admission history data
  const admissionHistory = [
    {
      id: 1,
      admissionDate: "2024-01-15",
      dischargeDate: "2024-01-17",
      duration: "2 days",
      admissionType: "Emergency",
      admittingDoctor: "Dr. Emergency Team",
      primaryDiagnosis: "Acute Chest Pain",
      department: "Cardiology",
      roomNumber: "ICU-205",
      dischargeDisposition: "Home",
      complications: "None",
      followUp: "Cardiology clinic in 1 week",
      notes:
        "Patient presented with acute chest pain. ECG showed no acute changes. Troponins negative. Discharged with cardiology follow-up.",
    },
    {
      id: 2,
      admissionDate: "2023-11-10",
      dischargeDate: "2023-11-12",
      duration: "2 days",
      admissionType: "Emergency",
      admittingDoctor: "Dr. Emergency Team",
      primaryDiagnosis: "Acute Bronchitis",
      department: "Internal Medicine",
      roomNumber: "MED-312",
      dischargeDisposition: "Home",
      complications: "None",
      followUp: "Primary care in 1 week",
      notes:
        "Admitted for respiratory distress. Treated with bronchodilators and antibiotics. Improved significantly.",
    },
    {
      id: 3,
      admissionDate: "2023-06-20",
      dischargeDate: "2023-06-25",
      duration: "5 days",
      admissionType: "Elective",
      admittingDoctor: "Dr. Orthopedic Team",
      primaryDiagnosis: "Right Knee Arthroplasty",
      department: "Orthopedics",
      roomNumber: "ORTH-108",
      dischargeDisposition: "Rehabilitation Facility",
      complications: "Post-operative pain well controlled",
      followUp: "Orthopedic clinic in 2 weeks",
      notes:
        "Elective total knee replacement. Surgery uncomplicated. Physical therapy initiated. Discharged to rehab for continued recovery.",
    },
  ];

  const getAdmissionTypeColor = (type) => {
    switch (type.toLowerCase()) {
      case "emergency":
        return "bg-red-100 text-red-800";
      case "urgent":
        return "bg-orange-100 text-orange-800";
      case "elective":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Admission History
      </h2>

      <div className="space-y-6">
        {admissionHistory.map((admission) => (
          <div
            key={admission.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {admission.primaryDiagnosis}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>Admitted: {admission.admissionDate}</span>
                    <span>Discharged: {admission.dischargeDate}</span>
                    <span>Duration: {admission.duration}</span>
                  </div>
                </div>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getAdmissionTypeColor(
                    admission.admissionType
                  )}`}
                >
                  {admission.admissionType}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">
                    Admitting Doctor:
                  </span>
                  <p className="text-gray-700">{admission.admittingDoctor}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Department:</span>
                  <p className="text-gray-700">{admission.department}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">Room:</span>
                  <p className="text-gray-700">{admission.roomNumber}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-900">
                    Disposition:
                  </span>
                  <p className="text-gray-700">
                    {admission.dischargeDisposition}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Clinical Summary:
                </h4>
                <p className="text-sm text-gray-700">{admission.notes}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Complications:
                  </h4>
                  <p className="text-sm text-gray-700">
                    {admission.complications}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Follow-up Care:
                  </h4>
                  <p className="text-sm text-gray-700">{admission.followUp}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {admissionHistory.length === 0 && (
        <div className="text-center py-12">
          <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No admission history
          </h3>
          <p className="text-gray-600">
            Hospital admission records will appear here as they are added to the
            patient's medical record.
          </p>
        </div>
      )}
    </div>
  );
};

// Treatment Plan Tab Component
const TreatmentPlanTab = ({ patient }) => {
  // Sample treatment plan data
  const treatmentPlans = [
    {
      id: 1,
      title: "Hypertension Management Plan",
      status: "active",
      startDate: "2024-01-20",
      endDate: null,
      doctor: "Dr. Sarah Wilson",
      goals: [
        "Reduce blood pressure to <130/80 mmHg",
        "Maintain healthy lifestyle",
        "Monitor for medication side effects",
      ],
      medications: [
        {
          name: "Lisinopril",
          dosage: "10mg",
          frequency: "Once daily",
          duration: "Ongoing",
        },
        {
          name: "Amlodipine",
          dosage: "5mg",
          frequency: "Once daily",
          duration: "Ongoing",
        },
      ],
      lifestyle: [
        "Low sodium diet (<2g/day)",
        "Regular exercise (30 min/day, 5 days/week)",
        "Weight management",
        "Stress reduction techniques",
      ],
      followUp: "Monthly blood pressure checks",
      notes:
        "Patient educated on DASH diet and importance of medication adherence.",
    },
    {
      id: 2,
      title: "Cholesterol Management",
      status: "active",
      startDate: "2024-01-15",
      endDate: null,
      doctor: "Dr. Michael Brown",
      goals: [
        "Reduce LDL cholesterol to <100 mg/dL",
        "Increase HDL cholesterol",
        "Reduce cardiovascular risk",
      ],
      medications: [
        {
          name: "Atorvastatin",
          dosage: "20mg",
          frequency: "Once daily",
          duration: "Ongoing",
        },
      ],
      lifestyle: [
        "Heart-healthy diet",
        "Regular aerobic exercise",
        "Weight management",
        "Smoking cessation if applicable",
      ],
      followUp: "Lipid panel every 3 months",
      notes:
        "Patient motivated to make lifestyle changes. Started exercise program.",
    },
    {
      id: 3,
      title: "Acute Bronchitis Treatment",
      status: "completed",
      startDate: "2023-11-10",
      endDate: "2023-11-17",
      doctor: "Dr. Emergency Team",
      goals: [
        "Resolve acute symptoms",
        "Prevent complications",
        "Return to normal activities",
      ],
      medications: [
        {
          name: "Acetaminophen",
          dosage: "500mg",
          frequency: "Every 6 hours as needed",
          duration: "7 days",
        },
        {
          name: "Guaifenesin",
          dosage: "200mg",
          frequency: "Every 4 hours as needed",
          duration: "7 days",
        },
      ],
      lifestyle: [
        "Rest and hydration",
        "Humidified air",
        "Avoid irritants (smoke, dust)",
      ],
      followUp: "Return if symptoms worsen or persist >10 days",
      notes:
        "Symptoms resolved within 5 days. No complications. Educated on prevention.",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "discontinued":
        return "bg-red-100 text-red-800";
      case "on_hold":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Treatment Plans</h2>

      <div className="space-y-6">
        {treatmentPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {plan.title}
                  </h3>
                  <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                    <span>Started: {plan.startDate}</span>
                    {plan.endDate && <span>Ended: {plan.endDate}</span>}
                    <span>By: {plan.doctor}</span>
                  </div>
                </div>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(
                    plan.status
                  )}`}
                >
                  {plan.status.replace("_", " ")}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Treatment Goals:
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {plan.goals.map((goal, index) => (
                    <li key={index}>{goal}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Medications */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Medications:
                </h4>
                <div className="space-y-2">
                  {plan.medications.map((med, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <span className="font-medium text-gray-900">
                          {med.name}
                        </span>
                        <span className="text-sm text-gray-600 ml-2">
                          {med.dosage}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {med.frequency} • {med.duration}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lifestyle Recommendations */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  Lifestyle Recommendations:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {plan.lifestyle.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center text-sm text-gray-700"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-up */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Follow-up Schedule:
                </h4>
                <p className="text-sm text-gray-700">{plan.followUp}</p>
              </div>

              {/* Notes */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Clinical Notes:
                </h4>
                <p className="text-sm text-gray-700">{plan.notes}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {treatmentPlans.length === 0 && (
        <div className="text-center py-12">
          <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No treatment plans
          </h3>
          <p className="text-gray-600">
            Treatment plans will appear here as they are created for the
            patient.
          </p>
        </div>
      )}
    </div>
  );
};

// Diagnosis History Tab Component
const DiagnosisHistoryTab = ({ patient }) => {
  const [diagnosisHistory, setDiagnosisHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiagnosisHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        // Fetch patient case log
        const response = await fetch(
          `${(import.meta.env.VITE_API_URL || 'https://emr-backend-nhe8.onrender.com')}/api/patientCaseLogs/${patient._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const caseLogData = await response.json();

          // Extract all diagnoses from medical cases
          const allDiagnoses = [];
          if (caseLogData.medicalCases) {
            caseLogData.medicalCases.forEach((medicalCase) => {
              if (medicalCase.diagnosis && medicalCase.diagnosis.length > 0) {
                medicalCase.diagnosis.forEach((diag) => {
                  allDiagnoses.push({
                    id: diag._id || `${medicalCase.caseId}-${diag.condition}`,
                    date: diag.diagnosisDate
                      ? format(new Date(diag.diagnosisDate), "yyyy-MM-dd")
                      : format(new Date(medicalCase.createdAt), "yyyy-MM-dd"),
                    diagnosis: diag.condition,
                    icdCode: diag.icd10Code || "N/A",
                    severity: medicalCase.priority || "N/A",
                    doctor: diag.diagnosedBy?.firstName
                      ? `Dr. ${diag.diagnosedBy.firstName} ${
                          diag.diagnosedBy.lastName || ""
                        }`
                      : "Doctor",
                    status:
                      medicalCase.status || diag.confidence || "confirmed",
                    notes:
                      diag.notes ||
                      medicalCase.caseTitle ||
                      "No notes available",
                    symptoms: medicalCase.symptoms?.map((s) => s.symptom) || [],
                    treatment:
                      medicalCase.treatment
                        ?.map((t) => t.description)
                        .join(", ") || "N/A",
                    caseTitle: medicalCase.caseTitle,
                  });
                });
              }
            });
          }

          // Also add chronic conditions from medical summary
          if (patient.medicalSummary?.chronicConditions) {
            patient.medicalSummary.chronicConditions.forEach(
              (condition, index) => {
                if (
                  condition &&
                  !allDiagnoses.find((d) => d.diagnosis === condition)
                ) {
                  allDiagnoses.push({
                    id: `chronic-${index}`,
                    date: patient.medicalSummary.lastUpdated
                      ? format(
                          new Date(patient.medicalSummary.lastUpdated),
                          "yyyy-MM-dd"
                        )
                      : "N/A",
                    diagnosis: condition,
                    icdCode: "N/A",
                    severity: "chronic",
                    doctor: "Previous Record",
                    status: "chronic",
                    notes: "Chronic condition from medical summary",
                    symptoms: [],
                    treatment: "See treatment history",
                  });
                }
              }
            );
          }

          setDiagnosisHistory(allDiagnoses);
        }
      } catch (error) {
        console.error("Error fetching diagnosis history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (patient?._id) {
      fetchDiagnosisHistory();
    }
  }, [patient]);

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case "mild":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "severe":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "chronic":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Diagnosis History
      </h2>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading diagnosis history...</p>
        </div>
      ) : diagnosisHistory.length > 0 ? (
        <div className="space-y-4">
          {diagnosisHistory.map((diagnosis) => (
            <div
              key={diagnosis.id}
              className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {diagnosis.diagnosis}
                    </h3>
                    <span className="text-sm text-gray-500">
                      ICD-10: {diagnosis.icdCode}
                    </span>
                  </div>

                  <div className="flex items-center space-x-4 mb-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(
                        diagnosis.severity
                      )}`}
                    >
                      {diagnosis.severity}
                    </span>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        diagnosis.status
                      )}`}
                    >
                      {diagnosis.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Diagnosed:</span>{" "}
                      {diagnosis.date}
                    </div>
                    <div>
                      <span className="font-medium">Doctor:</span>{" "}
                      {diagnosis.doctor}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                {diagnosis.symptoms && diagnosis.symptoms.length > 0 && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Symptoms:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {diagnosis.symptoms.map((symptom, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {diagnosis.treatment && diagnosis.treatment !== "N/A" && (
                  <div className="mb-3">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Treatment:
                    </h4>
                    <p className="text-sm text-gray-700">
                      {diagnosis.treatment}
                    </p>
                  </div>
                )}

                {diagnosis.notes && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Clinical Notes:
                    </h4>
                    <p className="text-sm text-gray-700">{diagnosis.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Stethoscope className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No diagnosis history
          </h3>
          <p className="text-gray-600">
            Diagnosis records will appear here as they are added to the
            patient's medical record.
          </p>
        </div>
      )}
    </div>
  );
};

// Case Log Tab with enhanced timestamp and creator information
const CaseLogTab = ({ patient, appointments = [] }) => {
  // Create detailed entries from all sources with timestamp and creator info
  const allEntries = [];

  // Add visits with enhanced information
  (patient.visits || []).forEach((v) => {
    allEntries.push({
      id: `visit-${v.checkIn}`,
      type: "Visit",
      icon: "calendar",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      title: "Check-in Recorded",
      description: v.clinicName,
      time: format(new Date(v.checkIn), "hh:mm a"),
      status: v.checkOut ? "Completed" : "In Progress",
      statusClass: v.checkOut
        ? "bg-green-100 text-green-700"
        : "bg-yellow-100 text-yellow-700",
      date: format(new Date(v.checkIn), "MMM dd, yyyy"),
      rawDate: new Date(v.checkIn),
      // Enhanced fields
      createdAt: v.checkIn,
      updatedAt: v.checkOut || v.checkIn,
      createdBy: v.createdBy || "System",
      createdByRole: v.createdByRole || "Automated Check-in",
      fullTimestamp: format(new Date(v.checkIn), "MMM dd, yyyy 'at' hh:mm a"),
      lastModified: v.checkOut
        ? format(new Date(v.checkOut), "MMM dd, yyyy 'at' hh:mm a")
        : format(new Date(v.checkIn), "MMM dd, yyyy 'at' hh:mm a"),
    });
  });

  // Add appointments with enhanced creator information
  appointments.forEach((apt) => {
    const isTeleconsultation =
      apt.type === "teleconsultation" ||
      apt.appointmentType === "teleconsultation" ||
      apt.type?.toLowerCase().includes("tele");

    // Get creator information
    const creatorName = apt.createdBy
      ? `${apt.createdBy.firstName || ""} ${
          apt.createdBy.lastName || ""
        }`.trim()
      : "Staff Member";
    const creatorRole = apt.createdBy?.role
      ? apt.createdBy.role
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())
      : "Healthcare Staff";

    allEntries.push({
      id: `apt-${apt._id}`,
      type: isTeleconsultation ? "Teleconsultation" : "Appointment",
      icon: isTeleconsultation ? "video" : "stethoscope",
      iconBg: isTeleconsultation ? "bg-purple-100" : "bg-blue-100",
      iconColor: isTeleconsultation ? "text-purple-600" : "text-blue-600",
      title: isTeleconsultation
        ? "Teleconsultation Scheduled"
        : "Appointment Scheduled",
      description: `${apt.appointmentType || "Consultation"} with ${
        apt.doctorId?.firstName
          ? `Dr. ${apt.doctorId.firstName} ${apt.doctorId.lastName || ""}`
          : "Doctor"
      }`,
      time: apt.time || "—",
      status: apt.status || "Scheduled",
      statusClass:
        apt.status?.toLowerCase() === "completed"
          ? "bg-green-100 text-green-700"
          : apt.status?.toLowerCase() === "cancelled"
          ? "bg-red-100 text-red-700"
          : "bg-blue-100 text-blue-700",
      date: format(new Date(apt.date || apt.appointmentDate), "MMM dd, yyyy"),
      rawDate: new Date(apt.date || apt.appointmentDate),
      // Enhanced fields
      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt,
      createdBy: creatorName,
      createdByRole: creatorRole,
      fullTimestamp: apt.createdAt
        ? format(new Date(apt.createdAt), "MMM dd, yyyy 'at' hh:mm a")
        : format(new Date(apt.date || apt.appointmentDate), "MMM dd, yyyy"),
      lastModified: apt.updatedAt
        ? format(new Date(apt.updatedAt), "MMM dd, yyyy 'at' hh:mm a")
        : apt.createdAt
        ? format(new Date(apt.createdAt), "MMM dd, yyyy 'at' hh:mm a")
        : format(new Date(apt.date || apt.appointmentDate), "MMM dd, yyyy"),
    });

    // Add prescription if completed with creator info
    if (apt.status?.toLowerCase() === "completed") {
      const doctorName = apt.doctorId?.firstName
        ? `Dr. ${apt.doctorId.firstName} ${apt.doctorId.lastName || ""}`.trim()
        : "Doctor";

      allEntries.push({
        id: `rx-${apt._id}`,
        type: "Prescription",
        icon: "pill",
        iconBg: "bg-orange-100",
        iconColor: "text-orange-600",
        title: "Prescription Issued",
        description: apt.diagnosis || "Medical prescription provided",
        time: apt.time || "—",
        status: "Completed",
        statusClass: "bg-green-100 text-green-700",
        date: format(new Date(apt.date || apt.appointmentDate), "MMM dd, yyyy"),
        rawDate: new Date(apt.date || apt.appointmentDate),
        // Enhanced fields
        createdAt: apt.updatedAt || apt.createdAt,
        updatedAt: apt.updatedAt || apt.createdAt,
        createdBy: doctorName,
        createdByRole: "Doctor",
        fullTimestamp: apt.updatedAt
          ? format(new Date(apt.updatedAt), "MMM dd, yyyy 'at' hh:mm a")
          : format(new Date(apt.date || apt.appointmentDate), "MMM dd, yyyy"),
        lastModified: apt.updatedAt
          ? format(new Date(apt.updatedAt), "MMM dd, yyyy 'at' hh:mm a")
          : format(new Date(apt.date || apt.appointmentDate), "MMM dd, yyyy"),
      });
    }
  });

  // Sort by date (most recent first)
  allEntries.sort((a, b) => b.rawDate - a.rawDate);

  const getIcon = (iconType) => {
    switch (iconType) {
      case "calendar":
        return <Calendar className="h-5 w-5" />;
      case "video":
        return <Video className="h-5 w-5" />;
      case "stethoscope":
        return <Stethoscope className="h-5 w-5" />;
      case "pill":
        return <Pill className="h-5 w-5" />;
      case "activity":
        return <Activity className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Case Logs</h2>
        <p className="text-gray-600">Timestamped patient activity timeline</p>
      </div>

      <div className="space-y-4">
        {allEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors p-5 shadow-sm"
          >
            <div className="flex items-start space-x-4">
              {/* Icon */}
              <div
                className={`flex-shrink-0 w-12 h-12 ${entry.iconBg} rounded-xl flex items-center justify-center ${entry.iconColor}`}
              >
                {getIcon(entry.icon)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {entry.title}
                      </h3>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${entry.statusClass}`}
                      >
                        {entry.status}
                      </span>
                    </div>

                    <p className="text-sm text-gray-700 mb-2">
                      {entry.description}
                    </p>

                    {/* Enhanced timestamp and creator information */}
                    <div className="space-y-1">
                      {/* Created timestamp and creator */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Created: {entry.fullTimestamp}</span>
                        </div>
                        {entry.createdBy && entry.createdBy !== "System" && (
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>by {entry.createdBy}</span>
                            {entry.createdByRole && (
                              <span className="text-blue-600 font-medium">
                                ({entry.createdByRole})
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Last modified (if different from created) */}
                      {entry.lastModified !== entry.fullTimestamp && (
                        <div className="flex items-center space-x-1 text-xs text-gray-400">
                          <RefreshCw className="h-3 w-3" />
                          <span>Last updated: {entry.lastModified}</span>
                        </div>
                      )}

                      {/* Appointment time (if applicable) */}
                      {entry.type.includes("Appointment") ||
                      entry.type.includes("Teleconsultation") ? (
                        <div className="flex items-center space-x-1 text-xs text-blue-600">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Scheduled for: {entry.date} at {entry.time}
                          </span>
                        </div>
                      ) : (
                        entry.type === "Visit" && (
                          <div className="flex items-center space-x-1 text-xs text-green-600">
                            <MapPin className="h-3 w-3" />
                            <span>Visit time: {entry.time}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  {/* Type badge */}
                  <div className="flex-shrink-0 ml-4">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {entry.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {allEntries.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No case log entries
          </h3>
          <p className="text-gray-600">
            Appointments, visits, and consultations will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default PatientView;
