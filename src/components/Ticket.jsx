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

  const sectionLabel = (ticket?.section || previewSection || service?.section || "").toUpperCase();
  const numLabel = ticket
    ? String(ticket.departmentNumber).padStart(3, "0")
    : previewNumber
      ? String(previewNumber).padStart(3, "0")
      : "---";
  const queueCode = sectionLabel ? `${sectionLabel}-${numLabel}` : numLabel;

  const price = Number(ticket?.price ?? service?.price ?? 0).toLocaleString("uz-UZ");

  const doctorFirst = ticket?.doctorFirstName ?? service?.doctorFirstName ?? "";
  const doctorLast = ticket?.doctorLastName ?? service?.doctorLastName ?? "";
  const doctorFull = [doctorFirst, doctorLast].filter(Boolean).join(" ").trim();
  const doctorPhone = ticket?.doctorPhone ?? service?.doctorPhone ?? "";
  const roomNumber = (ticket?.roomNumber ?? service?.roomNumber ?? "").trim();

  const createdAt = ticket ? new Date(ticket.createdAt) : null;
  const dateStr = createdAt
    ? createdAt.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" })
    : "-";
  const timeStr = createdAt
    ? createdAt.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })
    : "-";

  // Bitta chek komponenti
  const TicketCard = () => (
    <div
      style={{ fontFamily: "'Courier New', Courier, monospace", width: "78mm" }}
      className="bg-white text-black rounded overflow-hidden shadow-xl"
    >
      {/* Yuqori yirtish chizig'i */}
      <div
        style={{
          height: "8px",
          backgroundImage:
            "repeating-linear-gradient(90deg, #ccc 0, #ccc 5px, #fff 5px, #fff 10px)"
        }}
      />

      <div className="px-4 py-5 flex flex-col items-center text-center">
        {/* Header */}
        <p className="text-[13px] font-black tracking-wide uppercase leading-tight m-0">
          SHERDOR MEDICAL
        </p>
        <p className="text-[9px] text-black/50 m-0 mt-0.5">Navbat tizimi</p>
        <p className="text-[9px] text-black/50 m-0">Namangan, Jomashuy</p>

        <div className="w-full border-t border-dashed border-black/20 my-3" />

        {(doctorFull || doctorPhone) && (
          <div className="w-full flex flex-col items-center gap-1 mb-1">
            <p className="text-[9px] tracking-[0.12em] text-black/40 m-0 uppercase">Shifokor</p>
            {doctorFull ? (
              <p className="text-[11px] font-bold text-black m-0 leading-tight">{doctorFull}</p>
            ) : null}
            {doctorPhone ? (
              <p className="text-[10px] font-mono text-black/70 m-0">{doctorPhone}</p>
            ) : null}
          </div>
        )}

        {(doctorFull || doctorPhone) && (
          <div className="w-full border-t border-dashed border-black/20 my-3" />
        )}

        {/* Navbat raqami — katta */}
        <p className="text-[9px] tracking-[0.15em] text-black/40 m-0 uppercase">
          Navbat raqami
        </p>
        <p
          className="m-0 font-black leading-none tracking-tight"
          style={{ fontSize: "77px", marginTop: "6px", marginBottom: "4px" }}
        >
          {queueCode}
        </p>
        {roomNumber ? (
          <p
            className="m-0 font-black leading-none tracking-tight text-black/85"
            style={{ fontSize: "38px", marginTop: "2px", marginBottom: "6px" }}
          >
            Xona {roomNumber}
          </p>
        ) : null}

        {!ticket && (
          <p className="text-[9px] text-black/40 mt-1 mb-0 px-2">
            Raqam chek chiqarilganda band qilinadi
          </p>
        )}

        <div className="w-full border-t border-dashed border-black/20 my-3" />

        {/* Ma'lumotlar */}
        <table className="w-full text-[10px] border-collapse">
          <tbody>
            <tr>
              <td className="text-left text-black/40 py-[3px] pr-2">Bo'lim</td>
              <td className="text-right font-bold py-[3px] uppercase">{sectionLabel || "—"}</td>
            </tr>
            <tr>
              <td className="text-left text-black/40 py-[3px] pr-2">Sana</td>
              <td className="text-right py-[3px]">{dateStr}</td>
            </tr>
            <tr>
              <td className="text-left text-black/40 py-[3px] pr-2">Vaqt</td>
              <td className="text-right py-[3px]">{timeStr}</td>
            </tr>
            <tr style={{ borderTop: "1px dashed rgba(0,0,0,0.12)" }}>
              <td className="text-left font-bold text-black/80 pt-2 pb-1 pr-2">To'lov</td>
              <td className="text-right font-black pt-2 pb-1">{price} so'm</td>
            </tr>
          </tbody>
        </table>

        <div className="w-full border-t border-dashed border-black/20 my-3" />

        {/* Footer */}
        <p className="text-[9px] text-black/40 m-0">Navbatingizni kuting!</p>
        <p className="text-[9px] text-black/40 m-0 mt-0.5">Rahmat :)</p>
      </div>

      {/* Pastki yirtish chizig'i */}
      <div
        style={{
          height: "8px",
          backgroundImage:
            "repeating-linear-gradient(90deg, #ccc 0, #ccc 5px, #fff 5px, #fff 10px)"
        }}
      />
    </div>
  );

  return (
    <div className="flex flex-col items-center animate-fade-in py-8">
      <h2 className="text-sm font-semibold uppercase text-white/60 mb-8 tracking-widest">
        Chek Namunasi
      </h2>

      {/* Bitta chek, markazda */}
      <div className="flex justify-center">
        <TicketCard />
      </div>

      {/* Tugmalar */}
      <div className="mt-10 flex gap-3">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-white/10 text-white/60 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
        >
          Orqaga
        </button>
        <button
          onClick={handlePrint}
          disabled={isPrinting || printed}
          className="px-6 py-3 bg-teal-500 text-black rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-teal-400 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isPrinting ? "Yuborilmoqda..." : printed ? "Yuborildi ✓" : "Navbat olish"}
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