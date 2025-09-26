import React from 'react';
import { LS } from '../Utils/Resuse';
import { useNotificationWebSocket } from '../hooks/useNotificationWebSocket';

const WebSocketTest = () => {
  // const { isConnected, connectionError } = useNotificationWebSocket();
  // const testUserId = LS.get('userid');
  
  // return (
  //   <div className="p-4 bg-gray-100 rounded">
  //     <h3 className="font-bold mb-2">WebSocket Connection Status</h3>
  //     <div className="space-y-2 text-sm">
  //       <div>User ID: {testUserId || 'NOT FOUND'}</div>
  //       <div>API Base: {import.meta.env.VITE_HOST_IP || 'http://127.0.0.1:8000'}</div>
  //       <div className={`font-medium ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
  //         Status: {isConnected ? 'Connected' : 'Disconnected'}
  //       </div>
  //       {connectionError && (
  //         <div className="text-red-600">Error: {connectionError}</div>
  //       )}
  //     </div>
  //   </div>
  // );
};

export default WebSocketTest;