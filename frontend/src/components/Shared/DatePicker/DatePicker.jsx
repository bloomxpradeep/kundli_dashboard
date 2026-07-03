import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function parseDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplay(str) {
  if (!str) return "";
  const d = parseDate(str);
  if (!d) return "";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function toYMD(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function DatePicker({ value, onChange, placeholder = "Pick date", minDate, maxDate, align = "left" }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const selected = parseDate(value);
  const [viewYear, setViewYear] = useState(selected?.getFullYear() || today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth() ?? today.getMonth());
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevMonthDays - i, currentMonth: false, date: new Date(viewYear, viewMonth - 1, prevMonthDays - i) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true, date: new Date(viewYear, viewMonth, d) });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, currentMonth: false, date: new Date(viewYear, viewMonth + 1, d) });
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDate = (date) => { onChange(toYMD(date)); setOpen(false); };
  const clear = (e) => { e.stopPropagation(); onChange(""); };

  const isSelected = (date) => value && toYMD(date) === value;
  const isToday = (date) => toYMD(date) === toYMD(today);
  const isDisabled = (date) => {
    if (minDate && date < parseDate(minDate)) return true;
    if (maxDate && date > parseDate(maxDate)) return true;
    return false;
  };

  // Dropdown opens left-aligned or right-aligned to avoid edge overflow
  const dropdownPos = align === "right" ? "right-0" : "left-0";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-[7px] rounded-lg border text-xs transition cursor-pointer whitespace-nowrap ${value ? "bg-neutral-950 text-white border-neutral-950" : "bg-neutral-50 border-border-subtle text-text-muted hover:bg-neutral-100 hover:border-neutral-300"}`}
      >
        <Calendar size={12} className={value ? "text-white opacity-80" : "text-text-muted"} />
        <span className={value ? "text-white font-medium" : "text-text-muted"}>
          {value ? formatDisplay(value) : placeholder}
        </span>
        {value && (
          <span onClick={clear} className="ml-0.5 hover:bg-white/20 rounded p-0.5 cursor-pointer transition flex items-center">
            <X size={10} />
          </span>
        )}
      </button>

      {open && (
        <div className={`absolute z-50 top-full mt-2 ${dropdownPos} bg-white border border-border-subtle rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-4 w-[252px]`}>
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="w-7 h-7 flex items-center justify-center hover:bg-neutral-100 rounded-lg transition text-text-muted hover:text-text-main border-none bg-transparent cursor-pointer">
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-semibold text-text-main">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="w-7 h-7 flex items-center justify-center hover:bg-neutral-100 rounded-lg transition text-text-muted hover:text-text-main border-none bg-transparent cursor-pointer">
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-semibold text-text-muted py-1">{d}</div>
            ))}
          </div>

          {/* Date cells */}
          <div className="grid grid-cols-7">
            {cells.map(({ day, currentMonth, date }, idx) => {
              const sel = isSelected(date);
              const tod = isToday(date);
              const dis = isDisabled(date);
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={dis}
                  onClick={() => !dis && selectDate(date)}
                  className={[
                    "text-center text-[11px] h-8 w-full rounded-lg border-none transition font-medium",
                    dis ? "opacity-25 cursor-not-allowed" : "cursor-pointer",
                    sel ? "bg-neutral-950 text-white" : "",
                    !sel && tod ? "bg-neutral-100 text-neutral-950 font-bold" : "",
                    !sel && !tod && currentMonth && !dis ? "text-text-main hover:bg-neutral-100" : "",
                    !sel && !currentMonth ? "text-neutral-300" : "",
                  ].join(" ")}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-border-subtle">
            <button type="button" onClick={() => { onChange(""); setOpen(false); }} className="text-[11px] text-text-muted hover:text-red-500 transition font-medium border-none bg-transparent cursor-pointer px-1">
              Clear
            </button>
            <button type="button" onClick={() => selectDate(today)} className="text-[11px] text-neutral-950 hover:underline transition font-semibold border-none bg-transparent cursor-pointer px-1">
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
