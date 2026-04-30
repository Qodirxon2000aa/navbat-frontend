import { useEffect, useState } from "react";
import ServiceList from "./components/ServiceList";
import Ticket from "./components/Ticket";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

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
      // Ignore service refresh errors in client view.
    }
  };

  const fetchQueueSnapshot = async () => {
    try {
      const response = await fetch(`${API_URL}/queues`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setQueueSnapshot(Array.isArray(data?.queues) ? data.queues : []);
    } catch (_error) {
      // Ignore queue snapshot errors in client view.
    }
  };

  useEffect(() => {
    fetchServices();
    fetchQueueSnapshot();
    const interval = setInterval(() => {
      fetchServices();
      fetchQueueSnapshot();
    }, 1000);
    return () => clearInterval(interval);
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

  const handleSelectService = async (serviceId) => {
    setSelectedServiceId(serviceId);
    setCurrentTicket(null);
    setPreviewNumber(null);
    setPreviewSection("");

    try {
      const response = await fetch(`${API_URL}/services/${serviceId}/next-number`);
      if (response.ok) {
        const data = await response.json();
        setPreviewNumber(data.nextDepartmentNumber);
        setPreviewSection(data.section);
      }
    } catch (_error) {
      // Ignore preview errors, print flow still works.
    }

    setView("ticket");
  };

  const handlePrintTicket = async () => {
    try {
      let ticketToPrint = currentTicket;

      if (!ticketToPrint) {
        if (!selectedServiceId) {
          return { ok: false, message: "Avval xizmat tanlang" };
        }

        const ticketResponse = await fetch(`${API_URL}/tickets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ serviceId: selectedServiceId })
        });

        if (!ticketResponse.ok) {
          return { ok: false, message: "Navbat band qilishda xatolik" };
        }

        ticketToPrint = await ticketResponse.json();
      }

      const response = await fetch(`${API_URL}/printer/print-ticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket: ticketToPrint })
      });
      const data = await response.json();
      if (!response.ok) {
        return { ok: false, message: data?.message || "Printer xatoligi" };
      }

      setCurrentTicket(ticketToPrint);
      setPreviewNumber(ticketToPrint.departmentNumber + 1);
      setPreviewSection(ticketToPrint.section);
      setSelectedServiceId("");
      setCurrentTicket(null);
      setView("selection");
      fetchServices();
      fetchQueueSnapshot();
      return { ok: true, message: data?.message, ticket: ticketToPrint };
    } catch (_error) {
      return { ok: false, message: "Printerga ulanishda xatolik" };
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans flex flex-col">
      <nav className="border-b border-white/10 px-8 py-6 flex justify-between items-center sticky top-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold tracking-tight uppercase">Sherdor Medical</h1>
          <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Navbat Boshqaruv Tizimi</p>
        </div>

        <button
          onClick={() => setView("selection")}
          className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all bg-teal-500 text-black"
        >
          Navbat olish
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
