
import React from 'react';
import { Transaction } from '../types';
import { Calendar, User, CreditCard, ChevronRight, FileText, Banknote, QrCode, Users } from 'lucide-react';

interface Props {
  transactions: Transaction[];
}

const HistoryView: React.FC<Props> = ({ transactions }) => {
  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'CASH': return <Banknote size={12} />;
      case 'QRIS': return <QrCode size={12} />;
      default: return <CreditCard size={12} />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Riwayat Penjualan</h1>
          <p className="text-sm text-slate-500">Audit transaksi dan status audit pembayaran harian.</p>
        </div>
        <button className="px-4 py-2.5 border border-slate-200 bg-white rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
          <FileText size={18} />
          Ekspor Laporan
        </button>
      </div>

      <div className="space-y-4">
        {transactions.length === 0 ? (
          <div className="bg-white p-16 rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
            <div className="p-6 bg-slate-50 rounded-full mb-4">
              <Calendar size={48} className="opacity-50" />
            </div>
            <p className="font-bold">Belum ada transaksi hari ini.</p>
            <p className="text-sm">Mulailah berjualan di modul Checkout.</p>
          </div>
        ) : (
          transactions.slice().reverse().map(txn => (
            <div key={txn.id} className="bg-white p-5 rounded-2xl border border-slate-200 hover:shadow-xl hover:border-indigo-100 transition-all flex flex-col md:flex-row md:items-center gap-6 group">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <FileText size={28} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-black text-slate-800 tracking-tight">{txn.id}</span>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-100">Lunas</span>
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-2"><Calendar size={14} className="text-slate-400" /> {new Date(txn.date).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}</span>
                  <span className="flex items-center gap-2"><User size={14} className="text-slate-400" /> {txn.cashierName}</span>
                  {txn.customerId && (
                    <span className="flex items-center gap-2 text-indigo-400 font-bold">
                      <Users size={14} /> ID: {txn.customerId}
                    </span>
                  )}
                  <span className="flex items-center gap-2 uppercase font-bold text-indigo-600">
                    {getPaymentIcon(txn.paymentMethod)}
                    {txn.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-1 border-t md:border-t-0 pt-4 md:pt-0">
                <div className="flex flex-col items-end">
                  <span className="text-xl font-black text-slate-800">Rp {txn.total.toLocaleString()}</span>
                  <div className="flex gap-2 text-[10px] font-bold">
                    <span className="text-slate-400">{txn.items.length} Item</span>
                    {txn.paymentMethod === 'CASH' && (
                      <span className="text-emerald-500">Kembalian: Rp {txn.changeDue.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>

              <button className="hidden md:flex p-3 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                <ChevronRight size={24} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryView;
