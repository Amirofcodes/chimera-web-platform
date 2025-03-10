import React from 'react';
import { Card } from '../components/shared/Card';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.name || 'Developer'}</h2>
        <p>Manage your development environments and templates from this dashboard.</p>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-bold mb-2">Active Environments</h3>
          <p className="text-2xl font-semibold">0</p>
        </Card>
        
        <Card>
          <h3 className="text-lg font-bold mb-2">Recent Templates</h3>
          <p className="text-gray-600">No recent templates</p>
        </Card>
        
        <Card>
          <h3 className="text-lg font-bold mb-2">System Status</h3>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>All systems operational</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;