import React, { useEffect, useState } from "react";
import { FaChevronLeft } from "react-icons/fa6";
import { LuCirclePlus } from "react-icons/lu";
import { LiaPauseCircleSolid } from "react-icons/lia";
import { GoTrash } from "react-icons/go";
import { IoSync } from "react-icons/io5";
import ReminderForm from "../components/reminderForm";
import { deleteReminder, getReminders, pauseReminder, Reminder } from "../utils/saveReminders";
import { Link } from "react-router-dom";
import { customSortDays } from "../utils/helpers";


const DailyReminder: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dailyReminderData, setDailyReminderData] = useState<Array<Reminder>>([])
  const [remindId, setRemindId] = useState<number|null>(null);

  
  const handleDelete = async () => {
    if (remindId)
        await deleteReminder(remindId);
    setRemindId(null);
  }

  const handlePause = async (remindId: number|null) => {
    setRemindId(remindId);
    if (remindId)
        await pauseReminder(remindId)
    setRemindId(null);
  }

  useEffect(() => {
    getReminders().then(
        (reminders) => setDailyReminderData(reminders.sort((a: Reminder, b: Reminder): number => {
            if (a.id && b.id)
                return (b.id - a.id); 
            return (0);
        })) 
    );

  }, [showForm, remindId])

    
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-white p-4">
     <div className="w-full md:min-w-md p-4 flex justify-center">
        <div className="bg-[#545E31] text-white text-2xl font-bold py-4 px-6 rounded-lg w-full md:max-w-md shadow-md text-center">
        Ad-friend
      </div>
      </div>
      <div className="w-full mt-4 p-4">
        <div className="w-full flex justify-center">
        <div className="w-full md:max-w-md flex items-center">
        <div className="flex w-full flex-col gap-4 justify-between text-xl font-bold mb-4">
          <Link 
            to="/"
            >
          <FaChevronLeft className="cursor-pointer text-[#545E31] text-2xl" />
            </Link>
          <span className="text-[#545E31] text-center">Daily Reminders</span>
          <div className="flex w-full justify-end">
          <LuCirclePlus className="cursor-pointer text-[#545E31] text-3xl" 
          onClick={() => setShowForm(true)}
          />
          </div>
        </div>
        </div>
        </div>
        <div className="flex justify-center">
        <div className="space-y-4 w-full flex flex-col max-w-md text-[#545E31]">
            {dailyReminderData.map((reminder: Reminder) => (
            <div key={reminder.id} className="flex max-w-md border border-[#545E31] space-x-4 justify-between items-center p-4 rounded-lg shadow-[2px_2px_2px_2px_#545E31]">
              <div>
                <div className="font-bold">{reminder.text}</div>
                <div className="flex flex-row space-x-2">
                    <div className="text-sm">{reminder.remindAt}</div>
                    {customSortDays(Array.from(reminder.days)).map((day, index) => (
                    <button
                      key={index}
                      value={day}
                      className={"border-1 border-[#545E31] px-0.5 rounded-lg transition  bg-[#545E31] text-white"}
                    >
                      {day}
                    </button>
                  ))} 
                </div>
              </div>
              <div className="flex gap-3 items-center">
                {reminder.isPaused ? <IoSync className="cursor-pointer text-2xl" onClick={() => handlePause(reminder.id ?? null)}/> : <LiaPauseCircleSolid 
                    className="cursor-pointer text-3xl" onClick={() => handlePause(reminder.id ?? null)}/>}
                <GoTrash className="cursor-pointer text-2xl" onClick={() => {
                    setRemindId(reminder.id ?? null);
                    setShowDeleteModal(true);
                }
                }/>

              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
      {/* </div> */}

        {showForm && (
            <ReminderForm setShowForm={setShowForm} showForm={showForm}/>
        )}

        {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50 p-4"
        onClick={() => setShowDeleteModal(false)}
        >
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
            >
            <h2 className="text-xl font-bold text-center text-[#545E31] mb-4">
                Delete this reminder?
            </h2>
            <div className="flex justify-center gap-4">
                <button
                className="bg-[#545E31] text-white px-6 py-2 rounded-lg font-bold cursor-pointer"
                onClick={() => setShowDeleteModal(false)}
                >
                Cancel
                </button>
                <button
                className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold cursor-pointer"
                onClick={() => {
                    handleDelete()
                    setShowDeleteModal(false);
                }}
                >
                Yes
                </button>
            </div>
            </div>
        </div>
        )}

    </div>
  );
}

export default DailyReminder
