
import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { 
  Scan, 
  Search, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingCart, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Wallet,
  Printer,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Product, CartItem, Transaction, Customer, Employee } from '../types';
import QRISPaymentModal from './QRISPaymentModal';

interface Props {
  products: Product[];
  customers: Customer[];
  currentUser: Employee;
  onCompleteTransaction: (transaction: Transaction) => void;
}

const POSView: React.FC<Props> = ({ products, customers, currentUser, onCompleteTransaction }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showQRISModal, setShowQRISModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null);
  
  const [paymentMethod, setPaymentMethod] = useState<Transaction['paymentMethod']>('CASH');
  const [amountPaid, setAmountPaid] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discount, setDiscount] = useState(0);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  // Calculate values for discount logic
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Auto-focus manual input for USB Scanner support
  const manualInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showScanner) {
      scannerRef.current = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          videoConstraints: {
            facingMode: "environment"
          }
        },
        /* verbose= */ false
      );
      scannerRef.current.render(onScanSuccess, onScanFailure);
    } else {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, [showScanner]);

  const onScanSuccess = (decodedText: string) => {
    handleBarcode(decodedText);
    setShowScanner(false);
  };

  const onScanFailure = (error: any) => {
    // console.warn(`Code scan error = ${error}`);
  };

  const handleBarcode = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      if (product.stock <= 0) {
        alert(`Stok untuk ${product.name} habis!`);
        return;
      }
      addToCart(product);
    } else {
      alert(`Produk dengan barcode ${barcode} tidak ditemukan.`);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert("Stok tidak mencukupi");
          return prev;
        }
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        if (delta > 0 && newQty > item.stock) {
          alert("Stok tidak mencukupi");
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const tax = Math.round(subtotal * 0.1); // 10% tax
  const total = subtotal + tax - discount;

  const handlePayment = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
  };

  const finishTransaction = (qrisData?: { method: string, reference: string }) => {
    const paid = qrisData ? total : (parseFloat(amountPaid) || total);
    if (!qrisData && paymentMethod === 'CASH' && paid < total) {
      alert("Pembayaran kurang!");
      return;
    }

    const transaction: Transaction = {
      id: `TRX-${Date.now()}`,
      date: new Date().toISOString(),
      items: [...cart],
      total,
      tax,
      discount,
      paymentMethod: qrisData ? 'QRIS' : paymentMethod,
      amountPaid: paid,
      changeDue: paid - total,
      cashierId: currentUser.id,
      cashierName: currentUser.name,
      customerId: selectedCustomer?.id,
      paymentStatus: qrisData ? 'PAID' : 'PAID',
      paymentReference: qrisData?.reference
    };

    onCompleteTransaction(transaction);
    setLastTransaction(transaction);
    setCart([]);
    setShowPaymentModal(false);
    setShowQRISModal(false);
    setShowReceipt(true);
    setAmountPaid('');
    setSelectedCustomer(null);
    setDiscount(0);
  };

  const handleConfirmPayment = () => {
    if (paymentMethod === 'QRIS') {
      setShowQRISModal(true);
      setShowPaymentModal(false);
    } else {
      finishTransaction();
    }
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      {/* Product Selection Side */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              ref={manualInputRef}
              type="text" 
              placeholder="Cari produk atau scan barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleBarcode(searchQuery);
                  setSearchQuery('');
                }
              }}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold outline-none"
            />
          </div>
          <button 
            onClick={() => setShowScanner(true)}
            className="p-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            <Scan size={24} />
          </button>
        </div>

        {/* Removed redundant slot here */}

        {/* Quick Search Results / Favorites */}
        <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
          {products.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            p.barcode.includes(searchQuery) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase())
          ).map(product => (
            <button 
              key={product.id}
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              className={`p-4 bg-white rounded-3xl border border-slate-200 text-left hover:border-indigo-500 hover:shadow-md transition-all group relative ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="aspect-square bg-slate-50 rounded-2xl mb-3 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                <ShoppingCart size={32} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{product.category}</p>
              <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{product.name}</h4>
              <p className="font-black text-indigo-600 mt-1">Rp {product.price.toLocaleString()}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className={`text-[10px] font-bold ${product.stock <= product.minStock ? 'text-red-500' : 'text-slate-400'}`}>
                  Stok: {product.stock}
                </span>
              </div>
              {product.stock <= 0 && (
                <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-3xl">
                  <span className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Habis</span>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Cart Side */}
      <div className="w-full lg:w-96 flex flex-col gap-6">
        <div className="flex-1 bg-slate-900 rounded-[2.5rem] p-6 text-white flex flex-col shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 -mr-12 -mt-12">
            <ShoppingCart size={200} />
          </div>

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Keranjang</h3>
              <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">{cart.length} Item</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-8">
                  <div className="p-4 bg-white/5 rounded-full mb-4">
                    <ShoppingCart size={40} />
                  </div>
                  <p className="text-sm font-bold italic">Belum ada item.<br/>Scan barcode atau cari produk.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex items-center gap-3 group">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                      <p className="text-sm font-black italic">{item.name.charAt(0)}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{item.name}</p>
                      <p className="text-[10px] font-black text-indigo-400">Rp {item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:text-indigo-400 transition-colors"><Minus size={14} /></button>
                      <span className="text-xs font-black min-w-[20px] text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:text-indigo-400 transition-colors"><Plus size={14} /></button>
                      <button onClick={() => removeItem(item.id)} className="p-1 text-red-500 hover:text-red-400 transition-colors ml-1"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>Rp {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Pajak (10%)</span>
                <span>Rp {tax.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  <span>Diskon</span>
                  <span>-Rp {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-end pt-2">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Total Akhir</span>
                <span className="text-3xl font-black italic text-white leading-none">Rp {total.toLocaleString()}</span>
              </div>

              <button 
                onClick={handlePayment}
                disabled={cart.length === 0}
                className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-900/50 flex items-center justify-center gap-3"
              >
                Bayar Sekarang <CreditCard size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-8 pb-4">
               <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                      <Scan size={20} />
                    </div>
                    <h3 className="text-2xl font-black italic text-slate-800">Scan Barcode</h3>
                  </div>
                  <button 
                    onClick={() => setShowScanner(false)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
                  >
                    <X size={24} className="text-slate-600" />
                  </button>
               </div>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4 underline decoration-indigo-500 decoration-2 italic">Vision Engine Active</p>
            </div>
            
            <div className="px-8 pb-8">
              <div className="relative group overflow-hidden rounded-[2rem] border-4 border-slate-100 bg-black aspect-video flex items-center justify-center">
                <div id="reader" className="w-full h-full"></div>
                
                {/* Visual Overlay - Frame */}
                <div className="absolute inset-0 pointer-events-none bg-black/20 flex items-center justify-center">
                   {/* Scanning Frame Corners */}
                  <div className="absolute top-10 left-10 w-12 h-12 border-t-4 border-l-4 border-indigo-500 rounded-tl-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                  <div className="absolute top-10 right-10 w-12 h-12 border-t-4 border-r-4 border-indigo-500 rounded-tr-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                  <div className="absolute bottom-10 left-10 w-12 h-12 border-b-4 border-l-4 border-indigo-500 rounded-bl-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                  <div className="absolute bottom-10 right-10 w-12 h-12 border-b-4 border-r-4 border-indigo-500 rounded-br-xl shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                  
                  {/* Scanning Line Animation */}
                  <div className="absolute left-10 right-10 h-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)] animate-scan-move rounded-full"></div>
                </div>
                
                {/* Tech Badge */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-indigo-600/90 backdrop-blur-md rounded-full border border-indigo-400/30 flex items-center gap-2 shadow-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                  <span className="text-[9px] font-black text-white uppercase tracking-[0.25em]">Ready to scan</span>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest">
                  <div className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce"></div>
                  <span>Waiting for barcode detection</span>
                  <div className="w-1 h-1 bg-indigo-600 rounded-full animate-bounce delay-75"></div>
                </div>
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest italic opacity-60">Pastikan pencahayaan cukup terang</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[300] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black italic text-slate-800">Checkout Transaksi</h3>
                <button onClick={() => setShowPaymentModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X size={24} className="text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Metode Pembayaran</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'CASH', label: 'Tunai', icon: Banknote },
                        { id: 'CARD', label: 'Kartu', icon: CreditCard },
                        { id: 'QRIS', label: 'QRIS', icon: QrCode }
                      ].map(method => (
                        <button
                          key={method.id}
                          onClick={() => setPaymentMethod(method.id as any)}
                          className={`flex items-center gap-3 p-4 rounded-2xl border transition-all text-sm font-bold ${paymentMethod === method.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-600 hover:border-indigo-300'}`}
                        >
                          <method.icon size={20} /> {method.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Pilih Pelanggan (Opsional)</label>
                    <div className="space-y-3">
                      <select 
                        value={selectedCustomer?.id || ''}
                        onChange={(e) => {
                          const customer = customers.find(c => c.id === e.target.value);
                          setSelectedCustomer(customer || null);
                          if (customer) {
                            if (customer.tier === 'GOLD') setDiscount(Math.round(subtotal * 0.1));
                            else if (customer.tier === 'SILVER') setDiscount(Math.round(subtotal * 0.05));
                          } else {
                            setDiscount(0);
                          }
                        }}
                        className="w-full px-5 py-3.5 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-bold outline-none text-sm"
                      >
                        <option value="">Umum (Guest)</option>
                        {customers.map(c => (
                          <option key={c.id} value={c.id}>{c.nickname} ({c.id})</option>
                        ))}
                      </select>
                      
                      {selectedCustomer && (
                        <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex items-center gap-3 animate-in slide-in-from-top-2">
                           <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black">
                              {selectedCustomer.nickname.charAt(0)}
                           </div>
                           <div className="flex-1">
                              <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{selectedCustomer.nickname}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black bg-indigo-200 text-indigo-700 px-1.5 py-0.5 rounded leading-none uppercase">{selectedCustomer.tier}</span>
                                <span className="text-[9px] font-bold text-slate-400">{selectedCustomer.points} Points</span>
                              </div>
                           </div>
                           <button onClick={() => {
                             setSelectedCustomer(null);
                             setDiscount(0);
                           }} className="p-1 hover:bg-indigo-100 rounded text-indigo-400">
                             <X size={16} />
                           </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-[2rem] space-y-4">
                  <div className="text-center pb-4 border-b border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Tagihan</p>
                    <h2 className="text-4xl font-black italic text-indigo-600">Rp {total.toLocaleString()}</h2>
                  </div>

                  {paymentMethod === 'CASH' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Uang Dibayar</label>
                        <input 
                          type="number" 
                          autoFocus
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(e.target.value)}
                          placeholder="0"
                          className="w-full px-5 py-4 bg-white rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 font-black text-xl outline-none"
                        />
                      </div>
                      
                      <div className="flex justify-between items-center px-2">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Kembalian</p>
                        <p className={`text-xl font-black ${parseFloat(amountPaid) - total >= 0 ? 'text-emerald-600' : 'text-slate-300'}`}>
                          Rp {Math.max(0, (parseFloat(amountPaid) || 0) - total).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleConfirmPayment}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    {paymentMethod === 'QRIS' ? 'Generate QRIS' : 'Konfirmasi & Simpan'} <CheckCircle2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QRIS Modal */}
      <QRISPaymentModal 
        isOpen={showQRISModal}
        onClose={() => setShowQRISModal(false)}
        onSuccess={finishTransaction}
        amount={total}
        invoiceId={`INV-${Date.now()}`}
      />

      {/* Receipt Modal */}
      {showReceipt && lastTransaction && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[400] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden flex flex-col shadow-2xl animate-in fade-in duration-500">
            <div className="p-8 overflow-y-auto max-h-[80vh] receipt-content">
              <div className="text-center mb-8 border-b-2 border-dashed border-slate-200 pb-8">
                <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <ShoppingCart size={32} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest">NEXUS<span className="text-indigo-600">POS</span></h3>
                <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter italic">Vortex CRM & Intelligent Retail</p>
                <p className="text-[10px] font-bold text-slate-400 mt-2">{new Date(lastTransaction.date).toLocaleString()}</p>
                <p className="text-[10px] font-bold text-slate-400">ID: {lastTransaction.id}</p>
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
                  <div className="flex justify-between text-xs font-medium text-emerald-600">
                    <span>Diskon</span>
                    <span>-Rp {lastTransaction.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-2 border-t border-slate-100 mt-2">
                  <span className="text-xs font-black uppercase tracking-widest">Total</span>
                  <span className="text-2xl font-black text-slate-900">Rp {lastTransaction.total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-500 pt-4">
                  <span>Metode</span>
                  <span className="uppercase font-bold">{lastTransaction.paymentMethod}</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-slate-500">
                  <span>Bayar</span>
                  <span>Rp {lastTransaction.amountPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-black text-emerald-600">
                  <span>Kembalian</span>
                  <span>Rp {lastTransaction.changeDue.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-12 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Terima Kasih</p>
                <p className="text-[8px] font-bold text-slate-400 mt-1 italic">Barang yang sudah dibeli dapat ditukar jika rusak.</p>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                onClick={() => setShowReceipt(false)}
                className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100"
              >
                Tutup
              </button>
              <button 
                onClick={printReceipt}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 flex items-center justify-center gap-2"
              >
                <Printer size={16} /> Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden layout for Print Receipt */}
      <style>{`
        #reader video {
          transform: scaleX(1) !important;
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-content, .receipt-content * {
            visibility: visible;
          }
          .receipt-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm;
            padding: 0;
            margin: 0;
          }
          .receipt-content h3, .receipt-content p, .receipt-content div {
            color: black !important;
          }
        }
      `}</style>
    </div>
  );
};

export default POSView;
