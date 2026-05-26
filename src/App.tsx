import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import DashboardView from "./components/DashboardView";
import SearchStudentsView from "./components/SearchStudentsView";
import RegistrationForm from "./components/RegistrationForm";
import AppsScriptGuideView from "./components/AppsScriptGuideView";
import StudentReceipt from "./components/StudentReceipt";
import StudentDetailsModal from "./components/StudentDetailsModal";
import PasswordLockScreen from "./components/PasswordLockScreen";
import { Santri } from "./types";
import { initialMockSantri } from "./mockData";
import { Sparkles, CheckCircle2, X } from "lucide-react";

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => sessionStorage.getItem("psb_is_unlocked") === "true");
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [students, setStudents] = useState<Santri[]>([]);
  
  // Custom Google Apps Script configuration url state
  const [gasUrl, setGasUrl] = useState<string>("");
  const [isCustomGas, setIsCustomGas] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modal displays
  const [selectedStudent, setSelectedStudent] = useState<Santri | null>(null);
  const [printStudent, setPrintStudent] = useState<Santri | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [toastStudentName, setToastStudentName] = useState<string>("");

  // Initialize students and sync database configuration on mount
  useEffect(() => {
    // 1. Gas URL initialization
    const savedUrl = localStorage.getItem("psb_gas_url");
    if (savedUrl) {
      setGasUrl(savedUrl);
      setIsCustomGas(true);
    }

    // 2. Load students list
    const cachedStudents = localStorage.getItem("psb_students_data");
    if (cachedStudents) {
      try {
        setStudents(JSON.parse(cachedStudents));
      } catch (err) {
        setStudents(initialMockSantri);
      }
    } else {
      setStudents(initialMockSantri);
      localStorage.setItem("psb_students_data", JSON.stringify(initialMockSantri));
    }
  }, []);

  // Sync state to local storage when students list updates
  const updateStudentsList = (updatedList: Santri[]) => {
    setStudents(updatedList);
    localStorage.setItem("psb_students_data", JSON.stringify(updatedList));
  };

  // Synchronize/Sync fetch database from Google Apps Script Spreadsheet if URL is set
  const handleRefreshData = async () => {
    if (!isCustomGas || !gasUrl) return;
    setIsRefreshing(true);

    try {
      // Fetch GAS web app get_all action
      const response = await fetch(`${gasUrl}?action=get_all`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          // Merge spreadsheet list with existing local list by sorting or deduplicating by ID
          const existingIds = new Set(data.map((item: any) => item.id));
          const uniqueLocal = students.filter((s) => !existingIds.has(s.id));
          
          const mergedList = [...data, ...uniqueLocal];
          updateStudentsList(mergedList);
        }
      } else {
        console.warn("Respon GAS tidak sukses, menggunakan data lokal.");
      }
    } catch (error) {
      console.error("Gagal menyinkronkan data dari Google Sheets:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle successful registrants submission form
  const handleRegistrationSubmitSuccess = (newStudent: Santri) => {
    // 1. Append new student onto state list
    const newList = [newStudent, ...students];
    updateStudentsList(newList);

    // 2. Set toast message popup
    setToastStudentName(newStudent.nama_santri);
    setShowSuccessToast(true);

    // 3. Autoselect student for instant formal receipts print display
    setPrintStudent(newStudent);

    // 4. Return tab view to dashboard to update statistics
    setActiveTab("dashboard");

    // Hide toast after 5 seconds
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 5000);
  };

  if (!isUnlocked) {
    return <PasswordLockScreen onUnlock={() => setIsUnlocked(true)} />;
  }

  return (
    <div className="flex h-screen bg-stone-100 overflow-clip select-none font-sans text-stone-800">
      
      {/* 1. LEFT SIDEBAR (Hidden on mobile) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        gasUrl={gasUrl}
        isCustomGas={isCustomGas}
      />

      {/* 2. MAIN APPLICATION CONTENT AREA */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Navigation Top Header Bar */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          gasUrl={gasUrl}
          setGasUrl={setGasUrl}
          isCustomGas={isCustomGas}
          setIsCustomGas={setIsCustomGas}
          onRefreshData={isCustomGas ? handleRefreshData : undefined}
          isRefreshing={isRefreshing}
        />

        {/* Tab Canvas Content wrapper */}
        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 bg-stone-50/50 print:bg-white print:p-0 print:overflow-visible">
          
          {activeTab === "dashboard" && (
            <DashboardView
              students={students}
              onNavigateToRegister={() => setActiveTab("register")}
              onNavigateToSearch={() => setActiveTab("search")}
              onShowStudentDetails={(std) => setSelectedStudent(std)}
            />
          )}

          {activeTab === "register" && (
            <RegistrationForm
              onSubmitSuccess={handleRegistrationSubmitSuccess}
              gasUrl={gasUrl}
              isCustomGas={isCustomGas}
            />
          )}

          {activeTab === "search" && (
            <SearchStudentsView
              students={students}
              onShowStudentDetails={(std) => setSelectedStudent(std)}
              onPrintStudent={(std) => setPrintStudent(std)}
            />
          )}

          {activeTab === "integration" && (
            <AppsScriptGuideView />
          )}

        </main>
      </div>

      {/* SUCCESS POPUP ALERTS / TOAST */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-55 max-w-sm w-full bg-emerald-900 text-white rounded-2xl shadow-2xl border border-emerald-500/30 p-4 animate-bounce-short flex items-start gap-3.5">
          <div className="w-9 h-9 bg-emerald-850 rounded-xl flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs">
            <h4 className="font-bold text-[13px] text-white">Pendaftaran berhasil disimpan!</h4>
            <p className="text-emerald-200 mt-1 leading-normal">
              Profil santri baru <strong>{toastStudentName}</strong> telah sukses direkam ke database. Bukti registrasi resmi siap dicetak.
            </p>
          </div>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="p-1 hover:bg-emerald-800 rounded-lg text-emerald-300 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* PROFILE DETAILS MODAL */}
      {selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onPrint={() => {
            setPrintStudent(selectedStudent);
            setSelectedStudent(null);
          }}
        />
      )}

      {/* PRINT PROOF / PDF RECEIPT DISPLAY */}
      {printStudent && (
        <StudentReceipt
          student={printStudent}
          onClose={() => setPrintStudent(null)}
          onBackToDashboard={() => {
            setPrintStudent(null);
            setActiveTab("dashboard");
          }}
        />
      )}

    </div>
  );
}
