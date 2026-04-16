
import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  X, 
  Edit3, 
  Trash2, 
  MessageSquare, 
  Smartphone,
  Star,
  History,
  TrendingUp,
  Award,
  Filter
} from 'lucide-react';
import { Customer, Employee, UserRole } from '../types';

interface Props {
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  currentUser: Employee;
}

const CustomersView: React.FC<Props> = ({ customers, setCustomers, currentUser }) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({ nickname: '', phone: '', note: '' });
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');

  const handleOpenModal = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        nickname: customer.nickname,
        phone: customer.id,
        note: customer.note
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        nickname: '',
        phone: '',
        note: ''
      });
    }
    setShowAddModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Hapus member ini dari sistem?')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCustomer) {
      // Check if phone number is changed and if it's already taken by someone else
      if (formData.phone !== editingCustomer.id && customers.some(c => c.id === formData.phone)) {
        alert('Nomor WA ini sudah terdaftar oleh member lain!');
        return;
      }

      setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { 
        ...c, 
        nickname: formData.nickname,
        id: formData.phone,
        note: formData.note
      } : c));
    } else {
      if (customers.find(c => c.id === formData.phone)) {
        alert('Nomor WA ini sudah terdaftar!');
        return;
      }

      const customer: Customer = {
        id: formData.phone,
        nickname: formData.nickname,
        points: 0,
        tier: 'BRONZE',
        note: formData.note,
        lastVisit: '-',
        joinDate: new Date().toISOString().split('T')[0],
        clv: 0,
        visitCount: 0,
        segment: 'LOYAL',
        feedback: [],
        favoriteProducts: []
      };

      setCustomers(prev => [...prev, customer]);
    }
    
    setShowAddModal(false);
    setFormData({ nickname: '', phone: '', note: '' });
  };

  const filtered = customers.filter(c => {
    const matchesSearch = c.nickname.toLowerCase().includes(search.toLowerCase()) || c.id.includes(search);
    const matchesSegment = selectedSegment === 'ALL' || c.segment === selectedSegment;
    return matchesSearch && matchesSegment;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Widget */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Users size={80} />
          </div>
          <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1">Total Members</p>
          <h2 className="text-4xl font-black">{customers.length}</h2>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-bold bg-white/10 w-fit px-3 py-1 rounded-full">
             <TrendingUp size={12} /> +12% Update Real-time
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
           <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Customer Loyalty</p>
           <div className="flex items-end gap-3">
              <h2 className="text-4xl font-black text-slate-800">
                {customers.filter(c => c.tier === 'GOLD').length}
              </h2>
              <span className="text-xs font-bold text-amber-500 mb-1">GOLD TIER</span>
           </div>
           <div className="mt-6 flex gap-2">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500" 
                  style={{ width: `${(customers.filter(c => c.tier !== 'BRONZE').length / (customers.length || 1)) * 100}%` }}
                />
              </div>
           </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col justify-center">
           <button 
            onClick={() => handleOpenModal()}
            className="group flex items-center justify-between bg-indigo-600 hover:bg-indigo-700 p-4 rounded-2xl transition-all shadow-lg active:scale-95"
           >
              <div className="flex items-center gap-3">
                <UserPlus size={24} />
                <span className="font-black text-sm uppercase tracking-widest">Tambah Member Baru</span>
              </div>
              <X size={20} className="rotate-45 group-hover:rotate-90 transition-transform" />
           </button>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
           <div>
              <h3 className="text-2xl font-serif font-black text-slate-800">Member Registry</h3>
              <p className="text-sm text-slate-400">Kelola poin dan status loyalitas pelanggan</p>
           </div>
           <div className="flex items-center gap-3">
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                  type="text" 
                  placeholder="Cari member (WA/Nama)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs w-64 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                 />
              </div>
              <div className="flex bg-slate-50 p-1 rounded-xl">
                 {['ALL', 'LOYAL', 'CHAMPIONS'].map(seg => (
                   <button 
                    key={seg}
                    onClick={() => setSelectedSegment(seg)}
                    className={`px-3 py-2 rounded-lg text-[10px] font-black tracking-widest transition-all ${selectedSegment === seg ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                   >
                     {seg}
                   </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 italic">
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Member Profil</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Status & Nilai</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-center">Saldo Poin</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Terakhir Datang</th>
                <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 italic">
                    Member tidak ditemukan. Silakan tambah member baru.
                  </td>
                </tr>
              ) : (
                filtered.map(customer => (
                  <tr key={customer.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-6 px-4">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 border border-indigo-100">
                            {customer.nickname.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 leading-none mb-1">{customer.nickname}</p>
                            <p className="text-xs text-slate-400 font-mono flex items-center gap-1">
                               <Smartphone size={10} className="text-emerald-500" /> {customer.id}
                            </p>
                          </div>
                       </div>
                    </td>
                    <td className="py-6 px-4">
                       <div className="space-y-1">
                          <div className="flex items-center gap-2">
                             <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                                customer.tier === 'GOLD' ? 'bg-amber-400 text-slate-900' :
                                customer.tier === 'SILVER' ? 'bg-slate-300 text-slate-800' :
                                'bg-orange-600 text-white'
                             }`}>
                               {customer.tier}
                             </span>
                             <span className="text-[9px] text-slate-400 font-bold uppercase">{customer.segment || 'REGULAR'}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-700 italic">CLV: Rp {(customer.clv || 0).toLocaleString()}</p>
                       </div>
                    </td>
                    <td className="py-6 px-4 text-center">
                       <div className="flex flex-col items-center justify-center">
                          <div className="flex items-center gap-1.5 text-indigo-600">
                             <Award size={16} />
                             <span className="text-lg font-black">{(customer.points || 0).toLocaleString()}</span>
                          </div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Poin Tersedia</p>
                       </div>
                    </td>
                    <td className="py-6 px-4">
                       <p className="text-xs font-bold text-slate-600">{customer.lastVisit === '-' ? 'Belum Ada Kunjungan' : customer.lastVisit}</p>
                       <p className="text-[10px] text-slate-400 italic">Joined: {customer.joinDate}</p>
                    </td>
                    <td className="py-6 px-4 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <a 
                            href={`https://wa.me/${customer.id.replace(/^0/, '62')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-2 bg-white border border-slate-200 rounded-xl text-emerald-500 hover:bg-emerald-50 transition-colors shadow-sm"
                          >
                             <MessageSquare size={16} />
                          </a>
                          <button 
                            onClick={() => handleOpenModal(customer)}
                            className="p-2 bg-white border border-slate-200 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm"
                          >
                             <Edit3 size={16} />
                          </button>
                          <button onClick={() => handleDelete(customer.id)} className="p-2 bg-white border border-slate-200 rounded-xl text-red-500 hover:bg-red-50 transition-colors shadow-sm">
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                         <UserPlus size={24} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-serif font-black text-slate-800">{editingCustomer ? 'Perbarui Member' : 'Registrasi Member'}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{editingCustomer ? 'Update data pelanggan' : 'Input Data Pelanggan Baru'}</p>
                      </div>
                   </div>
                   <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                      <X size={24} className="text-slate-400" />
                   </button>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Panggilan</label>
                     <input 
                      type="text" 
                      required
                      value={formData.nickname}
                      onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                      placeholder="Contoh: Andi Wijaya"
                      className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold outline-none"
                     />
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor WhatsApp</label>
                     <div className="relative">
                        <input 
                          type="tel" 
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="0812XXXXXXXX"
                          className="w-full pl-5 pr-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-mono font-bold outline-none tracking-widest"
                        />
                     </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan</label>
                     <textarea 
                      value={formData.note}
                      onChange={(e) => setFormData(prev => ({ ...prev, note: e.target.value }))}
                      placeholder="Preferensi pelanggan..."
                      className="w-full h-24 px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 text-sm outline-none resize-none"
                     />
                   </div>

                   <div className="flex gap-4 pt-4">
                      <button 
                        type="button"
                        onClick={() => setShowAddModal(false)}
                        className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200"
                      >
                        Batal
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-xl shadow-indigo-100"
                      >
                        {editingCustomer ? 'Simpan Perubahan' : 'Simpan Member'}
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

export default CustomersView;
