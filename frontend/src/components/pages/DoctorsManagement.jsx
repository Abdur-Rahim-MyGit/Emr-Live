import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Users,
  UserCheck,
  UserX,
  Stethoscope,
  Phone,
  Mail,
  Calendar,
  MoreVertical,
  X,
  Save,
  AlertCircle,
  Building2,
  MapPin
} from 'lucide-react';
import { usersAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const DoctorsManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // State for real doctors data
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSpecialty, setFilterSpecialty] = useState('all');

  // Fetch real doctors data from API
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        
        console.log('Current user:', user);
        
        // Build query parameters for doctors
        const params = {
          role: 'doctor'
        };
        
        // If user is clinic admin, only show doctors from their clinic
        if (user?.role === 'clinic_admin' && user?.clinicId) {
          params.clinicId = user.clinicId;
        }
        
        console.log('Fetching doctors with params:', params);
        const response = await usersAPI.getAll(params);
        console.log('API Response:', response.data);
        
        if (response.data.success) {
          console.log('Raw API response users:', response.data.users);
          
          const doctorsData = response.data.users.map(doctor => {
            console.log('Processing doctor:', doctor);
            
            // Handle different data structures from MongoDB
            const fullName = doctor.fullName || 
                            (doctor.firstName && doctor.lastName ? `${doctor.firstName} ${doctor.lastName}` : '') ||
                            doctor.name || 
                            'Unknown Doctor';
            
            const specialty = doctor.specialty || 
                            doctor.specialization || 
                            'General Medicine';
            
            const clinic = doctor.clinicId ? {
              _id: typeof doctor.clinicId === 'object' ? doctor.clinicId._id : doctor.clinicId,
              name: typeof doctor.clinicId === 'object' ? doctor.clinicId.name : 'Unknown Clinic'
            } : null;
            
            return {
              _id: doctor._id,
              fullName: fullName,
              firstName: doctor.firstName,
              lastName: doctor.lastName,
              specialty: specialty,
              email: doctor.email,
              phone: doctor.phone || 'N/A',
              isActive: doctor.isActive !== false,
              role: doctor.role,
              createdAt: doctor.createdAt,
              clinic: clinic
            };
          });
          
          console.log('Processed doctors data:', doctorsData);
          setDoctors(doctorsData);
          setFilteredDoctors(doctorsData);
          
          if (doctorsData.length > 0) {
            toast.success(`Loaded ${doctorsData.length} doctors`);
          } else {
            toast('No doctors found in the database', { icon: 'ℹ️' });
          }
        } else {
          console.error('API response not successful:', response.data);
          toast.error(response.data.message || 'Failed to load doctors');
        }
      } catch (error) {
        console.error('Error fetching doctors:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          toast.error(error.response.data.message || 'Failed to load doctors data');
        } else {
          toast.error('Network error: Failed to connect to server');
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is available (authenticated)
    if (user) {
      fetchDoctors();
    } else {
      setLoading(false);
      toast.error('Please login to view doctors');
    }
  }, [user]);

  // Filter doctors based on search and filters
  useEffect(() => {
    let filtered = [...doctors];

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(doctor =>
        doctor.fullName.toLowerCase().includes(search) ||
        doctor.email.toLowerCase().includes(search) ||
        doctor.specialty.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(doctor => 
        filterStatus === 'active' ? doctor.isActive : !doctor.isActive
      );
    }

    // Specialty filter
    if (filterSpecialty !== 'all') {
      filtered = filtered.filter(doctor => doctor.specialty === filterSpecialty);
    }

    setFilteredDoctors(filtered);
  }, [doctors, searchTerm, filterStatus, filterSpecialty]);

  // Get unique specialties for filter
  const getUniqueSpecialties = () => {
    return [...new Set(doctors.map(doctor => doctor.specialty))];
  };

  // Test function to debug API call
  const testAPICall = async () => {
    try {
      console.log('Testing direct API call...');
      
      // Test the debug endpoint first
      console.log('Testing debug endpoint...');
      const testResponse = await fetch(`${(import.meta.env.VITE_API_URL || 'https://emr-backend-nhe8.onrender.com')}/api/users/test-doctors`);
      
      if (!testResponse.ok) {
        throw new Error(`HTTP ${testResponse.status}: ${testResponse.statusText}`);
      }
      
      const testData = await testResponse.json();
      console.log('Test endpoint response:', testData);
      
      // Test the regular API call
      console.log('Testing regular API...');
      let regularCount = 0;
      let regularError = null;
      
      try {
        const response = await usersAPI.getAll({ role: 'doctor' });
        console.log('Regular API Response:', response);
        regularCount = response.data.users?.length || 0;
        
        // If we got data from regular API, use it
        if (regularCount > 0) {
          const doctorsData = response.data.users.map(doctor => ({
            _id: doctor._id,
            fullName: doctor.fullName || `${doctor.firstName || ''} ${doctor.lastName || ''}`.trim() || 'Unknown Doctor',
            specialty: doctor.specialty || doctor.specialization || 'General Medicine',
            email: doctor.email,
            phone: doctor.phone || 'N/A',
            isActive: doctor.isActive !== false,
            role: doctor.role,
            createdAt: doctor.createdAt,
            clinic: doctor.clinicId ? {
              _id: typeof doctor.clinicId === 'object' ? doctor.clinicId._id : doctor.clinicId,
              name: typeof doctor.clinicId === 'object' ? doctor.clinicId.name : 'Unknown Clinic'
            } : null
          }));
          
          setDoctors(doctorsData);
          setFilteredDoctors(doctorsData);
          toast.success(`Loaded ${doctorsData.length} doctors via regular API`);
        }
      } catch (apiError) {
        console.error('Regular API Error:', apiError);
        regularError = apiError.message;
      }
      
      // Show detailed results
      const debugCount = testData.count || 0;
      const sampleDoctor = testData.sampleDoctor;
      
      let message = `Test Results:\n`;
      message += `Total users in DB: ${testData.allUsersCount || 0}\n`;
      message += `Debug endpoint: ${debugCount} doctors\n`;
      message += `Regular API: ${regularError ? 'ERROR: ' + regularError : regularCount + ' doctors'}\n`;
      
      if (testData.userRoles) {
        message += `\nUser roles in DB: ${testData.userRoles.join(', ')}\n`;
      }
      
      if (sampleDoctor) {
        message += `\nSample Doctor:\n`;
        message += `Name: ${sampleDoctor.fullName || (sampleDoctor.firstName + ' ' + sampleDoctor.lastName)}\n`;
        message += `Email: ${sampleDoctor.email}\n`;
        message += `Specialty: ${sampleDoctor.specialty || sampleDoctor.specialization}\n`;
        message += `Role: ${sampleDoctor.role}\n`;
      }
      
      alert(message);
      
    } catch (error) {
      console.error('Test API Error:', error);
      alert(`API Test Error: ${error.message}\n\nCheck console for details.`);
    }
  };

  // Statistics
  const stats = {
    total: doctors.length,
    active: doctors.filter(d => d.isActive).length,
    inactive: doctors.filter(d => !d.isActive).length,
    specialties: getUniqueSpecialties().length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctors Management</h1>
          <p className="text-gray-600 mt-1">Manage doctors and their information</p>
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={testAPICall}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <span>Test API</span>
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <span>Refresh</span>
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Doctor</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Doctors</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <Stethoscope className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Specialties</p>
              <p className="text-2xl font-bold text-gray-900">{stats.specialties}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search doctors by name, email, or specialty..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="min-w-[150px]">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Specialty Filter */}
          <div className="min-w-[180px]">
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
            >
              <option value="all">All Specialties</option>
              {getUniqueSpecialties().map(specialty => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctors Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Doctors List ({filteredDoctors.length})
          </h2>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {doctors.length === 0 
                ? "No doctors have been added yet." 
                : "Try adjusting your search or filter criteria."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Specialty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clinic
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDoctors.map((doctor) => (
                  <tr
                    key={doctor._id}
                    className="hover:bg-primary-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/doctors/${doctor._id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center">
                          <Stethoscope className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {doctor.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {doctor.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{doctor.specialty}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Phone className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {doctor.phone || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            Contact Number
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <Building2 className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {doctor.clinic?.name || 'No Clinic'}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                            {doctor.clinic?.address || 'Location not specified'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        doctor.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {doctor.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(doctor.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-primary-600">View</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorsManagement;