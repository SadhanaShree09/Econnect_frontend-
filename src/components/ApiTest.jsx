import React, { useState, useEffect } from 'react';
import { Baseaxios } from '../Utils/Resuse';

const ApiTest = () => {
  const [testResult, setTestResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const testApiConnection = async () => {
    setIsLoading(true);
    try {
      const response = await Baseaxios.get('/test');
      setTestResult(`✅ API Connected: ${JSON.stringify(response.data)}`);
    } catch (error) {
      setTestResult(`❌ API Error: ${error.message}`);
      console.error('API Test Error:', error);
    }
    setIsLoading(false);
  };

  const testNotification = async () => {
    setIsLoading(true);
    try {
      const userId = localStorage.getItem('userid') || 'test-user';
      const response = await Baseaxios.get(`/test-notifications/${userId}`);
      setTestResult(`✅ Notification Test: ${JSON.stringify(response.data)}`);
    } catch (error) {
      setTestResult(`❌ Notification Error: ${error.message}`);
      console.error('Notification Test Error:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    // Auto-test on component mount
    testApiConnection();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">API Connection Test</h2>
      
      <div className="space-y-4">
        <div>
          <button 
            onClick={testApiConnection}
            disabled={isLoading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test API Connection'}
          </button>
        </div>

        <div>
          <button 
            onClick={testNotification}
            disabled={isLoading}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test Notification System'}
          </button>
        </div>

        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-semibold mb-2">Test Result:</h3>
          <pre className="whitespace-pre-wrap text-sm">{testResult}</pre>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <div className="text-sm space-y-1">
            <div>Frontend URL: {window.location.origin}</div>
            <div>API Base URL: {import.meta.env.VITE_HOST_IP || "http://127.0.0.1:8000"}</div>
            <div>User ID: {localStorage.getItem('userid') || 'Not logged in'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiTest;
