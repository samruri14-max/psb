import React, { useState } from "react";
import { Lock, X, Eye, EyeOff, Save, KeyRound, ShieldCheck, AlertCircle } from "lucide-react";

interface ChangePasswordModalProps {
  onClose: () => void;
}

export default function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const activePassword = localStorage.getItem("psb_admin_password") || "admin123";

    if (currentPassword !== activePassword) {
      setErrorMsg("Kata sandi sekarang salah!");
      return;
    }

    if (newPassword.length < 4) {
      setErrorMsg("Kata sandi baru minimal harus terdiri dari 4 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi baru tidak cocok.");
      return;
    }

    // Save
    localStorage.setItem("psb_admin_password", newPassword);
    setSuccessMsg("Kata sandi sukses diperbarui! Gunakan sandi baru ini pada login berikutnya.");
    
    // Clear inputs
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    // Auto close modal after a short delay
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-100 modal-transition relative">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-700">
              <KeyRound className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-md font-bold text-stone-900">Ubah Kata Sandi Akses</h3>
              <p className="text-xs text-stone-500">Amankan data pendaftaran santri baru</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 bg-stone-100 rounded-lg cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          
          {/* Kata Sandi Sekarang */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Kata Sandi Sekarang <span className="text-emerald-700">*</span></label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Masukkan kata sandi saat ini"
                className="w-full text-xs p-3 pr-10 bg-stone-50 hover:bg-stone-100/40 focus:bg-white rounded-xl border border-stone-250 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-semibold"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="border-t border-dashed border-stone-200 my-4"></div>

          {/* Kata Sandi Baru */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Kata Sandi Baru <span className="text-emerald-700">*</span></label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Masukkan kata sandi baru"
                className="w-full text-xs p-3 pr-10 bg-stone-50 hover:bg-stone-100/40 focus:bg-white rounded-xl border border-stone-250 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-semibold"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Konfirmasi Kata Sandi Baru */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700">Konfirmasi Kata Sandi Baru <span className="text-emerald-700">*</span></label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi baru"
                className="w-full text-xs p-3 pr-10 bg-stone-50 hover:bg-stone-100/40 focus:bg-white rounded-xl border border-stone-250 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-semibold"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Alert Error */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

          {/* Alert Success */}
          {successMsg && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-150 text-emerald-900 rounded-xl text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-700 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-semibold leading-normal">{successMsg}</div>
            </div>
          )}

          {/* Buttons Footer */}
          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 text-stone-700 transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={!!successMsg}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white transition shadow-md shadow-emerald-400/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Kata Sandi</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
