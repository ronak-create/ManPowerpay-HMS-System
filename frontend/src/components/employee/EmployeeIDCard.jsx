import React, { useRef, useState } from "react";
import QRCode from "react-qr-code";
import {
  Printer,
  MapPin,
  Building,
  Calendar,
  Hash,
} from "lucide-react";
import { format } from "date-fns";

export default function EmployeeIDCard({
  user,
  employee,
  company,
}) {
  const cardRef = useRef();
  const [showQR, setShowQR] = useState(false);

  const handlePrint = () => {
    document.title = `${
      employee?.empCode || "employee"
    }-id-card`;

    window.print();
  };

  const qrValue = JSON.stringify({
    employeeId: employee?.id,
    empCode: employee?.empCode,
    name: user?.name,
    email: user?.email,
    company: company?.name,
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between no-print">
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
          Digital ID Card
        </h3>

        <button
          onClick={handlePrint}
          className="text-xs text-amber-700 font-semibold flex items-center gap-1 hover:underline"
        >
          <Printer size={13} />
          Print / Save
        </button>
      </div>

      {/* Printable Area */}
      <div className="printable-card-container flex justify-center">
        <div
          ref={cardRef}
          className="relative w-full max-w-[380px] rounded-[28px] overflow-hidden shadow-2xl text-white"
        >
          {/* Background */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #B45309, #D97706)' }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-10 w-36 h-36 rounded-full bg-white/5" />

          <div className="relative p-5">
            {/* Top */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-black leading-none">
                  {company?.name || "ManpowerPay HMS"}
                </p>

                <p className="text-[10px] tracking-[0.25em] text-white/60 uppercase mt-1">
                  Employee Identity Card
                </p>
              </div>

              <div className="bg-white rounded-xl px-2 py-1 text-amber-700 text-xs font-black shadow">
                {employee?.empCode || "EMP"}
              </div>
            </div>

            {/* Main section */}
            <div className="flex gap-4 items-center">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-white/15 border border-white/20 backdrop-blur flex items-center justify-center text-3xl font-black shadow-inner">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-black truncate">
                  {user?.name || "-"}
                </h2>

                <p className="text-sm text-white/75 font-medium truncate">
                  {employee?.designation || "Employee"}
                </p>

                <div className="mt-3 space-y-1.5 text-[11px]">
                  <div className="flex items-center gap-2">
                    <Building
                      size={12}
                      className="text-white/60"
                    />
                    <span className="text-white/70 w-12">
                      Dept
                    </span>
                    <span className="truncate font-semibold">
                      {employee?.department?.name ||
                        "-"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin
                      size={12}
                      className="text-white/60"
                    />
                    <span className="text-white/70 w-12">
                      Site
                    </span>
                    <span className="truncate font-semibold">
                      {employee?.site?.name || "-"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar
                      size={12}
                      className="text-white/60"
                    />
                    <span className="text-white/70 w-12">
                      DOJ
                    </span>
                    <span className="font-semibold">
                      {employee?.dateOfJoining
                        ? format(
                            new Date(
                              employee.dateOfJoining
                            ),
                            "dd MMM yyyy"
                          )
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Section */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => setShowQR(true)}
                  className="group focus:outline-none"
                  title="Click to enlarge QR"
                >
                  <div className="bg-white p-2 rounded-2xl shadow-lg transition-transform duration-200 group-hover:scale-105">
                    <QRCode
                      size={64}
                      value={qrValue}
                      bgColor="#ffffff"
                      fgColor="#111827"
                    />
                  </div>

                  <p className="text-[9px] text-center mt-1 text-white/60 uppercase tracking-wide">
                    Tap to Scan
                  </p>
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 pt-3 border-t border-white/15 flex items-center justify-between text-[10px]">
              <div className="flex items-center gap-1 text-white/70">
                <Hash size={10} />
                Employee ID
              </div>

              <div className="font-black tracking-wider">
                {employee?.empCode || "-"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 no-print"
          onClick={() => setShowQR(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 shadow-2xl max-w-sm w-full text-center animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Scan Employee QR
            </h3>

            <p className="text-sm text-gray-500 mb-5">
              Scan this QR to verify employee identity
            </p>

            <div className="bg-white p-4 rounded-2xl border flex justify-center">
              <QRCode
                size={220}
                value={qrValue}
                bgColor="#ffffff"
                fgColor="#111827"
              />
            </div>

            <button
              onClick={() => setShowQR(false)}
              className="mt-5 w-full py-3 rounded-xl bg-primary text-white font-semibold hover:opacity-90 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @page {
          size: A4;
          margin: 10mm;
        }

        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden;
          }

          .printable-card-container,
          .printable-card-container * {
            visibility: visible;
          }

          .printable-card-container {
            position: absolute;
            top: 40px;
            left: 40px;
            width: 380px;
          }

          .no-print {
            display: none !important;
          }

          #root {
            height: auto !important;
          }
        }
      `}</style>
    </div>
  );
}