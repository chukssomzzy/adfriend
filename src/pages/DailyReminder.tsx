import React, { useEffect, useState } from "react";
import { FaChevronLeft } from "react-icons/fa6";
import { LuCirclePlus } from "react-icons/lu";
import { LiaPauseCircleSolid } from "react-icons/lia";
import { GoTrash } from "react-icons/go";
import { IoSync } from "react-icons/io5";
import ReminderForm from "../components/reminderForm";
import {
  deleteReminder,
  getReminders,
  pauseReminder,
  Reminder,
} from "../utils/saveReminders";
import { Link } from "react-router-dom";
import { customSortDays } from "../utils/helpers";

const DailyReminder: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [dailyReminderData, setDailyReminderData] = useState<Array<Reminder>>(
    [],
  );
  const [remindId, setRemindId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (remindId) await deleteReminder(remindId);
    setRemindId(null);
  };

  const handlePause = async (remindId: number | null) => {
    setRemindId(remindId);
    if (remindId) await pauseReminder(remindId);
    setRemindId(null);
  };

  useEffect(() => {
    getReminders().then((reminders) =>
      setDailyReminderData(
        reminders.sort((a: Reminder, b: Reminder): number => {
          if (a.id && b.id) return b.id - a.id;
          return 0;
        }),
      ),
    );
  }, [showForm, remindId]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4">
      <div className="flex w-full justify-center p-4 md:min-w-md">
        <div className="w-full rounded-lg bg-[#545E31] px-6 py-4 text-center text-2xl font-bold text-white shadow-md md:max-w-md">
          Ad-friend
        </div>
      </div>
      <div className="mt-4 w-full p-4">
        <div className="flex w-full justify-center">
          <div className="flex w-full items-center md:max-w-md">
            <div className="mb-4 flex w-full flex-col justify-between gap-4 text-xl font-bold">
              <Link to="/">
                <FaChevronLeft className="cursor-pointer text-2xl text-[#545E31]" />
              </Link>
              <span className="text-center text-[#545E31]">
                Daily Reminders
              </span>
              <div className="flex w-full justify-end">
                <LuCirclePlus
                  className="cursor-pointer text-3xl text-[#545E31]"
                  onClick={() => setShowForm(true)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="flex w-full max-w-md flex-col space-y-4 text-[#545E31]">
            {dailyReminderData.map((reminder: Reminder) => (
              <div
                key={reminder.id}
                className="flex max-w-md items-center justify-between space-x-4 rounded-lg border border-[#545E31] p-4 shadow-[2px_2px_2px_2px_#545E31]"
              >
                <div>
                  <div className="font-bold">{reminder.text}</div>
                  <div className="flex flex-row space-x-2">
                    <div className="text-sm">{reminder.remindAt}</div>
                    {customSortDays(Array.from(reminder.days)).map(
                      (day, index) => (
                        <button
                          key={index}
                          value={day}
                          className={
                            "rounded-lg border-1 border-[#545E31] bg-[#545E31] px-0.5 text-white transition"
                          }
                        >
                          {day}
                        </button>
                      ),
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {reminder.isPaused ? (
                    <IoSync
                      className="cursor-pointer text-2xl"
                      onClick={() => handlePause(reminder.id ?? null)}
                    />
                  ) : (
                    <LiaPauseCircleSolid
                      className="cursor-pointer text-3xl"
                      onClick={() => handlePause(reminder.id ?? null)}
                    />
                  )}
                  <GoTrash
                    className="cursor-pointer text-2xl"
                    onClick={() => {
                      setRemindId(reminder.id ?? null);
                      setShowDeleteModal(true);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* </div> */}

      {showForm && (
        <ReminderForm setShowForm={setShowForm} showForm={showForm} />
      )}

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowDeleteModal(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-center text-xl font-bold text-[#545E31]">
              Delete this reminder?
            </h2>
            <div className="flex justify-center gap-4">
              <button
                className="cursor-pointer rounded-lg bg-[#545E31] px-6 py-2 font-bold text-white"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="cursor-pointer rounded-lg bg-red-600 px-6 py-2 font-bold text-white"
                onClick={() => {
                  handleDelete();
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
};

export default DailyReminder;
