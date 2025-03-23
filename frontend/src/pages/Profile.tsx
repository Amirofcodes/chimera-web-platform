// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { Card } from '../components/shared/Card';
import Button from '../components/shared/Button';
import { Spinner } from '../components/shared/Spinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const ProfilePage = () => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!profileImage) return;
    
    setLoading(true);
    setMessage(null);
    
    // This would be replaced with actual API endpoint when implemented
    try {
      const formData = new FormData();
      formData.append('profile_image', profileImage);
      
      // Simulating upload for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({
        type: 'success',
        text: 'Profile image updated successfully!'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to update profile image'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-4 md:mb-0">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl text-gray-400">{user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}</span>
              )}
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Change Profile Picture</label>
              <input 
                type="file" 
                accept="image/*" 
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                onChange={handleFileChange}
              />
              
              {profileImage && (
                <Button 
                  variant="primary" 
                  className="mt-2" 
                  onClick={handleUpload}
                  isLoading={loading}
                >
                  Upload Image
                </Button>
              )}
              
              {message && (
                <div className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {message.text}
                </div>
              )}
            </div>
          </div>
          
          <div className="md:w-2/3">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <div className="p-2 bg-gray-50 rounded">{user?.email}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <div className="p-2 bg-gray-50 rounded">{user?.name || 'Not provided'}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Account Created</label>
                <div className="p-2 bg-gray-50 rounded">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;