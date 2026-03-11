import { useState, useRef } from 'react';
import { Dashboard } from './components/Dashboard';
import { FamilyForm } from './components/FamilyForm';
import { useLogo } from './hooks/useLogo';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'form'>('dashboard');
  const [editingId, setEditingId] = useState<number | null>(null);
  const { logo, updateLogo } = useLogo();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreateNew = () => {
    setEditingId(null);
    setCurrentView('form');
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
    setCurrentView('form');
  };

  const handleBack = () => {
    setEditingId(null);
    setCurrentView('dashboard');
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        updateLogo(base64String);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so the same file can be selected again if needed
    if (e.target) {
      e.target.value = '';
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">فريق تكاتف الإنساني التطوعي</h1>
          </div>
          <div className="flex items-center gap-4">
            {currentView === 'dashboard' ? (
              <button
                onClick={handleCreateNew}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                إضافة عائلة جديدة
              </button>
            ) : (
              <button
                onClick={handleBack}
                className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                العودة للقائمة
              </button>
            )}
            <div className="relative group cursor-pointer" onClick={handleLogoClick} title="تغيير الشعار">
              <img 
                src={logo} 
                alt="شعار الفريق" 
                className="h-10 w-10 rounded-full object-contain border border-gray-200 shadow-sm group-hover:opacity-80 transition-opacity bg-white"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'dashboard' ? (
          <Dashboard onEdit={handleEdit} />
        ) : (
          <FamilyForm id={editingId} onSaved={handleBack} onCancel={handleBack} />
        )}
      </main>
    </div>
  );
}
