import React from "react";
import { Santri } from "../types";
import { Users, LayoutGrid, GraduationCap, Calendar, Search, ArrowRight, UserCheck, ShieldAlert, Award } from "lucide-react";

interface DashboardViewProps {
  students: Santri[];
  onNavigateToRegister: () => void;
  onNavigateToSearch: () => void;
  onShowStudentDetails: (student: Santri) => void;
}

export default function DashboardView({
  students,
  onNavigateToRegister,
  onNavigateToSearch,
  onShowStudentDetails
}: DashboardViewProps) {
  
  // Calculate Statistics
  const totalSantri = students.length;
  
  // Kamar calculation
  const kamarSet = new Set(students.map((s) => s.kamar).filter(Boolean));
  const totalKamar = kamarSet.size || 8; // Default placeholder minimum
  
  // Kelas calculation
  const kelasSet = new Set(students.map((s) => s.kelas).filter(Boolean));
  const totalKelas = kelasSet.size || 6;

  // Today registrations
  const todayStr = new Date().toISOString().substring(0, 10);
  const pendaftarHariIni = students.filter((s) => {
    if (!s.tanggal_daftar) return false;
    return s.tanggal_daftar.substring(0, 10) === todayStr;
  }).length;

  // Latest 4 registrants
  const latestStudents = [...students]
    .sort((a, b) => new Date(b.tanggal_daftar).getTime() - new Date(a.tanggal_daftar).getTime())
    .slice(0, 4);

  // Kamar popularity stats representation
  const kamarStats: Record<string, number> = {};
  students.forEach((s) => {
    if (s.kamar) {
      kamarStats[s.kamar] = (kamarStats[s.kamar] || 0) + 1;
    }
  });
  const kamarStatsList = Object.entries(kamarStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  // Format date helper
  const formatDate = (isoStr: string) => {
    if (!isoStr) return "-";
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }) + " WIB";
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6 md:space-y-8 font-sans pb-10">
      
      {/* Hero Welcome Slide */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-850 to-emerald-950 text-white p-6 md:p-8 shadow-xl border border-emerald-800/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.15),transparent_60%)]"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-700/10 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
        <div className="relative z-10 max-w-2xl space-y-3.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800/50 border border-emerald-600/30 text-xs text-emerald-300 font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>Pondok Pesantren Besuk Pasuruan</span>
          </div>
          <h2 className="text-xl md:text-3xl font-bold tracking-tight text-white leading-tight font-serif">
            Selamat Datang di Portal Penerimaan Santri Baru (PSB) Online
          </h2>
          <p className="text-emerald-100/80 text-xs md:text-sm leading-relaxed">
            Sistem pendaftaran online yang modern, aman, dan tanpa formulir cetak konvensional. Data Anda langsung disinkronkan ke Google Spreadsheet dan dokumen berkas disimpan rapi dalam Google Drive pesantren secara otomatis.
          </p>
          <div className="pt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={onNavigateToRegister}
              className="px-5 py-3 rounded-xl bg-white text-emerald-900 font-bold text-xs hover:bg-emerald-50 transition shadow-lg shadow-emerald-900/20 flex items-center gap-2 cursor-pointer"
            >
              <span>Daftar Santri Baru Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onNavigateToSearch}
              className="px-5 py-3 rounded-xl bg-emerald-800/40 text-emerald-100 border border-emerald-700/40 font-bold text-xs hover:bg-emerald-850 transition flex items-center gap-2 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cari Nama Santri</span>
            </button>
          </div>
        </div>
      </div>

      {/* METRIC CARD GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Total Santri */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Total Terdaftar</span>
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight block">
              {totalSantri}
            </span>
            <span className="text-[11px] text-stone-400 font-medium block mt-1">
              Santri terdaftar aktif
            </span>
          </div>
        </div>

        {/* Total Kamar */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Kamar Hunian</span>
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700">
              <LayoutGrid className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight block">
              {totalKamar}
            </span>
            <span className="text-[11px] text-stone-400 font-medium block mt-1">
              Kompleks asrama ditempati
            </span>
          </div>
        </div>

        {/* Total Kelas */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Kelas Madrasah</span>
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700">
              <GraduationCap className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight block">
              {totalKelas}
            </span>
            <span className="text-[11px] text-stone-400 font-medium block mt-1">
              Tingkat kelas aktif
            </span>
          </div>
        </div>

        {/* Pendaftar Hari Ini */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Daftar Hari Ini</span>
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl md:text-3xl font-black text-emerald-700 tracking-tight block">
              {pendaftarHariIni}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-1">
              Calon santri baru hari ini
            </span>
          </div>
        </div>

      </div>

      {/* BODY CONTENT: RECENT LIST & VISUAL BAR CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-7">
        
        {/* Kolom Kiri: Pendaftar Terbaru (span 2) */}
        <div className="lg:col-span-2 bg-white card-border rounded-3xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div>
                <h3 className="text-sm font-bold text-stone-900">Pendaftar Santri Terkini</h3>
                <p className="text-xs text-stone-400">Pendaftar yang baru-baru ini menyerahkan data berkas</p>
              </div>
              <button
                onClick={onNavigateToSearch}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <span>Lihat Semua</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-4 divide-y divide-stone-100">
              {latestStudents.length === 0 ? (
                <div className="py-12 text-center text-stone-400 text-xs">
                  Belum ada data pendaftar santri baru. Silakan tambahkan pendaftar baru lewat formulir.
                </div>
              ) : (
                latestStudents.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => onShowStudentDetails(student)}
                    className="py-3.5 flex items-center justify-between hover:bg-stone-50/80 px-2 rounded-xl transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-emerald-100/60 rounded-xl flex items-center justify-center text-emerald-800 font-bold text-xs">
                        {student.nama_santri.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-stone-850 group-hover:text-emerald-700 transition">
                          {student.nama_santri}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-0.5">
                          <span className="font-mono text-emerald-700 font-semibold">{student.nomor_induk}</span>
                          <span>•</span>
                          <span>{student.kota_kabupaten}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-full bg-stone-100 text-[10px] font-bold text-stone-600">
                        {student.kamar ? student.kamar.split(" - ")[0] : "Kamar -"}
                      </span>
                      <span className="text-[10px] text-stone-400 block mt-1">
                        {formatDate(student.tanggal_daftar)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Sistem pendaftaran diverifikasi online oleh Panitia PSB Pesuk.</span>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Statistik visual sederhana */}
        <div className="bg-white card-border rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-sm font-bold text-stone-900">Persebaran Asrama / Kamar</h3>
            <p className="text-xs text-stone-400">Grafik keterisian kamar santri baru</p>
          </div>

          {/* Render bar popularitas kamar */}
          <div className="space-y-4">
            {kamarStatsList.length === 0 ? (
              <div className="text-center py-10 text-xs text-stone-400">
                Data persebaran santri baru belum terekam.
              </div>
            ) : (
              kamarStatsList.map((kamar, index) => {
                const percentage = Math.round((kamar.count / totalSantri) * 100) || 0;
                // dynamic color colors
                const barColors = [
                  "bg-emerald-600",
                  "bg-amber-500",
                  "bg-teal-600",
                  "bg-blue-600"
                ];
                
                return (
                  <div key={kamar.name} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-stone-700 truncate max-w-[170px]">{kamar.name}</span>
                      <span className="font-bold text-stone-900">{kamar.count} santri ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-stone-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColors[index % barColors.length]} rounded-full transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Info Tambahan */}
          <div className="pt-4 border-t border-stone-100 space-y-3.5">
            <h4 className="text-xs font-bold text-stone-800">Alur Penerimaan Berkas</h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</div>
                <div>
                  <span className="font-bold text-stone-800 block">Isi Form & Upload</span>
                  <span className="text-stone-500 text-[11px] leading-normal block">Mengisi 5 langkah form registrasi online lengkap & lampirkan scan KK, Ijazah, Akta.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</div>
                <div>
                  <span className="font-bold text-stone-800 block">Cetak Bukti</span>
                  <span className="text-stone-500 text-[11px] leading-normal block">Menyimpan atau mencetak bukti pendaftaran PDF resmi yang mencantumkan QR Code.</span>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">3</div>
                <div>
                  <span className="font-bold text-stone-800 block">Uji & Klasifikasi</span>
                  <span className="text-stone-500 text-[11px] leading-normal block">Datang ke pondok membawa bukti pendaftaran untuk klasifikasi kelas & penempatan asrama definitif.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
