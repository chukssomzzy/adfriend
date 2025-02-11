import React, { useState } from "react";
import { FaChevronLeft } from "react-icons/fa6";
import { LuCirclePlus } from "react-icons/lu";
import { LiaPauseCircleSolid } from "react-icons/lia";
import { GoTrash } from "react-icons/go";
import { IoSync } from "react-icons/io5";

const DailyReminderData = [
    { text: "Turn in EGT essay", time: "3:30PM" },
    { text: "Meditate for 2 hours", time: "5:30AM" },
    { text: "Review form Submissions", time: "10:30AM" },
    { text: "Attend A.Js meeting", time: "3:45PM", repeat: true },
  ]


const DailyReminder: React.FC = () => {

    const [showForm, setShowForm] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);


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
          <FaChevronLeft className="cursor-pointer text-[#545E31] text-2xl" />
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
          {DailyReminderData.map((reminder, index) => (
            <div key={index} className="flex max-w-md border border-[#545E31] space-x-4 justify-between items-center p-4 rounded-lg shadow-[2px_2px_2px_2px_#545E31]">
              <div>
                <div className="font-bold">{reminder.text}</div>
                <div className="text-sm">{reminder.time}</div>
              </div>
              <div className="flex gap-3 items-center">
                
                {reminder.repeat ? <IoSync className="cursor-pointer text-2xl" /> : <LiaPauseCircleSolid className="cursor-pointer text-3xl" />}
                <GoTrash className="cursor-pointer text-2xl" onClick={() => setShowDeleteModal(true)} />

              </div>
            </div>
          ))}
        </div>
        </div>
      </div>
      {/* </div> */}

            {/* Pop-up Form */}
            {showForm && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 p-4"
        onClick={() => setShowForm(false)}
        >
          <div className="flex flex-col gap-6 bg-white p-6 rounded-lg shadow-lg max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-center text-[#545E31] mb-4">
              New Reminder
            </h2>

            {/* Reminder Input */}
            <input 
              type="text" 
              placeholder="Enter reminder..." 
              className="w-full border-b-2 border-gray-400 p-2 outline-none text-lg"
            />

            {/* Timer & Repeat */}
            <div className="flex justify-between mt-4">
              <div>
                <p className="font-bold text-[#545E31]">Timer</p>
                <input type="time" className="border-b-2 border-gray-400 text-2xl text-[#545E31] outline-none" />
              </div>
              <div>
                <p className="font-bold text-[#545E31]">Repeat</p>
                <div className="grid grid-cols-4 gap-2 justify-items-center items-center max-w-xs mx-auto mt-2">
                  {["M", "T", "W", "TH", "FR", "SA", "SU"].map((day, index) => (
                    <button 
                      key={index} 
                      className="border-2 border-[#545E31] px-1 rounded-lg text-[#545E31] hover:bg-[#545E31] hover:text-white transition"
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Button */}
            <div className="flex w-full justify-end">
            <button className="px-6 bg-[#545E31] text-white py-1 rounded-lg mt-4 cursor-pointer">
              Add
            </button>
            </div>
          </div>
        </div>
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
