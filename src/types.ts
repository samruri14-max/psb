export interface Santri {
  id: string;
  nomor_induk: string;
  nama_santri: string;
  nik_santri: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  nomor_kk: string;
  nisn: string;
  anak_ke: number;
  jumlah_saudara: number;
  
  // Alamat
  provinsi: string;
  kota_kabupaten: string;
  kecamatan: string;
  desa: string;
  rt: string;
  rw: string;
  alamat_lengkap: string;
  
  // Pendidikan
  kamar: string;
  tes_masuk: string;
  sekolah_terakhir: string;
  kelas: string;
  alamat_sekolah: string;
  pondok_terakhir: string;
  
  // Ayah
  nama_ayah: string;
  nik_ayah: string;
  tempat_lahir_ayah: string;
  tanggal_lahir_ayah: string;
  pendidikan_ayah: string;
  pekerjaan_ayah: string;
  
  // Ibu
  nama_ibu: string;
  nik_ibu: string;
  tempat_lahir_ibu: string;
  tanggal_lahir_ibu: string;
  pendidikan_ibu: string;
  pekerjaan_ibu: string;
  
  // Kontak
  nomor_wali: string;
  
  // Files
  file_kk?: string;
  file_ijazah?: string;
  file_akte?: string;
  
  tanggal_daftar: string;
}

export interface Stats {
  totalSantri: number;
  totalKamar: number;
  totalKelas: number;
  pendaftarHariIni: number;
}
