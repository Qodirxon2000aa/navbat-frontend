import React from "react";

export default function ServiceList({ services, onSelect }) {
  const [selectedId, setSelectedId] = React.useState(null);

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
        {services.map((service) => (
          <div
            key={service.id}
            onClick={() => handleSelect(service)}
            className={`relative p-6 rounded-2xl border transition-all cursor-pointer group overflow-hidden ${
              selectedId === service.id
                ? "bg-teal-500/10 border-teal-500 shadow-lg shadow-teal-500/10"
                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold tracking-tight text-white">{service.name}</h3>
              <span className="font-mono text-teal-400 font-bold bg-teal-500/10 px-2 py-0.5 rounded text-sm">
                {service.section}-{service.id.slice(0, 1).toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-white/40">Narxi: {service.price.toLocaleString()} UZS</p>
          </div>
        ))}
      </div>
    </div>
  );
}
