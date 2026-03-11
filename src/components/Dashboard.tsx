import { useState, useRef } from 'react';
import { db, FamilyRecord } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, Edit, Trash2, Users, Printer, X, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { BatchPrintTemplate } from './BatchPrintTemplate';

interface DashboardProps {
  onEdit: (id: number) => void;
}

export function Dashboard({ onEdit }: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [familyToDelete, setFamilyToDelete] = useState<number | null>(null);
  const printRef = useRef<HTMLDivElement>(null);
  
  const families = useLiveQuery(
    () => {
      if (!searchTerm) {
        return db.families.orderBy('id').reverse().toArray();
      }
      return db.families
        .filter(family => {
          const searchLower = searchTerm.toLowerCase();
          return (
            family.fullName.toLowerCase().includes(searchLower) ||
            family.nationalId.includes(searchTerm) ||
            family.id?.toString().includes(searchTerm)
          );
        })
        .reverse()
        .toArray();
    },
    [searchTerm]
  );

  const handleConfirmPrint = async () => {
    if (!printRef.current) return;
    
    setIsGeneratingPdf(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pages = printRef.current.children[0].children;
      
      for (let i = 0; i < pages.length; i++) {
        const pageElement = pages[i] as HTMLElement;
        
        const canvas = await html2canvas(pageElement, {
          scale: 2,
          useCORS: true,
          logging: false,
        });
        
        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        
        if (i > 0) {
          pdf.addPage();
        }
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save(`عوائل_تكاتف_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('حدث خطأ أثناء إنشاء ملف PDF');
    } finally {
      setIsGeneratingPdf(false);
      setIsPrintModalOpen(false);
    }
  };

  const selectedFamilies = families?.filter(f => f.id && selectedIds.has(f.id)) || [];

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && families) {
      setSelectedIds(new Set(families.map(f => f.id!)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDelete = (id: number) => {
    setFamilyToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (familyToDelete !== null) {
      await db.families.delete(familyToDelete);
      if (selectedIds.has(familyToDelete)) {
        const newSelected = new Set(selectedIds);
        newSelected.delete(familyToDelete);
        setSelectedIds(newSelected);
      }
      setDeleteModalOpen(false);
      setFamilyToDelete(null);
    }
  };

  const onPrintClick = () => {
    if (selectedIds.size === 0) {
      alert('الرجاء تحديد عائلة واحدة على الأقل من الجدول للطباعة.');
      return;
    }
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:max-w-md">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-3 pr-10 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
            placeholder="بحث بالاسم، رقم البطاقة، أو الرقم التسلسلي..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onPrintClick}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-6 py-3 rounded-xl font-medium transition-colors border border-blue-200"
          >
            <Printer className="h-5 w-5" />
            طباعة PDF {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-right">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    checked={!!(families && families.length > 0 && selectedIds.size === families.length)}
                    onChange={handleSelectAll}
                  />
                </th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">الرقم</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">الاسم الكامل</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">رقم البطاقة</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">الهاتف</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">موقف التسليم</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">الأفراد</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">تاريخ الانضمام</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!families ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    جاري التحميل...
                  </td>
                </tr>
              ) : families.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="h-12 w-12 text-gray-300 mb-4" />
                      <p className="text-lg font-medium text-gray-900">لا توجد عوائل مسجلة</p>
                      <p className="text-sm text-gray-500 mt-1">قم بإضافة عائلة جديدة للبدء</p>
                    </div>
                  </td>
                </tr>
              ) : (
                families.map((family) => (
                  <tr 
                    key={family.id} 
                    onClick={() => onEdit(family.id!)}
                    className={`hover:bg-gray-50 transition-colors cursor-pointer ${selectedIds.has(family.id!) ? 'bg-indigo-50/30' : ''}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        checked={selectedIds.has(family.id!)}
                        onChange={() => handleSelectOne(family.id!)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                      #{family.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {family.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {family.nationalId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {family.phoneNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        family.deliveryStatus === 'مستلم' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {family.deliveryStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{family.members.length}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {family.joinDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onEdit(family.id!)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                          title="تعديل"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(family.id!)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hidden print template */}
      <div className="absolute top-[-9999px] left-[-9999px]">
        <div ref={printRef}>
          <BatchPrintTemplate families={selectedFamilies} />
        </div>
      </div>

      {/* Print Confirmation Modal */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                  <Printer className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">تأكيد الطباعة المجمعة</h2>
                  <p className="text-sm text-gray-500 mt-1">سيتم طباعة استمارات العوائل المحددة التالية</p>
                </div>
              </div>
              <button onClick={() => setIsPrintModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-gray-50/50">
              <div className="space-y-3">
                {selectedFamilies.map(family => (
                  <div key={family.id} className="flex items-center gap-4 p-4 border border-gray-200 bg-white rounded-xl shadow-sm">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{family.fullName}</p>
                      <div className="flex gap-4 mt-1 text-sm text-gray-500">
                        <span className="font-mono">البطاقة: {family.nationalId}</span>
                        <span>•</span>
                        <span>الأفراد: {family.members.length}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button 
                onClick={() => setIsPrintModalOpen(false)} 
                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={handleConfirmPrint} 
                disabled={isGeneratingPdf}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGeneratingPdf ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    جاري التصدير...
                  </>
                ) : (
                  <>
                    <Printer className="h-5 w-5" />
                    تأكيد وتنزيل PDF ({selectedFamilies.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                  <Trash2 className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">تأكيد الحذف</h2>
              </div>
              <button onClick={() => setDeleteModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 bg-gray-50/50">
              <p className="text-gray-700 leading-relaxed">
                هل أنت متأكد من حذف هذا السجل؟ لا يمكن التراجع عن هذا الإجراء وسيتم مسح كافة بيانات العائلة وأفرادها بشكل نهائي.
              </p>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button 
                onClick={() => setDeleteModalOpen(false)} 
                className="px-6 py-2.5 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl font-medium transition-colors"
              >
                إلغاء
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors shadow-sm"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
