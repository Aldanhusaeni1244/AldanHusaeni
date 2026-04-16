
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  BrainCircuit, 
  Users, 
  Target, 
  MessageSquare, 
  Plus, 
  Trash2, 
  Edit3, 
  PieChart as PieChartIcon, 
  Filter,
  Search,
  X,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  Sparkles,
  AlertCircle,
  Package
} from 'lucide-react';
import { Transaction, Product, Customer, Campaign, RFMSegment, Employee, UserRole } from '../types';
import { getSalesAnalysis } from '../geminiService';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  Pie, 
  PieChart as RePieChart,
  Bar,
  BarChart
} from 'recharts';

interface Props {
  currentUser: Employee;
  transactions: Transaction[];
  products: Product[];
  customers: Customer[];
  campaigns: Campaign[];
  setCampaigns: React.Dispatch<React.SetStateAction<Campaign[]>>;
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const DashboardView: React.FC<Props & { initialTab?: 'INSIGHTS' | 'MEMBERS' | 'CAMPAIGNS' | 'FEEDBACK' }> = ({ 
  currentUser,
  transactions, 
  products, 
  customers, 
  campaigns, 
  setCampaigns,
  setCustomers,
  initialTab
}) => {
  const [activeTab, setActiveTab] = useState<'INSIGHTS' | 'MEMBERS' | 'CAMPAIGNS' | 'FEEDBACK'>(initialTab || 'INSIGHTS');
  
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const [memberSearch, setMemberSearch] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState({ nickname: '', phone: '', note: '' });
  const [aiInsight, setAiInsight] = useState<string>('Menganalisis data...');
  const [loadingAi, setLoadingAi] = useState(true);

  // --- Calculations ---
  const today = new Date().toISOString().split('T')[0];
  const todayTransactions = transactions.filter(t => t.date.startsWith(today));
  const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);
  const unitsSold = transactions.reduce((acc, t) => acc + t.items.reduce((sum, i) => sum + i.quantity, 0), 0);
  const avgCLV = customers.length ? (customers.reduce((acc, c) => acc + c.clv, 0) / customers.length) : 0;
  
