import React from "react";

export default function QueueMonitor({ queues, onCallNext, onReset }) {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-white/70">Operator paneli</h2>
        <button
          onClick={onReset}
          className="text-xs uppercase tracking-widest text-red-300 border border-red-500/30 px-3 py-2 rounded-lg hover:bg-red-500/10"
        >
          Barcha navbatni tozalash
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {queues.map((item) => (
          <div key={item.serviceId} className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{item.service}</h3>
              <span className="text-xs px-2 py-1 rounded bg-teal-500/10 text-teal-300">Bo'lim {item.section}</span>
            </div>

            <div className="text-sm text-white/70 space-y-2 mb-5">
              <p>
                Hozir chaqirilgan:{" "}
                <span className="font-mono font-bold text-white">
                  {item.current ? `${item.section}-${item.current.departmentNumber}` : "yo'q"}
                </span>
              </p>
              <p>
                Keyingi:{" "}
                <span className="font-mono font-bold text-white">
                  {item.next ? `${item.section}-${item.next.departmentNumber}` : "bo'sh"}
                </span>
              </p>
              <p>
                Kutayotganlar soni: <span className="font-bold text-teal-300">{item.waiting.length}</span>
              </p>
            </div>

            <button
              onClick={() => onCallNext(item.serviceId)}
              className="w-full bg-teal-500 hover:bg-teal-400 text-black px-5 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all"
            >
              Keyingi chaqirish ({item.section})
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
