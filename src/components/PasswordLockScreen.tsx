import React, { useState } from "react";
import { Lock, Eye, EyeOff, ShieldAlert, KeyRound } from "lucide-react";

interface PasswordLockScreenProps {
  onUnlock: () => void;
}

export default function PasswordLockScreen({ onUnlock }: PasswordLockScreenProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLockShaking, setIsLockShaking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Retrieve active password from local storage or fall back to default "admin123"
    const savedPassword = localStorage.getItem("psb_admin_password") || "admin123";

    if (password === savedPassword) {
      sessionStorage.setItem("psb_is_unlocked", "true");
      onUnlock();
    } else {
      setErrorMsg("Sandi salah! Silakan periksa kembali kata sandi Anda.");
      setIsLockShaking(true);
      setTimeout(() => setIsLockShaking(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4 font-sans text-stone-800 select-none">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-stone-200/80 overflow-hidden transform transition-all duration-300">
        
        {/* Banner/Header Pondok */}
        <div className="bg-emerald-950 px-6 py-8 text-center text-white relative border-b border-emerald-800/30 flex flex-col items-center">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"></div>
          
          {/* Logo Pesantren */}
          <div className={`w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-400/20 shadow-lg text-white font-serif font-bold text-3xl mb-3.5 ${isLockShaking ? 'animate-bounce' : ''}`}>
            ب
          </div>
          <h2 className="text-xl font-bold tracking-tight font-serif">PONDOK PESANTREN BESUK</h2>
          <p className="text-xs text-emerald-400 font-medium tracking-wide uppercase mt-1">Sistem Penerimaan Santri Baru</p>
        </div>

        {/* Form area */}
        <div className="p-6 md:p-8 space-y-6">
          <div className="space-y-2 text-center">
            <div className="inline-flex p-2.5 rounded-full bg-emerald-50 text-emerald-700">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-800 uppercase tracking-widest">Aplikasi Terkunci</h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Silakan masukkan kata sandi administrator untuk mengelola data pendaftar & melakukan registrasi santri baru.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wide flex justify-between items-center">
                <span>Kata Sandi Akses</span>
                <span className="text-emerald-700 font-mono text-[10px] lowercase">Wajib Diisi</span>
              </label>
              
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi..."
                  className="w-full text-sm py-3 px-4 pr-11 bg-stone-50 hover:bg-stone-100/60 focus:bg-white rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium font-mono text-stone-900 placeholder-stone-400 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs flex items-start gap-2 animate-pulse">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <span className="font-semibold">{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 hover:shadow-lg transition-all duration-200 cursor-pointer uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Buka Aplikasi</span>
            </button>
          </form>

          {/* Info Default Credential Box */}
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl text-[11px] leading-relaxed text-stone-500 text-center">
            <span className="font-bold text-stone-700 block mb-0.5">💡 Informasi Kata Sandi Default</span>
            Gunakan sandi bawaan <strong className="text-emerald-800 font-mono">admin123</strong> untuk masuk pertama kali. Sandi dapat diubah sewaktu-waktu di menu utama.
          </div>
        </div>

        {/* Footer */}
        <div className="bg-stone-50 py-4 border-t border-stone-100 text-center text-[10px] text-stone-400 font-mono">
          © 2026 PP. Besuk • Hak Cipta Dilindungi
        </div>
      </div>
    </div>
  );
}
