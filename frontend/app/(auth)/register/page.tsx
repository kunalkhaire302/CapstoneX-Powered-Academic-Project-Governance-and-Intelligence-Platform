'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'student', department: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 8) return setError('Password must be at least 8 characters');
    setLoading(true);
    setError('');
    try {
      // 1. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.password);
      
      // 2. Send additional profile data to our backend
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          name: form.name, 
          email: form.email, 
          role: form.role, 
          department: form.department,
          firebase_uid: userCredential.user.uid
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed to save profile');
      
      const minimalUser = { email: userCredential.user.email, role: data.user?.role || 'student', id: userCredential.user.uid };
      localStorage.setItem('user', JSON.stringify(minimalUser));
      
      window.location.href = `/${minimalUser.role === 'hod' ? 'mentor' : minimalUser.role}`;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50 flex items-center justify-center p-8">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cardinal to-cardinal-600 flex items-center justify-center shadow-glow">
              <img src="/logo.png" alt="CX" className="w-8 h-8 object-contain brightness-0 invert" />
            </div>
          </div>
          <h2 className="text-2xl font-display text-thunder">Create your account</h2>
          <p className="text-slate text-sm mt-1">Join CapstoneX to manage your academic projects</p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 flex items-center gap-2 animate-scale-in">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="bg-white rounded-2xl border border-gray-100 p-8 shadow-card space-y-5">
          <Input label="Full Name" placeholder="John Doe" value={form.name} onChange={e => updateField('name', e.target.value)} required id="register-name" />
          <Input label="Email" type="email" placeholder="you@university.edu" value={form.email} onChange={e => updateField('email', e.target.value)} required id="register-email" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Password" type="password" placeholder="Min 8 chars" value={form.password} onChange={e => updateField('password', e.target.value)} required id="register-password" />
            <Input label="Confirm Password" type="password" placeholder="Repeat" value={form.confirmPassword} onChange={e => updateField('confirmPassword', e.target.value)} required id="register-confirm" />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-thunder">Role</label>
            <select value={form.role} onChange={e => updateField('role', e.target.value)} className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-white hover:border-gray-300 focus:ring-2 focus:ring-cardinal/15 focus:border-cardinal focus:outline-none transition-all" id="register-role">
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>

              <option value="hod">HOD</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Input label="Department" placeholder="e.g., Computer Science" value={form.department} onChange={e => updateField('department', e.target.value)} id="register-dept" />

          <Button type="submit" className="w-full" size="lg" loading={loading} id="register-submit">Create Account</Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate">
          Already have an account? <Link href="/login" className="text-cardinal font-semibold hover:text-cardinal-hover transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
