import React, { useState, useRef, useEffect } from "react";
import { Santri } from "../types";
import { UserCheck, ShieldCheck, Landmark, FileText, Upload, ChevronRight, ChevronLeft, Check, Sparkles, Printer, FileDown, AlertCircle } from "lucide-react";

interface RegistrationFormProps {
  onSubmitSuccess: (newStudent: Santri) => void;
  gasUrl: string;
  isCustomGas: boolean;
}

export default function RegistrationForm({
  onSubmitSuccess,
  gasUrl,
  isCustomGas
}: RegistrationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Santri>>({
    nomor_induk: "Otomatis oleh Sistem",
    nama_santri: "",
    nik_santri: "",
    tempat_lahir: "",
    tanggal_lahir: "",
    nomor_kk: "",
    nisn: "",
    anak_ke: 1,
    jumlah_saudara: 3,
    
    // Alamat
    provinsi: "Jawa Timur",
    kota_kabupaten: "",
    kecamatan: "",
    desa: "",
    rt: "01",
    rw: "01",
    alamat_lengkap: "",
    
    // Pendidikan
    kamar: "Daerah A 1",
    tes_masuk: "Kelas 1 Ibtidaiyah",
    sekolah_terakhir: "",
    kelas: "-",
    alamat_sekolah: "",
    pondok_terakhir: "-",
    
    // Wali (Ayah)
    nama_ayah: "",
    nik_ayah: "",
    tempat_lahir_ayah: "",
    tanggal_lahir_ayah: "",
    pendidikan_ayah: "SLTA",
    pekerjaan_ayah: "",
    
    // Wali (Ibu)
    nama_ibu: "",
    nik_ibu: "",
    tempat_lahir_ibu: "",
    tanggal_lahir_ibu: "",
    pendidikan_ibu: "SLTA",
    pekerjaan_ibu: "",
    
    nomor_wali: "",
    
    // files base64
    file_kk: "",
    file_ijazah: "",
    file_akte: ""
  });

  // Track file metadata for user display
  const [fileNames, setFileNames] = useState({
    kk: "",
    ijazah: "",
    akte: ""
  });

  // Dukcapil Wilayah Indonesia API States
  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>([]);
  const [regencies, setRegencies] = useState<{ id: string; name: string }[]>([]);
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([]);
  const [villages, setVillages] = useState<{ id: string; name: string }[]>([]);

  const [provId, setProvId] = useState<string>("");
  const [regId, setRegId] = useState<string>("");
  const [distId, setDistId] = useState<string>("");
  const [villId, setVillId] = useState<string>("");

  const [isManualAddress, setIsManualAddress] = useState<boolean>(false);

  const [loadingRegions, setLoadingRegions] = useState({
    provinces: false,
    regencies: false,
    districts: false,
    villages: false,
  });

  // Helper to convert ALL CAPS to Title Case (e.g., "JAWA TIMUR" -> "Jawa Timur")
  const toTitleCase = (str: string) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Load Provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setLoadingRegions((prev) => ({ ...prev, provinces: true }));
      try {
        const res = await fetch("https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json");
        if (res.ok) {
          const data = await res.json();
          setProvinces(data);
          
          // Try to auto-select "Jawa Timur" matching initial state
          const jt = data.find((p: any) => p.name.toUpperCase() === "JAWA TIMUR");
          if (jt) {
            setProvId(jt.id);
            fetchRegencies(jt.id);
          }
        }
      } catch (err) {
        console.error("Gagal memuat data provinsi:", err);
      } finally {
        setLoadingRegions((prev) => ({ ...prev, provinces: false }));
      }
    };

    fetchProvinces();
  }, []);

  const fetchRegencies = async (provinceId: string) => {
    setLoadingRegions((prev) => ({ ...prev, regencies: true }));
    try {
      const res = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/regencies/${provinceId}.json`);
      if (res.ok) {
        const data = await res.json();
        setRegencies(data);
      }
    } catch (err) {
      console.error("Gagal memuat data kabupaten:", err);
    } finally {
      setLoadingRegions((prev) => ({ ...prev, regencies: false }));
    }
  };

  const fetchDistricts = async (regencyId: string) => {
    setLoadingRegions((prev) => ({ ...prev, districts: true }));
    try {
      const res = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/districts/${regencyId}.json`);
      if (res.ok) {
        const data = await res.json();
        setDistricts(data);
      }
    } catch (err) {
      console.error("Gagal memuat data kecamatan:", err);
    } finally {
      setLoadingRegions((prev) => ({ ...prev, districts: false }));
    }
  };

  const fetchVillages = async (districtId: string) => {
    setLoadingRegions((prev) => ({ ...prev, villages: true }));
    try {
      const res = await fetch(`https://emsifa.github.io/api-wilayah-indonesia/api/villages/${districtId}.json`);
      if (res.ok) {
        const data = await res.json();
        setVillages(data);
      }
    } catch (err) {
      console.error("Gagal memuat data desa/kelurahan:", err);
    } finally {
      setLoadingRegions((prev) => ({ ...prev, villages: false }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: (name === "anak_ke" || name === "jumlah_saudara") 
        ? (value === "" ? "" : parseInt(value) || 0) 
        : value
    }));
  };

  // Convert uploaded media files to base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "file_kk" | "file_ijazah" | "file_akte", labelName: "kk" | "ijazah" | "akte") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      alert(`Ukuran berkas ${file.name} melebihi batas 5MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64String = event.target?.result as string;
      setFormData((prev) => ({
        ...prev,
        [fieldName]: base64String
      }));
      setFileNames((prev) => ({
        ...prev,
        [labelName]: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  // Automated form validations per step
  const validateStep = (step: number): boolean => {
    setErrorMessage(null);

    if (step === 1) {
      if (!formData.nama_santri?.trim()) return fail("Nama Santri wajib diisi sesuai KK.");
      if (!formData.nik_santri || formData.nik_santri.length !== 16 || isNaN(Number(formData.nik_santri))) {
        return fail("NIK Santri wajib berupa 16 digit angka.");
      }
      if (!formData.tempat_lahir?.trim()) return fail("Tempat Lahir wajib diisi.");
      if (!formData.tanggal_lahir) return fail("Tanggal Lahir wajib dipilih.");
      if (!formData.nomor_kk || formData.nomor_kk.length !== 16 || isNaN(Number(formData.nomor_kk))) {
        return fail("Nomor Kartu Keluarga (KK) wajib berupa 16 digit angka.");
      }
      if (formData.nisn && isNaN(Number(formData.nisn))) {
        return fail("NISN harus berupa angka (jika diisi).");
      }
      if (!formData.sekolah_terakhir?.trim()) return fail("Sekolah Terakhir wajib diisi.");
      if (!formData.alamat_sekolah?.trim()) return fail("Alamat Sekolah Terakhir wajib diisi.");
    }

    if (step === 2) {
      if (!formData.provinsi?.trim()) return fail("Provinsi alamat wajib diisi.");
      if (!formData.kota_kabupaten?.trim()) return fail("Kota / Kabupaten wajib diisi.");
      if (!formData.kecamatan?.trim()) return fail("Kecamatan wajib diisi.");
      if (!formData.desa?.trim()) return fail("Desa / Kelurahan wajib diisi.");
      if (!formData.rt?.trim() || !formData.rw?.trim()) return fail("RT dan RW wajib diisi (misal: 01).");
      if (!formData.alamat_lengkap?.trim()) return fail("Alamat lengkap wajib diisi.");
    }

    if (step === 3) {
      if (!formData.kamar) return fail("Kamar / Asrama santri wajib ditentukan.");
    }

    if (step === 4) {
      if (!formData.nama_ayah?.trim()) return fail("Nama Ayah wajib diisi.");
      if (!formData.nik_ayah || formData.nik_ayah.length !== 16 || isNaN(Number(formData.nik_ayah))) {
        return fail("NIK Ayah wajib berisi 16 digit angka.");
      }
      if (!formData.tempat_lahir_ayah?.trim()) return fail("Tempat Lahir Ayah wajib diisi.");
      if (!formData.tanggal_lahir_ayah) return fail("Tanggal Lahir Ayah wajib dipilih.");
      if (!formData.pendidikan_ayah) return fail("Pendidikan Terakhir Ayah wajib dipilih.");
      if (!formData.pekerjaan_ayah?.trim()) return fail("Pekerjaan Ayah wajib diisi.");

      if (!formData.nama_ibu?.trim()) return fail("Nama Ibu wajib diisi.");
      if (!formData.nik_ibu || formData.nik_ibu.length !== 16 || isNaN(Number(formData.nik_ibu))) {
        return fail("NIK Ibu wajib berisi 16 digit angka.");
      }
      if (!formData.tempat_lahir_ibu?.trim()) return fail("Tempat Lahir Ibu wajib diisi.");
      if (!formData.tanggal_lahir_ibu) return fail("Tanggal Lahir Ibu wajib dipilih.");
      if (!formData.pendidikan_ibu) return fail("Pendidikan Terakhir Ibu wajib dipilih.");
      if (!formData.pekerjaan_ibu?.trim()) return fail("Pekerjaan Ibu wajib diisi.");
      
      const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
      if (!formData.nomor_wali || !phoneRegex.test(formData.nomor_wali)) {
        return fail("Nomor WhatsApp Wali harus valid (Format: 08xxxxxxxxxx).");
      }
    }

    if (step === 5) {
      if (!formData.file_kk) return fail("Harap upload berkas scan Kartu Keluarga (KK) wajib.");
      if (!formData.file_ijazah) return fail("Harap upload berkas scan Ijazah / SKL wajib.");
      if (!formData.file_akte) return fail("Harap upload berkas scan Akta Kelahiran wajib.");
    }

    return true;
  };

  const fail = (msg: string) => {
    setErrorMessage(msg);
    return false;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (isCustomGas && gasUrl) {
        // ACTUAL CONNECTED POST REQUEST TO GOOGLE APPS SCRIPT WEB APP
        const response = await fetch(gasUrl, {
          method: "POST",
          mode: "no-cors", // Standard GAS Web App accepts post triggers
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        });

        // Since no-cors returns an opaque response, we simulate reading successful state.
        // We fetch updated stats or student items, then commit success state
        setTimeout(() => {
          const generatedId = "SNTB" + Math.floor(1000 + Math.random() * 9000);
          
          let finalNoInduk = formData.nomor_induk;
          if (!finalNoInduk || finalNoInduk === "Otomatis oleh Sistem") {
            const currentYear = new Date().getFullYear().toString().substring(2); // "26"
            const staticPart = "00";
            let nextSequence = 1;
            try {
              const cached = localStorage.getItem("psb_students_data");
              if (cached) {
                const list: Santri[] = JSON.parse(cached);
                let maxNum = 0;
                list.forEach((s) => {
                  const match = s.nomor_induk ? s.nomor_induk.trim().match(/^(\d{2})\s+00\s+(\d+)$/) : null;
                  if (match) {
                    if (match[1] === currentYear) {
                      const num = parseInt(match[2], 10);
                      if (!isNaN(num) && num > maxNum) {
                        maxNum = num;
                      }
                    }
                  } else if (s.nomor_induk) {
                    const legacyMatch = s.nomor_induk.match(/PPB-(\d{2})\d*(\d{3})$/);
                    if (legacyMatch && legacyMatch[1] === currentYear) {
                      const num = parseInt(legacyMatch[2], 10);
                      if (!isNaN(num) && num > maxNum) {
                        maxNum = num;
                      }
                    }
                  }
                });
                nextSequence = maxNum + 1;
              }
            } catch (e) {
              console.error(e);
            }
            const paddedSeq = nextSequence.toString().padStart(3, "0");
            finalNoInduk = `${currentYear} ${staticPart} ${paddedSeq}`;
          }

          const finalSubmission: Santri = {
            ...(formData as Santri),
            id: generatedId,
            nomor_induk: finalNoInduk!,
            tanggal_daftar: new Date().toISOString()
          };
          
          setIsSubmitting(false);
          onSubmitSuccess(finalSubmission);
        }, 3000);

      } else {
        // OFFLINE STORAGE MODE (Simulated delay then local save)
        setTimeout(() => {
          const generatedId = "SBNT-" + Math.floor(1000 + Math.random() * 9000);
          
          let finalNoInduk = formData.nomor_induk;
          if (!finalNoInduk || finalNoInduk === "Otomatis oleh Sistem") {
            const currentYear = new Date().getFullYear().toString().substring(2); // "26"
            const staticPart = "00";
            let nextSequence = 1;
            try {
              const cached = localStorage.getItem("psb_students_data");
              if (cached) {
                const list: Santri[] = JSON.parse(cached);
                let maxNum = 0;
                list.forEach((s) => {
                  const match = s.nomor_induk ? s.nomor_induk.trim().match(/^(\d{2})\s+00\s+(\d+)$/) : null;
                  if (match) {
                    if (match[1] === currentYear) {
                      const num = parseInt(match[2], 10);
                      if (!isNaN(num) && num > maxNum) {
                        maxNum = num;
                      }
                    }
                  } else if (s.nomor_induk) {
                    const legacyMatch = s.nomor_induk.match(/PPB-(\d{2})\d*(\d{3})$/);
                    if (legacyMatch && legacyMatch[1] === currentYear) {
                      const num = parseInt(legacyMatch[2], 10);
                      if (!isNaN(num) && num > maxNum) {
                        maxNum = num;
                      }
                    }
                  }
                });
                nextSequence = maxNum + 1;
              }
            } catch (e) {
              console.error(e);
            }
            const paddedSeq = nextSequence.toString().padStart(3, "0");
            finalNoInduk = `${currentYear} ${staticPart} ${paddedSeq}`;
          }

          const finalSubmission: Santri = {
            ...(formData as Santri),
            id: generatedId,
            nomor_induk: finalNoInduk!,
            tanggal_daftar: new Date().toISOString()
          };

          setIsSubmitting(false);
          onSubmitSuccess(finalSubmission);
        }, 2000);
      }
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage("Gagal mengirim data pendaftaran: " + err.toString());
    }
  };

  // Steps configuration titles & icons
  const stepperHeads = [
    { num: 1, title: "Data Santri", icon: UserCheck },
    { num: 2, title: "Alamat Asal", icon: Landmark },
    { num: 3, title: "Pendidikan", icon: Landmark },
    { num: 4, title: "Orang Tua/Wali", icon: ShieldCheck },
    { num: 5, title: "Upload Dokumen", icon: Upload },
    { num: 6, title: "Tinjauan & Kirim", icon: FileText }
  ];

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-md p-6 md:p-8 font-sans max-w-4xl mx-auto">
      
      {/* 1. VISUAL STEPPER NAVIGATION */}
      <div className="hidden md:flex items-center justify-between border-b border-stone-100 pb-6 mb-8 col-span-3">
        {stepperHeads.map((s, index) => {
          const HeadIcon = s.icon;
          const isSelected = currentStep === s.num;
          const isPassed = currentStep > s.num;
          return (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-1.5 flex-1 relative">
                <div
                  onClick={() => s.num < currentStep && setCurrentStep(s.num)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition duration-250 ${
                    s.num < currentStep ? 'cursor-pointer' : ''
                  } ${
                    isSelected
                      ? "bg-emerald-700 text-white shadow-md shadow-emerald-400/25"
                      : isPassed
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-stone-50 text-stone-400 border border-stone-150"
                  }`}
                >
                  {isPassed ? <Check className="w-4 h-4 text-emerald-700" /> : s.num}
                </div>
                <span className={`text-[10px] font-bold tracking-tight uppercase leading-none ${
                  isSelected ? "text-emerald-800" : isPassed ? "text-stone-600" : "text-stone-400"
                }`}>
                  {s.title}
                </span>
              </div>
              {index < stepperHeads.length - 1 && (
                <div className={`h-0.5 w-10 flex-shrink-0 mx-2 ${currentStep > s.num ? 'bg-emerald-500/50' : 'bg-stone-100'}`}></div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="md:hidden p-3.5 mb-6 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-between text-xs font-bold text-emerald-800">
        <span>Langkah {currentStep} dari 6: {stepperHeads[currentStep - 1].title}</span>
        <div className="flex gap-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full ${currentStep === i + 1 ? 'bg-emerald-700' : 'bg-stone-200'}`}></div>
          ))}
        </div>
      </div>

      {/* 2. ERROR DISPLAY */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-3.5 text-rose-800 text-xs shadow-3xs">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Kesalahan Validasi Data</span>
            <span className="leading-relaxed block mt-1">{errorMessage}</span>
          </div>
        </div>
      )}

      {/* 3. MULTI-STEP FORMS */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* STEP 1: DATA SANTRI */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-stone-850 pb-2 border-b border-stone-100">Langkah A: Data Pribadi Santri</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Nomor Induk Santri</label>
                <input
                  type="text"
                  name="nomor_induk"
                  value={formData.nomor_induk}
                  readOnly
                  className="w-full text-xs p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-400 focus:outline-none font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Nama Santri (Sesuai KK) <span className="text-emerald-700">*</span></label>
                <input
                  type="text"
                  name="nama_santri"
                  placeholder="Contoh: Muhammad Azharuddin"
                  value={formData.nama_santri}
                  onChange={handleInputChange}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Nomor Induk Kependudukan (NIK - 16 Digit) <span className="text-emerald-700">*</span></label>
                <input
                  type="maxLength"
                  name="nik_santri"
                  maxLength={16}
                  placeholder="Masukan 16 digit NIK Santri"
                  value={formData.nik_santri}
                  onChange={handleInputChange}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">No Kartu Keluarga (KK - 16 Digit) <span className="text-emerald-700">*</span></label>
                <input
                  type="text"
                  name="nomor_kk"
                  maxLength={16}
                  placeholder="Masukan 16 digit Nomor KK"
                  value={formData.nomor_kk}
                  onChange={handleInputChange}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Tempat Lahir <span className="text-emerald-700">*</span></label>
                <input
                  type="text"
                  name="tempat_lahir"
                  placeholder="Pasuruan, Sidoarjo, dsb..."
                  value={formData.tempat_lahir}
                  onChange={handleInputChange}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Tanggal Lahir <span className="text-emerald-700">*</span></label>
                <input
                  type="date"
                  name="tanggal_lahir"
                  value={formData.tanggal_lahir}
                  onChange={handleInputChange}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Nomor NISN (Siswa Nasional - Opsional)</label>
                <input
                  type="text"
                  name="nisn"
                  placeholder="Contoh: 0112344556"
                  maxLength={10}
                  value={formData.nisn}
                  onChange={handleInputChange}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Anak Ke <span className="text-emerald-700">*</span></label>
                  <input
                    type="number"
                    name="anak_ke"
                    min={1}
                    value={formData.anak_ke}
                    onChange={handleInputChange}
                    placeholder="Contoh: 1"
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Dari Bersaudara <span className="text-emerald-700">*</span></label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      name="jumlah_saudara"
                      min={1}
                      value={formData.jumlah_saudara}
                      onChange={handleInputChange}
                      placeholder="Contoh: 3"
                      className="w-full text-xs p-3 pr-20 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                    <span className="absolute right-3 text-[10px] uppercase tracking-wider font-bold text-stone-400 pointer-events-none">Saudara</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-stone-700">Sekolah Asal Terakhir <span className="text-emerald-700">*</span></label>
                <input
                  type="text"
                  name="sekolah_terakhir"
                  placeholder="Contoh: SDN Kejayan 1 / MTsN Pasuruan"
                  value={formData.sekolah_terakhir}
                  onChange={handleInputChange}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-stone-700">Alamat Lengkap Sekolah Terakhir <span className="text-emerald-700">*</span></label>
                <input
                  type="text"
                  name="alamat_sekolah"
                  placeholder="Contoh: Jl. Diponegoro No. 84, Kejayan, Pasuruan"
                  value={formData.alamat_sekolah}
                  onChange={handleInputChange}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-stone-700">Madrasah Diniyah / Pondok Pesantren Sebelumnya (Jika Ada)</label>
                <input
                  type="text"
                  name="pondok_terakhir"
                  placeholder="Isi '-' jika tidak ada"
                  value={formData.pondok_terakhir}
                  onChange={handleInputChange}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ALAMAT SANTRI */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div className="flex justify-between items-center pb-2 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-850">Langkah B: Alamat Asal Santri</h3>
              <button
                type="button"
                onClick={() => setIsManualAddress(!isManualAddress)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-850 hover:underline flex items-center gap-1.5 cursor-pointer bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 transition"
              >
                {isManualAddress ? "✨ Gunakan Pilihan Dukcapil" : "✍️ Ketik Alamat Manual"}
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isManualAddress ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Provinsi <span className="text-emerald-700">*</span></label>
                    <input
                      type="text"
                      name="provinsi"
                      placeholder="Jawa Timur, DKI Jakarta dsb"
                      value={formData.provinsi}
                      onChange={handleInputChange}
                      className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Kota / Kabupaten <span className="text-emerald-700">*</span></label>
                    <input
                      type="text"
                      name="kota_kabupaten"
                      placeholder="Pasuruan, Sidoarjo, dsb"
                      value={formData.kota_kabupaten}
                      onChange={handleInputChange}
                      className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Kecamatan <span className="text-emerald-700">*</span></label>
                    <input
                      type="text"
                      name="kecamatan"
                      placeholder="Contoh: Kejayan"
                      value={formData.kecamatan}
                      onChange={handleInputChange}
                      className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Desa / Kelurahan <span className="text-emerald-700">*</span></label>
                    <input
                      type="text"
                      name="desa"
                      placeholder="Contoh: Besuk"
                      value={formData.desa}
                      onChange={handleInputChange}
                      className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Provinsi <span className="text-emerald-700">*</span></label>
                    {loadingRegions.provinces && provinces.length === 0 ? (
                      <div className="text-xs text-stone-400 p-3 bg-stone-50 rounded-xl border border-stone-200 animate-pulse">Menghubungi Dukcapil...</div>
                    ) : (
                      <select
                        name="provinsi"
                        value={provId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setProvId(id);
                          setRegId("");
                          setDistId("");
                          setVillId("");
                          
                          setRegencies([]);
                          setDistricts([]);
                          setVillages([]);

                          const selectedProv = provinces.find((p) => p.id === id);
                          const provName = selectedProv ? toTitleCase(selectedProv.name) : "";
                          setFormData((prev) => ({
                            ...prev,
                            provinsi: provName,
                            kota_kabupaten: "",
                            kecamatan: "",
                            desa: ""
                          }));
                          
                          if (id) {
                            fetchRegencies(id);
                          }
                        }}
                        className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white cursor-pointer"
                      >
                        <option value="">-- Pilih Provinsi --</option>
                        {provinces.map((p) => (
                          <option key={p.id} value={p.id}>
                            {toTitleCase(p.name)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Kota / Kabupaten <span className="text-emerald-700">*</span></label>
                    {loadingRegions.regencies ? (
                      <div className="text-xs text-stone-400 p-3 bg-stone-50 rounded-xl border border-stone-200 animate-pulse">Memuat Kota/Kab...</div>
                    ) : (
                      <select
                        name="kota_kabupaten"
                        value={regId}
                        disabled={!provId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setRegId(id);
                          setDistId("");
                          setVillId("");
                          
                          setDistricts([]);
                          setVillages([]);

                          const selectedReg = regencies.find((r) => r.id === id);
                          const regName = selectedReg ? toTitleCase(selectedReg.name) : "";
                          setFormData((prev) => ({
                            ...prev,
                            kota_kabupaten: regName,
                            kecamatan: "",
                            desa: ""
                          }));

                          if (id) {
                            fetchDistricts(id);
                          }
                        }}
                        className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold bg-white disabled:bg-stone-50 disabled:text-stone-400 cursor-pointer"
                      >
                        <option value="">-- Pilih Kota / Kabupaten --</option>
                        {regencies.map((r) => (
                          <option key={r.id} value={r.id}>
                            {toTitleCase(r.name)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Kecamatan <span className="text-emerald-700">*</span></label>
                    {loadingRegions.districts ? (
                      <div className="text-xs text-stone-400 p-3 bg-stone-50 rounded-xl border border-stone-200 animate-pulse">Memuat Kecamatan...</div>
                    ) : (
                      <select
                        name="kecamatan"
                        value={distId}
                        disabled={!regId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setDistId(id);
                          setVillId("");
                          
                          setVillages([]);

                          const selectedDist = districts.find((d) => d.id === id);
                          const distName = selectedDist ? toTitleCase(selectedDist.name) : "";
                          setFormData((prev) => ({
                            ...prev,
                            kecamatan: distName,
                            desa: ""
                          }));

                          if (id) {
                            fetchVillages(id);
                          }
                        }}
                        className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white disabled:bg-stone-50 disabled:text-stone-400 cursor-pointer"
                      >
                        <option value="">-- Pilih Kecamatan --</option>
                        {districts.map((d) => (
                          <option key={d.id} value={d.id}>
                            {toTitleCase(d.name)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700">Desa / Kelurahan <span className="text-emerald-700">*</span></label>
                    {loadingRegions.villages ? (
                      <div className="text-xs text-stone-400 p-3 bg-stone-50 rounded-xl border border-stone-200 animate-pulse">Memuat Desa/Kel...</div>
                    ) : (
                      <select
                        name="desa"
                        value={villId}
                        disabled={!distId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setVillId(id);

                          const selectedVill = villages.find((v) => v.id === id);
                          const villName = selectedVill ? toTitleCase(selectedVill.name) : "";
                          setFormData((prev) => ({
                            ...prev,
                            desa: villName
                          }));
                        }}
                        className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium bg-white disabled:bg-stone-50 disabled:text-stone-400 cursor-pointer"
                      >
                        <option value="">-- Pilih Desa / Kelurahan --</option>
                        {villages.map((v) => (
                          <option key={v.id} value={v.id}>
                            {toTitleCase(v.name)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">No RT <span className="text-emerald-700">*</span></label>
                  <input
                    type="text"
                    name="rt"
                    placeholder="Contoh: 02"
                    value={formData.rt}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">No RW <span className="text-emerald-700">*</span></label>
                  <input
                    type="text"
                    name="rw"
                    placeholder="Contoh: 01"
                    value={formData.rw}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-stone-700">Alamat Lengkap (Dusun, Jalan, No Rumah) <span className="text-emerald-700">*</span></label>
                <textarea
                  name="alamat_lengkap"
                  rows={2}
                  placeholder="Contoh: Jl. Kyai Ashari No. 12, Besuk Kidul, RT 02 RW 01"
                  value={formData.alamat_lengkap}
                  onChange={handleInputChange}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                ></textarea>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DATA PENDIDIKAN */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-stone-850 pb-2 border-b border-stone-100">Langkah C: Data Pendidikan & Asrama</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Pilih Kamar <span className="text-emerald-700">*</span></label>
                <select
                  name="kamar"
                  value={formData.kamar}
                  onChange={handleInputChange}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                >
                  <option value="Daerah A 1">Daerah A 1</option>
                  <option value="Daerah A 2">Daerah A 2</option>
                  <option value="Daerah A 3">Daerah A 3</option>
                  <option value="Daerah A 4">Daerah A 4</option>
                  <option value="Daerah A 5">Daerah A 5</option>
                  <option value="Daerah A 6">Daerah A 6</option>
                  <option value="Daerah B 1">Daerah B 1</option>
                  <option value="Daerah B 2">Daerah B 2</option>
                  <option value="Daerah B 3">Daerah B 3</option>
                  <option value="Daerah B 4">Daerah B 4</option>
                  <option value="Daerah B 5">Daerah B 5</option>
                  <option value="Daerah B 6">Daerah B 6</option>
                  <option value="Daerah C 2">Daerah C 2</option>
                  <option value="Daerah C 3">Daerah C 3</option>
                  <option value="Daerah C 4">Daerah C 4</option>
                  <option value="Daerah C 5">Daerah C 5</option>
                  <option value="Daerah C 6">Daerah C 6</option>
                  <option value="Daerah D 1">Daerah D 1</option>
                  <option value="Daerah D 2">Daerah D 2</option>
                  <option value="Daerah D 3">Daerah D 3</option>
                  <option value="Daerah D 4">Daerah D 4</option>
                  <option value="Daerah D 5">Daerah D 5</option>
                  <option value="Daerah D 6">Daerah D 6</option>
                  <option value="Daerah E 1">Daerah E 1</option>
                  <option value="Daerah E 2">Daerah E 2</option>
                  <option value="Daerah E 3">Daerah E 3</option>
                  <option value="Daerah E 4">Daerah E 4</option>
                  <option value="Daerah E 5">Daerah E 5</option>
                  <option value="Daerah E 6">Daerah E 6</option>
                  <option value="Daerah E 7">Daerah E 7</option>
                  <option value="Daerah E 8">Daerah E 8</option>
                  <option value="Unit Shibyan">Unit Shibyan</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700">Tes Masuk Madrasah <span className="text-emerald-700">*</span></label>
                <select
                  name="tes_masuk"
                  value={formData.tes_masuk}
                  onChange={handleInputChange}
                  className="w-full text-xs p-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                >
                  <option value="Kelas 1 Ibtidaiyah">Kelas 1 Ibtidaiyah</option>
                  <option value="Kelas 2 Ibtidaiyah">Kelas 2 Ibtidaiyah</option>
                  <option value="Kelas 3 Ibtidaiyah">Kelas 3 Ibtidaiyah</option>
                  <option value="Kelas 4 Ibtidaiyah">Kelas 4 Ibtidaiyah</option>
                  <option value="Kelas 1 Tsanawiyah">Kelas 1 Tsanawiyah</option>
                  <option value="Kelas 1 Aliyah">Kelas 1 Aliyah</option>
                </select>
              </div>

            </div>
          </div>
        )}

        {/* STEP 4: IDENTITAS WALI SANTRI */}
        {currentStep === 4 && (
          <div className="space-y-5 font-sans">
            <h3 className="text-sm font-bold text-stone-850 pb-2 border-b border-stone-100">Langkah D: Identitas Wali / Orang Tua</h3>
            
            {/* DATA AYAH KANDUNG */}
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/25 p-5 space-y-4">
              <span className="font-bold text-xs text-emerald-800 tracking-wider block">DATA AYAH KANDUNG</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Nama Lengkap Ayah <span className="text-emerald-700">*</span></label>
                  <input
                    type="text"
                    name="nama_ayah"
                    placeholder="Contoh: Ahmad Suhaimi"
                    value={formData.nama_ayah}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">NIK Ayah (16 Digit) <span className="text-emerald-700">*</span></label>
                  <input
                    type="text"
                    name="nik_ayah"
                    maxLength={16}
                    placeholder="Masukan NIK Ayah"
                    value={formData.nik_ayah}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Tempat Lahir Ayah <span className="text-emerald-700">*</span></label>
                  <input
                    type="text"
                    name="tempat_lahir_ayah"
                    placeholder="Tempat lahir ayah"
                    value={formData.tempat_lahir_ayah}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Tanggal Lahir Ayah <span className="text-emerald-700">*</span></label>
                  <input
                    type="date"
                    name="tanggal_lahir_ayah"
                    value={formData.tanggal_lahir_ayah}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Pendidikan Terakhir Ayah <span className="text-emerald-700">*</span></label>
                  <select
                    name="pendidikan_ayah"
                    value={formData.pendidikan_ayah}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                  >
                    <option value="SD">SD Sederajat</option>
                    <option value="SMP">SLTP / SMP Sederajat</option>
                    <option value="SLTA">SLTA / SMA Sederajat</option>
                    <option value="D3">Diploma 3 (D3)</option>
                    <option value="S1">Sarjana (S1)</option>
                    <option value="S2">Magister (S2 / S3)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Pekerjaan Ayah <span className="text-emerald-700">*</span></label>
                  <input
                    type="text"
                    name="pekerjaan_ayah"
                    placeholder="Contoh: Wiraswasta, Petani, PNS..."
                    value={formData.pekerjaan_ayah}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* DATA IBU KANDUNG */}
            <div className="rounded-2xl border border-rose-100 bg-rose-50/15 p-5 space-y-4">
              <span className="font-bold text-xs text-rose-800 tracking-wider block">DATA IBU KANDUNG</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Nama Lengkap Ibu <span className="text-emerald-700">*</span></label>
                  <input
                    type="text"
                    name="nama_ibu"
                    placeholder="Contoh: Siti Aminah"
                    value={formData.nama_ibu}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">NIK Ibu (16 Digit) <span className="text-emerald-700">*</span></label>
                  <input
                    type="text"
                    name="nik_ibu"
                    maxLength={16}
                    placeholder="Masukan NIK Ibu"
                    value={formData.nik_ibu}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Tempat Lahir Ibu <span className="text-emerald-700">*</span></label>
                  <input
                    type="text"
                    name="tempat_lahir_ibu"
                    placeholder="Tempat lahir ibu"
                    value={formData.tempat_lahir_ibu}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Tanggal Lahir Ibu <span className="text-emerald-700">*</span></label>
                  <input
                    type="date"
                    name="tanggal_lahir_ibu"
                    value={formData.tanggal_lahir_ibu}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-semibold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Pendidikan Terakhir Ibu <span className="text-emerald-700">*</span></label>
                  <select
                    name="pendidikan_ibu"
                    value={formData.pendidikan_ibu}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold cursor-pointer"
                  >
                    <option value="SD">SD Sederajat</option>
                    <option value="SMP">SLTP Sederajat</option>
                    <option value="SLTA">SLTA Sederajat</option>
                    <option value="D3">Diploma 3 (D3)</option>
                    <option value="S1">Sarjana (S1)</option>
                    <option value="S2">Magister (S2)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700">Pekerjaan Ibu <span className="text-emerald-700">*</span></label>
                  <input
                    type="text"
                    name="pekerjaan_ibu"
                    placeholder="Contoh: Ibu Rumah Tangga, Guru, Dagang..."
                    value={formData.pekerjaan_ibu}
                    onChange={handleInputChange}
                    className="w-full text-xs p-3 bg-white rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              </div>
            </div>

            {/* WA CONTACT */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700">Nomor WhatsApp Wali Santri (Aktif) <span className="text-emerald-700">*</span></label>
              <input
                type="text"
                name="nomor_wali"
                placeholder="Contoh: 081234567890"
                value={formData.nomor_wali}
                onChange={handleInputChange}
                className="w-full text-xs p-3.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
              />
            </div>
          </div>
        )}

        {/* STEP 5: UPLOAD BERKAS */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-stone-850 pb-2 border-b border-stone-100">Langkah E: Upload Berkas Dokumen Pendukung</h3>
            
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 leading-relaxed space-y-1 shadow-3xs">
              <span className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                Ketentuan Unggah Berkas:
              </span>
              <p>1. Format file yang diizinkan: <strong>PDF, JPG, atau PNG</strong>.</p>
              <p>2. Ukuran maksimal setiap berkas adalah <strong>5 Megabytes (5MB)</strong>.</p>
              <p>3. Pastikan scan dokumen jelas, terbaca sempurna, dan tidak buram.</p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              
              {/* KK Upload */}
              <div className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-stone-800 block">Scan Kartu Keluarga (KK) <span className="text-emerald-700">*</span></span>
                  <span className="text-[10.5px] text-stone-400 block">Digunakan untuk verifikasi NIK dan relasi wali.</span>
                  {fileNames.kk && (
                    <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-[10px] text-emerald-800 font-semibold border border-emerald-100">
                      ✓ Terunggah: {fileNames.kk}
                    </span>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <label className="px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 cursor-pointer flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih Berkas KK</span>
                    <input
                      type="file"
                      accept=".pdf,image/png,image/jpeg,image/jpg"
                      onChange={(e) => handleFileChange(e, "file_kk", "kk")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Ijazah Upload */}
              <div className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-stone-800 block">Ijazah / Surat Keterangan Lulus (SKL) <span className="text-emerald-700">*</span></span>
                  <span className="text-[10.5px] text-stone-400 block font-normal">Bukti kelulusan sekolah asal terakhir.</span>
                  {fileNames.ijazah && (
                    <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-[10px] text-emerald-800 font-semibold border border-emerald-100">
                      ✓ Terunggah: {fileNames.ijazah}
                    </span>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <label className="px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 cursor-pointer flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih Berkas Ijazah/SKL</span>
                    <input
                      type="file"
                      accept=".pdf,image/png,image/jpeg,image/jpg"
                      onChange={(e) => handleFileChange(e, "file_ijazah", "ijazah")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Akte Lahir Upload */}
              <div className="p-4 rounded-xl border border-stone-200/80 bg-stone-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-stone-800 block">Akte Kelahiran Resmi <span className="text-emerald-700">*</span></span>
                  <span className="text-[10.5px] text-stone-400 block">Verifikasi tanggal lahir santri baru resmi.</span>
                  {fileNames.akte && (
                    <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-50 text-[10px] text-emerald-800 font-semibold border border-emerald-100">
                      ✓ Terunggah: {fileNames.akte}
                    </span>
                  )}
                </div>
                
                <div className="flex-shrink-0">
                  <label className="px-4 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50 cursor-pointer flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Pilih Berkas Akte</span>
                    <input
                      type="file"
                      accept=".pdf,image/png,image/jpeg,image/jpg"
                      onChange={(e) => handleFileChange(e, "file_akte", "akte")}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STEP 6: PREVIEW & CONFIRMATION */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="pb-2 border-b border-stone-100">
              <h3 className="text-sm font-bold text-stone-850">Langkah F: Tinjauan Profil Pendaftar Santri</h3>
              <p className="text-xs text-stone-400">Harap teliti kembali seluruh data pendaftaran Anda sebelum menekan tombol Kirim.</p>
            </div>

            {/* FULL RENDER OF FORM DATA PREVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
              
              {/* Kolom 1 */}
              <div className="space-y-4">
                <div className="rounded-xl border border-stone-150 p-4 space-y-2.5 bg-stone-50/50">
                  <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">Identitas Calon Santri</span>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-stone-400">Nama:</span>
                    <span className="col-span-2 font-bold text-stone-900">{formData.nama_santri}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-stone-400">NIK:</span>
                    <span className="col-span-2 font-mono text-stone-800 font-semibold">{formData.nik_santri}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-stone-400">No Kartu Keluarga:</span>
                    <span className="col-span-2 font-mono text-stone-800">{formData.nomor_kk}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-stone-400">TTL:</span>
                    <span className="col-span-2 font-medium text-stone-800">{formData.tempat_lahir}, {formData.tanggal_lahir}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-stone-400">Anak Ke:</span>
                    <span className="col-span-2 font-medium text-stone-900 font-semibold">Anak Ke-{formData.anak_ke} dari {formData.jumlah_saudara} bersaudara</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-stone-400">NISN:</span>
                    <span className="col-span-2 font-mono text-stone-800">{formData.nisn || "-"}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-stone-150 p-4 space-y-2.5 bg-stone-50/50">
                  <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">Alamat Lengkap</span>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-stone-400">Kelurahan:</span>
                    <span className="col-span-2 font-bold text-stone-800">{formData.desa}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-stone-400">Kecamatan:</span>
                    <span className="col-span-2 font-medium text-stone-850">{formData.kecamatan}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-stone-400">Kabupaten:</span>
                    <span className="col-span-2 font-medium text-stone-850">{formData.kota_kabupaten}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-stone-400">RT/RW:</span>
                    <span className="col-span-2 font-bold text-stone-850">RT {formData.rt} / RW {formData.rw}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-stone-400">Detail Alamat:</span>
                    <span className="col-span-2 text-stone-700 leading-normal">{formData.alamat_lengkap}</span>
                  </div>
                </div>
              </div>

              {/* Kolom 2 */}
              <div className="space-y-4">
                <div className="rounded-xl border border-stone-150 p-4 space-y-2.5 bg-stone-50/50">
                  <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">Pendidikan & Asrama</span>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-stone-400">Kamar Diinginkan:</span>
                    <span className="col-span-2 font-bold text-emerald-800">{formData.kamar}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-stone-400">Tes Klasifikasi:</span>
                    <span className="col-span-2 font-bold text-stone-800">{formData.tes_masuk}</span>
                  </div>
                  {formData.kelas && formData.kelas !== "-" && (
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-stone-400">Pilihan Kelas:</span>
                      <span className="col-span-2 font-bold text-amber-700">Kelas {formData.kelas}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-stone-400">Sekolah Asal:</span>
                    <span className="col-span-2 font-medium text-stone-800">{formData.sekolah_terakhir}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-stone-400">Alamat Sekolah:</span>
                    <span className="col-span-2 text-stone-700 text-xs leading-normal">{formData.alamat_sekolah}</span>
                  </div>
                  {formData.pondok_terakhir && formData.pondok_terakhir !== "-" && (
                    <div className="grid grid-cols-3 gap-1">
                      <span className="text-stone-400">Pondok Asal:</span>
                      <span className="col-span-2 text-stone-700 text-xs">{formData.pondok_terakhir}</span>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-stone-150 p-4 space-y-2.5 bg-stone-50/50">
                  <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">Wali & Kontak</span>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-stone-400">Nama Ayah:</span>
                    <span className="col-span-2 font-semibold text-stone-900">{formData.nama_ayah}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-stone-400">Pekerjaan Ayah:</span>
                    <span className="col-span-2 text-stone-700">{formData.pekerjaan_ayah || "-"}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-stone-400">Nama Ibu:</span>
                    <span className="col-span-2 font-semibold text-stone-900">{formData.nama_ibu}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <span className="text-stone-400">Kontak WA Wali:</span>
                    <span className="col-span-2 font-mono font-bold text-emerald-700">{formData.nomor_wali}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-stone-150 p-4 space-y-2 bg-emerald-50/40 border-emerald-100">
                  <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px] block">Status Lampiran Berkas</span>
                  <p className="text-[11px] text-stone-600">
                    📂 KK: <strong className="text-emerald-700">{fileNames.kk ? "Terlampir" : "Belum diunggah"}</strong>
                  </p>
                  <p className="text-[11px] text-stone-600">
                    📂 Ijazah: <strong className="text-emerald-700">{fileNames.ijazah ? "Terlampir" : "Belum diunggah"}</strong>
                  </p>
                  <p className="text-[11px] text-stone-600">
                    📂 Akta Lahir: <strong className="text-emerald-700">{fileNames.akte ? "Terlampir" : "Belum diunggah"}</strong>
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-4 rounded-xl bg-slate-50 border border-slate-200 p-4 text-[11px] text-slate-700 leading-normal">
              Dengan mengklik tombol <strong>Kirim Pendaftaran Resmi</strong> di bawah, saya menyatakan bahwa seluruh data yang diisikan adalah benar adanya dan sesuai berkas kependudukan resmi KK aslinya.
            </div>
          </div>
        )}

        {/* 4. ACTIONS / NAVIGATION PANEL */}
        <div className="pt-6 border-t border-stone-100 flex items-center justify-between col-span-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-3 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-bold font-sans flex items-center gap-1.5 transition cursor-pointer"
              disabled={isSubmitting}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-3 rounded-xl bg-emerald-700 text-white hover:bg-emerald-850 text-xs font-bold font-sans flex items-center gap-1.5 transition shadow-md shadow-emerald-400/20 cursor-pointer"
            >
              <span>Lanjut</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              className={`px-6 py-3.5 rounded-xl text-white font-bold text-xs font-sans flex items-center gap-2 transition shadow-lg cursor-pointer ${
                isSubmitting
                  ? "bg-stone-500 cursor-not-allowed"
                  : "bg-emerald-750 hover:bg-emerald-850 shadow-emerald-700/30"
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isCustomGas ? "Mengupload ke Google Drive..." : "Menyimpan Berkas..."}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Kirim Pendaftaran Resmi</span>
                </>
              )}
            </button>
          )}
        </div>

      </form>
    </div>
  );
}
