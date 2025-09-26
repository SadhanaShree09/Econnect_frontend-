import React, { useState, useEffect } from "react";
import { Calendar, TrendingUp, Clock, UserCheck } from "lucide-react";
import { LS, ipadr } from "../Utils/Resuse";

const API_BASE_URL = `${ipadr}`;

const AttendanceStats = ({ onClose }) => {
  const userid = LS.get("userid");
  
  // Generate available years dynamically (current year and previous 2 years)
  const getCurrentYear = () => new Date().getFullYear();
  const generateAvailableYears = () => {
    const currentYear = getCurrentYear();
    return [currentYear, currentYear - 1, currentYear - 2];
  };

  const [availableYears] = useState(generateAvailableYears());
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Custom Bar Chart Component
  const CustomBarChart = ({ data }) => {
    const maxCount = Math.max(...data.map(d => d.count));
    
    return (
      <div className="space-y-6">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{item.metric}</span>
              <span className="text-sm text-gray-500">
                {item.count} days ({item.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-gray-200 rounded-full h-8 relative overflow-hidden">
                <div
                  className={`h-full ${item.bgColor} rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2`}
                  style={{ 
                    width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%`,
                    minWidth: item.count > 0 ? '40px' : '0px'
                  }}
                >
                  <span className="text-white text-xs font-medium">
                    {item.count}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const fetchAttendanceData = async (year) => {
    if (!userid) {
      setError("User ID is not available.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/attendance/user/${userid}/year/${year}`);
      
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data);
      } else {
        setError(`Failed to fetch attendance data for ${year}`);
      }
    } catch (err) {
      setError("Error fetching attendance data: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData(selectedYear);
  }, [selectedYear, userid]);

  const handleYearChange = (year) => {
    setSelectedYear(year);
  };

  const getChartData = () => {
    if (!attendanceData) return [];

    const stats = attendanceData.attendance_stats;
    return [
      {
        metric: "Present Days",
        count: stats.present_days,
        percentage: stats.attendance_percentage,
        color: "#10B981",
        bgColor: "bg-green-500"
      },
      {
        metric: "Leave Days",
        count: stats.leave_days_taken,
        percentage: stats.leave_percentage,
        color: "#F59E0B",
        bgColor: "bg-yellow-500"
      },
      {
        metric: "Absent Days",
        count: stats.total_working_days - stats.present_days - stats.leave_days_taken,
        percentage: 100 - stats.attendance_percentage - stats.leave_percentage,
        color: "#EF4444",
        bgColor: "bg-red-500"
      }
    ];
  };

  const StatCard = ({ icon, title, value, subtitle, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Attendance Analytics</h2>
              <p className="text-gray-600">
                {attendanceData?.user_info?.name || "Employee"} - Year {selectedYear}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {/* Year Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Year</label>
            <div className="flex space-x-2">
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => handleYearChange(year)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedYear === year
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading attendance data...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {attendanceData && !loading && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  icon={<Calendar className="h-6 w-6 text-blue-600" />}
                  title="Total Working Days"
                  value={attendanceData.attendance_stats.total_working_days}
                  color="text-blue-600"
                />
                <StatCard
                  icon={<UserCheck className="h-6 w-6 text-green-600" />}
                  title="Present Days"
                  value={attendanceData.attendance_stats.present_days}
                  subtitle={`${attendanceData.attendance_stats.attendance_percentage.toFixed(1)}%`}
                  color="text-green-600"
                />
                <StatCard
                  icon={<Clock className="h-6 w-6 text-yellow-600" />}
                  title="Leave Days"
                  value={attendanceData.attendance_stats.leave_days_taken}
                  subtitle={`${attendanceData.attendance_stats.leave_percentage.toFixed(1)}%`}
                  color="text-yellow-600"
                />
                <StatCard
                  icon={<TrendingUp className="h-6 w-6 text-purple-600" />}
                  title="Attendance Rate"
                  value={`${attendanceData.attendance_stats.attendance_percentage.toFixed(1)}%`}
                  color="text-purple-600"
                />
              </div>

              {/* Chart Section */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">Attendance Breakdown</h3>
                <CustomBarChart data={getChartData()} />
              </div>

              {/* Summary Section */}
              <div className="mt-6 bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">
                      <span className="font-medium">Employee:</span> {attendanceData.user_info.name}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Email:</span> {attendanceData.user_info.email}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Year:</span> {attendanceData.year}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">
                      <span className="font-medium">Last Updated:</span>{" "}
                      {new Date(attendanceData.attendance_stats.last_updated).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Status:</span>{" "}
                      <span className={`font-medium ${
                        attendanceData.attendance_stats.attendance_percentage >= 75 
                          ? 'text-green-600' 
                          : attendanceData.attendance_stats.attendance_percentage >= 60 
                          ? 'text-yellow-600' 
                          : 'text-red-600'
                      }`}>
                        {attendanceData.attendance_stats.attendance_percentage >= 75 
                          ? 'Excellent' 
                          : attendanceData.attendance_stats.attendance_percentage >= 60 
                          ? 'Good' 
                          : 'Needs Improvement'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceStats;