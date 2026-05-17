import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Trash2, 
  ShoppingCart, 
  CreditCard, 
  X, 
  CheckCircle2, 
  AlertCircle,
  History,
  Sparkles,
  Command,
  Mic,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { Product, CartItem, Transaction, Customer, Employee } from '../types';
import QRISPaymentModal from './QRISPaymentModal';
import FaceDetectionScanner from '../src/modules/face-recognition/FaceDetectionScanner';
import { useFaceRecognition } from '../src/modules/face-recognition/useFaceRecognition';

interface Props {
  products: Product[];
  customers: Customer[];
  currentUser: Employee;
  onCompleteTransaction: (transaction: Transaction) => void;
}

interface CommandLog {
  id: string;
  text: string;
  status: 'SUCCESS' | 'ERROR';
  message: string;
  timestamp: string;
}

const AIPOSView: React.FC<Props> = ({ products, customers, currentUser, onCompleteTransaction }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState<CommandLog[]>([]);
  const [discount, setDiscount] = useState(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showQRISModal, setShowQRISModal] = useState(false);
  const [pendingQRISData, setPendingQRISData] = useState<Transaction | null>(null);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFaceID, setShowFaceID] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const logEndRef = useRef<HTMLDivElement>(null);

  useFaceRecognition(customers, (member) => {
    setSelectedCustomer(member);
    // Add a log entry for auto-detection
    const log: CommandLog = {
      id: `face-${Date.now()}`,
      text: "AUTO-DETECT FACE",
      status: 'SUCCESS',
      message: `✔ Member terdeteksi: ${member.nickname}. Poin: ${member.points}`,
      timestamp: new Date().toLocaleTimeString('id-ID')
    };
    setLogs(prev => [...prev, log]);
  });

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // NLP Parser Logic
  const parseCommand = (input: string) => {
    const text = input.toLowerCase().trim();
    const results: { status: 'SUCCESS' | 'ERROR'; message: string }[] = [];

    // Split multi-commands (e.g., "dan", ",")
    const sentences = text.split(/\s+dan\s+|\s*,\s*/);

    sentences.forEach(sentence => {
      // 1. ADD PRODUCT
      // Patterns: "tambahkan 2 kopi", "masukkan aqua", "tambah 3 indomie"
      const addMatch = sentence.match(/(?:tambahkan|masukkan|tambah)\s+(\d+)?\s*(.+)/);
      if (addMatch) {
        const qty = parseInt(addMatch[1]) || 1;
        const productName = addMatch[2].trim();
        const product = findProduct(productName);
        
        if (product) {
          if (product.stock >= qty) {
            addToCart(product, qty);
            results.push({ status: 'SUCCESS', message: `✔ ${qty} ${product.name} berhasil ditambahkan` });
          } else {
            results.push({ status: 'ERROR', message: `❌ Stok ${product.name} tidak mencukupi (Tersedia: ${product.stock})` });
          }
        } else {
          results.push({ status: 'ERROR', message: `❌ Produk "${productName}" tidak ditemukan` });
        }
        return;
      }

      // 2. REMOVE PRODUCT
      // Patterns: "hapus kopi", "hapus semua roti"
      const removeMatch = sentence.match(/(?:hapus|remove)\s+(?:semua\s+)?(.+)/);
      if (removeMatch) {
        const productName = removeMatch[1].trim();
        const inCart = cart.find(item => item.name.toLowerCase().includes(productName));
        
        if (inCart) {
          removeFromCart(inCart.id);
          results.push({ status: 'SUCCESS', message: `✔ ${inCart.name} berhasil dihapus dari keranjang` });
        } else {
          results.push({ status: 'ERROR', message: `❌ Produk "${productName}" tidak ada di keranjang` });
        }
        return;
      }

      // 3. CHANGE QUANTITY
      // Patterns: "ubah kopi jadi 5", "set aqua 2", "kopi ganti 3"
      const changeMatch = sentence.match(/(?:ubah|set|ganti)\s+(.+?)\s+(?:jadi|ke|menjadi)?\s*(\d+)/);
      if (changeMatch) {
        const productName = changeMatch[1].trim();
        const newQty = parseInt(changeMatch[2]);
        const inCart = cart.find(item => item.name.toLowerCase().includes(productName));

        if (inCart) {
          if (inCart.stock >= newQty) {
            setCart(prev => prev.map(item => item.id === inCart.id ? { ...item, quantity: newQty } : item));
            results.push({ status: 'SUCCESS', message: `✔ Jumlah ${inCart.name} diperbarui menjadi ${newQty}` });
          } else {
            results.push({ status: 'ERROR', message: `❌ Stok ${inCart.name} tidak mencukupi untuk jumlah ${newQty}` });
          }
        } else {
          results.push({ status: 'ERROR', message: `❌ Produk "${productName}" tidak ada di keranjang` });
        }
        return;
      }

      // 4. DISCOUNT
      // Patterns: "diskon 10 persen", "beri diskon 5000"
      const discountMatch = sentence.match(/diskon\s+(\d+)\s*(persen|%)?/);
      if (discountMatch) {
        const value = parseInt(discountMatch[1]);
        const isPercent = discountMatch[2] !== undefined;
        
        if (isPercent) {
          const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
          setDiscount(Math.round(subtotal * (value / 100)));
          results.push({ status: 'SUCCESS', message: `✔ Diskon ${value}% diterapkan` });
        } else {
          setDiscount(value);
          results.push({ status: 'SUCCESS', message: `✔ Diskon Rp ${value.toLocaleString()} diterapkan` });
        }
        return;
      }

      // 5. PAYMENT
      // Patterns: "bayar tunai 100 ribu", "bayar qris", "selesaikan"
      const payMatch = sentence.match(/(?:bayar|selesaikan|finish)(?:\s+(tunai|cash|qris|kartu|transfer))?(?:\s+(\d+))?/);
      if (payMatch) {
        if (cart.length === 0) {
          results.push({ status: 'ERROR', message: `❌ Keranjang masih kosong` });
          return;
        }

        const method = payMatch[1] || 'tunai';
        const rawAmount = payMatch[2];
        let amount = rawAmount ? parseInt(rawAmount) : null;
        
        // Handle "ribu" keyword
        if (sentence.includes('ribu') && amount) amount *= 1000;
        if (sentence.includes('juta') && amount) amount *= 1000000;

        executePayment(method, amount);
        results.push({ status: 'SUCCESS', message: `✔ Transaksi selesai menggunakan ${method.toUpperCase()}` });
        return;
      }

      // Default
      results.push({ status: 'ERROR', message: `❌ Perintah "${sentence}" tidak dikenali` });
    });

    return results;
  };

  const findProduct = (name: string) => {
    // Exact match
    let p = products.find(prod => prod.name.toLowerCase() === name);
    if (p) return p;

    // Partial match
    p = products.find(prod => prod.name.toLowerCase().includes(name));
    if (p) return p;

    // Barcode match
    p = products.find(prod => prod.barcode === name);
    return p;
  };

  const addToCart = (product: Product, qty: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const executePayment = (method: string, amount: number | null) => {
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax - discount;
    const paid = amount || total;

    let paymentMethod: Transaction['paymentMethod'] = 'CASH';
    if (method.includes('qris')) paymentMethod = 'QRIS';
    else if (method.includes('kartu')) paymentMethod = 'CARD';

    const transaction: Transaction = {
      id: `AI-TRX-${Date.now()}`,
      date: new Date().toISOString(),
      items: [...cart],
      total,
      tax,
      discount,
      paymentMethod,
      amountPaid: paid,
      changeDue: Math.max(0, paid - total),
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      customerId: selectedCustomer?.id,
      paymentStatus: paymentMethod === 'QRIS' ? 'PENDING' : 'PAID'
    };

    if (paymentMethod === 'QRIS') {
      setPendingQRISData(transaction);
      setShowQRISModal(true);
    } else {
      onCompleteTransaction(transaction);
      setLastTransaction(transaction);
      setCart([]);
      setDiscount(0);
      setShowReceipt(true);
    }
  };

  const handleQRISSuccess = (paymentData: { method: string, reference: string }) => {
    if (pendingQRISData) {
      const completedTransaction: Transaction = {
        ...pendingQRISData,
        paymentStatus: 'PAID',
        paymentReference: paymentData.reference
      };
      onCompleteTransaction(completedTransaction);
      setLastTransaction(completedTransaction);
      setCart([]);
      setDiscount(0);
      setShowQRISModal(false);
      setPendingQRISData(null);
      setShowReceipt(true);
    }
  };

  const handleCommandSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!command.trim() || isProcessing) return;

    setIsProcessing(true);
    
    // Simulate thinking
    setTimeout(() => {
      const parsedResults = parseCommand(command);
      
      const newLogs: CommandLog[] = parsedResults.map(res => ({
        id: Math.random().toString(36).substr(2, 9),
        text: command,
        status: res.status,
        message: res.message,
        timestamp: new Date().toLocaleTimeString('id-ID')
      }));

      setLogs(prev => [...prev, ...newLogs]);
      setCommand('');
      setIsProcessing(false);
    }, 400);
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax - discount;

  return (
    <div className="h-full flex flex-col xl:flex-row gap-6 animate-in fade-in duration-500">
      {/* AI Interaction Side */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden min-h-[500px]">
        {/* Header Smart Assistant */}
        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100 flex items-center justify-between">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <Bot size={24} />
              </div>
              <h2 className="text-2xl font-black italic">SMART POS AI ASSISTANT</h2>
            </div>
            <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest opacity-80">
              Ketik perintah atau gunakan suara untuk transaksi cepat
            </p>
          </div>
          <div className="relative z-10 flex flex-col gap-2 items-end">
            <div className="px-4 py-2 bg-white/10 rounded-full border border-white/20 backdrop-blur-md flex items-center gap-2">
              <Sparkles size={16} className="text-amber-300" />
              <span className="text-[10px] font-black uppercase tracking-widest">Natural Language Processing Active</span>
            </div>
            <button 
              onClick={() => setShowFaceID(!showFaceID)}
              className={`px-4 py-2 rounded-full border backdrop-blur-md flex items-center gap-2 transition-all ${showFaceID ? 'bg-emerald-500/30 border-emerald-400 text-emerald-100' : 'bg-white/10 border-white/20 text-white'}`}
            >
              <UserCheck size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{showFaceID ? 'Face ID Vision ON' : 'Turn on Face ID'}</span>
            </button>
          </div>
          <div className="absolute top-0 right-0 p-12 opacity-10 -mr-16 -mt-16 pointer-events-none">
            <Bot size={240} />
          </div>
        </div>

        {/* Face Recognition Module Slot */}
        {showFaceID && (
          <div className="animate-in zoom-in-95 duration-500">
             <FaceDetectionScanner customers={customers} />
          </div>
        )}

        {/* Command History */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <History size={18} className="text-slate-400" />
              <h3 className="font-bold text-slate-800 text-sm">Riwayat Command</h3>
            </div>
            <button 
              onClick={() => setLogs([])}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
            >
              Hapus Riwayat
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center space-y-4">
                <div className="p-6 bg-slate-50 rounded-full">
                  <Command size={48} className="opacity-20" />
                </div>
                <div>
                  <p className="font-bold italic">Coba ketik sesuatu...</p>
                  <p className="text-[10px] uppercase font-black tracking-widest mt-1 opacity-60">"tambahkan 2 kopi dan 1 roti"</p>
                </div>
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} className={`flex flex-col gap-1 animate-in slide-in-from-bottom-2 duration-300`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{log.timestamp}</span>
                    <span className="text-[10px] font-bold text-slate-300 italic">User Command</span>
                  </div>
                  <div className={`p-4 rounded-2xl border ${log.status === 'SUCCESS' ? 'bg-indigo-50 border-indigo-100' : 'bg-red-50 border-red-100'}`}>
                    <p className="text-sm font-bold text-slate-700 mb-1">"{log.text}"</p>
                    <p className={`text-xs font-black ${log.status === 'SUCCESS' ? 'text-indigo-600' : 'text-red-600'}`}>
                      {log.message}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={logEndRef} />
          </div>

          {/* AI Input Area */}
          <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0">
            <form onSubmit={handleCommandSubmit} className="relative">
              <input 
                type="text" 
                autoFocus
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Ketik perintah transaksi (misal: masukkan 2 indomie)..."
                disabled={isProcessing}
                className="w-full pl-12 pr-28 py-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-indigo-500 font-bold outline-none transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500">
                <Mic size={20} className={isProcessing ? 'animate-pulse' : ''} />
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button 
                  type="submit"
                  disabled={!command.trim() || isProcessing}
                  className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-100 flex items-center justify-center"
                >
                  {isProcessing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Send size={20} />}
                </button>
              </div>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {['Tambah kopi', 'Hapus aqua', 'Bayar tunai', 'Diskon 10%'].map(hint => (
                <button 
                  key={hint}
                  onClick={() => setCommand(hint)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-500 hover:border-indigo-400 hover:text-indigo-600 transition-all uppercase tracking-widest"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* QRIS Modal */}
      <QRISPaymentModal 
        isOpen={showQRISModal}
        onClose={() => setShowQRISModal(false)}
        onSuccess={handleQRISSuccess}
        amount={total}
        invoiceId={`INV-${Date.now()}`}
      />

      {/* Realtime Cart Side */}
      <div className="w-full xl:w-[450px] flex flex-col gap-6">
        <div className="flex-1 bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col shadow-2xl relative overflow-hidden">
          {/* Subtle bg pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
            <div className="absolute rotate-12 -top-20 -left-20">
              <ShoppingCart size={400} />
            </div>
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <ShoppingCart className="text-indigo-400" size={24} />
                <h3 className="text-xl font-bold uppercase tracking-widest">Keranjang AI</h3>
              </div>
              <div className="flex items-center gap-2">
                {selectedCustomer && (
                  <div className="px-3 py-1 bg-emerald-500 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-emerald-400">
                    <UserCheck size={12} /> {selectedCustomer.nickname} recognized
                  </div>
                )}
                <span className="px-3 py-1 bg-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">{cart.length} Jenis Produk</span>
                <button 
                  onClick={() => {
                    setCart([]);
                    setSelectedCustomer(null);
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
                  title="Clear Cart"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2 -mr-2 scrollbar-hide">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center py-12">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <Bot size={40} />
                  </div>
                  <h4 className="text-indigo-300 font-bold italic text-lg">Menunggu Perintah Anda...</h4>
                  <p className="text-[10px] uppercase font-black tracking-widest mt-2 max-w-[200px] leading-relaxed opacity-60">"Coba katakan: tambahkan kopi dan indomie"</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="w-14 h-14 bg-white/10 rounded-[1.25rem] border border-white/5 flex items-center justify-center shrink-0 overflow-hidden">
                       <span className="text-xl font-black italic text-indigo-400">{item.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Rp {item.price.toLocaleString()}</span>
                        <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                        <span className="text-[10px] font-bold text-slate-400 italic">Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black italic text-lg leading-none">Rp {(item.price * item.quantity).toLocaleString()}</p>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-400 transition-colors mt-2"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-white/10 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                  <span>Subtotal</span>
                  <span>Rp {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                  <span>Pajak (10%)</span>
                  <span>Rp {tax.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs font-black text-emerald-400 uppercase tracking-[0.2em] animate-pulse">
                    <span>Diskon AI</span>
                    <span>-Rp {discount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-end pt-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Estimasi Total</span>
                  <h2 className="text-5xl font-black italic text-white leading-none mt-2">Rp {total.toLocaleString()}</h2>
                </div>
                <div className="p-3 bg-white/5 rounded-2xl border border-white/10 italic text-[10px] font-bold text-indigo-300 text-center">
                  NLP Powered<br/>Checkout
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-8">
                 <button className="py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10">
                   Hold POS
                 </button>
                 <button 
                  onClick={() => executePayment('tunai', null)}
                  disabled={cart.length === 0}
                  className="py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/50 flex items-center justify-center gap-2"
                 >
                   Instant Pay <ArrowRight size={16} />
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Receipt Modal (Shared with existing system logic) */}
      {showReceipt && lastTransaction && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[400] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-500">
            <div className="p-8 overflow-y-auto max-h-[80vh]">
              <div className="text-center mb-8 border-b-2 border-dashed border-slate-200 pb-8">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg ring-8 ring-indigo-50">
                  <Bot size={32} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest leading-none">NEXUS<span className="text-indigo-600">AI</span></h3>
                <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest italic flex items-center justify-center gap-1">
                   <Sparkles size={10} className="text-amber-400" /> NLP Smart Transaction <Sparkles size={10} className="text-amber-400" />
                </p>
                <div className="mt-6 flex justify-between px-2">
                   <div className="text-left">
                     <p className="text-[8px] font-black text-slate-400 uppercase">Cashier AI</p>
                     <p className="text-[10px] font-bold text-slate-800">{lastTransaction.cashierName}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[8px] font-black text-slate-400 uppercase">Tgl / Jam</p>
                     <p className="text-[10px] font-bold text-slate-800">{new Date(lastTransaction.date).toLocaleDateString('id-ID')} / {new Date(lastTransaction.date).toLocaleTimeString('id-ID')}</p>
                   </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {lastTransaction.items.map(item => (
                  <div key={item.id} className="flex justify-between items-start text-xs">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-[10px] font-medium text-slate-400 tracking-widest">{item.quantity} x Rp {item.price.toLocaleString()}</p>
                    </div>
                    <p className="font-bold text-slate-800 shrink-0">Rp {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 border-t-2 border-dashed border-slate-200 pt-6">
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Subtotal</span>
                  <span>Rp {(lastTransaction.total - lastTransaction.tax + lastTransaction.discount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Pajak (10%)</span>
                  <span>Rp {lastTransaction.tax.toLocaleString()}</span>
                </div>
                {lastTransaction.discount > 0 && (
                  <div className="flex justify-between text-xs font-black text-emerald-600">
                    <span>Diskon AI</span>
                    <span>-Rp {lastTransaction.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-4 border-t border-slate-100 mt-2">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Total Akhir</span>
                  <span className="text-2xl font-black text-indigo-600 italic">Rp {lastTransaction.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-500 pt-6">
                  <span>Metode</span>
                  <span className="uppercase font-bold text-indigo-600">{lastTransaction.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Bayar</span>
                  <span>Rp {(lastTransaction.amountPaid || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-black text-emerald-600">
                  <span>Kembalian</span>
                  <span>Rp {(lastTransaction.changeDue || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-12 text-center">
                <div className="inline-block p-2 bg-slate-50 rounded-lg mb-4">
                  <p className="text-[10px] font-black italic text-slate-400">{lastTransaction.id}</p>
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 italic">Smart AI Checkout Complete</p>
                <p className="text-[8px] font-bold text-slate-400 mt-2 italic px-8 leading-relaxed">System identified these products via Natural Language Processing engine.</p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setShowReceipt(false)}
                className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all"
              >
                Tutup
              </button>
              <button 
                onClick={() => window.print()}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                 Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPOSView;
