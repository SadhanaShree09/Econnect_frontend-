import React, { useState, useEffect } from 'react';
import { FaPlay, FaCheck, FaCog, FaChartBar, FaWifi, FaTimesCircle } from 'react-icons/fa';
import { ipadr } from '../Utils/Resuse';
import { toast } from 'react-hot-toast';

const NotificationSystemTest = () => {
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState([]);

  // Check system status
  const checkSystemStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${ipadr}/notification-system-status`);
      const data = await response.json();
      setSystemStatus(data);
      
      if (data.status === 'operational') {
        toast.success('Notification system is operational!');
      } else {
        toast.error('System status check failed');
      }
    } catch (error) {
      console.error('Error checking system status:', error);
      toast.error('Failed to check system status');
    } finally {
      setLoading(false);
    }
  };

  // Run automation checks
  const runAutomationTest = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${ipadr}/run-automation-checks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setTestResults(prev => [...prev, {
          test: 'Automation Checks',
          status: 'success',
          result: data.results,
          timestamp: new Date().toLocaleTimeString()
        }]);
        toast.success('Automation checks completed successfully!');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error running automation test:', error);
      setTestResults(prev => [...prev, {
        test: 'Automation Checks',
        status: 'error',
        result: error.message,
        timestamp: new Date().toLocaleTimeString()
      }]);
      toast.error('Automation test failed');
    } finally {
      setLoading(false);
    }
  };

  // Send test notification
  const sendTestNotification = async () => {
    const userid = localStorage.getItem('userid');
    if (!userid) {
      toast.error('Please login to test notifications');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${ipadr}/test-notifications/${userid}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setTestResults(prev => [...prev, {
          test: 'Test Notification',
          status: 'success',
          result: data,
          timestamp: new Date().toLocaleTimeString()
        }]);
        toast.success('Test notification sent! Check your notifications panel.');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      setTestResults(prev => [...prev, {
        test: 'Test Notification',
        status: 'error',
        result: error.message,
        timestamp: new Date().toLocaleTimeString()
      }]);
      toast.error('Failed to send test notification');
    } finally {
      setLoading(false);
    }
  };

  // Check overdue tasks
  const runOverdueTasksCheck = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${ipadr}/check-overdue-tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setTestResults(prev => [...prev, {
          test: 'Overdue Tasks Check',
          status: 'success',
          result: data.result,
          timestamp: new Date().toLocaleTimeString()
        }]);
        toast.success('Overdue tasks check completed!');
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Error checking overdue tasks:', error);
      setTestResults(prev => [...prev, {
        test: 'Overdue Tasks Check',
        status: 'error',
        result: error.message,
        timestamp: new Date().toLocaleTimeString()
      }]);
      toast.error('Overdue tasks check failed');
    } finally {
      setLoading(false);
    }
  };

  // Load initial status
  useEffect(() => {
    checkSystemStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📊 Enhanced Notification System Test Dashboard
          </h1>
          <p className="text-gray-600">
            Test and monitor the enhanced E-Connect notification system
          </p>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">System Status</h2>
            <button
              onClick={checkSystemStatus}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Checking...' : 'Refresh Status'}
            </button>
          </div>

          {systemStatus ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Overall Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Overall Status</span>
                  {systemStatus.status === 'operational' ? (
                    <FaCheck className="text-green-500" />
                  ) : (
                    <FaTimesCircle className="text-red-500" />
                  )}
                </div>
                <p className={`text-lg font-bold capitalize ${
                  systemStatus.status === 'operational' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {systemStatus.status}
                </p>
              </div>

              {/* WebSocket Connections */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">WebSocket</span>
                  <FaWifi className="text-blue-500" />
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {systemStatus.websocket?.active_users || 0} users
                </p>
                <p className="text-xs text-gray-500">
                  {systemStatus.websocket?.total_connections || 0} connections
                </p>
              </div>

              {/* Notifications */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Notifications</span>
                  <FaChartBar className="text-purple-500" />
                </div>
                <p className="text-lg font-bold text-purple-600">
                  {systemStatus.notifications?.total || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {systemStatus.notifications?.recent_24h || 0} in 24h
                </p>
              </div>

              {/* Scheduler */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Scheduler</span>
                  <FaCog className="text-orange-500" />
                </div>
                <p className={`text-lg font-bold capitalize ${
                  systemStatus.scheduler?.status === 'running' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {systemStatus.scheduler?.status || 'unknown'}
                </p>
                <p className="text-xs text-gray-500">
                  {systemStatus.scheduler?.jobs || 0} jobs
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading system status...</p>
            </div>
          )}
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Test Controls</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={sendTestNotification}
              disabled={loading}
              className="bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <FaPlay />
              <span>Send Test Notification</span>
            </button>

            <button
              onClick={runAutomationTest}
              disabled={loading}
              className="bg-purple-500 text-white px-4 py-3 rounded-lg hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <FaCog />
              <span>Run Automation</span>
            </button>

            <button
              onClick={runOverdueTasksCheck}
              disabled={loading}
              className="bg-orange-500 text-white px-4 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <FaChartBar />
              <span>Check Overdue Tasks</span>
            </button>

            <button
              onClick={() => window.open('/User/enhanced-notifications', '_blank')}
              className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2"
            >
              <FaWifi />
              <span>Open Notifications</span>
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Test Results</h2>
          
          {testResults.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No test results yet. Run some tests to see results here.
            </div>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    result.status === 'success'
                      ? 'bg-green-50 border-green-500'
                      : 'bg-red-50 border-red-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-800">{result.test}</h3>
                    <span className="text-xs text-gray-500">{result.timestamp}</span>
                  </div>
                  <div className={`text-sm ${
                    result.status === 'success' ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.status === 'success' ? (
                      <div>
                        <p className="font-medium">✅ Success</p>
                        {typeof result.result === 'object' ? (
                          <pre className="mt-2 text-xs bg-white p-2 rounded border">
                            {JSON.stringify(result.result, null, 2)}
                          </pre>
                        ) : (
                          <p className="mt-1">{result.result}</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">❌ Error</p>
                        <p className="mt-1">{result.result}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl p-6 mt-6">
          <h3 className="text-lg font-bold text-blue-800 mb-3">📋 How to Test</h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Check the system status above to ensure all components are operational</li>
            <li>Click "Send Test Notification" to create a sample notification</li>
            <li>Open the notifications panel to see real-time notifications</li>
            <li>Run automation tests to verify scheduled notification checks</li>
            <li>Check overdue tasks to test task deadline monitoring</li>
            <li>Monitor WebSocket connections for real-time functionality</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default NotificationSystemTest;
