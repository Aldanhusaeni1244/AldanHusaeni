
import React from 'react';
import { Transaction, Product } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Download, FileBarChart } from 'lucide-react';

interface Props {
  transactions: Transaction[];
  products: Product[];
}

const ReportsView: React.FC<Props> = ({ transactions, products }) => {
  // Aggregate category sales
  const categorySalesMap: Record<string, number> = {};
  transactions.forEach(txn => {
    txn.items.forEach(item => {
      categorySalesMap[item.category] = (categorySalesMap[item.category] || 0) + (item.price * item.quantity);
    });
  });

  const pieData = Object.entries(categorySalesMap).map(([name, value]) => ({ name, value }));
  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // Profit/Loss simulation
  const totalRevenue = transactions.reduce((acc, t) => acc + t.total, 0);
  const totalCost = transactions.reduce((acc, t) => 
    acc + t.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0), 0
  );
  const grossProfit = totalRevenue - totalCost;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Laporan Keuangan & Audit</h1>
        <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2">
          <Download size={18} />
          Unduh Laporan Bulanan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <FileBarChart size={20} className="text-indigo-500" />
              Performa Penjualan Per Kategori
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pieData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-6">Audit Penjualan Bulanan</h3>
            <div className="grid grid-cols-3 gap-6">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Pendapatan Kotor</p>
                <p className="text-xl font-bold text-slate-800">Rp {totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Total HPP</p>
                <p className="text-xl font-bold text-slate-800">Rp {totalCost.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl">
                <p className="text-xs text-emerald-600 font-bold uppercase mb-1">Laba Bersih</p>
                <p className="text-xl font-bold text-emerald-700">Rp {grossProfit.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 h-fit">
          <h3 className="font-bold text-slate-800 mb-6 text-center">Distribusi Kategori</h3>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-slate-600">{entry.name}</span>
                </div>
                <span className="font-bold text-slate-800">Rp {entry.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
