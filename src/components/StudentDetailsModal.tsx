import React from "react";
import { Santri } from "../types";
import { X, Printer, ExternalLink, Calendar, CircleUser, MapPin, GraduationCap, Phone, Sparkles } from "lucide-react";

interface StudentDetailsModalProps {
  student: Santri;
  onClose: () => void;
  onPrint: () => void;
}

export default function StudentDetailsModal({ student, onClose, onPrint }: StudentDetailsModalProps) {
  
  const formatDate = (isoStr: string) => {
    if (!isoStr) return "-";
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }) + " WIB";
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-stone-100 modal-transition">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-800 font-bold font-mono">
              S
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Profil Lengkap Santri</h3>
              <p className="text-xs text-stone-400">Pendaftaran ID: <span className="font-mono text-emerald-700 font-bold">{student.id}</span></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100/60 text-emerald-800 border border-emerald-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Cetakan</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin text-xs text-stone-700">
          
          {/* Kolom Kiri: Data & Alamat */}
          <div className="space-y-5">
            
            {/* 1. DATA SANTRI */}
            <div className="space-y-3.5 p-4 rounded-2xl bg-stone-50 border border-stone-150">
              <span className="font-bold text-[10px] uppercase tracking-wider text-stone-400 block">Identitas Santri</span>
              
              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">Nomor Induk:</span>
                <span className="col-span-2 font-mono text-emerald-950 font-bold">{student.nomor_induk}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">Nama Santri:</span>
                <span className="col-span-2 font-bold text-stone-900">{student.nama_santri}</span>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">NIK:</span>
                <span className="col-span-2 font-mono text-stone-850">{student.nik_santri}</span>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">Tempat Lahir:</span>
                <span className="col-span-2 font-medium text-stone-800">{student.tempat_lahir}</span>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">Tanggal Lahir:</span>
                <span className="col-span-2 font-mono text-stone-850 font-semibold">{student.tanggal_lahir}</span>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">Nomor KK:</span>
                <span className="col-span-2 font-mono text-stone-850">{student.nomor_kk}</span>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">NISN:</span>
                <span className="col-span-2 font-mono text-stone-850">{student.nisn || "-"}</span>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">Anak Ke:</span>
                <span className="col-span-2 font-bold text-stone-900">Anak Ke-{student.anak_ke} dari {student.jumlah_saudara || "-"} bersaudara</span>
              </div>
            </div>

            {/* 2. ALAMAT SANTRI */}
            <div className="space-y-3.5 p-4 rounded-2xl bg-stone-50 border border-stone-150">
              <span className="font-bold text-[10px] uppercase tracking-wider text-stone-400 block">Alamat Asal</span>
              
              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">Provinsi:</span>
                <span className="col-span-2 font-semibold text-stone-855">{student.provinsi}</span>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">Kota/Kab:</span>
                <span className="col-span-2 font-semibold text-stone-855">{student.kota_kabupaten}</span>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">Kecamatan:</span>
                <span className="col-span-2 font-medium text-stone-850">{student.kecamatan}</span>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">Desa/Kel:</span>
                <span className="col-span-2 font-medium text-stone-850">{student.desa}</span>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">RT / RW:</span>
                <span className="col-span-2 font-bold text-stone-850">RT {student.rt} / RW {student.rw}</span>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">Lengkap:</span>
                <span className="col-span-2 text-stone-600 leading-normal">{student.alamat_lengkap}</span>
              </div>
            </div>

          </div>

          {/* Kolom Kanan: Sekolah, Wali, lampiran berkas */}
          <div className="space-y-5">
            
            {/* 3. PENDIDIKAN & KAMAR */}
            <div className="space-y-3.5 p-4 rounded-2xl bg-stone-50 border border-stone-150">
              <span className="font-bold text-[10px] uppercase tracking-wider text-stone-400 block">Pendidikan & Asrama</span>

              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">Asrama Kamar:</span>
                <span className="col-span-2 font-bold text-emerald-800">{student.kamar}</span>
              </div>

              {student.kelas && student.kelas !== "-" && (
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-stone-400">Pilihan Kelas:</span>
                  <span className="col-span-2 font-bold text-amber-700">Kelas {student.kelas}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">Tes Masuk:</span>
                <span className="col-span-2 font-medium text-stone-800">{student.tes_masuk}</span>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">Sekolah Asal:</span>
                <span className="col-span-2 font-semibold text-stone-850">{student.sekolah_terakhir}</span>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">Alamat Sekolah:</span>
                <span className="col-span-2 text-stone-600 leading-normal">{student.alamat_sekolah}</span>
              </div>

              {student.pondok_terakhir && (
                <div className="grid grid-cols-3 gap-1">
                  <span className="text-stone-400">Pesantren Asal:</span>
                  <span className="col-span-2 text-stone-600">{student.pondok_terakhir}</span>
                </div>
              )}
            </div>

            {/* 4. IDENTITAS WALI */}
            <div className="space-y-3.5 p-4 rounded-2xl bg-stone-50 border border-stone-150">
              <span className="font-bold text-[10px] uppercase tracking-wider text-stone-400 block">Identitas Wali / Orang Tua</span>

              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">Nama Ayah:</span>
                <span className="col-span-2 font-bold text-stone-900">{student.nama_ayah}</span>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">Pekerjaan Ayah:</span>
                <span className="col-span-2 text-stone-700">{student.pekerjaan_ayah}</span>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">Nama Ibu:</span>
                <span className="col-span-2 font-bold text-stone-900">{student.nama_ibu}</span>
              </div>

              <div className="grid grid-cols-3 gap-1">
                <span className="text-stone-400">Pekerjaan Ibu:</span>
                <span className="col-span-2 text-stone-700">{student.pekerjaan_ibu}</span>
              </div>

              <div className="grid grid-cols-3 gap-1 border-t border-stone-200/65 pt-2 mt-2">
                <span className="text-stone-400 font-bold">No Wali (WA):</span>
                <span className="col-span-2 font-mono font-bold text-emerald-800">{student.nomor_wali}</span>
              </div>
            </div>

            {/* 5. BERKAS ATTACHMENTS */}
            <div className="space-y-3 p-4 rounded-2xl bg-emerald-50/25 border border-emerald-100 font-sans">
              <span className="font-bold text-[10px] uppercase tracking-wider text-emerald-800 block">Berkas Lampiran Dokumen</span>
              
              <div className="space-y-2">
                {student.file_kk ? (
                  <a
                    href={student.file_kk}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 text-[11px] font-bold text-emerald-900 transition"
                  >
                    <span>📁 Scan Kartu Keluarga (KK)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-stone-400 italic block">Tanpa berkas KK</span>
                )}

                {student.file_ijazah ? (
                  <a
                    href={student.file_ijazah}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 text-[11px] font-bold text-emerald-900 transition"
                  >
                    <span>📁 Scan Ijazah / SKL</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-stone-400 italic block">Tanpa berkas Ijazah</span>
                )}

                {student.file_akte ? (
                  <a
                    href={student.file_akte}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 text-[11px] font-bold text-emerald-900 transition"
                  >
                    <span>📁 Scan Surat Akte Lahir</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <span className="text-stone-400 italic block">Tanpa berkas Akte Lahir</span>
                )}
              </div>
            </div>

          </div>

        </div>

        {/* Footer info tanggal daftar */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
          <span>Terdaftar pada: <strong>{formatDate(student.tanggal_daftar)}</strong></span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold transition cursor-pointer"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
}
