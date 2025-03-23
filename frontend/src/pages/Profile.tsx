// src/pages/Profile.tsx with enhanced styling
import React, { useState, useEffect } from 'react';
import { Card } from '../components/shared/Card';
import Button from '../components/shared/Button';
import { Spinner } from '../components/shared/Spinner';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { authService } from '../services/authService';

interface ProfileData {
  id: string;
  email: string;
  name?: string;
  created_at?: string;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);


  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/auth/profile');
        if (response.data && response.data.success) {
          setProfileData(response.data.user);
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load profile data'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: 'error',
        text: 'New passwords do not match'
      });
      return;
    }
    
    setPasswordLoading(true);
    setPasswordMessage(null);
    
    try {
      await authService.changePassword(currentPassword, newPassword);
      
      setPasswordMessage({
        type: 'success',
        text: 'Password updated successfully'
      });
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordMessage({
        type: 'error',
        text: error.response?.data?.error || 'Failed to update password'
      });
    } finally {
      setPasswordLoading(false);
    }
  };


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

  if (loading && !profileData) {
    return (
      <div className="flex justify-center items-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  // Combine local user data with API data, preferring API data
  const userData = profileData || user;
  const userInitial = userData?.name?.charAt(0)?.toUpperCase() || userData?.email?.charAt(0)?.toUpperCase() || '?';

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 mb-4 md:mb-0 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
              {previewUrl ? (
                <img src={previewUrl} alt="Profile preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl text-gray-400">{userInitial}</span>
              )}
            </div>
            
            <div className="mt-6 w-full">
              <p className="text-sm font-medium mb-2">Change Profile Picture</p>
              <label 
                className="block w-full px-4 py-2 text-sm font-medium text-center text-blue-700 bg-blue-50 rounded cursor-pointer hover:bg-blue-100 transition-colors mb-2"
              >
                Choose File
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden"
                  onChange={handleFileChange} 
                />
              </label>
              <p className="text-xs text-center text-gray-500">
                {profileImage ? profileImage.name : "No file selected"}
              </p>
              
              {profileImage && (
                <Button 
                  variant="primary" 
                  className="mt-4 w-full" 
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
          
          <div className="md:w-2/3 md:pl-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <div className="p-3 bg-gray-50 rounded-md border border-gray-100">{userData?.email}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <div className="p-3 bg-gray-50 rounded-md border border-gray-100">{userData?.name || 'Not provided'}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Account Created</label>
                <div className="p-3 bg-gray-50 rounded-md border border-gray-100">
                  {userData?.created_at 
                    ? new Date(userData.created_at).toLocaleDateString() 
                    : 'Unknown'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="mb-6">
       <h2 className="text-xl font-semibold mb-4">Change Password</h2>
       <form onSubmit={handlePasswordChange}>
         <div className="space-y-4">
           <div>
             <label className="block text-sm font-medium mb-1">Current Password</label>
             <input
               type="password"
               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
               value={currentPassword}
               onChange={(e) => setCurrentPassword(e.target.value)}
               required
             />
           </div>
      
           <div>
             <label className="block text-sm font-medium mb-1">New Password</label>
             <input
               type="password"
               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
               value={newPassword}
               onChange={(e) => setNewPassword(e.target.value)}
               required
               minLength={8}
             />
           </div>
      
           <div>
             <label className="block text-sm font-medium mb-1">Confirm New Password</label>
             <input
               type="password"
               className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
               value={confirmPassword}
               onChange={(e) => setConfirmPassword(e.target.value)}
               required
               minLength={8}
             />
           </div>
      
           {passwordMessage && (
             <div className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
               {passwordMessage.text}
             </div>
           )}
      
           <Button
             variant="primary"
             type="submit"
             isLoading={passwordLoading}
           >
             Update Password
           </Button>
         </div>
       </form>
     </Card>
    </div>
  );
};

export default ProfilePage;