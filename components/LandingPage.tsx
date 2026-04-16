
import React from 'react';
import { 
  Scan, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Gift, 
  Layout, 
  ChevronRight,
  Filter,
  Menu,
  X,
  Star,
  Quote
} from 'lucide-react';

interface Props {
  onStart: () => void;
  onLogin: () => void;
}

const LandingPage: React.FC<Props> = ({ onStart, onLogin }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-x-hidden">
      
      {/* 3. NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-xl text-white">
              <Scan size={24} />
            </div>
            <span className="font-black text-2xl text-slate-900 tracking-tighter">
              NEXUS<span className="text-indigo-600">POS</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {['Fitur', 'Solusi', 'Harga', 'Blog', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="px-6 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
            >
              Login
            </button>
            <button 
              onClick={onStart}
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-black rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all"
            >
              Coba Gratis
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden p-2 text-slate-900" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-100 p-6 flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
            {['Fitur', 'Solusi', 'Harga', 'Blog', 'FAQ'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-lg font-bold text-slate-700">
                {item}
              </a>
            ))}
            <hr className="border-slate-100" />
            <button onClick={onLogin} className="w-full py-4 text-center font-bold text-slate-700">Login</button>
            <button onClick={onStart} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black">Coba Gratis Sekarang</button>
          </div>
        )}
      </nav>

      {/* 2. HERO SECTION */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Modern Gradient Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-[1000px] bg-[radial-gradient(circle_at_50%_0%,#4f46e508_0%,#06b6d405_30%,transparent_70%)] -z-10" />
        <div className="absolute top-20 right-[-10%] w-[500px] h-[500px] bg-indigo-400 opacity-10 blur-[120px] rounded-full -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-[-10%] w-[400px] h-[400px] bg-emerald-400 opacity-10 blur-[120px] rounded-full -z-10" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in slide-in-from-left-10 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest">
              <Sparkles size={14} /> Dipercaya oleh 10.000+ bisnis di Indonesia
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-black text-slate-900 leading-[1.1] tracking-tight">
              Kelola Bisnis Lebih <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 italic">Cerdas</span> dengan CRM Kasir Modern
            </h1>
            <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-lg">
              Gabungkan sistem kasir dan manajemen pelanggan dalam satu platform untuk meningkatkan penjualan dan loyalitas pelanggan secara real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={onStart}
                className="px-8 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Coba Gratis Sekarang <ArrowRight size={20} />
              </button>
              <button 
                className="px-8 py-5 bg-white text-slate-700 border-2 border-slate-100 rounded-2xl font-bold text-lg hover:bg-slate-50 hover:border-slate-200 transition-all flex items-center justify-center gap-3"
              >
                Lihat Demo
              </button>
            </div>
          </div>

          {/* Hero Illustration / Preview */}
          <div className="relative animate-in zoom-in-95 duration-1000 delay-200">
            <div className="relative z-10 bg-white p-4 rounded-[2.5rem] shadow-2xl border border-slate-100 rotate-1">
               <img 
                 src="https://picsum.photos/seed/pos_ui/1200/800" 
                 alt="Dashboard Preview" 
                 referrerPolicy="no-referrer"
                 className="rounded-[2rem] shadow-inner"
               />
            </div>
            
            {/* Floating Icons */}
            <div className="absolute top-10 -right-8 z-20 bg-emerald-500 p-6 rounded-3xl text-white shadow-xl animate-bounce-slow">
              <TrendingUp size={32} />
              <p className="text-[10px] font-black uppercase mt-2">Revenue +45%</p>
            </div>
            <div className="absolute -bottom-10 -left-8 z-20 bg-white p-6 rounded-3xl shadow-2xl flex items-center gap-4 animate-float">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">1.2k Member</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Loyalty Joined</p>
              </div>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 -left-12 z-0 w-24 h-24 bg-indigo-600 rounded-full blur-[40px] opacity-20" />
          </div>
        </div>
      </section>

      {/* 4. SECTION FITUR UTAMA */}
      <section id="fitur" className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <h2 className="text-xs font-black text-indigo-600 uppercase tracking-[0.3em]">Fitur Unggulan</h2>
            <h3 className="text-4xl font-serif font-black text-slate-900 tracking-tight">Semua yang Anda Butuhkan untuk Skala Bisnis</h3>
            <p className="text-slate-500">Sistem terintegrasi yang dirancang untuk efisiensi maksimal dan pertumbuhan berkelanjutan.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: ShoppingCart, title: 'Kasir Cepat & Mudah', desc: 'Selesaikan transaksi dalam hitungan detik dengan antarmuka yang intuitif.', color: 'bg-blue-50 text-blue-600' },
              { icon: Users, title: 'Manajemen Pelanggan', desc: 'Database pelanggan lengkap dengan riwayat belanja dan segmentasi otomatis.', color: 'bg-indigo-50 text-indigo-600' },
              { icon: BarChart3, title: 'Laporan Real-Time', desc: 'Pantau performa bisnis, stok, dan keuntungan di mana saja secara instan.', color: 'bg-emerald-50 text-emerald-600' },
              { icon: Sparkles, title: 'Rekomendasi Otomatis', desc: 'Tawarkan produk yang tepat berdasarkan preferensi belanja pelanggan.', color: 'bg-amber-50 text-amber-600' },
              { icon: Send, title: 'Notifikasi & Promo', desc: 'Kirim e-receipt dan promo eksklusif langsung ke WhatsApp pelanggan.', color: 'bg-purple-50 text-purple-600' },
              { icon: Layout, title: 'Multi Outlet', desc: 'Kelola banyak cabang dalam satu dashboard pusat tanpa ribet.', color: 'bg-slate-900 text-white' }
            ].map((feature, i) => (
              <div key={i} className="group bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all">
                <div className={`${feature.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon size={28} />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SECTION KEUNGGULAN (Value Prop) */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img 
                src="https://picsum.photos/seed/biz_success/800/1000" 
                alt="Business Success" 
                className="rounded-[3rem] shadow-2xl relative z-10"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-indigo-600 rounded-full -z-0 blur-[100px] opacity-20" />
            </div>

            <div className="space-y-12">
              <div className="space-y-4">
                <h2 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Solusi Pintar</h2>
                <h3 className="text-4xl font-serif font-black text-slate-900">Alasan Mengapa NexusPOS Berbeda</h3>
              </div>

              <div className="space-y-8">
                {[
                  { q: 'Masih catat manual?', a: 'Gunakan sistem otomatis yang mengurangi human error hingga 99%.', icon: CheckCircle2 },
                  { q: 'Sulit tahu pelanggan loyal?', a: 'CRM cerdas kami menganalisis perilaku pelanggan secara otomatis untuk Anda.', icon: ShieldCheck },
                  { q: 'Stok sering tidak sinkron?', a: 'Inventaris real-time yang terupdate otomatis setiap ada transaksi di kasir.', icon: Package }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl h-fit">
                      <item.icon size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-800 mb-1">{item.q}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SECTION FITUR CERDAS (ADVANCED CRM) */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-indigo-600/10 blur-[120px]" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="max-w-3xl mx-auto mb-20 space-y-6">
            <div className="bg-indigo-500/20 text-indigo-300 w-fit mx-auto px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-500/30">
              Advanced Analytics
            </div>
            <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tight leading-tight">
              Lebih dari Sekadar Kasir: <br />
              <span className="text-indigo-400">Kecerdasan Buatan untuk Retail</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Sparkles, title: 'AI Recommendation', desc: 'Rekomendasi barang berdasarkan pola belanja unik tiap pelanggan.', color: 'text-amber-400' },
              { icon: BarChart3, title: 'Ranking Pelanggan', desc: 'Identifikasi otomatis siapa 1% pelanggan paling berharga Anda.', color: 'text-emerald-400' },
              { icon: Gift, title: 'Loyalty Point', desc: 'Sistem poin yang terintegrasi penuh tanpa kartu fisik yang merepotkan.', color: 'text-indigo-400' },
              { icon: Filter, title: 'RFM Segmentation', desc: 'Segmentasi Champion, Loyal, hingga At-Risk untuk target strategi.', color: 'text-purple-400' },
              { icon: Send, title: 'Auto Promo', desc: 'Kirim kode diskon otomatis saat pelanggan lama tidak berkunjung.', color: 'text-blue-400' }
            ].map((item, i) => (
              <div key={i} className="p-10 bg-white/5 border border-white/10 rounded-[2.5rem] hover:bg-white/10 hover:border-white/20 transition-all text-left">
                <item.icon className={`${item.color} mb-6`} size={32} />
                <h4 className="text-xl font-bold mb-3">{item.title}</h4>
                <p className="text-slate-400 text-sm leading-relaxed italic">"{item.desc}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SECTION TESTIMONI */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 space-y-4">
             <h2 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Kisah Sukses</h2>
             <h3 className="text-4xl font-serif font-black text-slate-900 tracking-tight">Dipercaya oleh Pemilik Bisnis</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Rina Wijaya', biz: 'Bakery House', text: 'Sistem kasir paling intuitif yang pernah saya gunakan. CRM-nya membantu kami mengenal pelanggan lebih dekat.', stars: 5 },
              { name: 'Budi Santoso', biz: 'Nexus Coffee', text: 'Hanya dalam 3 bulan, penjualan kami meningkat 30% berkat fitur loyalty point yang sangat mudah digunakan.', stars: 5 },
              { name: 'Santi Maria', biz: 'Luna Fashion', text: 'Dukungan support 24/7 dan sistem yang super stabil. Sangat membantu manajemen multi-outlet kami.', stars: 4 }
            ].map((testi, i) => (
              <div key={i} className="p-10 bg-slate-50 rounded-[2.5rem] relative group hover:bg-white hover:shadow-2xl transition-all border border-transparent hover:border-slate-100">
                <Quote className="absolute top-8 right-8 text-indigo-100 group-hover:text-indigo-50 transition-colors" size={60} />
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={14} className={idx < testi.stars ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                  ))}
                </div>
                <p className="text-slate-600 leading-relaxed mb-8 italic relative z-10">"{testi.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">
                    {testi.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-slate-800">{testi.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{testi.biz}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. SECTION CTA (PENUTUP) */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto bg-indigo-600 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#ffffff15_0%,transparent_70%)]" />
          <div className="relative z-10 space-y-10">
            <h2 className="text-4xl md:text-6xl font-serif font-black leading-tight tracking-tight">Siap Meningkatkan <br /> Bisnis Anda?</h2>
            <div className="flex flex-col items-center gap-6">
              <button 
                onClick={onStart}
                className="px-10 py-6 bg-white text-indigo-600 rounded-2xl font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-black/20"
              >
                Mulai Sekarang Gratis
              </button>
              <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-indigo-100">
                <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Tanpa kartu kredit</span>
                <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Setup cepat</span>
                <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Support 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="py-20 bg-white border-t border-slate-100 font-medium">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <Scan size={24} />
              </div>
              <span className="font-black text-2xl text-slate-900 tracking-tighter">
                NEXUS<span className="text-indigo-600">POS</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              Solusi intelligent retail lengkap untuk membantu bisnis tumbuh lebih cepat dengan kekuatan CRM dan Analitik.
            </p>
          </div>

          {[
            { title: 'Produk', links: ['Fitur Kasir', 'Manajemen Stok', 'Loyalty App', 'Dashboard CRM'] },
            { title: 'Perusahaan', links: ['Tentang Kami', 'Karir', 'Kontak', 'Media Kit'] },
            { title: 'Dukungan', links: ['Pusat Bantuan', 'Panduan Penggunaan', 'FAQ', 'Privacy Policy'] }
          ].map((col, i) => (
            <div key={i} className="space-y-6">
              <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">{col.title}</h4>
              <ul className="space-y-4">
                {col.links.map(link => (
                  <li key={link}><a href="#" className="text-sm text-slate-500 hover:text-indigo-600 transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-bold uppercase tracking-widest">
          <p>© 2026 NexusPOS System. All Rights Reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-indigo-600">Instagram</a>
            <a href="#" className="hover:text-indigo-600">Twitter X</a>
            <a href="#" className="hover:text-indigo-600">LinkedIn</a>
          </div>
        </div>
      </footer>

      {/* Animation Styles */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translate(0, 0); }
          50% { transform: translate(10px, 10px); }
          100% { transform: translate(0, 0); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

    </div>
  );
};

export default LandingPage;

const TrendingUp = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const Package = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);
