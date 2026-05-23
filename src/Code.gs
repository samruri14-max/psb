/**
 * Google Apps Script untuk Pendaftaran Santri Baru Pondok Pesantren Besuk
 * Hubungkan script ini dengan Google Spreadsheet & tempatkan di Google Apps Script editor.
 * 
 * Jangan lupa untuk melakukan "Deploy as Web App" dengan akses: "Anyone" (Siapa saja, bahkan anonim).
 */

// Konfigurasi ID Folder Google Drive untuk menyimpan berkas upload
// Jika ingin mendefinisikan folder tertentu secara statis, masukkan ID foldernya di sini.
// Contoh: "1a2b3c4d5e6f7g8h9i0j..." atau biarkan kosong agar otomatis membuat folder baru bernama "Berkas Santri Pesantren Besuk".
var GOOGLE_DRIVE_FOLDER_ID = ""; 

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

/**
 * Mendapatkan Folder Google Drive untuk Upload
 */
function getTargetFolder() {
  if (GOOGLE_DRIVE_FOLDER_ID && GOOGLE_DRIVE_FOLDER_ID !== "MY_FOLDER_ID") {
    try {
      return DriveApp.getFolderById(GOOGLE_DRIVE_FOLDER_ID);
    } catch (err) {
      // Jika ID tidak valid, buat folder baru
    }
  }
  
  // Mencari folder bernama "Berkas Santri Pesantren Besuk"
  var folders = DriveApp.getFoldersByName("Berkas Santri Pesantren Besuk");
  if (folders.hasNext()) {
    return folders.next();
  } else {
    return DriveApp.createFolder("Berkas Santri Pesantren Besuk");
  }
}

/**
 * Menyimpan File Base64 ke Google Drive dan mengembalikan URL download-nya
 */
