import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { LS } from "../Utils/Resuse";

const AccessDenied = () => {
  const navigate = useNavigate();
  const isAdmin = LS.get("isadmin");
  const userName = LS.get("name") || "User";

  const handleGoBack = () => {
    navigate(-1); // Go back to previous page
  };

  const handleGoHome = () => {
    // Navigate to appropriate dashboard based on user role
    if (isAdmin) {
      navigate("/admin/time");
    } else {
      navigate("/User/Clockin_int");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">
            Sorry {userName}, you don't have permission to view this page.
          </p>
          <p className="text-sm text-gray-500">
            This page requires administrative privileges. If you believe you should have access to this area, please contact your administrator.
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleGoHome}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
          >
            Go to Dashboard
          </button>
          <button
            onClick={handleGoBack}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-200"
          >
            Go Back
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            If you need access to administrative features, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
