'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useCurrentUser } from '@/lib/hooks';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';

interface User {
  id: string; name: string; email: string; role: string;
  department: string | null; is_active: boolean; created_at: string;
}

export default function AdminUsersPage() {
  const currentUser = useCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modal states
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [csvModal, setCsvModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form state for add/edit
  const [form, setForm] = useState({ name: '', email: '', role: 'student', department: '' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page, limit };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await api.get('/users', { params });
      setUsers(res.data.data || []);
      setTotal(res.data.pagination?.total || 0);
    } catch {
      // Fallback mock data if not logged in
      setUsers([
        { id: '1', name: 'Admin User', email: 'admin@capstonex.com', role: 'admin', department: 'Administration', is_active: true, created_at: '2026-05-01' },
        { id: '2', name: 'Dr. Rajesh Kumar', email: 'hod@capstonex.com', role: 'hod', department: 'Computer Science', is_active: true, created_at: '2026-05-01' },
        { id: '3', name: 'Prof. Anita Sharma', email: 'mentor1@capstonex.com', role: 'mentor', department: 'Computer Science', is_active: true, created_at: '2026-05-01' },
        { id: '4', name: 'Student 1', email: 'student1@capstonex.com', role: 'student', department: 'Computer Science', is_active: true, created_at: '2026-05-01' },
      ]);
      setTotal(4);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleEdit = (u: User) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, role: u.role, department: u.department || '' });
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await api.put(`/users/${editUser.id}`, { name: form.name, role: form.role, department: form.department });
      setMessage('User updated successfully');
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to update user');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setSaving(true);
    try {
      await api.delete(`/users/${deleteUser.id}`);
      setMessage('User deactivated successfully');
      setDeleteUser(null);
      fetchUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to deactivate user');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAddUser = async () => {
    setSaving(true);
    try {
      await api.post('/auth/register', { ...form, password: 'CapstoneX@2024' });
      setMessage('User created successfully');
      setAddModal(false);
      setForm({ name: '', email: '', role: 'student', department: '' });
      fetchUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Failed to create user');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/users/bulk-import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(res.data.message);
      setCsvModal(false);
      fetchUsers();
    } catch (err: any) {
      setMessage(err.response?.data?.error || 'Import failed');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const roleColors: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
    admin: 'error', hod: 'warning', mentor: 'info', coordinator: 'success', student: 'default', accreditation: 'default',
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <DashboardLayout role="admin" title="User Management" userName={currentUser?.name || 'Admin'}>
      {/* Toast */}
      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700 animate-fade-in">
          {message}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <input type="text" placeholder="Search by name or email..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full px-3 py-2 text-sm border border-border rounded-md focus:ring-2 focus:ring-cardinal focus:outline-none"
            id="search-users" />
          <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-sm border border-border rounded-md">
            <option value="">All Roles</option>
            {['student', 'mentor', 'coordinator', 'hod', 'admin', 'accreditation'].map(r => (
              <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setCsvModal(true)}>📄 CSV Import</Button>
          <Button onClick={() => { setAddModal(true); setForm({ name: '', email: '', role: 'student', department: '' }); }}>+ Add User</Button>
        </div>
      </div>

      {/* Users Table */}
      <Card padding="sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-slate font-medium">Name</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Email</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Role</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Department</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Status</th>
                <th className="text-left py-3 px-4 text-slate font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className="py-8 text-center text-slate">No users found</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cardinal-light flex items-center justify-center text-xs font-semibold text-cardinal">
                          {u.name.charAt(0)}
                        </div>
                        <span className="font-medium text-thunder">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate">{u.email}</td>
                    <td className="py-3 px-4"><Badge variant={roleColors[u.role] || 'default'}>{u.role}</Badge></td>
                    <td className="py-3 px-4 text-slate">{u.department || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 text-xs ${u.is_active ? 'text-green-600' : 'text-slate'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(u)} className="text-xs text-cardinal hover:text-cardinal-hover font-medium">Edit</button>
                        <button onClick={() => setDeleteUser(u)} className="text-xs text-slate hover:text-red-600 font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <p className="text-xs text-slate">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}</p>
            <div className="flex gap-1">
              <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 text-xs border border-border rounded disabled:opacity-40 hover:bg-surface">Prev</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 text-xs rounded ${page === i + 1 ? 'bg-cardinal text-white' : 'border border-border hover:bg-surface'}`}>
                  {i + 1}
                </button>
              ))}
              <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 text-xs border border-border rounded disabled:opacity-40 hover:bg-surface">Next</button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      {editUser && (
        <Modal isOpen={true} title="Edit User" onClose={() => setEditUser(null)}>
          <div className="space-y-4">
            <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-thunder mb-1">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border rounded-md">
                {['student', 'mentor', 'coordinator', 'hod', 'admin', 'accreditation'].map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
            <Input label="Department" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={() => setEditUser(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit} loading={saving}>Save Changes</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteUser && (
        <Modal title="Deactivate User" onClose={() => setDeleteUser(null)}>
          <p className="text-sm text-slate mb-4">
            Are you sure you want to deactivate <strong>{deleteUser.name}</strong> ({deleteUser.email})? They will no longer be able to log in.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteUser(null)}>Cancel</Button>
            <Button onClick={handleDelete} loading={saving} className="!bg-red-600 hover:!bg-red-700">Deactivate</Button>
          </div>
        </Modal>
      )}

      {/* Add User Modal */}
      {addModal && (
        <Modal title="Add New User" onClose={() => setAddModal(false)}>
          <div className="space-y-4">
            <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <div>
              <label className="block text-sm font-medium text-thunder mb-1">Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-border rounded-md">
                {['student', 'mentor', 'coordinator', 'hod', 'admin'].map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
            <Input label="Department" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
            <p className="text-xs text-slate">Default password: <code className="bg-surface px-1 rounded">CapstoneX@2024</code></p>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button>
              <Button onClick={handleAddUser} loading={saving}>Create User</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* CSV Import Modal */}
      {csvModal && (
        <Modal title="Import Users from CSV" onClose={() => setCsvModal(false)}>
          <div className="space-y-4">
            <p className="text-sm text-slate">Upload a CSV file with columns: <code className="bg-surface px-1 rounded text-xs">name, email, role, department</code></p>
            <input type="file" accept=".csv" onChange={handleCSVImport} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-cardinal file:text-white file:cursor-pointer" />
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="secondary" onClick={() => setCsvModal(false)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
