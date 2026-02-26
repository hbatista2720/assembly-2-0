"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

type Props = {
  value: string; // formato "YYYY-MM-DDTHH:mm"
  onChange: (value: string) => void;
  minDate?: string; // formato "YYYY-MM-DDTHH:mm" o vacío
  placeholder?: string;
  id?: string;
  disabled?: boolean;
};

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const WEEKDAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export default function DateTimePickerPopup({
  value,
  onChange,
  minDate = "",
  placeholder = "Seleccionar fecha y hora",
  id,
  disabled = false,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (value) {
      const d = new Date(value);
      return isNaN(d.getTime()) ? new Date() : d;
    }
    if (minDate) {
      const d = new Date(minDate);
      return isNaN(d.getTime()) ? new Date() : d;
    }
    return new Date();
  });
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const [hour, setHour] = useState(() => {
    if (value) {
      const d = new Date(value);
      return isNaN(d.getTime()) ? 18 : d.getHours();
    }
    return 18;
  });
  const [minute, setMinute] = useState(() => {
    if (value) {
      const d = new Date(value);
      return isNaN(d.getTime()) ? 0 : d.getMinutes();
    }
    return 0;
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const minDateObj = minDate ? new Date(minDate) : null;

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  // Al abrir, mostrar el mes de la fecha seleccionada o de la fecha mínima
  useEffect(() => {
    if (isOpen) {
      if (value) {
        const d = new Date(value);
        if (!isNaN(d.getTime())) setViewDate(d);
      } else if (minDate) {
        const d = new Date(minDate);
        if (!isNaN(d.getTime())) setViewDate(d);
      }
    }
  }, [isOpen, value, minDate]);

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setSelectedDate(d);
        setViewDate(d);
        setHour(d.getHours());
        setMinute(d.getMinutes());
      }
    } else {
      setSelectedDate(null);
      if (minDate) {
        const d = new Date(minDate);
        if (!isNaN(d.getTime())) setViewDate(d);
      }
    }
  }, [value, minDate]);

  // Al abrir el popup, centrar la vista en la fecha actual o mínima
  useEffect(() => {
    if (isOpen) {
      if (value) {
        const d = new Date(value);
        if (!isNaN(d.getTime())) setViewDate(d);
      } else if (minDate) {
        const d = new Date(minDate);
        if (!isNaN(d.getTime())) setViewDate(d);
      }
    }
  }, [isOpen, value, minDate]);

  const toISOString = (d: Date, h: number, m: number): string => {
    const copy = new Date(d);
    copy.setHours(h, m, 0, 0);
    return copy.toISOString().slice(0, 16);
  };

  const isDayDisabled = (day: Date): boolean => {
    if (!minDateObj) return false;
    const d = new Date(day);
    d.setHours(0, 0, 0, 0);
    const min = new Date(minDateObj);
    min.setHours(0, 0, 0, 0);
    return d < min;
  };

  const handleSelectDay = (day: Date) => {
    if (isDayDisabled(day)) return;
    setSelectedDate(day);
  };

  const handleApply = () => {
    let d = selectedDate;
    if (!d && minDateObj) d = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), minDateObj.getDate());
    if (!d) d = new Date();

    if (minDateObj) {
      const selD = new Date(d);
      selD.setHours(hour, minute, 0, 0);
      if (selD < minDateObj) {
        onChange(minDate);
        setIsOpen(false);
        return;
      }
    }
    onChange(toISOString(d, hour, minute));
    setIsOpen(false);
  };

  const displayValue = value
    ? new Date(value).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "";

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPad = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < startPad; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < days.length; i += 7) rows.push(days.slice(i, i + 7));

  const hourOptions = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  // Posición fixed para que el popup sea visible (no se corte con overflow)
  const [popupPos, setPopupPos] = useState<{ top: number; left: number; width: number }>({ top: 0, left: 0, width: 320 });
  useLayoutEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPopupPos({
      top: rect.bottom + 8,
      left: rect.left,
      width: Math.max(320, rect.width),
    });
  }, [isOpen]);

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((o) => !o)}
        style={{
          width: "100%",
          padding: "10px 12px",
          borderRadius: "8px",
          border: "1px solid rgba(148,163,184,0.3)",
          background: "rgba(15,23,42,0.6)",
          color: displayValue ? "#e2e8f0" : "#64748b",
          fontSize: "14px",
          textAlign: "left",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span>{displayValue || placeholder}</span>
        <span style={{ opacity: 0.7 }}>📅</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-label="Seleccionar fecha y hora"
          style={{
            position: "fixed",
            top: popupPos.top,
            left: popupPos.left,
            minWidth: popupPos.width,
            zIndex: 10000,
            background: "linear-gradient(160deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.98))",
            border: "1px solid rgba(148,163,184,0.3)",
            borderRadius: "12px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
            padding: "16px",
          }}
        >
          {/* Navegación mes/año */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              style={{ padding: "6px 12px", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", borderRadius: "8px", color: "#a5b4fc", cursor: "pointer", fontSize: "14px" }}
            >
              ←
            </button>
            <span style={{ fontWeight: 600, color: "#e2e8f0", fontSize: "15px" }}>
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              style={{ padding: "6px 12px", background: "rgba(99,102,241,0.2)", border: "1px solid rgba(99,102,241,0.4)", borderRadius: "8px", color: "#a5b4fc", cursor: "pointer", fontSize: "14px" }}
            >
              →
            </button>
          </div>

          {/* Encabezados días */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
            {WEEKDAYS.map((w) => (
              <div key={w} style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#94a3b8" }}>
                {w}
              </div>
            ))}
          </div>

          {/* Grilla de días */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {rows.map((row, ri) => (
              <div key={ri} style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                {row.map((day, di) => {
                  if (day === null) return <div key={di} />;
                  const d = new Date(year, month, day);
                  const disabled = isDayDisabled(d);
                  const isSelected =
                    selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === month && selectedDate.getFullYear() === year;
                  const isToday =
                    new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
                  return (
                    <button
                      key={di}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleSelectDay(d)}
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        maxWidth: "40px",
                        borderRadius: "8px",
                        border: "none",
                        background: disabled ? "transparent" : isSelected ? "rgba(99,102,241,0.6)" : isToday ? "rgba(99,102,241,0.2)" : "rgba(51,65,85,0.5)",
                        color: disabled ? "#475569" : isSelected ? "#fff" : "#e2e8f0",
                        cursor: disabled ? "not-allowed" : "pointer",
                        fontSize: "14px",
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Hora y minuto */}
          <div style={{ marginTop: "16px", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#94a3b8" }}>
              Hora:
              <select
                value={hour}
                onChange={(e) => setHour(parseInt(e.target.value, 10))}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(148,163,184,0.3)",
                  background: "rgba(15,23,42,0.8)",
                  color: "#e2e8f0",
                  fontSize: "14px",
                }}
              >
                {hourOptions.map((h) => (
                  <option key={h} value={h}>
                    {String(h).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#94a3b8" }}>
              Min:
              <select
                value={minute}
                onChange={(e) => setMinute(parseInt(e.target.value, 10))}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  border: "1px solid rgba(148,163,184,0.3)",
                  background: "rgba(15,23,42,0.8)",
                  color: "#e2e8f0",
                  fontSize: "14px",
                }}
              >
                {minuteOptions.map((m) => (
                  <option key={m} value={m}>
                    {String(m).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={handleApply}
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "16px", borderRadius: "8px", padding: "10px" }}
          >
            Aplicar fecha y hora
          </button>
        </div>
      )}
    </div>
  );
}
