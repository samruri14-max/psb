import React, { useState } from "react";
import { Santri } from "../types";
import { Search, Download, FileText, Printer, Check, Copy, Calendar, CircleUser, MapPin, GraduationCap, Phone, Eye, ExternalLink, RefreshCw } from "lucide-react";

interface SearchStudentsViewProps {
  students: Santri[];
  onShowStudentDetails: (student: Santri) => void;
  onPrintStudent: (student: Santri) => void;
}

export default function SearchStudentsView({
  students,
  onShowStudentDetails,
  onPrintStudent
}: SearchStudentsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKamar, setFilterKamar] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // List of unique Kamars & Kelas for filter dropdowns
  const kamars = Array.from(new Set(students.map((s) => s.kamar).filter(Boolean)));
  const kelases = Array.from(new Set(students.map((s) => s.kelas).filter(Boolean)));

  // Filter logic: realtime by Nama, Nomor Induk, Kamar, Kelas
  const filteredStudents = students.filter((student) => {
    const sTerm = searchTerm.toLowerCase();
    const matchSearch =
      student.nama_santri.toLowerCase().includes(sTerm) ||
      student.nomor_induk.toLowerCase().includes(sTerm) ||
      (student.nik_santri && student.nik_santri.includes(sTerm)) ||
      (student.desa && student.desa.toLowerCase().includes(sTerm)) ||
      (student.kota_kabupaten && student.kota_kabupaten.toLowerCase().includes(sTerm));

    const matchKamar = !filterKamar || student.kamar === filterKamar;
    const matchKelas = !filterKelas || student.kelas === filterKelas;

    return matchSearch && matchKamar && matchKelas;
  });

  const handleCopyId = (e: React.MouseEvent, idStr: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(idStr);
    setCopiedId(idStr);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Natively export santri list to Excel compatible CSV with BOM format
  const handleExportExcel = () => {
    if (students.length === 0) return;

    const headers = [
      "ID", "Nomor Induk", "Nama Santri", "NIK Santri", "Tempat Lahir", "Tanggal Lahir",
      "Nomor KK", "NISN", "Anak Ke", "Jumlah Bersaudara", "Provinsi", "Kota/Kabupaten", "Kecamatan", "Desa",
      "RT", "RW", "Alamat Lengkap", "Kamar Mandiri", "Tes Masuk", "Sekolah Terakhir", "Kelas",
      "Alamat Sekolah", "Pondok Terakhir", "Nama Ayah", "NIK Ayah", "Pekerjaan Ayah",
      "Nama Ibu", "NIK Ibu", "Pekerjaan Ibu", "No Wali", "Tanggal Daftar"
    ];

    const csvRows = [headers.join(",")];

    students.forEach((s) => {
      const row = [
        `"${s.id}"`,
        `"${s.nomor_induk}"`,
        `"${(s.nama_santri || '').replace(/"/g, '""')}"`,
        `"${s.nik_santri || ''}"`,
        `"${s.tempat_lahir || ''}"`,
        `"${s.tanggal_lahir || ''}"`,
        `"${s.nomor_kk || ''}"`,
        `"${s.nisn || ''}"`,
        s.anak_ke,
        s.jumlah_saudara || 1,
        `"${s.provinsi || ''}"`,
        `"${s.kota_kabupaten || ''}"`,
        `"${s.kecamatan || ''}"`,
        `"${s.desa || ''}"`,
        `"${s.rt || ''}"`,
        `"${s.rw || ''}"`,
        `"${(s.alamat_lengkap || '').replace(/"/g, '""')}"`,
        `"${s.kamar || ''}"`,
        `"${s.tes_masuk || ''}"`,
        `"${(s.sekolah_terakhir || '').replace(/"/g, '""')}"`,
        `"${s.kelas || ''}"`,
        `"${(s.alamat_sekolah || '').replace(/"/g, '""')}"`,
        `"${(s.pondok_terakhir || '').replace(/"/g, '""')}"`,
        `"${(s.nama_ayah || '').replace(/"/g, '""')}"`,
        `"${s.nik_ayah || ''}"`,
        `"${(s.pekerjaan_ayah || '').replace(/"/g, '""')}"`,
        `"${(s.nama_ibu || '').replace(/"/g, '""')}"`,
        `"${s.nik_ibu || ''}"`,
        `"${(s.pekerjaan_ibu || '').replace(/"/g, '""')}"`,
        `"${s.nomor_wali || ''}"`,
        `"${s.tanggal_daftar || ''}"`
      ];
      csvRows.push(row.join(","));
    });

    // Excel friendly UTF-8 BOM
    const csvContent = "\uFEFF" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Data_Santri_PP_Besuk_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      
      {/* FILTER CONTROL CARD */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-stone-900 block">Pencarian Realtime Santri</h2>
            <p className="text-xs text-stone-400">Gunakan saringan di bawah untuk menyaring pendaftar</p>
          </div>
          
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor ke Excel CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 pt-2">
          
          {/* Input Search Nama/No Induk */}
          <div className="col-span-1 md:col-span-2 relative">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, no induk, NIK, kelurahan, kota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs p-3.5 pl-10 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 text-stone-750 font-medium transition"
            />
          </div>

          {/* Dropdown Kamar */}
          <div className="relative">
            <select
              value={filterKamar}
              onChange={(e) => setFilterKamar(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 text-stone-750 font-medium transition cursor-pointer appearance-none"
            >
              <option value="">Semua Kamar</option>
              {kamars.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

          {/* Dropdown Kelas */}
          <div className="relative">
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl bg-stone-50 border border-stone-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 text-stone-750 font-medium transition cursor-pointer appearance-none"
            >
              <option value="">Semua Kelas</option>
              {kelases.map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>

        </div>
      </div>

      {/* STUDENT DATA LIST / TABLE */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-sm overflow-hidden">
        
        {/* Mobile-Friendly List & Desktop Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/80 border-b border-stone-150 text-stone-600">
                <th className="px-5 py-3.5 text-xs font-bold leading-normal">Nomor Induk</th>
                <th className="px-5 py-3.5 text-xs font-bold leading-normal">Nama Lengkap</th>
                <th className="px-5 py-3.5 text-xs font-bold leading-normal">Kamar & Kelas</th>
                <th className="px-5 py-3.5 text-xs font-bold leading-normal">Daerah Asal</th>
                <th className="px-5 py-3.5 text-xs font-bold leading-normal">No Wali</th>
                <th className="px-5 py-3.5 text-xs font-bold leading-normal text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-150 font-sans text-stone-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-stone-400 text-xs">
                    Tidak menemukan nama santri yang cocok dengan kriteria pencarian Anda.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    onClick={() => onShowStudentDetails(student)}
                    className="hover:bg-stone-50/55 transition cursor-pointer group"
                  >
                    
                    {/* ID & No Induk */}
                    <td className="px-5 py-4 text-xs whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-emerald-850 font-bold bg-emerald-50 text-emerald-950 px-2 py-0.5 rounded-md border border-emerald-100 shadow-3xs">{student.nomor_induk}</span>
                        <button
                          onClick={(e) => handleCopyId(e, student.nomor_induk)}
                          title="Copy No Induk"
                          className="p-1 rounded-sm text-stone-400 hover:text-emerald-700 hover:bg-stone-100 transition cursor-pointer"
                        >
                          {copiedId === student.nomor_induk ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-stone-400 block mt-1">NISN: {student.nisn || "-"}</span>
                    </td>

                    {/* Nama Santri Sesuai KK */}
                    <td className="px-5 py-4 text-xs">
                      <span className="font-bold text-stone-900 leading-normal block group-hover:text-emerald-850 transition">{student.nama_santri}</span>
                      <span className="text-[10px] text-stone-400 font-mono mt-0.5 block">NIK: {student.nik_santri}</span>
                    </td>

                    {/* Kamar & Kelas */}
                    <td className="px-5 py-4 text-xs whitespace-nowrap">
                      <span className="font-semibold text-stone-750 block">{student.kamar || "Belum ditentukan"}</span>
                      <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">Kelas: {student.kelas}</span>
                    </td>

                    {/* Kota / Kabupaten */}
                    <td className="px-5 py-4 text-xs whitespace-nowrap">
                      <span className="font-medium text-stone-850 block">{student.desa || "-"}</span>
                      <span className="text-[10px] text-stone-400 block mt-0.5">{student.kota_kabupaten}, {student.provinsi}</span>
                    </td>

                    {/* No Wali */}
                    <td className="px-5 py-4 text-xs font-mono whitespace-nowrap">
                      {student.nomor_wali || "-"}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-xs text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Detail Trigger */}
                        <button
                          onClick={() => onShowStudentDetails(student)}
                          title="Lihat Detail Profil"
                          className="p-2 text-stone-600 hover:text-emerald-700 hover:bg-stone-100 rounded-xl transition flex items-center justify-center cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Print Receipt Trigger */}
                        <button
                          onClick={() => onPrintStudent(student)}
                          title="Cetak Bukti Pendaftaran"
                          className="p-2 text-stone-600 hover:text-emerald-700 hover:bg-stone-100 rounded-xl transition flex items-center justify-center cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Total rows count banner */}
        <div className="bg-stone-50 border-t border-stone-150 p-4 flex items-center justify-between text-xs text-stone-500 font-medium">
          <span>Menampilkan <strong className="text-stone-800">{filteredStudents.length}</strong> santri dari <strong className="text-stone-800">{students.length}</strong> total data pesantren.</span>
          <span className="hidden md:inline font-mono">Dikelola tanpa password</span>
        </div>

      </div>

    </div>
  );
}
