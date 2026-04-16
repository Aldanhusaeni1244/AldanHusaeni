import React, { useState } from 'react';
import { Employee, UserRole } from '../types';
import { Shield, UserPlus, Edit3, Trash2, X, Key, CheckCircle2, Mail, Phone } from 'lucide-react';

interface Props {
  employees: Employee[];
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
}

const EmployeesView: React.FC<Props> = ({ employees, setEmployees }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    role: UserRole.ADMIN,
    status: 'ACTIVE',
    pin: ''
  });

  const handleOpenModal = (emp?: Employee) => {
    if (emp) {
      setEditingEmployee(emp);
      setFormData(emp);
    } else {
      setEditingEmployee(null);
      setFormData({
        name: '',
        role: UserRole.ADMIN,
        status: 'ACTIVE',
        pin: ''
      });
    }
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.pin) return;

    if (editingEmployee) {
      setEmployees(prev => prev.map(emp => emp.id === editingEmployee.id ? { ...emp, ...formData } as Employee : emp));
    } else {
      const newEmp: Employee = {
        ...formData as Employee,
        id: `emp-${Date.now()}`,
        lastLogin: '-'
      };
      setEmployees(prev => [...prev, newEmp]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (employees.length <= 1) {
      alert('Tidak bisa menghapus Admin terakhir!');
      return;
    }
    if (confirm('Hapus karyawan ini secara permanen?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Manajemen Karyawan</h1>
          <p className="text-sm text-slate-500">Kelola akses staf dan hak istimewa Admin.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
        >
          <UserPlus size={20} />
          Tambah Staf
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(emp => (
          <div key={emp.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden group shadow-sm hover:shadow-md transition-all">
            <div className="h-24 bg-gradient-to-r from-indigo-500 to-indigo-700 relative">
              <div className="absolute top-4 right-4 flex gap-2">
                <button 
                  onClick={() => handleOpenModal(emp)}
                  className="p-2 bg-white/20 hover:bg-white/40 rounded-lg text-white transition-colors"
                >
                   <Edit3 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(emp.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-white transition-colors"
                >
                   <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="px-6 pb-6 relative">
              <div className="w-20 h-20 bg-white p-1 rounded-2xl absolute -top-10 border border-slate-100 shadow-lg">
                <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center font-bold text-2xl text-slate-400 uppercase">
                  {emp.name.charAt(0)}
                </div>
              </div>
              <div className="pt-12 mb-4">
                <h3 className="text-lg font-bold text-slate-800">{emp.name}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-1">
                  <Shield size={14} className="text-indigo-500" />
                  <span className="uppercase tracking-widest">{emp.role}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className={`flex items-center gap-1 ${emp.status === 'ACTIVE' ? 'text-green-500' : 'text-slate-400'}`}>
                    {emp.status === 'ACTIVE' && <CheckCircle2 size={10} />}
                    {emp.status}
                  </span>
                </div>
              </div>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-3 text-slate-500 text-sm">
                  <Mail size={16} />
                  <span className="truncate">{emp.name.toLowerCase().replace(/\s+/g, '.')}@store.com</span>
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-sm">
                  <Phone size={16} />
                  <span>+62 812-XXXX-XXXX</span>
                </div>
                <div className="flex items-center gap-3 text-indigo-600 text-xs font-bold pt-2">
                  <Key size={14} />
                  <span className="tracking-[0.5em]">PIN: {emp.pin}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Login Terakhir</span>
                <span className="text-[10px] text-slate-600 font-bold">{emp.lastLogin}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{editingEmployee ? 'Edit Staf' : 'Tambah Staf Baru'}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Konfigurasi Akses Sistem</p>
                  </div>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold outline-none"
                    placeholder="Nama Karyawan"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as UserRole }))}
                      className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold outline-none text-sm"
                    >
                      <option value={UserRole.ADMIN}>ADMIN</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold outline-none text-sm"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PIN Akses (4 Digit)</label>
                  <input 
                    type="password" 
                    required
                    maxLength={4}
                    value={formData.pin || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))}
                    className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold outline-none tracking-[1em]"
                    placeholder="****"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all hover:-translate-y-0.5"
                  >
                    Simpan Staf
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeesView;
