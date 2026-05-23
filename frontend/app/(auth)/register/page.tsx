'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: form.role, department: form.department }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = `/${data.user.role === 'hod' ? 'coordinator' : data.user.role}`;
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const updateField = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-8">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-cardinal rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-lg">CX</span>
          </div>
          <h2 className="text-2xl font-display text-thunder">Create your account</h2>
          <p className="text-slate text-sm mt-1">Join CapstoneX to manage your academic projects</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-cardinal">{error}</div>}

        <form onSubmit={handleRegister} className="bg-white rounded-lg border border-border p-8 shadow-card space-y-5">
          <Input label="Full Name" placeholder="John Doe" value={form.name} onChange={e => updateField('name', e.target.value)} required id="register-name" />
          <Input label="Email" type="email" placeholder="you@university.edu" value={form.email} onChange={e => updateField('email', e.target.value)} required id="register-email" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Password" type="password" placeholder="Min 8 characters" value={form.password} onChange={e => updateField('password', e.target.value)} required id="register-password" />
            <Input label="Confirm Password" type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => updateField('confirmPassword', e.target.value)} required id="register-confirm" />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-thunder">Role</label>
            <select value={form.role} onChange={e => updateField('role', e.target.value)} className="w-full px-3 py-2 text-sm border border-border rounded-md" id="register-role">
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
              <option value="coordinator">Coordinator</option>
              <option value="hod">HOD</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Input label="Department" placeholder="e.g., Computer Science" value={form.department} onChange={e => updateField('department', e.target.value)} id="register-dept" />

          <Button type="submit" className="w-full" loading={loading} id="register-submit">Create Account</Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate">
          Already have an account? <Link href="/login" className="text-cardinal font-medium hover:text-cardinal-hover">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
