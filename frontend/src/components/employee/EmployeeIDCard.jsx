import React, { useRef } from 'react';
import { QrCode, Download, Printer, MapPin, Building, Calendar, Hash } from 'lucide-react';
import { format } from 'date-fns';

export default function EmployeeIDCard({ user, employee, company }) {
  const cardRef = useRef();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Digital ID Card</h3>
        <button onClick={handlePrint} className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline no-print">
          <Printer size={13} /> Print / Save
        </button>
      </div>

      <div 
        ref={cardRef}
        className="relative w-full max-w-[350px] aspect-[1.58/1] bg-gradient-to-br from-primary-900 to-primary-light rounded-2xl shadow-xl overflow-hidden text-white p-5 flex flex-col justify-between"
      >
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-12 translate-x-12" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-8" />
        
        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-primary font-black text-sm">
              MP
            </div>
            <div>
              <p className="text-xs font-black leading-none">{company?.name || 'ManpowerPay HMS'}</p>
              <p className="text-[8px] text-white/50 tracking-widest mt-0.5">IDENTITY CARD</p>
            </div>
          </div>
          <QrCode size={24} className="text-white/30" />
        </div>

        {/* Body */}
        <div className="relative flex items-center gap-4 py-4">
          <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl font-black shadow-inner">
            {user?.name?.[0]}
          </div>
          <div className="min-w-0">
            <h4 className="text-lg font-black truncate">{user?.name}</h4>
            <p className="text-xs text-white/70 font-medium">{employee?.designation}</p>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative grid grid-cols-2 gap-x-4 gap-y-2 border-t border-white/10 pt-3 text-[9px] uppercase tracking-wider font-bold">
          <div className="flex items-center gap-1.5">
            <Hash size={10} className="text-white/40" />
            <span className="text-white/40">ID:</span>
            <span>{employee?.empCode}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building size={10} className="text-white/40" />
            <span className="text-white/40">Dept:</span>
            <span className="truncate">{employee?.department?.name || '-'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin size={10} className="text-white/40" />
            <span className="text-white/40">Site:</span>
            <span className="truncate">{employee?.site?.name || '-'}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar size={10} className="text-white/40" />
            <span className="text-white/40">DOJ:</span>
            <span>{employee?.dateOfJoining ? format(new Date(employee.dateOfJoining), 'dd MMM yy') : '-'}</span>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .no-print { display: none !important; }
          #root { height: 0; }
          .printable-card-container, .printable-card-container * { visibility: visible; }
          .printable-card-container { position: absolute; left: 0; top: 0; }
        }
      `}</style>
    </div>
  );
}
