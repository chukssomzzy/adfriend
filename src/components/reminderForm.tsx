import { useState } from "react";
import { saveReminders } from "../utils/saveReminders"; // Import only the function needed

interface ReminderProp {
  setShowForm: (value: boolean) => void;
  showForm: boolean;
}

const ReminderForm = ({ setShowForm, showForm }: ReminderProp) => {
  const [text, setText] = useState("");
  const [time, setTime] = useState("");
  const [days, setDays] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  const updateDays = (day: string): void => {
    setDays((prevDays) => {
      const newDays = new Set(prevDays);
      if (newDays.has(day)) newDays.delete(day);
      else newDays.add(day);
      return newDays;
    });
  };

  /**
   * Handles the addition of a new reminder.
   * Validates input, saves the reminder using the util function,
   * and resets the form or shows an error.
   */
  const handleAdd = async () => {
    if (!text) {
      setError("Reminder text is required");
      return;
    }

    if (!time) {
      setError("Time is required");
      return;
    }

    setError("");
    const reminderToSave = {
      text: text,
      remindAt: time,
      days: days,
    };

    try {
      await saveReminders(reminderToSave);
      setText("");
      setTime("");
      setDays(new Set());
      setShowForm(false);
    } catch (e) {
      console.error("Failed to save reminder:", e);
      setError("Failed to save reminder. Please try again.");
    }
  };

  return (
    <>
      {showForm && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-center text-xl font-bold text-[#545E31]">
              New Reminder
            </h2>

            {/* Reminder Input */}
            <input
              type="text"
              placeholder="Enter reminder..."
              className="w-full border-b-2 border-gray-400 p-2 text-lg text-[#545E31] outline-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            {/* Timer & Repeat */}
            <div className="mt-4 flex justify-between">
              <div>
                <p className="font-bold text-[#545E31]">Timer</p>
                <input
                  type="time"
                  className="border-b-2 border-gray-400 text-2xl text-[#545E31] outline-none"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
              <div>
                <p className="font-bold text-[#545E31]">Repeat</p>
                <div className="mx-auto mt-2 grid max-w-xs grid-cols-4 items-center justify-items-center gap-2">
                  {["M", "T", "W", "TH", "FR", "SA", "SU"].map((day, index) => (
                    <button
                      key={index}
                      value={day}
                      onClick={() => updateDays(day)}
                      className={`rounded-lg border-1 border-[#545E31] px-1 text-[#545E31] transition hover:bg-[#545E31] hover:text-white ${
                        days.has(day) ? "bg-[#545E31] text-white" : ""
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

            {/* Add Button */}
            <div className="flex w-full justify-end">
              <button
                className="mt-4 cursor-pointer rounded-lg bg-[#545E31] px-6 py-1 text-white"
                onClick={handleAdd}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReminderForm;
