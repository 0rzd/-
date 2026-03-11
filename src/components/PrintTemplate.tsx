import { FamilyRecord } from '../db';
import { format } from 'date-fns';
import { useLogo } from '../hooks/useLogo';

interface PrintTemplateProps {
  data: Omit<FamilyRecord, 'id' | 'createdAt'>;
  id: number | null;
}

export function PrintTemplate({ data, id }: PrintTemplateProps) {
  const { logo } = useLogo();
  
  // Generate exactly 10 rows for the members table
  const tableRows = Array.from({ length: 10 }).map((_, index) => {
    const member = data.members[index];
    return {
      index: index + 1,
      name: member?.name || '',
      profession: member?.profession || '',
      age: member?.age || '',
    };
  });

  const sequenceNumber = id ? `F-${new Date().getFullYear()}-${String(id).padStart(4, '0')}` : 'جديدة';

  return (
    <div className="p-8 bg-[#ffffff] text-[#000000] w-[210mm] min-h-[297mm] mx-auto relative flex flex-col" dir="rtl" style={{ fontFamily: 'Arial, sans-serif' }}>
      
      {/* 1. Header Section */}
      <div className="flex justify-between items-start mb-6">
        {/* Right side */}
        <div className="text-right font-bold text-lg leading-tight w-1/3">
          <p>فريق تكاتف الانساني التطوعي</p>
        </div>

        {/* Center */}
        <div className="w-1/3 flex justify-center">
          <div className="border-2 border-[#000000] bg-[#e5e7eb] px-6 py-2 text-center font-bold text-xl">
            كشف مواطن / عوائل متعففة
          </div>
        </div>

        {/* Left side */}
        <div className="w-1/3 flex justify-end">
          <div className="w-20 h-20 border-2 border-[#d1d5db] flex items-center justify-center bg-[#f9fafb] text-xs text-[#9ca3af]">
            <img 
              src={logo} 
              alt="شعار الفريق" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* 2. Body Section (Row with 2 Main Columns) */}
      <div className="flex gap-4 flex-1">
        
        {/* Right Column (Family Main Details) */}
        <div className="w-1/2 flex flex-col gap-1">
          {[
            { label: 'رقم التسلسل العائلي', value: sequenceNumber, isMono: true },
            { label: 'المكتب', value: data.office },
            { label: 'تاريخ الانضمام', value: data.joinDate },
            { label: 'رقم البطاقة الوطنية', value: data.nationalId, isMono: true },
            { label: 'الاسم', value: data.fullName },
            { label: 'المواليد', value: data.birthYear, isMono: true },
            { label: 'اسم الام', value: data.motherName },
            { label: 'رقم الهاتف', value: data.phoneNumber, isMono: true },
            { label: 'التحصيل الدراسي', value: data.educationLevel },
            { label: 'من طرف', value: data.referredBy },
            { label: 'المحافظة', value: data.governorate },
            { label: 'القضاء', value: data.district },
            { label: 'الناحية', value: data.subDistrict },
            { label: 'الحي', value: data.neighborhood },
            { label: 'المهنة', value: data.profession },
            { 
              label: 'موقف التسليم', 
              value: data.deliveryStatus, 
              isRed: data.deliveryStatus === 'مستلم' 
            },
          ].map((field, idx) => (
            <div key={idx} className="flex border border-[#000000] text-sm h-8 items-stretch">
              <div className="w-2/5 bg-[#f3f4f6] border-l border-[#000000] p-1 font-bold flex items-center">
                {field.label}
              </div>
              <div className={`w-3/5 p-1 flex items-center ${field.isMono ? 'font-mono' : ''} ${field.isRed ? 'text-[#dc2626] font-bold' : ''}`}>
                {field.value}
              </div>
            </div>
          ))}
        </div>

        {/* Left Column (Family Members Table) */}
        <div className="w-1/2">
          <div className="border border-[#000000] flex flex-col h-full">
            <div className="bg-[#e5e7eb] text-center font-bold py-1 border-b border-[#000000]">
              افراد العائلة
            </div>
            <table className="w-full text-center text-sm border-collapse">
              <thead>
                <tr className="bg-[#f3f4f6] border-b border-[#000000]">
                  <th className="border-l border-[#000000] py-1 w-10">الرقم</th>
                  <th className="border-l border-[#000000] py-1">الاسم</th>
                  <th className="border-l border-[#000000] py-1 w-24">المهنة</th>
                  <th className="py-1 w-16">العمر</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, idx) => (
                  <tr key={idx} className="border-b border-[#000000] last:border-b-0 h-8">
                    <td className="border-l border-[#000000]">{row.index}</td>
                    <td className="border-l border-[#000000] text-right pr-2">{row.name}</td>
                    <td className="border-l border-[#000000]">{row.profession}</td>
                    <td className="">{row.age}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* 3. Footer Section */}
      <div className="mt-6 flex flex-col gap-4">
        {/* Notes Box */}
        <div className="border border-[#000000] min-h-[100px] relative">
          <div className="absolute top-0 right-0 bg-[#e5e7eb] border-b border-l border-[#000000] px-4 py-1 font-bold">
            الملاحظات
          </div>
          <div className="p-4 pt-10 whitespace-pre-wrap text-sm">
            {data.notes}
          </div>
        </div>

        {/* Page Footer */}
        <div className="flex justify-between items-center text-xs mt-4 pt-2 border-t border-[#d1d5db]">
          <div className="font-bold">
            تاريخ التصدير: {format(new Date(), 'yyyy/MM/dd')}
          </div>
          <div className="font-bold">
            الصفحة: 1
          </div>
        </div>
      </div>

    </div>
  );
}
