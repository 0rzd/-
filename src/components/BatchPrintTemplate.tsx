import { FamilyRecord } from '../db';
import { PrintTemplate } from './PrintTemplate';

interface BatchPrintTemplateProps {
  families: FamilyRecord[];
}

export function BatchPrintTemplate({ families }: BatchPrintTemplateProps) {
  return (
    <div dir="rtl">
      {families.map((family, index) => (
        <div 
          key={family.id} 
          style={{ 
            pageBreakAfter: index === families.length - 1 ? 'auto' : 'always' 
          }}
        >
          <PrintTemplate data={family} id={family.id!} />
        </div>
      ))}
    </div>
  );
}
