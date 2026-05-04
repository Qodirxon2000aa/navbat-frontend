/**
 * Kiosk sensor ekran: pastda qotgan katta tugmalar.
 * mode: "latin" — ism/familiya; "numeric" — telefon raqamlari.
 */
export const KB_BACK = "BACK";
export const KB_SPACE = "SPACE";

const latinLayout = [
  { keys: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"] },
  { keys: ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"] },
  { keys: ["A", "S", "D", "F", "G", "H", "J", "K", "L"] },
  { keys: ["Z", "X", "C", "V", "B", "N", "M", "-", "'"] },
  { keys: [KB_BACK, KB_SPACE], columns: "minmax(0,1fr) minmax(0,4fr)" }
];

const numericLayout = [
  { keys: ["1", "2", "3"] },
  { keys: ["4", "5", "6"] },
  { keys: ["7", "8", "9"] },
  { keys: [KB_BACK, "0", KB_BACK], columns: "minmax(0,1fr) minmax(0,1.2fr) minmax(0,1fr)" }
];

export default function TouchKeyboard({ mode, onKey }) {
  const layout = mode === "numeric" ? numericLayout : latinLayout;

  return (
    <div
      className="touch-keyboard-root fixed bottom-0 left-0 right-0 z-[200] border-t border-white/10 bg-[#050508]/97 backdrop-blur-md pb-[max(10px,env(safe-area-inset-bottom))] shadow-[0_-16px_48px_rgba(0,0,0,0.6)]"
      onMouseDown={(e) => e.preventDefault()}
    >
      <p className="text-center text-[clamp(0.65rem,1.6vw,0.85rem)] font-bold uppercase tracking-[0.22em] text-white/40 py-2 m-0">
        {mode === "numeric" ? "Raqamlar" : "Klaviatura"}
      </p>
      <div className="mx-auto w-full max-w-[min(100vw,1200px)] px-3 sm:px-5 pb-3 flex flex-col gap-2 sm:gap-2.5">
        {layout.map((row, ri) => (
          <div
            key={ri}
            className="grid gap-2 sm:gap-2.5 w-full"
            style={{
              gridTemplateColumns: row.columns || `repeat(${row.keys.length}, minmax(0, 1fr))`
            }}
          >
            {row.keys.map((key, ki) => {
              if (key === KB_BACK) {
                return (
                  <button
                    key={`bk-${ri}-${ki}`}
                    type="button"
                    className="touch-kb-key touch-kb-key--wide bg-white/10 text-white border border-white/15 rounded-xl font-bold active:bg-red-500/30 active:border-red-400/40"
                    onClick={() => onKey(KB_BACK)}
                  >
                    ←
                  </button>
                );
              }
              if (key === KB_SPACE) {
                return (
                  <button
                    key={`${ri}-sp`}
                    type="button"
                    className="touch-kb-key touch-kb-key--space bg-white/8 text-white/90 border border-white/12 rounded-xl font-bold active:bg-teal-500/25"
                    onClick={() => onKey(KB_SPACE)}
                  >
                    Bo‘shliq
                  </button>
                );
              }
              return (
                <button
                  key={`${ri}-${ki}-${key}`}
                  type="button"
                  className="touch-kb-key bg-white/12 text-white border border-white/15 rounded-xl font-black uppercase active:bg-teal-500/35 active:border-teal-400/50 active:text-black"
                  onClick={() => onKey(key)}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
