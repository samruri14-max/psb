import React from "react";
import { Santri } from "../types";
import { Printer, X, CheckCircle, ShieldCheck, Download, LayoutDashboard } from "lucide-react";

interface StudentReceiptProps {
  student: Santri;
  onClose: () => void;
  onBackToDashboard?: () => void;
}

export default function StudentReceipt({ student, onClose, onBackToDashboard }: StudentReceiptProps) {
  
  const handlePrint = () => {
    window.print();
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&color=005F27&data=PPB_BESUK_${student.nomor_induk}_${encodeURIComponent(student.nama_santri)}`;

  const formatDate = (isoStr: string) => {
    if (!isoStr) return "-";
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-905/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto font-sans print:p-0 print:bg-white print:relative print:inset-auto">
      
      {/* Container utama bukti pendaftaran */}
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl border border-stone-100 modal-transition relative print:shadow-none print:border-none print:p-0 print:max-w-full">
        
        {/* Tombol Aksi di atas (Tersembunyi saat Cetak) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-100 print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-700" />
            <span className="font-bold text-xs text-stone-800">Bukti Registrasi Santri Baru</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBackToDashboard || onClose}
              className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-stone-500" />
              <span>Kembali ke Dashboard</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NOTA CETAKAN BUKTI (Ini yang akan dicetak ke printer) */}
        <div className="space-y-6 print:space-y-8 bg-stone-50/25 p-5 border border-emerald-800/25 rounded-2xl print:border-stone-300 print:p-8 print:bg-white">
          
          {/* Header Pondok Pesantren */}
          <div className="flex items-center justify-between pb-5 border-b-2 border-emerald-900/30">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 bg-emerald-800 rounded-xl flex items-center justify-center text-white border border-emerald-600/30">
                <span className="text-2xl font-bold font-serif">ب</span>
              </div>
              <div>
                <h2 className="text-md md:text-lg font-bold text-emerald-900 tracking-tight font-serif uppercase">PONDOK PESANTREN BESUK PASURUAN</h2>
                <span className="text-[10px] md:text-xs text-stone-500 font-medium leading-none block mt-0.5">Sekretariat Penerimaan Santri Baru (PSB) Online</span>
                <span className="text-[9px] text-stone-400 mt-1 block">Alamat: Kejayan, Pasuruan, Jawa Timur. Telp: (0343) 412233</span>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="inline-block px-3 py-1.5 rounded-lg bg-emerald-50 text-[10px] font-bold text-emerald-800 border border-emerald-100 uppercase tracking-widest font-mono">
                PESANTREN MODERN
              </span>
            </div>
          </div>

          {/* Judul Formulir */}
          <div className="text-center space-y-1">
            <h3 className="text-sm font-bold text-stone-900 uppercase font-serif tracking-wider">KARTU BUKTI PENDAFTARAN SANTRI BARU</h3>
            <span className="text-[11px] text-stone-500 block">Tahun Ajaran: <strong>2026/2027</strong></span>
          </div>

          {/* GRID DATA PENERIMA */}
          <div className="space-y-3.5 text-xs text-stone-700">
            
            <div className="grid grid-cols-3 border-b border-stone-100 pb-2">
              <span className="font-semibold text-stone-400 uppercase tracking-wide text-[9px]">No Pendaftaran:</span>
              <span className="col-span-2 font-mono text-emerald-900 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block w-max">
                {student.nomor_induk}
              </span>
            </div>

            <div className="grid grid-cols-3 border-b border-stone-100 pb-2">
              <span className="font-semibold text-stone-400 uppercase tracking-wide text-[9px]">Nama Lengkap:</span>
              <span className="col-span-2 font-bold text-stone-900">{student.nama_santri}</span>
            </div>

            <div className="grid grid-cols-3 border-b border-stone-100 pb-2">
              <span className="font-semibold text-stone-400 uppercase tracking-wide text-[9px]">NIK Santri:</span>
              <span className="col-span-2 font-mono text-stone-800">{student.nik_santri}</span>
            </div>

            <div className="grid grid-cols-3 border-b border-stone-100 pb-2">
              <span className="font-semibold text-stone-400 uppercase tracking-wide text-[9px]">Tempat, Tgl Lahir:</span>
              <span className="col-span-2 font-medium text-stone-800">{student.tempat_lahir}, {formatDate(student.tanggal_lahir)}</span>
            </div>

            <div className="grid grid-cols-3 border-b border-stone-100 pb-2">
              <span className="font-semibold text-stone-400 uppercase tracking-wide text-[9px]">Asrama Kamar:</span>
              <span className="col-span-2 font-bold text-emerald-800">{student.kamar}</span>
            </div>

            {student.kelas && student.kelas !== "-" && (
              <div className="grid grid-cols-3 border-b border-stone-100 pb-2">
                <span className="font-semibold text-stone-400 uppercase tracking-wide text-[9px]">Kelas Madrasah:</span>
                <span className="col-span-2 font-bold text-amber-700">{student.kelas}</span>
              </div>
            )}

            <div className="grid grid-cols-3 border-b border-stone-100 pb-2">
              <span className="font-semibold text-stone-400 uppercase tracking-wide text-[9px]">Daerah Asal:</span>
              <span className="col-span-2 font-medium text-stone-850">
                {student.desa}, Kecamatan {student.kecamatan}, {student.kota_kabupaten}, {student.provinsi}
              </span>
            </div>

            <div className="grid grid-cols-3 border-b border-stone-100 pb-2">
              <span className="font-semibold text-stone-400 uppercase tracking-wide text-[9px]">Instansi Terakhir:</span>
              <span className="col-span-2 font-medium text-stone-800">{student.sekolah_terakhir}</span>
            </div>

            <div className="grid grid-cols-3 border-b border-stone-100 pb-2">
              <span className="font-semibold text-stone-400 uppercase tracking-wide text-[9px]">Orang Tua / Wali:</span>
              <span className="col-span-2 font-semibold text-stone-900">{student.nama_ayah} / {student.nama_ibu}</span>
            </div>

            <div className="grid grid-cols-3">
              <span className="font-semibold text-stone-400 uppercase tracking-wide text-[9px]">Kontak WhatsApp:</span>
              <span className="col-span-2 font-mono font-bold text-stone-900">{student.nomor_wali}</span>
            </div>

          </div>

          {/* Tanda Tangan */}
          <div className="pt-5 flex items-center justify-end text-xs font-sans">
            <div className="text-center space-y-12">
              <div className="space-y-0.5">
                <span className="text-stone-400 block text-[10px]">Pasuruan, {formatDate(student.tanggal_daftar)}</span>
                <span className="text-stone-500 font-bold block text-[10px]">Staf TU</span>
              </div>
              <div>
                <strong className="block text-stone-850">Ust. H. Moh. Syamsuri, S.Pd</strong>
                <span className="text-[9px] text-stone-400 block mt-0.5">Kabid Kesiswaan PPB</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer info cetak */}
        <div className="mt-4 text-center text-[10px] text-stone-400 hidden print:block">
          Bukti pendaftaran ini digenerate secara resmi melalui Portal Penerimaan Santri Baru Pondok Pesantren Besuk Pasuruan.
        </div>

      </div>
    </div>
  );
}
