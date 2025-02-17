import { useState } from 'react';
import {saveReminders, Reminder} from '../utils/saveReminders';

interface ReminderProp {
  setShowForm: (value: boolean) => void;
  showForm: boolean;
}


const ReminderForm = ({ setShowForm, showForm }: ReminderProp) => {
  const [text, setText] = useState('');
  const [time, setTime] = useState('');
  const [days, setDays] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  const updateDays = (day: string): void => {
    setDays(prevDays => {
      const newDays = new Set(prevDays); 
      if (newDays.has(day)) 
        newDays.delete(day)
      else 
        newDays.add(day);
      return newDays;
    })
  }


  const handleAdd = async () => {
    const reminder: Reminder = { days: days, remindAt: time, text: text };

    if (!text) {
      setError('Reminder text is required');
      return;
    }

    if (!time) {
      setError('Time is required');
      return;
    }

    reminder.createdAt = new Date()
    await saveReminders(reminder)
    setText('');
    setTime('');
    setDays(new Set());
    setError('');
    setShowForm(false);
  };

  return (
    <>
    {showForm && (
      <div
      className="fixed inset-0 flex justify-center items-center bg-black/50 p-4"
      onClick={() => setShowForm(false)}
      >
      <div
      className="flex flex-col gap-6 bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
      onClick={(e) => e.stopPropagation()}
      >
      <h2 className="text-xl font-bold text-center text-[#545E31] mb-4">
      New Reminder
      </h2>

      {/* Reminder Input */}
      <input
      type="text"
      placeholder="Enter reminder..."
      className="w-full border-b-2 border-gray-400 p-2 outline-none text-lg text-[#545E31]"
      value={text}
      onChange={(e) => setText(e.target.value)}
      />

      {/* Timer & Repeat */}
      <div className="flex justify-between mt-4">
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
      <div className="grid grid-cols-4 gap-2 justify-items-center items-center max-w-xs mx-auto mt-2">
      {["M", "T", "W", "TH", "FR", "SA", "SU"].map((day, index) => (
        <button
        key={index}
        value={day}
        onClick={() => updateDays(day)}
        className={`border-1 border-[#545E31] px-1 rounded-lg text-[#545E31] hover:bg-[#545E31] hover:text-white transition ${
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
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

      {/* Add Button */}
      <div className="flex w-full justify-end">
      <button
      className="px-6 bg-[#545E31] text-white py-1 rounded-lg mt-4 cursor-pointer"
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
