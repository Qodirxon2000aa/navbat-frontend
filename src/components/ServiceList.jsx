import React from "react";
import { resolveDoctorPhotoUrl } from "../utils/resolveDoctorPhotoUrl.js";

export default function ServiceList({ services, queueSnapshot = [], onSelect }) {
  const [selectedId, setSelectedId] = React.useState(null);
  const queueByServiceId = React.useMemo(() => {
    const map = new Map();
    queueSnapshot.forEach((item) => map.set(item.serviceId, item));
    return map;
  }, [queueSnapshot]);

  const handleSelect = (service) => {
    setSelectedId(service.id);
    onSelect(service.id);
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="mb-10">
        <h2 className="text-sm font-semibold uppercase text-white/60 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-teal-500 rounded-full shadow-[0_0_8px_rgba(20,184,166,0.5)]"></span>
          Xizmatni tanlang
        </h2>
        <p className="text-white/40 text-xs">Ro'yxatdan kerakli bo'limni tanlang</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => {
          const doctorName = [service.doctorFirstName, service.doctorLastName]
            .filter(Boolean)
            .join(" ")
            .trim();
          const photo = resolveDoctorPhotoUrl(service.doctorPhotoUrl || "");
          const queueInfo = queueByServiceId.get(service.id);
          const waitingCount = queueInfo?.waitingCount ?? 0;
          const lastNumber = queueInfo?.lastNumber || 0;
          const currentCode = queueInfo?.current
            ? `${service.section}-${String(queueInfo.current.departmentNumber).padStart(3, "0")}`
            : `${service.section}-${String(lastNumber).padStart(3, "0")}`;
          const latestIssuedCode = `${service.section}-${String(lastNumber).padStart(3, "0")}`;
          return (
            <div
              key={service.id}
              onClick={() => handleSelect(service)}
              className={`relative flex flex-col p-6 rounded-2xl border transition-all cursor-pointer group overflow-hidden ${
                selectedId === service.id
                  ? "bg-teal-500/10 border-teal-500 shadow-lg shadow-teal-500/10"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <div className="mb-3 inline-flex self-start items-center gap-2 rounded-md border border-teal-500/25 bg-teal-500/10 px-2.5 py-1">
                <span className="text-[10px] uppercase tracking-[0.16em] text-teal-200/90">Amaldagi</span>
                <span className="font-mono text-xs font-bold text-teal-300">{currentCode}</span>
              </div>
              <div className="flex items-start gap-4 flex-1">
                {photo ? (
                  <img
                    src={photo}
                    alt=""
                    className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0 bg-white/5"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white/10 border border-white/10 shrink-0 flex items-center justify-center text-white/30 text-xs">
                    —
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-xl font-bold tracking-tight text-white">{service.name}</h3>
                    <span className="font-mono text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded text-sm shrink-0">
                      {service.section}-{String(service.id).slice(0, 1).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-white/45 mt-1">Kutayotganlar: {waitingCount}</p>
                  <p className="text-xs text-white/45 mt-1">Bo'lim bo'yicha oxirgi raqam: {latestIssuedCode}</p>
                  {doctorName ? (
                    <p className="text-sm text-white/70 font-medium">Shifokor: {doctorName}</p>
                  ) : null}
                  {service.doctorPhone ? (
                    <p className="text-xs text-white/45 mt-0.5 font-mono">{service.doctorPhone}</p>
                  ) : null}
                </div>
              </div>

              {/* Xona va narx — alohida, katta blok */}
              <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  className={`rounded-xl px-4 py-4 text-center sm:text-left border ${
                    selectedId === service.id
                      ? "bg-teal-500/15 border-teal-400/40"
                      : "bg-teal-500/10 border-teal-500/25"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-200/90 mb-1">
                    Xona raqami
                  </p>
                  <p className="text-3xl sm:text-4xl font-black font-mono text-white leading-none tracking-tight">
                    {service.roomNumber?.trim() || "—"}
                  </p>
                </div>
                <div
                  className={`rounded-xl px-4 py-4 text-center sm:text-right border ${
                    selectedId === service.id
                      ? "bg-white/10 border-white/20"
                      : "bg-white/[0.06] border-white/10"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/50 mb-1">
                    Narxi
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-teal-300 tabular-nums leading-tight">
                    {Number(service.price || 0).toLocaleString("uz-UZ")}
                  </p>
                  <p className="text-sm font-bold text-white/60 mt-1">so'm</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
