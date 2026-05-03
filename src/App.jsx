import { useCallback, useEffect, useState } from "react";
import { getNavbatApiBase } from "./apiBase.js";
import ServiceList from "./components/ServiceList";
import Ticket from "./components/Ticket";

const API_URL = getNavbatApiBase();

export default function App() {
  const [view, setView] = useState("selection");
  const [services, setServices] = useState([]);
  const [queueSnapshot, setQueueSnapshot] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [previewNumber, setPreviewNumber] = useState(null);
  const [previewSection, setPreviewSection] = useState("");

  const fetchServices = async () => {
    try {
      const response = await fetch(`${API_URL}/services`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (_error) {
      /* ignore */
    }
  };

  const fetchQueueSnapshot = async () => {
    try {
      const response = await fetch(`${API_URL}/queues`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setQueueSnapshot(Array.isArray(data?.queues) ? data.queues : []);
    } catch (_error) {
      /* ignore */
    }
  };

  useEffect(() => {
    fetchServices();
    fetchQueueSnapshot();
    const events = new EventSource(`${API_URL}/events`);
    events.addEventListener("state-updated", () => {
      fetchServices();
      fetchQueueSnapshot();
    });
    events.onerror = () => {
      fetchServices();
      fetchQueueSnapshot();
    };
    return () => events.close();
  }, []);

  useEffect(() => {
    if (!selectedServiceId) return;
    const selectedStillExists = services.some((item) => item.id === selectedServiceId);
    if (!selectedStillExists) {
      setSelectedServiceId("");
      setCurrentTicket(null);
      setPreviewNumber(null);
      setPreviewSection("");
      setView("selection");
    }
  }, [services, selectedServiceId]);

  const issueTicketAndPrint = useCallback(async (serviceId) => {
    const ticketRes = await fetch(`${API_URL}/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serviceId })
    });
    if (!ticketRes.ok) {
      let msg = "Navbat band qilishda xatolik";
      try {
        const err = await ticketRes.json();
        if (err?.message) msg = err.message;
      } catch {
        /* ignore */
      }
      return { ok: false, message: msg, ticket: null };
    }
    const ticket = await ticketRes.json();

    const printRes = await fetch(`${API_URL}/printer/print-ticket`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket })
    });
    let printData = {};
    try {
      printData = await printRes.json();
    } catch {
      /* ignore */
    }
    if (!printRes.ok) {
      return {
        ok: false,
        message: printData?.message || "Printer xatoligi",
        ticket
      };
    }

    return {
      ok: true,
      message: printData?.message || "Chek chop etildi",
      ticket
    };
  }, []);

  /** Xizmat tanlash → namuna ekrani (navbat shu yerda band qilinmaydi) */
  const handleSelectService = (serviceId) => {
    setSelectedServiceId(serviceId);
    setCurrentTicket(null);

    const svc = services.find((s) => s.id === serviceId);
    const row = queueSnapshot.find((q) => q.serviceId === serviceId);
    const guessNext = row?.lastNumber != null ? Number(row.lastNumber) + 1 : null;
    setPreviewSection(svc?.section || "");
    setPreviewNumber(guessNext);
    setView("ticket");

    void (async () => {
      try {
        const response = await fetch(`${API_URL}/services/${serviceId}/next-number`, {
          cache: "no-store"
        });
        if (!response.ok) return;
        const data = await response.json();
        setPreviewNumber(data.nextDepartmentNumber);
        if (data.section) setPreviewSection(data.section);
      } catch {
        /* ignore */
      }
    })();
  };

  const handlePrintTicket = async () => {
    if (!selectedServiceId && !currentTicket) {
      return { ok: false, message: "Avval xizmat tanlang" };
    }

    try {
      let ticketToPrint = currentTicket;
      let printMessage = "";

      if (ticketToPrint) {
        const response = await fetch(`${API_URL}/printer/print-ticket`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticket: ticketToPrint })
        });
        let data = {};
        try {
          data = await response.json();
        } catch {
          /* ignore */
        }
        if (!response.ok) {
          return { ok: false, message: data?.message || "Printer xatoligi" };
        }
        printMessage = data?.message || "";
      } else {
        const result = await issueTicketAndPrint(selectedServiceId);
        if (!result.ok) {
          if (result.ticket) setCurrentTicket(result.ticket);
          return {
            ok: false,
            message: result.message,
            ticket: result.ticket
          };
        }
        ticketToPrint = result.ticket;
        printMessage = result.message || "";
      }

      setPreviewNumber(Number(ticketToPrint.departmentNumber ?? 0) + 1);
      setPreviewSection(ticketToPrint.section || "");
      setSelectedServiceId("");
      setCurrentTicket(null);
      setView("selection");
      fetchServices();
      fetchQueueSnapshot();
      return { ok: true, message: printMessage, ticket: ticketToPrint };
    } catch (_error) {
      return { ok: false, message: "Printerga ulanishda xatolik" };
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans flex flex-col">
      <nav className="border-b border-white/10 px-8 py-6 flex justify-between items-center sticky top-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-md">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-none">Sherdor Medical</h1>
          <p className="mt-2 text-xs md:text-sm text-white/70 font-bold uppercase tracking-[0.18em]">
            Navbat Boshqaruv Tizimi
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setView("selection");
          }}
          className="px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all bg-teal-500 text-black"
        >
          Xizmatlar
        </button>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full p-8">
        {view === "selection" && (
          <ServiceList
            services={services}
            queueSnapshot={queueSnapshot}
            onSelect={handleSelectService}
          />
        )}
        {view === "ticket" && currentTicket && (
          <Ticket
            ticket={currentTicket}
            onBack={() => setView("selection")}
            onPrint={handlePrintTicket}
            previewNumber={previewNumber}
            previewSection={previewSection}
          />
        )}
        {view === "ticket" && !currentTicket && (
          <Ticket
            ticket={null}
            service={services.find((item) => item.id === selectedServiceId) || null}
            onBack={() => setView("selection")}
            onPrint={handlePrintTicket}
            previewNumber={previewNumber}
            previewSection={previewSection}
          />
        )}
      </main>
    </div>
  );
}
