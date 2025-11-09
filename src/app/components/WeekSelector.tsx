"use client";

import { useState } from "react";

interface DayTimeSlot {
  start: string;
  end: string;
}

interface WeekSchedule {
  [key: string]: {
    enabled: boolean;
    slots: DayTimeSlot[];
  };
}

const DAYS = [
  { key: "mon", label: "Segunda" },
  { key: "tue", label: "Terça" },
  { key: "wed", label: "Quarta" },
  { key: "thu", label: "Quinta" },
  { key: "fri", label: "Sexta" },
  { key: "sat", label: "Sábado" },
  { key: "sun", label: "Domingo" },
];

interface WeekScheduleSelectorProps {
  value: WeekSchedule;
  onChange: (schedule: WeekSchedule) => void;
}

export function WeekScheduleSelector({
  value,
  onChange,
}: WeekScheduleSelectorProps) {
  const toggleDay = (dayKey: string) => {
    const newSchedule = { ...(value || {}) };
    if (!newSchedule[dayKey]) {
      newSchedule[dayKey] = {
        enabled: true,
        slots: [{ start: "08:00", end: "18:00" }],
      };
    } else {
      newSchedule[dayKey].enabled = !newSchedule[dayKey].enabled;
    }
    onChange(newSchedule);
  };

  const updateSlot = (
    dayKey: string,
    slotIndex: number,
    field: "start" | "end",
    slotValue: string
  ) => {
    const newSchedule = { ...(value || {}) };
    if (newSchedule[dayKey]?.slots[slotIndex]) {
      newSchedule[dayKey].slots[slotIndex][field] = slotValue;
      onChange(newSchedule);
    }
  };

  const addSlot = (dayKey: string) => {
    const newSchedule = { ...value };
    if (newSchedule[dayKey]) {
      newSchedule[dayKey].slots.push({ start: "08:00", end: "18:00" });
      onChange(newSchedule);
    }
  };

  const removeSlot = (dayKey: string, slotIndex: number) => {
    const newSchedule = { ...value };
    if (newSchedule[dayKey]?.slots.length > 1) {
      newSchedule[dayKey].slots.splice(slotIndex, 1);
      onChange(newSchedule);
    }
  };

  return (
    <div className="space-y-3">
      {DAYS.map((day) => {
        const daySchedule = value[day.key];
        const isEnabled = daySchedule?.enabled || false;

        return (
          <div
            key={day.key}
            className={`border rounded-lg p-4 transition-all ${
              isEnabled ? "border-primary-300 bg-primary-50" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => toggleDay(day.key)}
                  className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="font-medium text-gray-900">{day.label}</span>
              </label>
            </div>

            {isEnabled && daySchedule?.slots && (
              <div className="space-y-2 pl-8">
                {daySchedule.slots.map((slot, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) =>
                        updateSlot(day.key, index, "start", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <span className="text-gray-500">até</span>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) =>
                        updateSlot(day.key, index, "end", e.target.value)
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {daySchedule.slots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSlot(day.key, index)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addSlot(day.key)}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  + Adicionar horário
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
