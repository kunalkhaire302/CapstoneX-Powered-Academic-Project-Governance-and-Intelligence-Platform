'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { StatCard } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { ColumnDef } from '@/components/ui/DataTable';
import { useCurrentUser } from '@/lib/hooks';
import { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { 
  Users, Plus, Upload, Trash2, Edit2, Search, 
  CheckCircle, PauseCircle, Activity, Shield, AlertTriangle
} from 'lucide-react';

interface User {
  id: string; name: string; email: string; role: string;
  department: string | null; is_active: boolean; created_at: string;
  sap_id?: string | null; roll_no?: string | null; branch?: string | null;
}

const ROLE_CONFIG: Record<string, { bg: string; text: string; dot: string; badge: 'success' | 'info' | 'warning' | 'error' | 'default' }> = {
  admin:         { bg: 'bg-red-50',    text: 'text-red-700',    dot: 'bg-red-500',    badge: 'error' },
  mentor:        { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: 'bg-blue-500',   badge: 'info' },
  student:       { bg: 'bg-slate-50',  text: 'text-slate-600',  dot: 'bg-slate-400',  badge: 'default' },
};

const ALL_ROLES = ['student', 'mentor', 'admin'];

export default function AdminUsersPage() {
  const currentUser = useCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [addModal, setAddModal] = useState(false);
  const [csvModal, setCsvModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: '', email: '', role: 'student', department: '', sap_id: '', roll_no: '', branch: '', password: '' });

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
      setUsers([
        { id: '1', name: 'Admin User',        email: 'admin@capstonex.com',   role: 'admin',  department: 'Administration',   is_active: true, created_at: '2026-05-01' },
        { id: '3', name: 'Prof. Anita Sharma',email: 'mentor1@capstonex.com', role: 'mentor', department: 'Computer Science', is_active: true, created_at: '2026-05-01' },
        { id: '4', name: 'Student 1',         email: 'student1@capstonex.com',role: 'student',department: 'Computer Science', is_active: true, created_at: '2026-05-01' },
      ]);
      setTotal(4);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleEdit = (u: User) => {
    setEditUser(u);
    setForm({ name: u.name, email: u.email, role: u.role, department: u.department || '', sap_id: u.sap_id || '', roll_no: u.roll_no || '', branch: u.branch || '', password: '' });
  };

  const handleSaveEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await api.put(`/users/${editUser.id}`, { 
        name: form.name, role: form.role,
        sap_id: form.sap_id, roll_no: form.roll_no, branch: form.branch
      });
      toast.success('User updated successfully');
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to update user');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteUser) return;
    setSaving(true);
    try {
      await api.delete(`/users/${deleteUser.id}`);
      toast.success('User deleted successfully');
      setDeleteUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to delete user');
    } finally { setSaving(false); }
  };

  const handleAddUser = async () => {
    setSaving(true);
    try {
      await api.post('/users/admin-create', { ...form, password: form.password || 'CapstoneX@2024' });
      toast.success('User created successfully');
      setAddModal(false);
      setForm({ name: '', email: '', role: 'student', department: '', sap_id: '', roll_no: '', branch: '', password: '' });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create user');
    } finally { setSaving(false); }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const { getAccessToken } = await import('@/lib/api');
      const token = await getAccessToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/users/bulk-import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      
      toast.success(data.message || 'Import successful');
      setCsvModal(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setSaving(false);
      e.target.value = ''; // Reset input so the same file can be selected again
    }
  };

  const totalPages = Math.ceil(total / limit);
  const activeCount = users.filter(u => u.is_active).length;
  const thisMonth = users.filter(u => new Date(u.created_at).getMonth() === new Date().getMonth()).length;

  const selectClass = "w-full px-3.5 py-2.5 text-sm bg-cx-surface border border-cx-border rounded-xl focus:ring-2 focus:ring-cardinal-200 focus:border-cardinal-500 outline-none transition-all hover:border-cx-border-strong text-cx-text";

  const columns: ColumnDef<User>[] = [
    {
      header: 'User',
      className: 'font-semibold text-cx-text',
      cell: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cx-bg-muted flex items-center justify-center text-xs font-bold text-cx-text-secondary shadow-sm flex-shrink-0 border border-cx-border">
            {u.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-cx-text">{u.name}</span>
        </div>
      )
    },
    {
      header: 'Email',
      className: 'text-cx-text-secondary text-xs',
      accessorKey: 'email'
    },
    {
      header: 'Role',
      cell: (u) => {
        const rc = ROLE_CONFIG[u.role] || ROLE_CONFIG.student;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold capitalize ${rc.bg} ${rc.text} border border-cx-border`}>
            <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
            {u.role}
          </span>
        );
      }
    },
    {
      header: 'Branch',
      className: 'text-cx-text-secondary text-xs',
      cell: (u) => u.branch || '—'
    },
    {
      header: 'Status',
      cell: (u) => (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${u.is_active ? 'text-emerald-600' : 'text-slate-400'}`}>
          <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
          {u.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (u) => (
        <div className="flex items-center gap-1">
          <button onClick={(e) => { e.stopPropagation(); handleEdit(u); }}
            className="p-1.5 rounded-lg text-cx-text-muted hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteUser(u); }}
            className="p-1.5 rounded-lg text-cx-text-muted hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout role="admin" title="User Management" userName={currentUser?.name || 'Admin'}>
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <PageHeader 
        title="User Management" 
        description="Create, edit and manage all platform users"
        actions={
          <>
            <Button variant="secondary" onClick={() => setCsvModal(true)} icon={<Upload className="w-4 h-4" />}>
              CSV Import
            </Button>
            <Button onClick={() => { setAddModal(true); setForm({ name: '', email: '', role: 'student', department: '', sap_id: '', roll_no: '', branch: '', password: '' }); }} icon={<Plus className="w-4 h-4" />}>
              Add User
            </Button>
          </>
        }
      />

      {/* ── KPI Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={loading ? '...' : total} icon={<Users className="w-6 h-6" />} iconBg="bg-blue-50 text-blue-600" />
        <StatCard label="Active" value={loading ? '...' : activeCount} icon={<CheckCircle className="w-6 h-6" />} iconBg="bg-emerald-50 text-emerald-600" />
        <StatCard label="Inactive" value={loading ? '...' : total - activeCount} icon={<PauseCircle className="w-6 h-6" />} iconBg="bg-slate-100 text-slate-600" />
        <StatCard label="Joined This Month" value={loading ? '...' : thisMonth} icon={<Activity className="w-6 h-6" />} iconBg="bg-violet-50 text-violet-600" />
      </div>

      {/* ── Controls ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search with icon */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cx-text-muted" />
          <input type="text" placeholder="Search by name or email..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-cx-surface border border-cx-border rounded-xl focus:ring-2 focus:ring-cardinal-200 focus:border-cardinal-500 outline-none transition-all hover:border-cx-border-strong text-cx-text"
            id="search-users" />
        </div>

        {/* Role pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {['', ...ALL_ROLES].map(r => (
            <button key={r} onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold capitalize transition-all border ${
                roleFilter === r
                  ? 'bg-cx-text text-cx-surface border-cx-text shadow-sm'
                  : 'bg-cx-surface text-cx-text-secondary border-cx-border hover:border-cx-border-strong hover:text-cx-text'
              }`}>
              {r || 'All Roles'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────── */}
      <Card padding="none" className="overflow-hidden">
        <DataTable 
          data={users} 
          columns={columns} 
          loading={loading}
          emptyTitle="No users found"
          emptyDescription="Try adjusting your search or role filter"
          className="border-none shadow-none rounded-none"
        />

        {/* Pagination */}
        {totalPages > 1 && !loading && users.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-cx-border-subtle bg-cx-bg-subtle">
            <p className="text-xs text-cx-text-secondary">Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of <span className="font-semibold text-cx-text">{total}</span> users</p>
            <div className="flex gap-1.5">
              <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
                <Button key={i} variant={page === i + 1 ? 'primary' : 'secondary'} size="sm" onClick={() => setPage(i + 1)}>
                  {i + 1}
                </Button>
              ))}
              <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Edit Modal ───────────────────────────────────────────────── */}
      <Modal isOpen={!!editUser} title="Edit User" onClose={() => setEditUser(null)}>
        <div className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <div>
            <label className="block text-sm font-semibold text-cx-text mb-1.5">Role</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={selectClass}>
              {ALL_ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>
          
          {form.role === 'student' && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="SAP ID" value={form.sap_id} onChange={e => setForm({ ...form, sap_id: e.target.value })} />
              <Input label="Roll No" value={form.roll_no} onChange={e => setForm({ ...form, roll_no: e.target.value })} />
              <Input label="Branch" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} />
            </div>
          )}
          
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit} loading={saving}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Modal ─────────────────────────────────────────────── */}
      <Modal isOpen={!!deleteUser} title="Delete User" onClose={() => setDeleteUser(null)}>
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl mb-6 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700 leading-relaxed">
            Are you sure you want to delete <strong>{deleteUser?.name}</strong> ({deleteUser?.email})?
            This action is permanent and cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteUser(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={saving}>Delete</Button>
        </div>
      </Modal>

      {/* ── Add User Modal ───────────────────────────────────────────── */}
      <Modal isOpen={addModal} title="Add New User" onClose={() => setAddModal(false)}>
        <div className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
          <Input label="Email Address" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
          <div>
            <label className="block text-sm font-semibold text-cx-text mb-1.5">Role</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className={selectClass}>
              {ALL_ROLES.filter(r => r !== 'accreditation').map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
            </select>
          </div>

          {form.role === 'student' && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="SAP ID" value={form.sap_id} onChange={e => setForm({ ...form, sap_id: e.target.value })} />
              <Input label="Roll No" value={form.roll_no} onChange={e => setForm({ ...form, roll_no: e.target.value })} />
              <Input label="Branch" value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} />
            </div>
          )}

          <Input 
            label="Password (Optional)" 
            type="password" 
            placeholder="Leave blank to use default" 
            value={form.password} 
            onChange={e => setForm({ ...form, password: e.target.value })} 
          />

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Default password if left blank: <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-amber-200 text-amber-900 font-semibold">CapstoneX@2024</code></span>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddUser} loading={saving}>Create User</Button>
          </div>
        </div>
      </Modal>

      {/* ── CSV Import Modal ─────────────────────────────────────────── */}
      <Modal isOpen={csvModal} title="Import Users from CSV" onClose={() => setCsvModal(false)}>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-sm font-semibold text-blue-800 mb-2">Required CSV columns:</p>
            <code className="text-xs bg-white px-2 py-1 rounded border border-blue-200 text-blue-700 font-mono shadow-sm">name, email, role, sap_id, roll_no, branch</code>
          </div>
          <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-cx-border rounded-xl cursor-pointer hover:border-cardinal-300 hover:bg-cardinal-50/50 transition-all group bg-cx-surface">
            <Upload className="w-8 h-8 mb-3 text-cx-text-muted group-hover:text-cardinal-500 group-hover:scale-110 transition-all" />
            <span className="text-sm font-medium text-cx-text-secondary group-hover:text-cardinal-600">Click to choose CSV file</span>
            <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
          </label>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setCsvModal(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
