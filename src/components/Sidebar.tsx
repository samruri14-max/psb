import React from "react";
import { LayoutDashboard, UserPlus, Search, Code, BookOpen, Settings } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  gasUrl: string;
  isCustomGas: boolean;
}

export default function Sidebar({ activeTab, setActiveTab, gasUrl, isCustomGas }: SidebarProps) {
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      desc: "Ringkasan statistik santri"
    },
    {
      id: "register",
      label: "Pendaftaran Baru",
      icon: UserPlus,
      desc: "Formulir pendaftaran multi-step"
    },
    {
      id: "search",
      label: "Pencarian Santri",
      icon: Search,
      desc: "Cari & kelola data santri"
    },
    {
      id: "integration",
      label: "Panduan Integrasi",
      icon: Code,
      desc: "Setup Spreadsheet & Drive"
    }
  ];

  return (
    <aside className="w-80 bg-stone-900 text-stone-100 flex-shrink-0 border-r border-emerald-800/30 flex flex-col justify-between hidden md:flex font-sans">
      <div>
        {/* Header Pesantren */}
        <div className="p-6 border-b border-emerald-800/20 bg-emerald-950/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg border border-emerald-400/20">
              <span className="text-xl font-bold text-white font-serif">ب</span>
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white leading-tight font-serif">PP. BESUK</h2>
              <p className="text-xs text-emerald-400 font-medium font-sans">Penerimaan Santri Baru</p>
            </div>
          </div>
          <div className="mt-4 p-2 rounded-lg bg-emerald-900/40 border border-emerald-500/20 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isCustomGas ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400 animate-pulse'}`}></div>
            <span className="text-[10px] text-emerald-300 font-mono truncate">
              {isCustomGas ? "Terhubung ke GAS Spreadsheet" : "Menggunakan Database Lokal"}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1.5">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full text-left p-3.5 rounded-xl flex items-start gap-3.5 transition-all duration-250 cursor-pointer ${
                  isActive
                    ? "bg-emerald-700 font-medium text-white shadow-lg shadow-emerald-900/40 translate-x-1"
                    : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/60"
                }`}
              >
                <IconComponent className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isActive ? "text-white" : "text-emerald-500/80"}`} />
                <div className="leading-none">
                  <span className="text-sm font-semibold block">{item.label}</span>
                  <span className={`text-[11px] block mt-1 leading-normal ${isActive ? "text-emerald-200" : "text-stone-500"}`}>
                    {item.desc}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-5 border-t border-emerald-800/10 bg-stone-950/40 text-xs text-stone-500 space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold text-stone-400">Pondok Pesantren Besuk</span>
        </div>
        <p className="leading-relaxed text-[11px]">
          Kejayan, Pasuruan, Jawa Timur. Didirikan sejak tahun 1881 M.
        </p>
        <div className="pt-2 text-[10px] text-stone-600 font-mono flex justify-between items-center border-t border-emerald-800/5">
          <span>v1.2.0-Cerdas</span>
          <span>© 2026 Admin</span>
        </div>
      </div>
    </aside>
  );
}
