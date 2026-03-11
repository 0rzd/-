import { useState, useEffect, useRef } from 'react';
import { db, FamilyRecord, FamilyMember } from '../db';
import { useReactToPrint } from 'react-to-print';
import { format } from 'date-fns';
import { Plus, Trash2, Save, X, Printer, UserPlus } from 'lucide-react';
import { PrintTemplate } from './PrintTemplate';

interface FamilyFormProps {
  id: number | null;
  onSaved: () => void;
  onCancel: () => void;
}

const initialFormState: Omit<FamilyRecord, 'id' | 'createdAt'> = {
  office: '',
  joinDate: format(new Date(), 'yyyy-MM-dd'),
  nationalId: '',
  fullName: '',
  birthYear: '',
  motherName: '',
  phoneNumber: '',
  educationLevel: '',
  referredBy: '',
  governorate: '',
  district: '',
  subDistrict: '',
  neighborhood: '',
  profession: '',
  deliveryStatus: 'غير مستلم',
  notes: '',
  members: [],
};

export function FamilyForm({ id, onSaved, onCancel }: FamilyFormProps) {
  const [formData, setFormData] = useState<Omit<FamilyRecord, 'id' | 'createdAt'>>(initialFormState);
  const [isSaving, setIsSaving] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `استمارة_عائلة_${formData.fullName || 'جديدة'}`,
  });

  useEffect(() => {
    if (id) {
      db.families.get(id).then(record => {
        if (record) {
          const { id: _, createdAt: __, ...rest } = record;
          setFormData({ ...initialFormState, ...rest });
        }
      });
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMember = () => {
    setFormData(prev => ({
      ...prev,
      members: [
        ...prev.members,
        { id: crypto.randomUUID(), name: '', age: '', profession: '' }
      ]
    }));
  };

  const handleMemberChange = (memberId: string, field: keyof FamilyMember, value: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === memberId ? { ...m, [field]: value } : m)
    }));
  };

  const handleRemoveMember = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== memberId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (id) {
        await db.families.update(id, formData);
      } else {
        await db.families.add({
          ...formData,
          createdAt: Date.now(),
        });
      }
      onSaved();
    } catch (error) {
      console.error('Error saving family:', error);
      alert('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {id ? `تعديل عائلة #${id}` : 'إضافة عائلة جديدة'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">يرجى ملء جميع الحقول المطلوبة بدقة</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {id && (
            <button
              type="button"
              onClick={() => handlePrint()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2.5 rounded-xl font-medium transition-colors border border-blue-200"
            >
              <Printer className="h-5 w-5" />
              طباعة الاستمارة
            </button>
          )}
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition-colors"
          >
            <X className="h-5 w-5" />
            إلغاء
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 shadow-sm"
          >
            <Save className="h-5 w-5" />
            {isSaving ? 'جاري الحفظ...' : 'حفظ البيانات'}
          </button>
        </div>
      </div>

      <form id="family-form" onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">المعلومات الأساسية</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">المكتب</label>
              <input required type="text" name="office" value={formData.office} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">تاريخ الانضمام</label>
              <input required type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">رقم البطاقة الوطنية</label>
              <input required type="text" name="nationalId" value={formData.nationalId} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors font-mono text-left" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">الاسم الكامل</label>
              <input required type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">المواليد (سنة)</label>
              <input required type="number" name="birthYear" value={formData.birthYear} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors font-mono text-left" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">اسم الام</label>
              <input required type="text" name="motherName" value={formData.motherName} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">رقم الهاتف</label>
              <input required type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors font-mono text-left" dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">التحصيل الدراسي</label>
              <input required type="text" name="educationLevel" value={formData.educationLevel} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">من طرف</label>
              <input required type="text" name="referredBy" value={formData.referredBy} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">المحافظة</label>
              <input required type="text" name="governorate" value={formData.governorate} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">القضاء</label>
              <input required type="text" name="district" value={formData.district} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">الناحية</label>
              <input required type="text" name="subDistrict" value={formData.subDistrict} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">الحي</label>
              <input required type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">المهنة</label>
              <input required type="text" name="profession" value={formData.profession} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">موقف التسليم</label>
              <select required name="deliveryStatus" value={formData.deliveryStatus} onChange={handleChange} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors">
                <option value="مستلم">مستلم</option>
                <option value="غير مستلم">غير مستلم</option>
              </select>
            </div>
            <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">الملاحظات</label>
              <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white transition-colors resize-y"></textarea>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">أفراد العائلة</h3>
                <p className="text-sm text-gray-500">إضافة أفراد العائلة وتفاصيلهم</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddMember}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-4 py-2 rounded-xl font-medium transition-colors border border-emerald-200"
            >
              <Plus className="h-5 w-5" />
              إضافة فرد جديد
            </button>
          </div>

          {formData.members.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <UserPlus className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">لا يوجد أفراد مضافين حالياً</p>
              <button
                type="button"
                onClick={handleAddMember}
                className="mt-4 text-emerald-600 font-medium hover:text-emerald-700"
              >
                اضغط هنا لإضافة فرد
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.members.map((member, index) => (
                <div key={member.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 bg-gray-50 rounded-xl border border-gray-200 relative group">
                  <div className="absolute -right-3 -top-3 w-8 h-8 bg-white border border-gray-200 rounded-full flex items-center justify-center text-sm font-bold text-gray-500 shadow-sm">
                    {index + 1}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full">
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase">الاسم</label>
                      <input
                        required
                        type="text"
                        value={member.name || ''}
                        onChange={(e) => handleMemberChange(member.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        placeholder="اسم الفرد"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase">العمر</label>
                      <input
                        required
                        type="number"
                        value={member.age || ''}
                        onChange={(e) => handleMemberChange(member.id, 'age', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white font-mono text-left"
                        dir="ltr"
                        placeholder="العمر"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase">المهنة</label>
                      <input
                        required
                        type="text"
                        value={member.profession || ''}
                        onChange={(e) => handleMemberChange(member.id, 'profession', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                        placeholder="المهنة"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(member.id)}
                    className="w-full sm:w-auto mt-2 sm:mt-0 p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="sm:hidden font-medium">حذف الفرد</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>

      {/* Hidden print template */}
      <div className="overflow-hidden h-0 w-0 absolute opacity-0 pointer-events-none">
        <div ref={printRef}>
          <PrintTemplate data={formData} id={id} />
        </div>
      </div>
    </div>
  );
}
