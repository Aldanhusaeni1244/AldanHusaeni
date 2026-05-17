
import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, CheckCircle2, AlertCircle, Clock, Loader2, Wallet, Smartphone, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentData: { method: string, reference: string }) => void;
  amount: number;
  invoiceId: string;
}

const QRISPaymentModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, amount, invoiceId }) => {
  const [status, setStatus] = useState<'PENDING' | 'PAID' | 'EXPIRED'>('PENDING');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrisString, setQrisString] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setStatus('PENDING');
      setTimeLeft(300);
      setIsProcessing(false);
      setError(null);
      setQrisString('');
      return;
    }

    // Mode Simulasi DANA
    setIsLoading(true);
    setError(null);
    
    // Gunakan URL DANA yang memicu redirect ke aplikasi DANA
    // Ini berfungsi sebagai simulation link yang bisa discan kamera HP
    const danaSimulationURL = 'https://link.dana.id/qr/simulasi-pembayaran-nexus';
    setQrisString(danaSimulationURL);
    
    setTimeout(() => {
      setIsLoading(false);
    }, 600);

    // Simulate Payment Detection (Wait between 5-15 seconds for "automatic" detection)
    const detectionTimer = setTimeout(() => {
      setIsProcessing(true);
      setTimeout(() => {
        handlePaymentSuccess();
      }, 2000);
    }, 7000 + Math.random() * 8000);

    // Timer for expiration
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus('EXPIRED');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(detectionTimer);
      clearInterval(timer);
    };
  }, [isOpen]);

  const handlePaymentSuccess = () => {
    setStatus('PAID');
    setIsProcessing(false);
    
    // Play success sound (browser beep or notification sound)
    try {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
      audio.play();
    } catch (e) {
      console.log('Audio play failed');
    }

    // Auto close and trigger success callback after 2 seconds
    setTimeout(() => {
      onSuccess({
        method: 'QRIS',
        reference: `QRIS-${Date.now()}`
      });
    }, 2000);
  };

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[500] flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl relative">
        {/* Header */}
        <div className="p-8 text-center border-b border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black italic text-slate-800">SIMULASI DANA</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>
          
          <div className="bg-indigo-50 p-4 rounded-2xl flex items-center justify-center gap-3 mb-4">
             <Smartphone size={24} className="text-indigo-600" />
             <div className="text-left">
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">DANA REDIRECT</p>
                <p className="text-xs font-bold text-slate-700">Scan QR untuk membuka aplikasi DANA</p>
             </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Tagihan</p>
            <h2 className="text-3xl font-black italic text-indigo-600 leading-none">Rp {amount.toLocaleString()}</h2>
            <p className="text-[10px] font-bold text-slate-400 italic">Invoice: {invoiceId}</p>
          </div>
        </div>

        {/* QR Body */}
        <div className="p-8 flex flex-col items-center">
          <div className="relative group">
            {/* Corner decorations */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-indigo-600 rounded-tl-lg"></div>
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-indigo-600 rounded-tr-lg"></div>
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-indigo-600 rounded-bl-lg"></div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-indigo-600 rounded-br-lg"></div>

            <div className={`bg-white p-4 rounded-xl transition-all duration-500 ${status === 'PAID' || isLoading ? 'scale-90 blur-sm opacity-20' : ''}`}>
              {!isLoading && qrisString && (
                <QRCodeSVG 
                  value={qrisString} 
                  size={220}
                  level="H"
                  includeMargin={false}
                />
              )}
            </div>

            {/* Status Overlays */}
            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-indigo-600">
                <Loader2 size={48} className="animate-spin mb-2" />
                <p className="text-[10px] font-black italic uppercase tracking-widest">Membuat Link DANA...</p>
              </div>
            )}
            {status === 'PAID' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-600 animate-in zoom-in-50 duration-500">
                <div className="bg-emerald-100 p-4 rounded-full mb-3 shadow-lg shadow-emerald-200">
                  <CheckCircle2 size={48} />
                </div>
                <p className="font-black italic text-xl uppercase tracking-widest text-emerald-700">BERHASIL!</p>
              </div>
            )}

            {status === 'EXPIRED' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-red-600 animate-in zoom-in-50 duration-500">
                <div className="bg-red-100 p-4 rounded-full mb-3 shadow-lg shadow-red-200">
                  <AlertCircle size={48} />
                </div>
                <p className="font-black italic text-xl uppercase tracking-widest text-red-700">KADALUWARSA</p>
              </div>
            )}

            {isProcessing && status === 'PENDING' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-xl backdrop-blur-sm">
                <Loader2 size={48} className="text-indigo-600 animate-spin mb-2" />
                <p className="text-[10px] font-black italic text-indigo-600 uppercase tracking-widest">Mendeteksi Pembayaran...</p>
              </div>
            )}
          </div>

          <div className="mt-8 text-center w-full">
            {error && (
              <div className="mb-4 p-2 bg-amber-50 rounded-lg flex items-center justify-center gap-2 border border-amber-100">
                <AlertCircle size={14} className="text-amber-600" />
                <span className="text-[10px] font-bold text-amber-700">{error}</span>
              </div>
            )}
            {status === 'PENDING' && (
              <>
                <div className="flex items-center justify-center gap-2 text-slate-400 mb-4 animate-pulse">
                  <Clock size={16} />
                  <span className="text-xs font-bold tracking-[0.2em]">KADALUWARSA DALAM {formatTime(timeLeft)}</span>
                </div>
                <div className="flex items-center justify-center gap-4 border-t border-slate-100 pt-6">
                   <div className="flex flex-col items-center gap-1 opacity-40">
                      <Wallet size={20} />
                      <span className="text-[8px] font-black uppercase">E-Wallet</span>
                   </div>
                   <div className="h-8 w-px bg-slate-200"></div>
                   <div className="flex flex-col items-center gap-1 opacity-40">
                      <ShieldCheck size={20} />
                      <span className="text-[8px] font-black uppercase">Secure Pay</span>
                   </div>
                </div>
              </>
            )}

            {status === 'PAID' && (
              <div className="text-center py-2 animate-bounce">
                <p className="text-xs font-bold text-emerald-600">Dana berhasil diterima!</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Struk akan segera dicetak...</p>
              </div>
            )}

            {status === 'EXPIRED' && (
              <button 
                onClick={onClose}
                className="w-full py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200"
              >
                Coba Lagi
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRISPaymentModal;
