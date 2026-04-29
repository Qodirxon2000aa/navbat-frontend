import React, { useState } from "react";

export default function Ticket({ ticket, service, onBack, onPrint, previewNumber, previewSection }) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printed, setPrinted] = useState(false);
  const [printError, setPrintError] = useState("");
  const [printInfo, setPrintInfo] = useState("");

  const handlePrint = async () => {
    if (printed || isPrinting) {
      return;
    }

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

  return (
    <div className="flex flex-col items-center animate-fade-in py-8">
      <h2 className="text-sm font-semibold uppercase text-white/60 mb-8 tracking-widest">Chek Namunasi</h2>

      <div className="w-[320px] bg-white text-black p-8 rounded shadow-2xl flex flex-col items-center text-center font-mono">
        <p className="text-[12px] font-black tracking-tight uppercase leading-none mb-1">Sherdor Medical</p>
        <p className="text-[9px] opacity-60 mb-5">Namangan viloyati, Jomashuy</p>

        <div className="border-y border-dashed border-black/20 w-full py-4 my-4">
          <p className="text-[10px] uppercase font-bold text-black/40 mb-1">Bo'lim navbati</p>
          <h3 className="text-4xl font-black tracking-tighter">
            {ticket
              ? `${ticket.section}-${ticket.departmentNumber}`
              : previewNumber
                ? `${previewSection || service?.section || ""}-${String(previewNumber).padStart(3, "0")}`
                : "---"}
          </h3>
        </div>
        {!ticket ? (
          <p className="text-[10px] text-black/60 mb-4">
            Navbat raqami chekni chiqarish tugmasi bosilganda band qilinadi.
          </p>
        ) : null}

        <div className="w-full text-left text-[10px] space-y-2 mb-6">
          <div className="flex justify-between border-b border-black/5 pb-1">
            <span className="opacity-50">Bo'lim:</span>
            <span className="font-bold uppercase">{ticket?.service || service?.name || "-"}</span>
          </div>
          <div className="flex justify-between border-b border-black/5 pb-1">
            <span className="opacity-50">To'lov:</span>
            <span className="font-bold">{Number(ticket?.price ?? service?.price ?? 0).toLocaleString()} UZS</span>
          </div>
          <div className="flex justify-between">
            <span className="opacity-50">Vaqt:</span>
            <span>{ticket ? new Date(ticket.createdAt).toLocaleString("uz-UZ") : "-"}</span>
          </div>
        </div>
      </div>

      <div className="mt-10 flex gap-3">
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
          {isPrinting ? "Yuborilmoqda..." : printed ? "Yuborildi" : "Chekni chiqarish"}
        </button>
      </div>
      {printError ? <p className="text-red-400 mt-4 text-sm">{printError}</p> : null}
      {printInfo ? <p className="text-teal-300 mt-4 text-sm">{printInfo}</p> : null}
    </div>
  );
}
