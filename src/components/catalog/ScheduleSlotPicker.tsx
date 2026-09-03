"use client";

import React, { useState } from "react";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";
import type { ScheduleSlot } from "@/types/domain";

export interface SlotItem {
  id?: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count?: number;
}

interface ScheduleSlotPickerProps {
  slots: SlotItem[];
  onChange: (slots: SlotItem[]) => void;
  readOnly?: boolean;
}

export function ScheduleSlotPicker({
  slots,
  onChange,
  readOnly = false,
}: ScheduleSlotPickerProps) {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("19:00");
  const [endTime, setEndTime] = useState("20:30");
  const [capacity, setCapacity] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const handleAddSlot = () => {
    setError(null);
    if (!date) {
      setError("Silakan pilih tanggal sesi");
      return;
    }
    if (!startTime || !endTime) {
      setError("Jam mulai dan jam selesai harus diisi");
      return;
    }
    if (startTime >= endTime) {
      setError("Jam selesai harus lebih akhir dari jam mulai");
      return;
    }
    if (capacity < 1) {
      setError("Kapasitas minimal 1 peserta");
      return;
    }

    try {
      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(`${date}T${endTime}:00`);

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        setError("Format waktu tidak valid");
        return;
      }

      const newSlot: SlotItem = {
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        capacity,
      };

      onChange([...slots, newSlot]);
      setDate("");
    } catch {
      setError("Gagal membuat slot waktu");
    }
  };

  const handleRemoveSlot = (index: number) => {
    onChange(slots.filter((_, i) => i !== index));
  };

  const formatSlotTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return isoString;
    }
  };

  const formatSlotDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("id-ID", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/40 space-y-3">
          <p className="text-xs font-bold text-on-surface">Tambah Slot Jadwal Sesi Live</p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                Tanggal Sesi
              </label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-surface text-xs text-on-surface border border-outline-variant/40 rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                Jam Mulai
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-surface text-xs text-on-surface border border-outline-variant/40 rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                Jam Selesai
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-surface text-xs text-on-surface border border-outline-variant/40 rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-on-surface-variant mb-1">
                Kapasitas (Orang)
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={capacity}
                onChange={(e) => setCapacity(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-surface text-xs text-on-surface border border-outline-variant/40 rounded-lg focus:ring-2 focus:ring-primary/20 focus:outline-hidden"
              />
            </div>
          </div>

          {error && <p className="text-xs text-error font-medium">{error}</p>}

          <button
            type="button"
            onClick={handleAddSlot}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs"
          >
            <AddIcon sx={{ fontSize: 16 }} />
            <span>Tambahkan ke Jadwal</span>
          </button>
        </div>
      )}

      {/* List of slots */}
      {slots.length === 0 ? (
        <div className="p-4 text-center border border-dashed border-outline-variant/50 rounded-xl">
          <CalendarMonthOutlinedIcon sx={{ fontSize: 28 }} className="text-outline mx-auto mb-1" />
          <p className="text-xs text-on-surface-variant">Belum ada slot jadwal yang ditambahkan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-bold text-on-surface">
            Daftar Slot Tersedia ({slots.length} sesi):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {slots.map((slot, index) => (
              <div
                key={slot.id || index}
                className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 overflow-hidden">
                  <div className="flex items-center gap-1.5 font-bold text-on-surface">
                    <CalendarMonthOutlinedIcon sx={{ fontSize: 16 }} className="text-primary shrink-0" />
                    <span>{formatSlotDate(slot.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-on-surface-variant text-[11px]">
                    <span className="flex items-center gap-1">
                      <AccessTimeOutlinedIcon sx={{ fontSize: 14 }} />
                      {formatSlotTime(slot.start_time)} - {formatSlotTime(slot.end_time)}
                    </span>
                    <span className="flex items-center gap-1">
                      <GroupOutlinedIcon sx={{ fontSize: 14 }} />
                      {slot.booked_count !== undefined ? `${slot.booked_count}/` : ""}
                      {slot.capacity} kuota
                    </span>
                  </div>
                </div>

                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(index)}
                    className="p-1 text-on-surface-variant hover:text-error hover:bg-surface-variant rounded-lg transition-colors shrink-0"
                    title="Hapus slot"
                  >
                    <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
