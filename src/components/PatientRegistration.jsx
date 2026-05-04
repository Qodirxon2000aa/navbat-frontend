import { useState } from "react";
import TouchKeyboard, { KB_BACK, KB_SPACE } from "./TouchKeyboard.jsx";

export const KIOSK_PATIENT_SESSION_KEY = "navbat-kiosk-patient";

const PHONE_PREFIX = "+998";
const PHONE_LOCAL_MAX = 9;

const digitsOnly = (s) => String(s || "").replace(/\D/g, "");

export function readKioskPatientSession() {
  try {
    const raw = sessionStorage.getItem(KIOSK_PATIENT_SESSION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p?.firstName || !p?.lastName || !p?.phone) return null;
    return {
      firstName: String(p.firstName).trim(),
      lastName: String(p.lastName).trim(),
      phone: String(p.phone).trim()
    };
  } catch {
    return null;
  }
}

export function writeKioskPatientSession(patient) {
  sessionStorage.setItem(
    KIOSK_PATIENT_SESSION_KEY,
    JSON.stringify({
      firstName: patient.firstName,
      lastName: patient.lastName,
      phone: patient.phone
    })
  );
}

export function clearKioskPatientSession() {
  sessionStorage.removeItem(KIOSK_PATIENT_SESSION_KEY);
}

export default function PatientRegistration({ apiUrl, onRegistered }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [focusField, setFocusField] = useState("firstName");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleKeyboardKey = (key) => {
    if (key === KB_BACK) {
      if (focusField === "firstName") setFirstName((s) => s.slice(0, -1));
      else if (focusField === "lastName") setLastName((s) => s.slice(0, -1));
      else setPhoneDigits((s) => s.slice(0, -1));
      return;
    }
    if (key === KB_SPACE) {
      if (focusField === "firstName" || focusField === "lastName") {
        if (focusField === "firstName") setFirstName((s) => `${s} `);
        else setLastName((s) => `${s} `);
      }
      return;
    }
    if (focusField === "phone") {
      if (/^\d$/.test(key)) {
        setPhoneDigits((s) => (s.length >= PHONE_LOCAL_MAX ? s : `${s}${key}`));
      }
      return;
    }
    if (focusField === "firstName" || focusField === "lastName") {
      const ch = String(key);
      if (ch.length === 1) {
        if (focusField === "firstName") setFirstName((s) => s + ch);
        else setLastName((s) => s + ch);
      }
    }
  };

  const fieldRing = (name) =>
    focusField === name
      ? "border-teal-400/70 ring-2 ring-teal-500/35"
      : "border-white/10 focus:border-teal-500/50";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const local = digitsOnly(phoneDigits);
    if (local.length < PHONE_LOCAL_MAX) {
      setError(`Telefon: +998 dan keyin ${PHONE_LOCAL_MAX} ta raqam kiriting`);
      setFocusField("phone");
      return;
    }
    const phone = `${PHONE_PREFIX}${local}`;
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/kiosk/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: String(firstName).trim(),
          lastName: String(lastName).trim(),
          phone
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message || "Ro'yxatdan o'tishda xatolik");
        setLoading(false);
        return;
      }
      const patient = {
        firstName: data.firstName || String(firstName).trim(),
        lastName: data.lastName || String(lastName).trim(),
        phone: data.phone || phone
      };
      writeKioskPatientSession(patient);
      onRegistered(patient);
    } catch {
      setError("Serverga ulanib bo'lmadi");
    }
    setLoading(false);
  };

  const kbMode = focusField === "phone" ? "numeric" : "latin";

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0 px-2 pt-2 pb-[clamp(260px,44vh,540px)]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 backdrop-blur-sm">
          <h2 className="text-xl font-black uppercase tracking-tight text-white m-0">Bemor ro&apos;yxatdan o&apos;tishi</h2>
          <p className="text-xs text-white/50 mt-2 mb-6 font-medium uppercase tracking-widest leading-relaxed">
            Pastdagi klaviatura bilan kiriting. Telefon: <strong className="text-teal-300/90">+998</strong> avtomatik,
            faqat keyingi {PHONE_LOCAL_MAX} raqamni bosing.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-400/90">Ism</span>
              <input
                type="text"
                name="firstName"
                readOnly
                inputMode="none"
                autoComplete="off"
                value={firstName}
                onFocus={() => setFocusField("firstName")}
                className={`mt-1.5 w-full rounded-xl border bg-black/40 px-4 py-3 text-lg text-white placeholder:text-white/25 outline-none cursor-pointer ${fieldRing("firstName")}`}
                placeholder="Masalan: AZIZ"
                required
                minLength={2}
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-400/90">Familiya</span>
              <input
                type="text"
                name="lastName"
                readOnly
                inputMode="none"
                autoComplete="off"
                value={lastName}
                onFocus={() => setFocusField("lastName")}
                className={`mt-1.5 w-full rounded-xl border bg-black/40 px-4 py-3 text-lg text-white placeholder:text-white/25 outline-none cursor-pointer ${fieldRing("lastName")}`}
                placeholder="Masalan: KARIMOV"
                required
                minLength={2}
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-teal-400/90">Telefon</span>
              <div
                className={`mt-1.5 flex rounded-xl border overflow-hidden bg-black/40 ${fieldRing("phone")}`}
                onMouseDown={(ev) => {
                  const t = ev.target;
                  if (t && t.closest && t.closest("input")) return;
                  ev.preventDefault();
                  setFocusField("phone");
                }}
              >
                <span className="flex items-center px-3 sm:px-4 bg-teal-500/15 text-teal-200 font-mono font-black text-base sm:text-lg shrink-0 border-r border-white/10">
                  +998
                </span>
                <input
                  type="text"
                  name="phone"
                  readOnly
                  inputMode="none"
                  autoComplete="off"
                  value={phoneDigits}
                  onFocus={() => setFocusField("phone")}
                  className="flex-1 min-w-0 border-0 bg-transparent px-3 py-3 text-lg text-white font-mono outline-none cursor-pointer placeholder:text-white/25"
                  placeholder="901234567"
                  aria-label="Telefon raqami +998 dan keyin"
                />
              </div>
              <p className="text-[10px] text-white/35 mt-1 m-0">
                {phoneDigits.length}/{PHONE_LOCAL_MAX} raqam
              </p>
            </label>

            {error ? <p className="text-sm text-red-400 m-0">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-teal-500 py-4 text-sm font-black uppercase tracking-widest text-black hover:bg-teal-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saqlanmoqda..." : "Davom etish"}
            </button>
          </form>
        </div>
      </div>

      <TouchKeyboard mode={kbMode} onKey={handleKeyboardKey} />
    </div>
  );
}
