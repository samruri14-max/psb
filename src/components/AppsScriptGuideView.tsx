import React, { useState } from "react";
import { Check, Copy, ExternalLink, ShieldAlert, Sparkles, Database, FileSpreadsheet, FolderKanban, Milestone } from "lucide-react";

export default function AppsScriptGuideView() {
  const [copiedCodeVal, setCopiedCodeVal] = useState(false);
  const [copiedJsonVal, setCopiedJsonVal] = useState(false);

  const codeGsStr = `/**
 * Google Apps Script untuk Pendaftaran Santri Baru Pondok Pesantren Besuk
 * Hubungkan script ini dengan Google Spreadsheet & tempatkan di Google Apps Script editor.
 * 
 * Jangan lupa untuk melakukan "Deploy as Web App" dengan akses: "Anyone" (Siapa saja, bahkan anonim).
 */

var GOOGLE_DRIVE_FOLDER_ID = ""; // Opsional: ID Folder Google Drive khusus

function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : "";
  var result;
  
  try {
    if (action === "get_all") {
      result = getAllSantri();
    } else if (action === "stats") {
      result = getStats();
    } else {
      result = { status: "success", message: "Google Apps Script Pondok Pesantren Besuk is active!" };
    }
  } catch (error) {
    result = { status: "error", error: error.toString() };
  }
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
}

function doPost(e) {
  var response;
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    
    // Simpan Data Santri
    var savedRow = saveData(data);
    
    response = {
      status: "success",
      message: "Pendaftaran berhasil disimpan",
      data: savedRow
    };
  } catch (error) {
    response = {
      status: "error",
      message: "Gagal menyimpan pendaftaran: " + error.toString()
    };
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
}

function getTargetFolder() {
  if (GOOGLE_DRIVE_FOLDER_ID && GOOGLE_DRIVE_FOLDER_ID !== "") {
    try {
      return DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID);
    } catch (err) {}
  }
  
  var folders = DriveApp.getFoldersByName("Berkas Santri Pesantren Besuk");
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder("Berkas Santri Pesantren Besuk");
  }
}

function uploadFileToDrive(base64Data, originalFileName, studentName, fileTypeLabel) {
  if (!base64Data) return "";
  
  try {
    var splitData = base64Data.split(",");
    var meta = splitData[0];
    var rawBase64 = splitData[1] || splitData[0];
    
    var contentType = "application/octet-stream";
    var match = meta.match(/data:(.*?);/);
    if (match) {
      contentType = match[1];
    }
    
    var decoded = Utilities.base64Decode(rawBase64);
    
    var extension = "bin";
    if (contentType.indexOf("png") !== -1) extension = "png";
    else if (contentType.indexOf("jpg") !== -1 || contentType.indexOf("jpeg") !== -1) extension = "jpg";
    else if (contentType.indexOf("pdf") !== -1) extension = "pdf";
    
    var fileName = fileTypeLabel + "_" + studentName.replace(/[^a-zA-Z0-9]/g, "_") + "_" + Math.floor(Math.random() * 1000) + "." + extension;
    var blob = Utilities.newBlob(decoded, contentType, fileName);
    
    var folder = getTargetFolder();
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    return file.getUrl();
  } catch (error) {
    return "Gagal Upload: " + error.toString();
  }
}

function generateNomorInduk(sheet) {
  var lastRow = sheet.getLastRow();
  var year = new Date().getFullYear().toString().substring(2); // "26" 
  var staticPart = "00";
  
  if (lastRow <= 1) {
    return year + " " + staticPart + " 001";
  }
  
  // Ambil nomor urut pendaftaran terakhir
  var maxNum = 0;
  var values = sheet.getRange(2, 2, lastRow - 1, 1).getValues(); // Kolom B (nomor_induk)
  
  for (var i = 0; i < values.length; i++) {
    var val = values[i][0].toString().trim();
    // Regex mencocokkan format baru "26 00 001" atau sejenisnya
    var match = val.match(/^(\d{2})\s+00\s+(\d+)$/);
    if (match) {
      if (match[1] === year) {
        var num = parseInt(match[2], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    } else {
      // Kecocokan alternatif dengan format lama "PPB-26001" untuk kompatibilitas
      var altMatch = val.match(/PPB-(\d{2})\d*(\d{3})$/);
      if (altMatch && altMatch[1] === year) {
        var num = parseInt(altMatch[2], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  }
  
  var nextNum = maxNum + 1;
  var nextNumStr = nextNum.toString();
  while (nextNumStr.length < 3) {
    nextNumStr = "0" + nextNumStr;
  }
  
  return year + " " + staticPart + " " + nextNumStr;
}

function saveData(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Data_Santri");
  
  if (!sheet) {
    sheet = ss.insertSheet("Data_Santri");
    var headers = [
      "id", "nomor_induk", "nama_santri", "nik_santri", "tempat_lahir", "tanggal_lahir", 
      "nomor_kk", "nisn", "anak_ke", "jumlah_saudara", "provinsi", "kota_kabupaten", "kecamatan", "desa", 
      "rt", "rw", "alamat_lengkap", "kamar", "tes_masuk", "sekolah_terakhir", "kelas", 
      "alamat_sekolah", "pondok_terakhir", "nama_ayah", "nik_ayah", "tempat_lahir_ayah", 
      "tanggal_lahir_ayah", "pendidikan_ayah", "pekerjaan_ayah", "nama_ibu", "nik_ibu", 
      "tempat_lahir_ibu", "tanggal_lahir_ibu", "pendidikan_ibu", "pekerjaan_ibu", 
      "nomor_wali", "file_kk", "file_ijazah", "file_akte", "tanggal_daftar"
    ];
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#005F27").setFontColor("#FFFFFF");
  }
  
  var id = "SNT" + Utilities.getUuid().substring(0, 8).toUpperCase();
  var nomorInduk = data.nomor_induk || generateNomorInduk(sheet);
  var tanggalDaftar = new Date().toISOString();
  var studentName = data.nama_santri || "Tanpa_Nama";
  
  var kkUrl = data.file_kk ? uploadFileToDrive(data.file_kk, "kk", studentName, "KK") : "";
  var ijazahUrl = data.file_ijazah ? uploadFileToDrive(data.file_ijazah, "ijazah", studentName, "IJAZAH") : "";
  var akteUrl = data.file_akte ? uploadFileToDrive(data.file_akte, "akte", studentName, "AKTE") : "";
  
  var rowData = [
    id, nomorInduk, data.nama_santri, data.nik_santri, data.tempat_lahir, data.tanggal_lahir, 
    data.nomor_kk, data.nisn, data.anak_ke, data.jumlah_saudara || 1, data.provinsi, data.kota_kabupaten, data.kecamatan, 
    data.desa, data.rt, data.rw, data.alamat_lengkap, data.kamar, data.tes_masuk, data.sekolah_terakhir, 
    data.kelas, data.alamat_sekolah, data.pondok_terakhir, data.nama_ayah, data.nik_ayah, 
    data.tempat_lahir_ayah, data.tanggal_lahir_ayah, data.pendidikan_ayah, data.pekerjaan_ayah, 
    data.nama_ibu, data.nik_ibu, data.tempat_lahir_ibu, data.tanggal_lahir_ibu, data.pendidikan_ibu, 
    data.pekerjaan_ibu, data.nomor_wali, kkUrl, ijazahUrl, akteUrl, tanggalDaftar
  ];
  
  sheet.appendRow(rowData);
  
  return {
    id: id,
    nomor_induk: nomorInduk,
    nama_santri: data.nama_santri,
    file_kk: kkUrl,
    file_ijazah: ijazahUrl,
    file_akte: akteUrl,
    tanggal_daftar: tanggalDaftar
  };
}`;

  const appsscriptJsonStr = `{
  "timeZone": "Asia/Jakarta",
  "dependencies": {
  },
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE"
  }
}`;

  const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 font-sans pb-10">
      
      {/* HEADER GUIDE */}
      <div className="bg-emerald-850 text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_60%)]"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-800 text-xs text-white border border-emerald-600 font-bold">
            <Milestone className="w-3.5 h-3.5" />
            <span>Panduan Deployment Mandiri</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight font-serif text-white">Panduan Integrasi Spreadsheet & Google Drive</h2>
          <p className="text-emerald-100/90 text-xs leading-relaxed max-w-3xl">
            Ikuti 4 langkah sederhana berikut untuk menghubungkan formulir pendaftaran ini dengan Google Spreadsheet & Google Drive milik pondok pesantren Anda. Seluruh berkas pendaftaran akan terupload rapi!
          </p>
        </div>
      </div>

      {/* STEP DEPLOYMENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LANGKAH 1 */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-3.5 relative">
          <span className="absolute top-4 right-4 text-3xl font-black text-stone-100 font-serif">01</span>
          <div className="w-9 h-9 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide">Langkah 1: Siapkan Spreadsheet</h3>
            <span className="text-[11px] text-stone-500 block leading-normal">
              Buat spreadsheet baru di Google Drive milik Akun Pesantren. Beri nama spreadsheet misalnya: <strong>"Pendaftaran Santri PP Besuk"</strong>. Buatlah tab sheet bernama <strong className="text-emerald-850">Data_Santri</strong> di dalamnya.
            </span>
          </div>
        </div>

        {/* LANGKAH 2 */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-3.5 relative">
          <span className="absolute top-4 right-4 text-3xl font-black text-stone-100 font-serif">02</span>
          <div className="w-9 h-9 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide">Langkah 2: Buka Apps Script</h3>
            <span className="text-[11px] text-stone-500 block leading-normal">
              Dalam Google Spreadsheet tersebut, klik menu <strong>Extensions (Ekstensi)</strong> &gt; <strong>Apps Script</strong>. Hapus semua kode default di editor, lalu salin-tempel kode <strong>Code.gs</strong> yang kami sediakan di bawah ini.
            </span>
          </div>
        </div>

        {/* LANGKAH 3 */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-3.5 relative">
          <span className="absolute top-4 right-4 text-3xl font-black text-stone-100 font-serif">03</span>
          <div className="w-9 h-9 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide">Langkah 3: Atur Folder Google Drive</h3>
            <span className="text-[11px] text-stone-500 block leading-normal">
              Secara bawaan script akan membuat folder baru bernama <strong>"Berkas Santri Pesantren Besuk"</strong> secara otomatis di Google Drive Anda. Jika ingin menyimpannya di folder yang sudah Anda siapkan secara khusus, salin ID Folder tersebut dan masukkan di dalam variabel `GOOGLE_DRIVE_FOLDER_ID` pada baris ke-10 di bawah.
            </span>
          </div>
        </div>

        {/* LANGKAH 4 */}
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 space-y-3.5 relative">
          <span className="absolute top-4 right-4 text-3xl font-black text-stone-100 font-serif">04</span>
          <div className="w-9 h-9 bg-emerald-50 text-emerald-800 rounded-xl flex items-center justify-center">
            <ExternalLink className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wide">Langkah 4: Deploy & Hubungkan</h3>
            <span className="text-[11px] text-stone-500 block leading-normal">
              Klik tombol <strong>Deploy</strong> &gt; <strong>New Deployment</strong>. Tentukan tipe sebagai <strong>Web App</strong>. Atur "Execute as" sebagai <strong>Me (Akun email Anda)</strong> dan "Who has access" sebagai <strong>Anyone (Siapa saja)</strong>. Deploy, lalu salin URL Web App yang dihasilkan, dan hubungkan lewat tombol "Hubungkan Spreadsheet" di pokok kanan atas web ini.
            </span>
          </div>
        </div>

      </div>

      {/* CODE SECTIONS FOR COPY PASTE */}
      <div className="space-y-6">
        
        {/* Code.gs Copy Area */}
        <div className="bg-stone-900 rounded-2xl border border-stone-850 overflow-hidden shadow-lg">
          <div className="bg-stone-950 p-4 border-b border-emerald-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
              <span className="text-xs font-mono font-bold text-stone-200">Code.gs (Google Apps Script)</span>
            </div>
            <button
              onClick={() => copyToClipboard(codeGsStr, setCopiedCodeVal)}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-emerald-900/40 text-stone-200 hover:text-white transition duration-200 flex items-center gap-1.5 text-xs font-bold font-sans cursor-pointer"
            >
              {copiedCodeVal ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-400" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-5 overflow-auto max-h-96 text-xs text-stone-300 font-mono leading-relaxed bg-stone-900/95 scrollbar-thin">
            {codeGsStr}
          </pre>
        </div>

        {/* appsscript.json Copy Area */}
        <div className="bg-stone-900 rounded-2xl border border-stone-850 overflow-hidden shadow-lg">
          <div className="bg-stone-950 p-4 border-b border-emerald-950/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
              <span className="text-xs font-mono font-bold text-stone-200">appsscript.json (Manifes Apps Script)</span>
            </div>
            <button
              onClick={() => copyToClipboard(appsscriptJsonStr, setCopiedJsonVal)}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-emerald-900/40 text-stone-200 hover:text-white transition duration-200 flex items-center gap-1.5 text-xs font-bold font-sans cursor-pointer"
            >
              {copiedJsonVal ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-stone-400" />
                  <span>Salin JSON</span>
                </>
              )}
            </button>
          </div>
          <p className="p-4 bg-stone-900 text-stone-400 text-xs italic leading-tight border-b border-stone-850">
            *Untuk menempel manifes, aktifkan centang "Show 'appsscript.json' manifest file in editor" pada menu Gear Pengaturan Apps Script Anda.
          </p>
          <pre className="p-5 overflow-auto text-xs text-emerald-300 font-mono leading-relaxed bg-stone-900/95">
            {appsscriptJsonStr}
          </pre>
        </div>

      </div>

    </div>
  );
}
