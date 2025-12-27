import React from 'react';
import { InvoiceData } from '../types';

interface InvoiceCardProps {
  data: InvoiceData;
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ data }) => {
  return (
    <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden my-4 text-sm md:text-base">
      
      {/* Header */}
      <div className="bg-slate-800 text-white p-6 flex justify-between items-center">
        <div>
           <h2 className="text-xl font-bold">فاتورة صيانة</h2>
           <p className="text-slate-400 text-sm">Maintenance Invoice</p>
        </div>
        <div className="text-left">
           <div className="text-2xl font-mono font-bold">{data.invoiceNumber}</div>
           <div className="text-slate-400 text-sm">{data.date}</div>
        </div>
      </div>

      {/* Info */}
      <div className="p-6 grid grid-cols-2 gap-8 border-b border-slate-100">
        <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">العميل (Client)</h3>
            <p className="font-bold text-slate-800 text-lg">{data.clientName}</p>
        </div>
        <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">الجهاز (Device)</h3>
            <p className="font-bold text-slate-800 text-lg">{data.printerModel}</p>
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        <table className="w-full text-right">
          <thead>
            <tr className="text-xs text-slate-500 border-b border-slate-200">
              <th className="pb-3 w-1/2">الوصف (Description)</th>
              <th className="pb-3">النوع</th>
              <th className="pb-3 text-left">التكلفة</th>
            </tr>
          </thead>
          <tbody className="text-slate-700">
            {data.items.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-50 last:border-0">
                <td className="py-4">
                  <div className="font-medium">{item.description}</div>
                  {item.partNumber && <div className="text-xs text-slate-400 font-mono">{item.partNumber}</div>}
                </td>
                <td className="py-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${item.type === 'part' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {item.type === 'part' ? 'قطعة غيار' : 'خدمة'}
                  </span>
                </td>
                <td className="py-4 text-left font-mono font-bold">
                  {item.cost.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="bg-slate-50 p-6 flex flex-col items-end gap-2 border-t border-slate-200">
         <div className="flex justify-between w-full md:w-1/2 text-slate-600">
            <span>المجموع الفرعي (Subtotal):</span>
            <span className="font-mono">{data.subtotal.toLocaleString()}</span>
         </div>
         <div className="flex justify-between w-full md:w-1/2 text-slate-600">
            <span>الضريبة (VAT 15%):</span>
            <span className="font-mono">{data.tax.toLocaleString()}</span>
         </div>
         <div className="flex justify-between w-full md:w-1/2 pt-3 mt-1 border-t border-slate-200 text-slate-900 font-bold text-xl">
            <span>الإجمالي (Total):</span>
            <span className="font-mono text-indigo-700">{data.total.toLocaleString()}</span>
         </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-100 p-4 text-center text-xs text-slate-400 print:hidden">
        تم إنشاء هذه الفاتورة تلقائياً بواسطة AI Print by Loai
      </div>
    </div>
  );
};

export default InvoiceCard;