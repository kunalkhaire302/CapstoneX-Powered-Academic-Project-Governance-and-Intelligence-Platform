'use client';

import { useEffect, useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import api from '@/lib/api';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  bio?: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
}

export default function SettingsModal({ isOpen, onClose, profile, onSaveProfile }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [error, setError] = useState('');

  useEffect(() => setFormData(profile), [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'security') {
      setError('Password changes are not available from this workspace yet. Use the password recovery flow instead.');
      return;
    }
    setError('');
    setLoading(true);
    
    try {
      const { data } = await api.put('/users/profile', { name: formData.name, bio: formData.bio });
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        localStorage.setItem('user', JSON.stringify({ ...parsed, ...data.user }));
      }

      onSaveProfile({ ...formData, ...data.user });
      onClose();
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Profile could not be saved. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account Settings" size="lg">
      <div className="flex flex-col md:flex-row gap-6 -mx-6 -mt-1 px-6">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-1/4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4 flex md:flex-col gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'profile' ? 'bg-brand-50 text-brand' : 'text-slate hover:bg-gray-50 hover:text-thunder'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'security' ? 'bg-brand-50 text-brand' : 'text-slate hover:bg-gray-50 hover:text-thunder'
            }`}
          >
            Security
          </button>
        </div>

        {/* Main Content Area */}
        <div className="w-full md:w-3/4 pb-2">
          <form onSubmit={handleSave} className="space-y-6">
            {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            
            {activeTab === 'profile' && (
              <div className="space-y-5 animate-fade-in">
                {/* Avatar Section */}
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand to-brand-600 flex items-center justify-center text-white text-2xl font-bold shadow-inner-glow">
                    {formData.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <Button variant="secondary" size="sm" type="button" disabled title="Avatar uploads are not implemented by the API">Avatar uploads unavailable</Button>
                    <p className="text-xs text-slate mt-2">This workspace does not yet support avatar uploads.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input 
                    label="Full Name" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                  <Input 
                    label="Email Address" 
                    type="email" 
                    value={formData.email} 
                    disabled
                  />
                </div>
                
                <Input label="Role / Department" value={formData.role} disabled />
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-thunder">Bio</label>
                  <textarea 
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand/15 focus:border-brand focus:outline-none transition-all resize-none"
                    rows={3}
                    placeholder="Write a short bio about yourself..."
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  />
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-5 animate-fade-in">
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Password changes are unavailable here. Use password recovery to set a new password.</p>
                <Input label="Current Password" type="password" placeholder="••••••••" disabled />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="New Password" type="password" placeholder="••••••••" disabled />
                  <Input label="Confirm New Password" type="password" placeholder="••••••••" disabled />
                </div>
                <p className="text-xs text-slate">Password must be at least 8 characters long and contain a mix of letters, numbers, and symbols.</p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
              <Button type="submit" loading={loading} disabled={activeTab === 'security'}>{activeTab === 'security' ? 'Use password recovery' : 'Save Changes'}</Button>
            </div>
          </form>
        </div>
        
      </div>
    </Modal>
  );
}