  // Sales Heatmap (by Hour)
  const hourData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    sales: transactions.filter(t => new Date(t.date).getHours() === i).length
  })).filter(h => h.sales > 0 || (Number(h.hour.split(':')[0]) > 8 && Number(h.hour.split(':')[0]) < 22));

  // Category Distribution
  const categoryData = products.reduce((acc: any[], p) => {
    const existing = acc.find(item => item.name === p.category);
    const sold = transactions.reduce((sum, t) => sum + t.items.filter(i => i.id === p.id).reduce((s, item) => s + item.quantity, 0), 0);
    if (existing) {
      existing.value += sold;
    } else {
      acc.push({ name: p.category, value: sold });
    }
    return acc;
  }, []).filter(c => c.value > 0);

  // Stock Alerts
  const lowStockItems = products.filter(p => p.stock <= p.minStock);

  // RFM Segmentation Breakdown
  const segmentData = [
    { name: 'Champions', value: customers.filter(c => c.segment === 'CHAMPIONS').length, color: '#10b981' },
    { name: 'Loyal', value: customers.filter(c => c.segment === 'LOYAL').length, color: '#4f46e5' },
    { name: 'At Risk', value: customers.filter(c => c.segment === 'AT_RISK').length, color: '#f59e0b' },
    { name: 'Hibernating', value: customers.filter(c => c.segment === 'HIBERNATING').length, color: '#ef4444' },
  ].filter(s => s.value > 0);

  // Churn Rate
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const churnedCount = customers.filter(c => new Date(c.lastVisit) < thirtyDaysAgo).length;
  const churnRate = customers.length ? (churnedCount / customers.length) * 100 : 0;

  // RFM Distribution
  const rfmDist = {
    CHAMPIONS: customers.filter(c => c.segment === 'CHAMPIONS').length,
    LOYAL: customers.filter(c => c.segment === 'LOYAL').length,
    AT_RISK: customers.filter(c => c.segment === 'AT_RISK').length,
    HIBERNATING: customers.filter(c => c.segment === 'HIBERNATING').length,
  };

  const rfmChartData = [
    { name: 'Champions', value: rfmDist.CHAMPIONS, color: '#4f46e5' },
    { name: 'Loyal', value: rfmDist.LOYAL, color: '#10b981' },
    { name: 'At Risk', value: rfmDist.AT_RISK, color: '#f59e0b' },
    { name: 'Hibernating', value: rfmDist.HIBERNATING, color: '#64748b' },
  ];

  useEffect(() => {
    const fetchAi = async () => {
      setLoadingAi(true);
      const insight = await getSalesAnalysis(transactions, products);
      setAiInsight(insight || 'Belum ada wawasan yang tersedia saat ini.');
      setLoadingAi(false);
    };
    fetchAi();
  }, [transactions, products]);

  const handleDeleteMember = (id: string) => {
    if (confirm('Hapus member ini?')) {
      setCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.nickname || !newMember.phone) return;
    
    // Check if member already exists
    if (customers.find(c => c.id === newMember.phone)) {
      alert('Nomor WhatsApp sudah terdaftar sebagai member!');
      return;
    }

    const customer: Customer = {
      id: newMember.phone,
      nickname: newMember.nickname,
      points: 0,
      tier: 'BRONZE',
      note: newMember.note,
      lastVisit: '-',
      joinDate: new Date().toISOString().split('T')[0],
      clv: 0,
      visitCount: 0,
      segment: 'LOYAL',
      feedback: [],
      favoriteProducts: []
    };

    setCustomers(prev => [...prev, customer]);
    setShowAddMember(false);
    setNewMember({ nickname: '', phone: '', note: '' });
  };

  const tabs = [
    { id: 'INSIGHTS', label: 'Insights', icon: PieChartIcon },
    { id: 'MEMBERS', label: 'Members', icon: Users },
    { id: 'CAMPAIGNS', label: 'Campaigns', icon: Target },
    { id: 'FEEDBACK', label: 'Feedback', icon: MessageSquare }
  ];

  const filteredCustomers = customers.filter(c => 
    c.nickname.toLowerCase().includes(memberSearch.toLowerCase()) || 
    c.id.includes(memberSearch)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-1">
            CRM PRO DASHBOARD
          </p>
          <h1 className="text-4xl font-serif font-black text-slate-800 tracking-tight">
             Vortex Pro Insights
          </h1>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'INSIGHTS' && (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <DollarSign size={80} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Total Sales</p>
              <h2 className="text-2xl font-black text-slate-800">Rp {totalRevenue.toLocaleString()}</h2>
              <div className="mt-4 flex items-center gap-2 text-emerald-600 text-[10px] font-bold">
                <ArrowUpRight size={14} />
                <span>+12.5% vs Prev</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <ShoppingBag size={80} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Transactions</p>
              <h2 className="text-2xl font-black text-slate-800">{transactions.length}</h2>
              <div className="mt-4 flex items-center gap-2 text-indigo-600 text-[10px] font-bold">
                <TrendingUp size={14} />
                <span>{todayTransactions.length} Hari Ini</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <Users size={80} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Customers</p>
              <h2 className="text-2xl font-black text-slate-800">{customers.length}</h2>
              <div className="mt-4 flex items-center gap-2 text-emerald-600 text-[10px] font-bold">
                <ArrowUpRight size={14} />
                <span>+5 Baru</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                <Package size={80} />
              </div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Units Sold</p>
              <h2 className="text-2xl font-black text-slate-800">{unitsSold}</h2>
              <div className="mt-4 flex items-center gap-2 text-emerald-600 text-[10px] font-bold font-mono">
                 STOCK: LIVE
              </div>
            </div>
          </div>

          {/* New Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
             <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-serif font-black text-slate-800">Sales Heatmap</h3>
                    <p className="text-xs text-slate-400">Pola transaksi berdasarkan jam operasional</p>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <TrendingUp size={20} />
                  </div>
               </div>
               <div className="h-[250px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
               </div>
             </div>

             <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="flex items-center justify-between mb-8 relative z-10">
                   <div>
                    <h3 className="text-2xl font-serif font-black">Stock Alert</h3>
                    <p className="text-xs text-slate-400">Produk yang mencapai batas minimum stok</p>
                   </div>
                   <div className="p-3 bg-red-500/20 text-red-400 rounded-2xl">
                    <AlertCircle size={20} />
                   </div>
                </div>
                <div className="space-y-3 relative z-10 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                   {lowStockItems.length === 0 ? (
                     <div className="py-12 flex flex-col items-center justify-center text-slate-500 italic opacity-50 text-center">
                        <Package size={48} className="mb-4 mx-auto" />
                        Semua stok aman
                     </div>
                   ) : (
                     lowStockItems.map(item => (
                       <div key={item.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center group hover:bg-white/10 transition-all">
                          <div>
                             <p className="font-bold text-sm tracking-tight">{item.name}</p>
                             <p className="text-[10px] text-slate-400 italic">Kategori: {item.category}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-lg font-black text-red-400">{item.stock}</p>
                             <p className="text-[10px] font-black text-slate-500 uppercase">Min: {item.minStock}</p>
                          </div>
                       </div>
                     ))
                   )}
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-serif font-black text-slate-800">Sales by Category</h3>
                    <p className="text-xs text-slate-400">Peringkat penjualan berdasarkan kategori produk</p>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <PieChartIcon size={20} />
                  </div>
               </div>
               <div className="h-[250px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} width={80} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="value" fill="#4f46e5" radius={[0, 10, 10, 0]} barSize={16} />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-serif font-black text-slate-800">Customer Trends</h3>
                    <p className="text-xs text-slate-400">Pertumbuhan member (Bronze, Silver, Gold)</p>
                  </div>
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <Users size={20} />
                  </div>
               </div>
               <div className="grid grid-cols-3 gap-4">
                  {['BRONZE', 'SILVER', 'GOLD'].map(tier => {
                    const count = customers.filter(c => c.tier === tier).length;
                    return (
                      <div key={tier} className="text-center p-4 bg-slate-50 rounded-[2rem] border border-slate-100 group hover:border-indigo-300 transition-all">
                        <p className="text-[10px] font-black text-slate-400 tracking-widest uppercase mb-1">{tier}</p>
                        <p className="text-2xl font-black text-slate-800">{count}</p>
                        <p className="text-[8px] font-bold text-slate-400 mt-1">{( (count / (customers.length || 1)) * 100).toFixed(0)}% SHARE</p>
                      </div>
                    )
                  })}
               </div>
               <div className="mt-8 p-4 bg-indigo-600 rounded-2xl text-white flex items-center justify-between shadow-xl shadow-indigo-200 group cursor-pointer hover:bg-indigo-700 transition-all">
                  <div className="flex items-center gap-3">
                     <UserPlus size={20} />
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Member Retention</p>
                        <p className="text-sm font-bold">Launch Retention Campaign</p>
                     </div>
                  </div>
                  <ArrowUpRight size={20} />
               </div>
            </div>
          </div>

          {/* Visualization Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-2xl font-serif font-bold text-slate-800">Retention Analytics</h3>
                    <p className="text-xs text-slate-400">Distribusi segmen member berdasarkan RFM</p>
                 </div>
                 <div className="flex gap-2">
                    <button className="p-2 bg-slate-50 rounded-lg text-slate-400 hover:text-indigo-600">
                      <Filter size={16} />
                    </button>
                 </div>
              </div>
              <div className="h-[350px] flex flex-col md:flex-row items-center gap-8">
                 <div className="w-full md:w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={rfmChartData}
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {rfmChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                           contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
                      </RePieChart>
                    </ResponsiveContainer>
                 </div>
                 <div className="w-full md:w-1/2 space-y-4">
                    {rfmChartData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-sm font-bold text-slate-700">{item.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-black text-slate-900">{item.value}</span>
                          <span className="text-[10px] text-slate-400 font-bold">{((item.value / customers.length) * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 p-8 opacity-5">
                  <Target size={150} />
               </div>
               <h3 className="text-2xl font-serif font-bold mb-6">Active Campaigns</h3>
               <div className="space-y-4 overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                  {campaigns.filter(c => c.active).map(campaign => (
                    <div key={campaign.id} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group">
                       <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-sm group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{campaign.name}</h4>
                          <span className="text-[10px] font-black bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full">{campaign.targetSegment}</span>
                       </div>
                       <p className="text-[11px] text-slate-400 leading-snug mb-3">{campaign.description}</p>
                       <div className="flex justify-between items-center text-[10px] font-black text-slate-500">
                          <span>Status: ACTIVE</span>
                          <span className="text-white">Dsc: {campaign.type === 'PERCENTAGE' ? `${campaign.discountValue}%` : `Rp ${campaign.discountValue.toLocaleString()}`}</span>
                       </div>
                    </div>
                  ))}
               </div>
               <button onClick={() => setActiveTab('CAMPAIGNS')} className="mt-8 w-full py-4 bg-indigo-600 rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                  MANAGE CAMPAIGNS <Target size={14} />
               </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'MEMBERS' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-3xl font-serif font-black text-slate-800">Member Registry</h3>
              <p className="text-sm text-slate-400">Total {customers.length} member terdaftar dalam sistem</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                 <input 
                  type="text" 
                  placeholder="Cari mamber (WA/Nama)..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs w-64 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                 />
               </div>
              <button 
                onClick={() => setShowAddMember(true)}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black shadow-lg hover:bg-slate-800 transition-all"
              >
                <UserPlus size={16} /> REGISTRASI MEMBER
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 italic">
                    <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest px-4">Member Info</th>
                    <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest px-4">Segment & Tier</th>
                    <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest px-4 text-center">Points Balance</th>
                    <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest px-4">CLV & Lifespan</th>
                    <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest px-4">Last Visit</th>
                    <th className="pb-4 text-xs font-black text-slate-400 uppercase tracking-widest px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredCustomers.map(customer => (
                    <tr key={customer.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-4">
                        <p className="font-bold text-slate-800">{customer.nickname}</p>
                        <p className="text-xs text-slate-400 font-mono tracking-tighter">{customer.id}</p>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex flex-col gap-1">
                          <span className={`w-fit text-[10px] font-black px-2 py-0.5 rounded-full ${
                            customer.segment === 'CHAMPIONS' ? 'bg-indigo-100 text-indigo-700' :
                            customer.segment === 'LOYAL' ? 'bg-emerald-100 text-emerald-700' :
                            customer.segment === 'AT_RISK' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {customer.segment}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase leading-none">{customer.tier} TIER</span>
                        </div>
                      </td>
                      <td className="py-5 px-4 text-center">
                        <p className="text-lg font-black text-indigo-600">{customer.points.toLocaleString()}</p>
                        <p className="text-[10px] font-bold text-slate-400">POIN AKTIF</p>
                      </td>
                      <td className="py-5 px-4">
                        <p className="text-sm font-black text-slate-800">Rp {customer.clv.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-400">{customer.visitCount} Sesi Belanja</p>
                      </td>
                      <td className="py-5 px-4">
                        <p className="text-sm text-slate-500 font-medium">{customer.lastVisit}</p>
                        <p className="text-[10px] text-slate-400 italic font-medium">Joined: {customer.joinDate}</p>
                      </td>
                      <td className="py-5 px-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                            <Edit3 size={14} />
                          </button>
                          <button onClick={() => handleDeleteMember(customer.id)} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'CAMPAIGNS' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
           <div className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
             <div>
                <h3 className="text-3xl font-serif font-black text-slate-800 tracking-tight">Campaign Engine</h3>
                <p className="text-slate-400 text-sm">Targetkan segmen pelanggan dengan penawaran eksklusif</p>
             </div>
             <button className="flex items-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black shadow-lg hover:bg-indigo-700 transition-all">
               <Plus size={16} /> NEW CAMPAIGN
             </button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map(campaign => (
                <div key={campaign.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all relative overflow-hidden flex flex-col h-full">
                   <div className={`absolute top-0 right-0 px-4 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl-xl ${campaign.active ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {campaign.active ? 'Active' : 'Draft'}
                   </div>
                   <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                         <Target size={24} />
                      </div>
                      <h4 className="font-black text-slate-800 leading-tight">{campaign.name}</h4>
                   </div>
                   <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1 italic">"{campaign.description}"</p>
                   
                   <div className="space-y-4 pt-4 border-t border-slate-50">
                      <div className="flex justify-between items-center text-xs font-bold">
                         <span className="text-slate-400 uppercase tracking-widest">Target</span>
                         <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{campaign.targetSegment}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-bold">
                         <span className="text-slate-400 uppercase tracking-widest">Benefit</span>
                         <span className="text-slate-800">{campaign.type === 'PERCENTAGE' ? `${campaign.discountValue}% OFF` : `Rp ${campaign.discountValue.toLocaleString()} OFF`}</span>
                      </div>
                   </div>

                   <div className="mt-8 flex gap-3">
                      <button 
                        onClick={() => setCampaigns(prev => prev.map(c => c.id === campaign.id ? { ...c, active: !c.active } : c))}
                        className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${campaign.active ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'}`}
                      >
                         {campaign.active ? 'Deactivate' : 'Publish'}
                      </button>
                      <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-red-500 transition-colors">
                         <Trash2 size={16} />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      {activeTab === 'FEEDBACK' && (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex justify-between items-center">
             <div>
                <h3 className="text-3xl font-serif font-black text-slate-800 tracking-tight">Feedback Monitor</h3>
                <p className="text-slate-400 text-sm">Suara pelanggan dari rating transaksi</p>
             </div>
             <div className="flex gap-4">
               <div className="text-center">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Rating</p>
                  <p className="text-2xl font-black text-amber-500">4.8 / 5.0</p>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {customers.filter(c => c.feedback.length > 0).map(customer => (
                customer.feedback.map((f, i) => (
                  <div key={`${customer.id}-${i}`} className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-lg transition-all flex flex-col gap-4">
                     <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                             {customer.nickname.charAt(0)}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-slate-800">{customer.nickname}</p>
                              <p className="text-[10px] font-mono text-slate-400">{customer.id}</p>
                           </div>
                        </div>
                        <div className="flex gap-1 text-amber-400">
                           {[...Array(5)].map((_, idx) => (
                             <Sparkles key={idx} size={14} className={idx < f.rating ? 'fill-amber-400' : 'text-slate-200'} />
                           ))}
                        </div>
                     </div>
                     <p className="text-slate-600 italic text-sm leading-relaxed">"{f.comment}"</p>
                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-auto">{f.date}</p>
                  </div>
                ))
             ))}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                    <UserPlus size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-serif font-black text-slate-800">New Member</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Registrasi Pelanggan</p>
                  </div>
                </div>
                <button onClick={() => setShowAddMember(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={20} className="text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleCreateMember} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Panggilan</label>
                  <input 
                    type="text" 
                    required
                    value={newMember.nickname}
                    onChange={(e) => setNewMember(prev => ({ ...prev, nickname: e.target.value }))}
                    placeholder="Contoh: Budi Sudarsono"
                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 text-sm font-bold placeholder:font-normal outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nomor WhatsApp</label>
                  <input 
                    type="tel" 
                    required
                    value={newMember.phone}
                    onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Contoh: 08123456789"
                    className="w-full px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono font-bold placeholder:font-normal outline-none"
                  />
                  <p className="text-[9px] text-slate-400 italic ml-1">* Nomor WhatsApp digunakan sebagai ID Member</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Catatan (Opsional)</label>
                  <textarea 
                    value={newMember.note}
                    onChange={(e) => setNewMember(prev => ({ ...prev, note: e.target.value }))}
                    placeholder="Preferensi atau info unik pelanggan..."
                    className="w-full h-24 px-5 py-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 text-sm outline-none resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddMember(false)}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-600 shadow-xl shadow-slate-200 transition-all"
                  >
                    Simpan Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default DashboardView;
