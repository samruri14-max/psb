import React, { useState } from "react";
import { Menu, X, Settings, RefreshCw, Sparkles, CheckCircle2, ChevronRight, LayoutDashboard, UserPlus, Search, Code, KeyRound } from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  gasUrl: string;
  setGasUrl: (url: string) => void;
  isCustomGas: boolean;
  setIsCustomGas: (val: boolean) => void;
  onRefreshData?: () => void;
  isRefreshing?: boolean;
}

export default function Header({
  activeTab,
  setActiveTab,
  gasUrl,
  setGasUrl,
  isCustomGas,
  setIsCustomGas,
  onRefreshData,
  isRefreshing
}: HeaderProps) {
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [inputUrl, setInputUrl] = useState(gasUrl);

  const formatTabName = (tab: string) => {
    switch (tab) {
      case "dashboard": return "Ringkasan Dashboard";
      case "register": return "Pendaftaran Santri Baru";
      case "search": return "Pencarian Realtime";
      case "integration": return "Panduan Integrasi Spreadsheet";
      default: return "Aplikasi PSB";
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = inputUrl.trim();
    if (cleanUrl) {
      setGasUrl(cleanUrl);
      setIsCustomGas(true);
      localStorage.setItem("psb_gas_url", cleanUrl);
    } else {
      setIsCustomGas(false);
    }
    setShowConfigModal(false);
  };

  const handleDisconnect = () => {
    setGasUrl("");
    setIsCustomGas(false);
    setInputUrl("");
    localStorage.removeItem("psb_gas_url");
    setShowConfigModal(false);
  };

  return (
    <header className="bg-white border-b border-stone-200/80 sticky top-0 z-40 px-4 py-3 md:py-4 flex items-center justify-between font-sans">
      
      {/* Kiri: Judul & Mobile Menu Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpenMobileMenu(!isOpenMobileMenu)}
          className="p-2 text-stone-600 hover:text-emerald-700 hover:bg-stone-100 rounded-lg md:hidden transition cursor-pointer"
        >
          {isOpenMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        
        {/* Logo Mini Mobile */}
        <div className="w-9 h-9 bg-emerald-700 text-white font-serif font-bold rounded-lg flex items-center justify-center md:hidden">
          ب
        </div>

        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span>Pondok Pesantren Besuk</span>
            <ChevronRight className="w-3 h-3 text-stone-400" />
            <span className="capitalize">{activeTab}</span>
          </div>
          <h1 className="text-sm md:text-lg font-bold text-stone-850 tracking-tight leading-none mt-1">
            {formatTabName(activeTab)}
          </h1>
        </div>
      </div>

      {/* Kanan: Alat Konfigurasi Web App URL */}
      <div className="flex items-center gap-2.5">
        {onRefreshData && (
          <button
            onClick={onRefreshData}
            title="Sikronkan data"
            className={`p-2 rounded-xl text-stone-500 hover:text-emerald-700 hover:bg-stone-50 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${isRefreshing ? 'opacity-80' : ''}`}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Sinkronisasi</span>
          </button>
        )}

        {/* Tombol Ubah Password Akses */}
        <button
          onClick={() => setShowPasswordModal(true)}
          className="px-3.5 py-1.8 rounded-xl text-xs font-bold border bg-white text-stone-700 border-stone-300 hover:bg-stone-50 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          title="Ubah kata sandi akses aplikasi"
        >
          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden sm:inline">Ubah Sandi</span>
        </button>

        {/* Tombol Konfigurasi Database */}
        <button
          onClick={() => setShowConfigModal(true)}
          className={`px-3.5 py-1.8 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
            isCustomGas
              ? "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100/60"
              : "bg-white text-stone-700 border-stone-300 hover:bg-stone-50"
          }`}
        >
          <Settings className={`w-3.5 h-3.5 ${isCustomGas ? 'text-emerald-700 animate-spin-slow' : 'text-stone-500'}`} />
          <span>{isCustomGas ? "Terhubung" : "Hubungkan Spreadsheet"}</span>
        </button>
      </div>

      {/* MOBILE DRAWER */}
      {isOpenMobileMenu && (
        <div className="absolute top-[100%] left-0 w-full bg-stone-900 border-b border-emerald-800/20 text-stone-200 z-50 p-4 shadow-xl flex flex-col gap-2 md:hidden">
          <div className="p-3 mb-2 bg-emerald-950/70 border border-emerald-800/30 rounded-xl">
            <h3 className="font-bold text-sm text-white font-serif">Pondok Pesantren Besuk</h3>
            <p className="text-[11px] text-emerald-400">Pendaftaran Online Terintegrasi</p>
          </div>
          
          <button
            onClick={() => { setActiveTab("dashboard"); setIsOpenMobileMenu(false); }}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === "dashboard" ? "bg-emerald-800 text-white" : "hover:bg-stone-800"}`}
          >
            <LayoutDashboard className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold">Dashboard</span>
          </button>
          
          <button
            onClick={() => { setActiveTab("register"); setIsOpenMobileMenu(false); }}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === "register" ? "bg-emerald-800 text-white" : "hover:bg-stone-800"}`}
          >
            <UserPlus className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold">Pendaftaran Baru</span>
          </button>
          
          <button
            onClick={() => { setActiveTab("search"); setIsOpenMobileMenu(false); }}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === "search" ? "bg-emerald-800 text-white" : "hover:bg-stone-800"}`}
          >
            <Search className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold">Pencarian Santri</span>
          </button>
          
          <button
            onClick={() => { setActiveTab("integration"); setIsOpenMobileMenu(false); }}
            className={`w-full text-left p-3 rounded-lg flex items-center gap-3 ${activeTab === "integration" ? "bg-emerald-800 text-white" : "hover:bg-stone-800"}`}
          >
            <Code className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold">Panduan Integrasi</span>
          </button>

          <button
            onClick={() => { setShowPasswordModal(true); setIsOpenMobileMenu(false); }}
            className="w-full text-left p-3 rounded-lg flex items-center gap-3 hover:bg-stone-850 text-amber-400 border-t border-stone-800/60 pt-4 mt-2"
          >
            <KeyRound className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-semibold">Ubah Kata Sandi</span>
          </button>
        </div>
      )}

      {/* CONFIGURATION MODAL */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-100 modal-transition">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-800">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-md font-bold text-stone-900">Ubah Database Ke Google Sheets</h3>
                  <p className="text-xs text-stone-500">Hubungkan pendaftaran ke Spreadsheet & Google Drive asli Anda</p>
                </div>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700 bg-stone-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className="mt-6 space-y-4">
              <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-xs text-emerald-800 space-y-2">
                <div className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Petunjuk Penting</span>
                </div>
                <p className="leading-relaxed">
                  Gunakan Google Apps Script Web App URL yang Anda peroleh setelah mengikuti panduan deploy (tertera di Tab Panduan Integrasi). Aplikasi akan meng-upload berkas ke Google Drive dan mencatat data langsung ke Spreadsheet Anda secara real-time.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Google Apps Script Web App URL</label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full text-sm p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                  required
                />
              </div>

              <div className="pt-4 flex items-center justify-between gap-3 border-t border-stone-100">
                {isCustomGas ? (
                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                  >
                    Putuskan Hubungan
                  </button>
                ) : (
                  <span className="text-xs text-stone-400 font-mono">Status: Database Lokal</span>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-100 text-stone-700 hover:bg-stone-200 transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition shadow-md shadow-emerald-400/20 cursor-pointer"
                  >
                    Simpan & Hubungkan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* MODAL UBAH PASSWORD AKSES */}
      {showPasswordModal && (
        <ChangePasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </header>
  );
}