function uploadFileToDrive(base64Data, originalFileName, studentName, fileTypeLabel) {
  if (!base64Data) return "";
  
  try {
    // Format data base64: "data:image/png;base64,iVBORw0KGgo..."
    var splitData = base64Data.split(",");
    var meta = splitData[0];
    var rawBase64 = splitData[1] || splitData[0];
    
    var contentType = "application/octet-stream";
    var match = meta.match(/data:(.*?);/);
    if (match) {
      contentType = match[1];
    }
    
    var decoded = Utilities.base64Decode(rawBase64);
    
    // Tentukan ekstensi file
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

/**
 * Menghasilkan Nomor Induk Santri (No Pendaftaran) Otomatis
 * Format: PPB-2026-[URUTAN] atau BESUK-26[URUTAN]
 */
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

/**
 * Menyimpan data santri ke Google Spreadsheet
 */
function saveData(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Data_Santri");
  
  if (!sheet) {
    // Buat sheet baru jika tidak ada
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
  
  // Upload file-file jika ada base64-nya
  var kkUrl = data.file_kk && data.file_kk.indexOf("http") !== 0 ? uploadFileToDrive(data.file_kk, "kk", studentName, "KK") : (data.file_kk || "");
  var ijazahUrl = data.file_ijazah && data.file_ijazah.indexOf("http") !== 0 ? uploadFileToDrive(data.file_ijazah, "ijazah", studentName, "IJAZAH") : (data.file_ijazah || "");
  var akteUrl = data.file_akte && data.file_akte.indexOf("http") !== 0 ? uploadFileToDrive(data.file_akte, "akte", studentName, "AKTE") : (data.file_akte || "");
  
  var rowData = [
    id,
    nomorInduk,
    data.nama_santri,
    data.nik_santri,
    data.tempat_lahir,
    data.tanggal_lahir,
    data.nomor_kk,
    data.nisn,
    data.anak_ke,
    data.jumlah_saudara || 1,
    
    data.provinsi,
    data.kota_kabupaten,
    data.kecamatan,
    data.desa,
    data.rt,
    data.rw,
    data.alamat_lengkap,
    
    data.kamar,
    data.tes_masuk,
    data.sekolah_terakhir,
    data.kelas,
    data.alamat_sekolah,
    data.pondok_terakhir,
    
    data.nama_ayah,
    data.nik_ayah,
    data.tempat_lahir_ayah,
    data.tanggal_lahir_ayah,
    data.pendidikan_ayah,
    data.pekerjaan_ayah,
    
    data.nama_ibu,
    data.nik_ibu,
    data.tempat_lahir_ibu,
    data.tanggal_lahir_ibu,
    data.pendidikan_ibu,
    data.pekerjaan_ibu,
    
    data.nomor_wali,
    
    kkUrl,
    ijazahUrl,
    akteUrl,
    tanggalDaftar
  ];
  
  sheet.appendRow(rowData);
  
  // Kembalikan data lengkap untuk dicetak atau review
  return {
    id: id,
    nomor_induk: nomorInduk,
    nama_santri: data.nama_santri,
    nik_santri: data.nik_santri,
    tempat_lahir: data.tempat_lahir,
    tanggal_lahir: data.tanggal_lahir,
    nomor_kk: data.nomor_kk,
    nisn: data.nisn,
    anak_ke: data.anak_ke,
    jumlah_saudara: data.jumlah_saudara || 1,
    provinsi: data.provinsi,
    kota_kabupaten: data.kota_kabupaten,
    kecamatan: data.kecamatan,
    desa: data.desa,
    rt: data.rt,
    rw: data.rw,
    alamat_lengkap: data.alamat_lengkap,
    kamar: data.kamar,
    tes_masuk: data.tes_masuk,
    sekolah_terakhir: data.sekolah_terakhir,
    kelas: data.kelas,
    alamat_sekolah: data.alamat_sekolah,
    pondok_terakhir: data.pondok_terakhir,
    nama_ayah: data.nama_ayah,
    nik_ayah: data.nik_ayah,
    tempat_lahir_ayah: data.tempat_lahir_ayah,
    tanggal_lahir_ayah: data.tanggal_lahir_ayah,
    pendidikan_ayah: data.pendidikan_ayah,
    pekerjaan_ayah: data.pekerjaan_ayah,
    nama_ibu: data.nama_ibu,
    nik_ibu: data.nik_ibu,
    tempat_lahir_ibu: data.tempat_lahir_ibu,
    tanggal_lahir_ibu: data.tanggal_lahir_ibu,
    pendidikan_ibu: data.pendidikan_ibu,
    pekerjaan_ibu: data.pekerjaan_ibu,
    nomor_wali: data.nomor_wali,
    file_kk: kkUrl,
    file_ijazah: ijazahUrl,
    file_akte: akteUrl,
    tanggal_daftar: tanggalDaftar
  };
}

/**
 * Mendapatkan semua data santri untuk fitur realtime search di frontend
 */
function getAllSantri() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Data_Santri");
  if (!sheet) return [];
  
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return [];
  
  var lastColumn = sheet.getLastColumn();
  var range = sheet.getRange(2, 1, lastRow - 1, lastColumn);
  var values = range.getValues();
  var headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
  
  var santriList = [];
  for (var i = 0; i < values.length; i++) {
    var item = {};
    for (var j = 0; j < headers.length; j++) {
      var val = values[i][j];
      // Format tanggal agar mudah diproses di Javascript client
      if (val instanceof Date) {
        item[headers[j]] = val.toISOString().substring(0, 10);
      } else {
        item[headers[j]] = val;
      }
    }
    santriList.push(item);
  }
  
  return santriList;
}

/**
 * Mendapatkan ringkasan statistik sederhana
 */
function getStats() {
  var data = getAllSantri();
  var nowStr = new Date().toISOString().substring(0, 10);
  
  var stats = {
    totalSantri: data.length,
    totalKamar: 0,
    totalKelas: 0,
    pendaftarHariIni: 0
  };
  
  var kamars = {};
  var kelases = {};
  
  for (var i = 0; i < data.length; i++) {
    var item = data[i];
    if (item.kamar) kamars[item.kamar] = true;
    if (item.kelas) kelases[item.kelas] = true;
    
    if (item.tanggal_daftar && item.tanggal_daftar.indexOf(nowStr) === 0) {
      stats.pendaftarHariIni++;
    }
  }
  
  stats.totalKamar = Object.keys(kamars).length || 8; // default minimal display jika baru
  stats.totalKelas = Object.keys(kelases).length || 6;
  
  return stats;
}
