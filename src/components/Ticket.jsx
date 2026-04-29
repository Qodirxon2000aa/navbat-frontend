import React, { useState } from "react";

export default function Ticket({
  ticket,
  service,
  onBack,
  onPrint,
  previewNumber,
  previewSection
}) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printed, setPrinted] = useState(false);
  const [printError, setPrintError] = useState("");
  const [printInfo, setPrintInfo] = useState("");

  const handlePrint = async () => {
    if (printed || isPrinting) return;
    setIsPrinting(true);
    setPrintError("");
    setPrintInfo("");

    const result = await onPrint();
    if (result.ok) {
      setPrinted(true);
      setPrintInfo(result.message || "Chek printerga yuborildi");
    } else {
      setPrintError(result.message || "Print xatoligi");
    }
    setIsPrinting(false);
  };

  // Chek preview uchun ma'lumotlar
  const sectionLabel = ticket?.section || previewSection || service?.section || "";
  const numLabel = ticket
    ? String(ticket.departmentNumber).padStart(3, "0")
    : previewNumber
      ? String(previewNumber).padStart(3, "0")
      : "---";
  const queueCode = sectionLabel
    ? `${sectionLabel.toUpperCase()}-${numLabel}`
    : numLabel;

  const serviceName = ticket?.service || service?.name || "-";
  const price = Number(ticket?.price ?? service?.price ?? 0).toLocaleString("uz-UZ");

  const createdAt = ticket ? new Date(ticket.createdAt) : null;
  const dateStr = createdAt
    ? createdAt.toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      })
    : "-";
  const timeStr = createdAt
    ? createdAt.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })
    : "-";

  return (
    <div className="flex flex-col items-center animate-fade-in py-8">
      <h2 className="text-sm font-semibold uppercase text-white/60 mb-8 tracking-widest">
        Chek Namunasi
      </h2>

      {/* ── Termal chek preview ── */}
      <div
        style={{ fontFamily: "'Courier New', Courier, monospace" }}
        className="w-[300px] bg-white text-black rounded shadow-2xl overflow-hidden"
      >
        {/* Yirtish chizig'i yuqorida */}
        <div
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg,#000 0,#000 6px,transparent 6px,transparent 12px)",
            height: "6px",
            opacity: 0.15
          }}
        />

        <div className="px-5 py-5 flex flex-col items-center text-center">
          {/* Header */}
          <p className="text-[13px] font-black tracking-tight uppercase leading-tight">
            SHERDOR MEDICAL
          </p>
          <p className="text-[9px] text-black/50 leading-snug mt-0.5">Navbat tizimi</p>
          <p className="text-[9px] text-black/50 leading-snug">Namangan, Jomashuy</p>

          <div className="w-full border-t border-dashed border-black/20 my-3" />

          {/* Navbat raqami */}
          <p className="text-[9px] uppercase tracking-widest text-black/40 mb-1">
            * NAVBAT RAQAMI *
          </p>
          <p className="text-5xl font-black tracking-tight leading-none my-2">
            {queueCode}
          </p>
          {!ticket && (
            <p className="text-[9px] text-black/40 mt-1 px-2">
              Navbat raqami chek chiqarilganda band qilinadi
            </p>
          )}

          <div className="w-full border-t border-dashed border-black/20 my-3" />

          {/* Ma'lumotlar jadvali */}
          <table className="w-full text-[10px]">
            <tbody>
              <tr className="border-b border-black/5">
                <td className="text-left text-black/40 py-1 pr-2">Bo'lim</td>
                <td className="text-right font-bold py-1 uppercase">{serviceName}</td>
              </tr>
              <tr className="border-b border-black/5">
                <td className="text-left text-black/40 py-1 pr-2">Xizmat</td>
                <td className="text-right font-bold py-1">Ko'rik</td>
              </tr>
              <tr className="border-b border-black/5">
                <td className="text-left text-black/40 py-1 pr-2">Sana</td>
                <td className="text-right py-1">{dateStr}</td>
              </tr>
              <tr className="border-b border-black/5">
                <td className="text-left text-black/40 py-1 pr-2">Vaqt</td>
                <td className="text-right py-1">{timeStr}</td>
              </tr>
              <tr>
                <td className="text-left text-black/40 pt-2 pb-1 pr-2 font-bold">
                  To'lov
                </td>
                <td className="text-right pt-2 pb-1 font-black">{price} so'm</td>
              </tr>
            </tbody>
          </table>

          <div className="w-full border-t border-dashed border-black/20 my-3" />

          {/* Footer */}
          <p className="text-[9px] text-black/50">Navbatingizni kuting!</p>
          <p className="text-[9px] text-black/50">Rahmat :)</p>
        </div>

        {/* Yirtish chizig'i pastda */}
        <div
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg,#000 0,#000 6px,transparent 6px,transparent 12px)",
            height: "6px",
            opacity: 0.15
          }}
        />
      </div>

      {/* ── Tugmalar ── */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-white/10 text-white/60 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
        >
          Yangi navbat
        </button>
        <button
          onClick={handlePrint}
          disabled={isPrinting || printed}
          className="px-6 py-3 bg-teal-500 text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-teal-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPrinting ? "Yuborilmoqda..." : printed ? "Yuborildi ✓" : "Chekni chiqarish"}
        </button>
      </div>

      {printError && (
        <p className="text-red-400 mt-4 text-sm text-center max-w-xs">{printError}</p>
      )}
      {printInfo && (
        <p className="text-teal-300 mt-4 text-sm text-center">{printInfo}</p>
      )}
    </div>
  );
}