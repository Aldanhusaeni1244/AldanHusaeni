
import React, { useState, useEffect, useCallback } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  History, 
  Users, 
  BarChart3, 
  Menu, 
  Scan,
  Bell,
  Search,
  Gift,
  Store,
  Settings,
  UserCircle
} from 'lucide-react';
import { View, Product, CartItem, Transaction, Employee, UserRole, Customer, Campaign } from './types';
import { INITIAL_PRODUCTS, INITIAL_EMPLOYEES, INITIAL_CUSTOMERS, INITIAL_CAMPAIGNS } from './constants';
import DashboardView from './components/DashboardView';
import InventoryView from './components/InventoryView';
import HistoryView from './components/HistoryView';
import EmployeesView from './components/EmployeesView';
import ReportsView from './components/ReportsView';
import LandingPage from './components/LandingPage';
import CustomersView from './components/CustomersView';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('DASHBOARD');
  const [showLanding, setShowLanding] = useState(true);
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('nexus_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('nexus_transactions');
    return saved ? JSON.parse(saved) : [];
  });
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('nexus_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => {
    const saved = localStorage.getItem('nexus_campaigns');
    return saved ? JSON.parse(saved) : INITIAL_CAMPAIGNS;
  });
  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('nexus_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });
  const [currentUser, setCurrentUser] = useState<Employee | null>(employees[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeOutlet, setActiveOutlet] = useState('Utama (Jakarta)');

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('nexus_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('nexus_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('nexus_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('nexus_campaigns', JSON.stringify(campaigns));
  }, [campaigns]);

  useEffect(() => {
    localStorage.setItem('nexus_employees', JSON.stringify(employees));
  }, [employees]);

  const handleCompleteTransaction = useCallback((transaction: Transaction) => {
    // Update Stock
    setProducts(prev => prev.map(p => {
      const cartItem = transaction.items.find(item => item.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.quantity };
      }
      return p;
    }));

    // Update CRM logic if customerId exists
    if (transaction.customerId) {
      setCustomers(prev => prev.map(c => {
        if (c.id === transaction.customerId) {
          // 1. Calculate Points
          const pointsEarned = Math.floor(transaction.total / 1000);
          const newPoints = c.points + pointsEarned - (transaction.discount > 0 ? transaction.discount : 0); // Logic for point redemption if handled as discount
          
          // 2. Update CLV and Visit Count
          const updatedCLV = c.clv + transaction.total;
          const updatedVisitCount = c.visitCount + 1;
          
          // 3. Auto-Tiering Logic
          let updatedTier = c.tier;
          if (updatedCLV > 2000000) updatedTier = 'GOLD';
          else if (updatedCLV > 500000) updatedTier = 'SILVER';
          
          // 4. Update Favorite Products
          const currentItems = transaction.items.map(i => i.name);
          const updatedFavorites = Array.from(new Set([...c.favoriteProducts, ...currentItems])).slice(0, 5);

          // 5. Update Segment (Simple RFM Simulation)
          const today = new Date();
          const lastVisit = today;
          let updatedSegment = c.segment;
          if (updatedVisitCount > 10 && updatedCLV > 1000000) updatedSegment = 'CHAMPIONS';
          else if (updatedVisitCount > 5) updatedSegment = 'LOYAL';

          // Background "Automation" Simulation
          console.log(`[Vortex CRM] Automation triggered for ${c.nickname}`);
          console.log(`[Vortex CRM] Points: ${newPoints}, CLV: ${updatedCLV}, Tier: ${updatedTier}`);
          
          return { 
            ...c, 
            points: Math.max(0, newPoints),
            clv: updatedCLV,
            visitCount: updatedVisitCount,
            tier: updatedTier,
            segment: updatedSegment,
            lastVisit: lastVisit.toISOString().split('T')[0],
            favoriteProducts: updatedFavorites
          };
        }
        return c;
      }));
    }

    // Record Transaction
    setTransactions(prev => [...prev, transaction]);
  }, []);

  const menuItems = [
    { id: 'DASHBOARD', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'HISTORY', label: 'Transaksi', icon: History },
    { id: 'INVENTORY', label: 'Produk & Stok', icon: Package },
    { id: 'CUSTOMERS', label: 'Pelanggan (CRM)', icon: Users },
    { id: 'PROMOS', label: 'Promo', icon: Gift },
    { id: 'REPORTS', label: 'Laporan', icon: BarChart3 },
    { id: 'EMPLOYEES', label: 'Karyawan', icon: UserCircle },
    { id: 'OUTLETS', label: 'Outlet', icon: Store },
    { id: 'SETTINGS', label: 'Pengaturan', icon: Settings },
  ];

  if (showLanding) {
    return (
      <LandingPage 
        onStart={() => setShowLanding(false)} 
        onLogin={() => setShowLanding(false)} 
      />
    );
  }

  const filteredMenuItems = menuItems;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Sidebar */}
      <aside className={`bg-slate-900 text-white transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'} flex flex-col shrink-0`}>
        <div className="p-6 flex items-center gap-3">
          <div className="bg-indigo-500 p-2 rounded-lg">
            <Scan size={24} />
          </div>
          {isSidebarOpen && <span className="font-bold text-xl tracking-tight">NEXUS<span className="text-indigo-400">POS</span></span>}
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-1">
          {filteredMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as View)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeView === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className={`flex items-center gap-3 ${isSidebarOpen ? '' : 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">
              {currentUser?.name.charAt(0)}
            </div>
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentUser?.name}</p>
                <p className="text-xs text-slate-500 uppercase tracking-wider">{currentUser?.role}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-6">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
              <Menu size={20} />
            </button>
            
            {/* Outlet Selector */}
            <div className="hidden lg:flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Active Outlet</span>
              <select 
                value={activeOutlet}
                onChange={(e) => setActiveOutlet(e.target.value)}
                className="bg-transparent border-none text-sm font-black text-slate-800 focus:ring-0 p-0 cursor-pointer hover:text-indigo-600 transition-colors outline-none"
              >
                <option>Utama (Jakarta)</option>
                <option>Cabang Bandung</option>
                <option>Cabang Surabaya</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden xl:flex flex-col items-end border-r border-slate-100 pr-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Periode Filter</span>
              <div className="flex gap-2">
                {['Hari Ini', 'Mingguan', 'Bulanan'].map(p => (
                   <button key={p} className="text-[10px] font-bold text-slate-500 hover:text-indigo-600 transition-colors uppercase">{p}</button>
                ))}
              </div>
            </div>

            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Cari transaksi atau produk..." 
                className="pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-2xl text-sm w-64 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              />
            </div>
            <div className="relative cursor-pointer group">
              <Bell size={20} className="text-slate-500 group-hover:text-indigo-600 transition-colors" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs text-slate-400 font-medium">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                <p className="text-sm font-bold text-slate-700">Status: <span className="text-green-500">Live</span></p>
              </div>
               <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 border border-indigo-100">
                {currentUser?.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
            {activeView === 'DASHBOARD' && <DashboardView key="dashboard" currentUser={currentUser!} transactions={transactions} products={products} customers={customers} campaigns={campaigns} setCampaigns={setCampaigns} setCustomers={setCustomers} initialTab="INSIGHTS" />}
            {activeView === 'INVENTORY' && <InventoryView products={products} setProducts={setProducts} />}
            {activeView === 'HISTORY' && <HistoryView transactions={transactions} />}
            {activeView === 'CUSTOMERS' && <CustomersView key="customers" customers={customers} setCustomers={setCustomers} currentUser={currentUser!} />}
            {activeView === 'PROMOS' && <DashboardView key="promos" currentUser={currentUser!} transactions={transactions} products={products} customers={customers} campaigns={campaigns} setCampaigns={setCampaigns} setCustomers={setCustomers} initialTab="CAMPAIGNS" />}
            {activeView === 'EMPLOYEES' && <EmployeesView employees={employees} setEmployees={setEmployees} />}
          {activeView === 'REPORTS' && <ReportsView transactions={transactions} products={products} />}
          {(activeView === 'OUTLETS' || activeView === 'SETTINGS') && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 italic">
               Modul {activeView.toLowerCase()} sedang dalam pengembangan.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
