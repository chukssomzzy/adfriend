import React, { useState, FormEvent } from "react";
import { saveReminders } from "@/utils/saveReminders";
import type { ReminderInput } from "@/shared/types";

interface ReminderFormProps {
  setShowForm: (value: boolean) => void;
  showForm: boolean;
  onReminderSaved: () => void;
}

const daysOfWeek: string[] = ["M", "T", "W", "TH", "FR", "SA", "SU"];

/**
 * Form component for creating and editing reminders.
 * @param props - Component props: setShowForm, showForm, onReminderSaved.
 * @returns The rendered ReminderForm component.
 */
const ReminderForm: React.FC<ReminderFormProps> = ({
  setShowForm,
  showForm,
  onReminderSaved,
}: ReminderFormProps): JSX.Element | null => {
  const [text, setText] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  /**
   * Toggles the selection of a day for reminder repetition.
   * @param day - The day string (e.g., "M", "T") to toggle.
   */
  const toggleDay = (day: string): void => {
    setSelectedDays((prevDays) => {
      const newDays = new Set(prevDays);
      if (newDays.has(day)) {
        newDays.delete(day);
      } else {
        newDays.add(day);
      }
      return newDays;
    });
  };

  /**
   * Handles the submission of the reminder form.
   * @param e - The form event.
   */
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Reminder text cannot be empty.");
      return;
    }
    if (!time) {
      setError("Please select a time for the reminder.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    const reminderToSave: ReminderInput = {
      text: text.trim(),
      remindAt: time,
      days: Array.from(selectedDays),
    };

    try {
      await saveReminders(reminderToSave);
      setText("");
      setTime("");
      setSelectedDays(new Set());
      setShowForm(false);
      onReminderSaved();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      console.error("Failed to save reminder:", errorMessage);
      setError(`Failed to save reminder: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showForm) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={() => setShowForm(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-form-title"
    >
      <div
        className="flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="reminder-form-title"
          className="mb-2 text-center text-xl font-bold text-[#545E31]"
        >
          New Reminder
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reminderText" className="sr-only">
              Reminder Text
            </label>
            <input
              id="reminderText"
              type="text"
              placeholder="Enter reminder..."
              className="w-full border-b-2 border-gray-300 p-2 text-lg text-[#545E31] outline-none focus:border-[#545E31]"
              value={text}
              onChange={(e) => setText(e.target.value)}
              required
              aria-required="true"
            />
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
            <div>
              <p className="mb-1 font-semibold text-[#545E31]">Time</p>
              <label htmlFor="reminderTime" className="sr-only">
                Reminder Time
              </label>
              <input
                id="reminderTime"
                type="time"
                className="w-full appearance-none rounded border-2 border-gray-300 p-2 text-lg text-[#545E31] outline-none focus:border-[#545E31] sm:w-auto"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                aria-required="true"
              />
            </div>
            <div className="sm:text-right">
              <p className="mb-1 font-semibold text-[#545E31]">Repeat</p>
              <div
                className="mt-1 grid grid-cols-4 items-center justify-items-center gap-1.5 sm:grid-cols-7"
                role="group"
                aria-label="Repeat days"
              >
                {daysOfWeek.map((day) => (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`focus:ring-opacity-50 rounded-md border border-[#545E31] px-2 py-1 text-sm font-medium text-[#545E31] transition-colors hover:bg-[#e9ede0] focus:ring-2 focus:ring-[#545E31] focus:outline-none ${
                      selectedDays.has(day)
                        ? "bg-[#545E31] text-white"
                        : "bg-white"
                    }`}
                    aria-pressed={selectedDays.has(day)}
                    aria-label={`Repeat on ${day}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <p role="alert" className="mt-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex w-full justify-end gap-3 pt-2">
            <button
              type="button"
              className="cursor-pointer rounded-lg border border-gray-400 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-gray-400 focus:outline-none"
              onClick={() => setShowForm(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="focus:ring-opacity-50 cursor-pointer rounded-lg bg-[#545E31] px-6 py-2 font-medium text-white transition-colors hover:bg-[#6C783F] focus:ring-2 focus:ring-[#545E31] focus:outline-none"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Reminder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderForm;
