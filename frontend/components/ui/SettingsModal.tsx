'use client';

import { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultName?: string;
  defaultEmail?: string;
  role?: string;
}

export default function SettingsModal({ isOpen, onClose, defaultName = 'User', defaultEmail = 'user@capstonex.com', role = 'Student' }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [loading, setLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Profile updated successfully!');
      onClose();
    }, 800);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Account Settings" size="lg">
      <div className="flex flex-col md:flex-row gap-6 -mx-6 -mt-1 px-6">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-1/4 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-4 flex md:flex-col gap-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'profile' ? 'bg-cardinal-50 text-cardinal' : 'text-slate hover:bg-gray-50 hover:text-thunder'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'security' ? 'bg-cardinal-50 text-cardinal' : 'text-slate hover:bg-gray-50 hover:text-thunder'
            }`}
          >
            Security
          </button>
        </div>

        {/* Main Content Area */}
        <div className="w-full md:w-3/4 pb-2">
          <form onSubmit={handleSave} className="space-y-6">
            
            {activeTab === 'profile' && (
              <div className="space-y-5 animate-fade-in">
                {/* Avatar Section */}
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cardinal to-cardinal-600 flex items-center justify-center text-white text-2xl font-bold shadow-inner-glow">
                    {defaultName.charAt(0)}
                  </div>
                  <div>
                    <Button variant="secondary" size="sm" type="button">Change Avatar</Button>
                    <p className="text-xs text-slate mt-2">JPG, GIF or PNG. Max size 2MB.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Full Name" defaultValue={defaultName} required />
                  <Input label="Email Address" type="email" defaultValue={defaultEmail} required />
                </div>
                
                <Input label="Role / Department" defaultValue={role} disabled />
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-thunder">Bio</label>
                  <textarea 
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-cardinal/15 focus:border-cardinal focus:outline-none transition-all resize-none"
                    rows={3}
                    placeholder="Write a short bio about yourself..."
                  />
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-5 animate-fade-in">
                <Input label="Current Password" type="password" placeholder="••••••••" required />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="New Password" type="password" placeholder="••••••••" required />
                  <Input label="Confirm New Password" type="password" placeholder="••••••••" required />
                </div>
                <p className="text-xs text-slate">Password must be at least 8 characters long and contain a mix of letters, numbers, and symbols.</p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-4 mt-6 border-t border-gray-100 flex justify-end gap-3">
              <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
              <Button type="submit" loading={loading}>Save Changes</Button>
            </div>
          </form>
        </div>
        
      </div>
    </Modal>
  );
}
