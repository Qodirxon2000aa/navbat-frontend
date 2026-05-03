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
        <h2 className="text-3xl md:text-4xl font-black uppercase text-white mb-2 flex items-center gap-3">
          <span className="w-3 h-3 bg-teal-500 rounded-full shadow-[0_0_10px_rgba(20,184,166,0.7)]"></span>
          Xizmatni tanlang
        </h2>
        <p className="text-white/70 text-base font-semibold">Ro'yxatdan kerakli bo'limni tanlang</p>
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
              className={`relative flex flex-col md:flex-row gap-4 p-4 rounded-2xl border transition-all overflow-hidden cursor-pointer group ${
                selectedId === service.id
                  ? "bg-teal-500/10 border-teal-500 shadow-lg shadow-teal-500/10"
                  : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
              }`}
            >
              <div className="md:basis-[30%] md:max-w-[30%] w-full">
                {photo ? (
                  <img
                    src={photo}
                    alt=""
                    className="w-full h-44 md:h-full min-h-44 rounded-xl object-cover border border-white/10 bg-white/5"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-44 md:h-full min-h-44 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-white/30 text-xs">
                    —
                  </div>
                )}
              </div>
              <div className="md:basis-[70%] md:max-w-[70%] flex-1 min-w-0">
                <div className="mb-2 inline-flex self-start items-center gap-2 rounded-md border border-teal-500/25 bg-teal-500/10 px-2.5 py-1">
                  <span className="text-[10px] uppercase tracking-[0.16em] text-teal-200/90">Amaldagi</span>
                  <span className="font-mono text-xs font-bold text-teal-300">{currentCode}</span>
                </div>
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
                <div className="mt-3 flex flex-wrap gap-2">
                  <div
                    className={`w-[140px] h-[88px] rounded-lg px-3 py-2 border flex flex-col justify-between ${
                      selectedId === service.id
                        ? "bg-teal-500/15 border-teal-400/40"
                        : "bg-teal-500/10 border-teal-500/25"
                    }`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-teal-200/90">Xona</p>
                    <p className="text-3xl font-black font-mono text-white leading-none">
                      {service.roomNumber?.trim() || "-"}
                    </p>
                  </div>
                  <div
                    className={`w-[140px] h-[88px] rounded-lg px-3 py-2 border flex flex-col justify-between ${
                      selectedId === service.id
                        ? "bg-white/10 border-white/20"
                        : "bg-white/[0.06] border-white/10"
                    }`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">Narxi</p>
                    <p className="text-xl font-black text-teal-300 tabular-nums leading-tight">
                      {Number(service.price || 0).toLocaleString("uz-UZ")}
                    </p>
                    <p className="text-xs font-bold text-white/60">so'm</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
