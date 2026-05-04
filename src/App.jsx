import { useCallback, useEffect, useState } from "react";
import { getNavbatApiBase } from "./apiBase.js";
import PatientRegistration, {
  clearKioskPatientSession,
  readKioskPatientSession
} from "./components/PatientRegistration.jsx";
import ServiceList from "./components/ServiceList";
import Ticket from "./components/Ticket";

const API_URL = getNavbatApiBase();

export default function App() {
  const [patient, setPatient] = useState(() => readKioskPatientSession());
  const [view, setView] = useState("selection");
  const [services, setServices] = useState([]);
  const [queueSnapshot, setQueueSnapshot] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [previewNumber, setPreviewNumber] = useState(null);
  const [previewSection, setPreviewSection] = useState("");

  const fetchServices = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/services`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setServices(Array.isArray(data) ? data : []);
    } catch (_error) {
      /* ignore */
    }
  }, []);

  const fetchQueueSnapshot = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/queues`, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      setQueueSnapshot(Array.isArray(data?.queues) ? data.queues : []);
    } catch (_error) {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!patient) return undefined;

    void fetchServices();
    void fetchQueueSnapshot();

    const pollTimer = setInterval(() => {
      void fetchServices();
      void fetchQueueSnapshot();
    }, 1000);

    const events = new EventSource(`${API_URL}/events`);
    events.addEventListener("state-updated", () => {
      void fetchServices();
      void fetchQueueSnapshot();
    });
    events.onerror = () => {
      void fetchServices();
      void fetchQueueSnapshot();
    };
    return () => {
      clearInterval(pollTimer);
      events.close();
    };
  }, [patient, fetchServices, fetchQueueSnapshot]);

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

  /** Faqat navbat yaratish — chop etish alohida, fonda */
  const postTicket = useCallback(async (serviceId) => {
    if (!patient) {
      return { ok: false, message: "Bemor ma'lumoti topilmadi", ticket: null };
    }
    const ticketRes = await fetch(`${API_URL}/tickets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId,
        patientFirstName: patient.firstName,
        patientLastName: patient.lastName,
        patientPhone: patient.phone
      })
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
    return { ok: true, ticket };
  }, [patient]);

  const printTicketInBackground = useCallback((ticket) => {
    void fetch(`${API_URL}/printer/print-ticket`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket })
    }).catch(() => {
      /* printer kechikishi/xatosi — navbat allaqachon berilgan */
    });
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

      if (!ticketToPrint) {
        const result = await postTicket(selectedServiceId);
        if (!result.ok) {
          return { ok: false, message: result.message, ticket: null };
        }
        ticketToPrint = result.ticket;
        printTicketInBackground(ticketToPrint);
      } else {
        printTicketInBackground(ticketToPrint);
      }

      resetPatientAndGoRegister();
      return {
        ok: true,
        message: "Navbat olindi",
        ticket: ticketToPrint
      };
    } catch (_error) {
      return { ok: false, message: "Navbat olishda xatolik" };
    }
  };

  const resetPatientAndGoRegister = () => {
    clearKioskPatientSession();
    setPatient(null);
    setView("selection");
    setSelectedServiceId("");
    setCurrentTicket(null);
    setPreviewNumber(null);
    setPreviewSection("");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white font-sans flex flex-col">
      <nav className="border-b border-white/10 px-8 py-6 flex justify-between items-center sticky top-0 z-50 bg-[#0A0A0B]/80 backdrop-blur-md gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-none">Sherdor Medical</h1>
          <p className="mt-2 text-xs md:text-sm text-white/70 font-bold uppercase tracking-[0.18em]">
            Navbat Boshqaruv Tizimi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-end">
          {patient ? (
            <>
              <div className="text-right hidden sm:block mr-2">
                <p className="text-[10px] uppercase tracking-widest text-white/40 m-0">Bemor</p>
                <p className="text-xs font-bold text-white/90 m-0">
                  {patient.firstName} {patient.lastName}
                </p>
                <p className="text-[11px] font-mono text-teal-400/90 m-0">{patient.phone}</p>
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
              <button
                type="button"
                onClick={resetPatientAndGoRegister}
                className="px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border border-white/15 text-white/70 hover:bg-white/5"
              >
                Bemorni almashtirish
              </button>
            </>
          ) : null}
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full p-8">
        {!patient ? (
          <PatientRegistration apiUrl={API_URL} onRegistered={setPatient} />
        ) : (
          <>
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
                patient={patient}
                onBack={() => setView("selection")}
                onPrint={handlePrintTicket}
                previewNumber={previewNumber}
                previewSection={previewSection}
              />
            )}
            {view === "ticket" && !currentTicket && (
              <Ticket
                ticket={null}
                patient={patient}
                service={services.find((item) => item.id === selectedServiceId) || null}
                onBack={() => setView("selection")}
                onPrint={handlePrintTicket}
                previewNumber={previewNumber}
                previewSection={previewSection}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
