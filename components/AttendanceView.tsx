import React, { useState } from 'react';
import { UserCheck, Clock, History, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { Employee, Attendance } from '../types';
import FaceDetectionScanner from '../src/modules/face-recognition/FaceDetectionScanner';
import { useFaceRecognition } from '../src/modules/face-recognition/useFaceRecognition';

interface Props {
  employees: Employee[];
  attendances: Attendance[];
  onRecordAttendance: (attendance: Attendance) => void;
}

const AttendanceView: React.FC<Props> = ({ employees, attendances, onRecordAttendance }) => {
  const [lastAttendance, setLastAttendance] = useState<Attendance | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useFaceRecognition(employees, (employee) => {
    // Record attendance
    const newAttendance: Attendance = {
      id: `att-${Date.now()}`,
      employeeId: employee.id,
      employeeName: employee.name,
      timestamp: new Date().toISOString(),
      type: 'IN',
      method: 'FACE'
    };
    
    onRecordAttendance(newAttendance);
    setLastAttendance(newAttendance);
    setIsSuccess(true);
    
    // Reset success message after 4 seconds
    setTimeout(() => {
      setIsSuccess(false);
    }, 4000);
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black italic text-slate-800 mb-2 leading-none">Presensi Vision</h2>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-[10px] flex items-center gap-2">
            <span className="w-8 h-[1px] bg-indigo-500"></span>
            Sistem Absensi Wajah Otomatis
          </p>
        </div>
        
        <div className="bg-white px-6 py-4 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu Sekarang</p>
            <p className="text-xl font-black text-slate-800">{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Scanner */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-2 rounded-[3.5rem] border border-slate-200 shadow-xl overflow-hidden relative">
            <FaceDetectionScanner employees={employees} />
            
            {isSuccess && lastAttendance && (
              <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-md flex flex-col items-center justify-center p-12 text-center z-50 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-white text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-3xl font-black text-white italic mb-2 tracking-tight">Presensi Berhasil!</h3>
                <p className="text-emerald-100 font-bold text-lg mb-1">Selamat Bekerja, {lastAttendance.employeeName}</p>
                <div className="text-emerald-200 text-[10px] font-black uppercase tracking-[0.2em] mt-4 px-4 py-2 bg-emerald-500/30 rounded-full border border-emerald-400/30">
                  {new Date(lastAttendance.timestamp).toLocaleTimeString('id-ID')} • ID: {lastAttendance.employeeId}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
               <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                 <UserCheck size={20} />
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktif Sekarang</p>
                 <p className="text-base font-bold text-slate-700">{employees.filter(e => e.status === 'ACTIVE').length} Karyawan</p>
               </div>
             </div>
             <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center gap-4">
               <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                 <History size={20} />
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Presensi Hari Ini</p>
                 <p className="text-base font-bold text-slate-700">{attendances.filter(a => new Date(a.timestamp).toDateString() === new Date().toDateString()).length} Sesi</p>
               </div>
             </div>
          </div>
        </div>

        {/* Right Column: Recent Activity */}
        <div className="lg:col-span-5 flex flex-col gap-6">
           <div className="bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-12 opacity-5 -mr-8 -mt-8 rotate-12 group-hover:rotate-0 transition-transform duration-700">
                <User size={160} />
              </div>
              <h4 className="text-xl font-black italic mb-2">Panduan Absensi</h4>
              <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">Posisikan wajah Anda di dalam lingkaran scanner. Pastikan pencahayaan cukup dan wajah terlihat jelas tanpa aksesoris berlebih.</p>
              
              <ul className="space-y-3">
                {[
                  'Buka kacamata hitam/masker',
                  'Arahkan pandangan ke kamera',
                  'Tunggu hingga ID terverifikasi',
                  'Selesai'
                ].map((step, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-bold">
                    <span className="w-5 h-5 bg-indigo-500 rounded-lg flex items-center justify-center text-[10px] font-black">{i+1}</span>
                    <span className="text-slate-300">{step}</span>
                  </li>
                ))}
              </ul>
           </div>

           <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                 <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Riwayat Terkini</h4>
                 <History size={16} className="text-slate-400" />
              </div>
              
              <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                {attendances.length === 0 ? (
                  <div className="p-12 text-center">
                    <AlertCircle size={32} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-xs font-bold text-slate-400 uppercase">Belum ada aktivitas</p>
                  </div>
                ) : (
                  attendances.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10).map((att) => (
                    <div key={att.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center font-black text-sm">
                        {att.employeeName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-800 leading-none mb-1">{att.employeeName}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">ID: {att.employeeId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-indigo-600 italic">{new Date(att.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{new Date(att.timestamp).toLocaleDateString('id-ID')}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                 <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">Lihat Semua Laporan</button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceView;
