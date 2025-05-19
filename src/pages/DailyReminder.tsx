import React, { useEffect, useState, useCallback } from "react";
import { FaChevronLeft } from "react-icons/fa6";
import { LuCirclePlus } from "react-icons/lu";
import { LiaPauseCircleSolid, LiaPlayCircleSolid } from "react-icons/lia";
import { GoTrash } from "react-icons/go";
import ReminderForm from "@/components/reminderForm";
import {
  deleteReminder,
  getReminders,
  pauseReminder,
} from "@/utils/saveReminders";
import type { Reminder } from "@/shared/types";
import { Link } from "react-router-dom";
import { customSortDays } from "@/utils/helpers";

/**
 * Page component for displaying and managing daily reminders.
 * @returns The rendered DailyReminder component.
 */
const DailyReminder: React.FC = (): JSX.Element => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [dailyReminderData, setDailyReminderData] = useState<Reminder[]>([]);
  const [selectedReminderId, setSelectedReminderId] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches reminders from storage and updates the component state.
   */
  const fetchReminders = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const reminders = await getReminders();
      setDailyReminderData(
        reminders.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
      );
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load reminders.";
      console.error("Error fetching reminders:", errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  /**
   * Handles the deletion of a reminder.
   */
  const handleDelete = async (): Promise<void> => {
    if (selectedReminderId) {
      try {
        await deleteReminder(selectedReminderId);
        fetchReminders();
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete reminder.";
        console.error("Error deleting reminder:", errorMessage);
        setError(errorMessage);
      } finally {
        setShowDeleteModal(false);
        setSelectedReminderId(null);
      }
    }
  };

  /**
   * Handles toggling the pause state of a reminder.
   * @param reminderId - The ID of the reminder to toggle.
   */
  const handleTogglePause = async (reminderId: string): Promise<void> => {
    try {
      await pauseReminder(reminderId);
      fetchReminders();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to toggle pause state.";
      console.error("Error pausing/unpausing reminder:", errorMessage);
      setError(errorMessage);
    }
  };

  /**
   * Opens the delete confirmation modal for a specific reminder.
   * @param reminderId - The ID of the reminder to be deleted.
   */
  const openDeleteModal = (reminderId: string): void => {
    setSelectedReminderId(reminderId);
    setShowDeleteModal(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white p-4">
      <header className="sticky top-0 z-10 flex w-full max-w-md justify-center bg-white py-4">
        <div className="w-full rounded-lg bg-[#545E31] px-6 py-4 text-center text-2xl font-bold text-white shadow-md">
          Ad-Friend
        </div>
      </header>

      <main className="mt-4 w-full max-w-md flex-grow p-4">
        <div className="mb-4 flex w-full items-center justify-between">
          <Link to="/" aria-label="Go back to quote page">
            <FaChevronLeft className="cursor-pointer text-2xl text-[#545E31] transition-colors hover:text-[#6C783F]" />
          </Link>
          <h1 className="text-xl font-bold text-[#545E31]">Daily Reminders</h1>
          <button
            onClick={() => setShowForm(true)}
            aria-label="Add new reminder"
            className="focus:outline-none"
          >
            <LuCirclePlus className="cursor-pointer text-3xl text-[#545E31] transition-colors hover:text-[#6C783F]" />
          </button>
        </div>

        {isLoading && (
          <p className="text-center text-[#545E31]">Loading reminders...</p>
        )}
        {error && (
          <p className="text-center text-red-600" role="alert">
            Error: {error}
          </p>
        )}

        {!isLoading && !error && dailyReminderData.length === 0 && (
          <p className="text-center text-gray-600">
            No reminders yet. Add one!
          </p>
        )}

        {!isLoading && !error && dailyReminderData.length > 0 && (
          <div className="space-y-4">
            {dailyReminderData.map((reminder: Reminder) => (
              <article
                key={reminder.id}
                className={`flex max-w-md items-center justify-between space-x-4 rounded-lg border border-[#545E31] p-4 shadow-[2px_2px_2px_2px_#545E31] ${reminder.isPaused ? "opacity-60" : ""}`}
                aria-labelledby={`reminder-text-${reminder.id}`}
              >
                <div className="flex-grow">
                  <h2 id={`reminder-text-${reminder.id}`} className="font-bold">
                    {reminder.text}
                  </h2>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <time dateTime={reminder.remindAt}>
                      {reminder.remindAt}
                    </time>
                    {customSortDays(reminder.days).map((day) => (
                      <span
                        key={day}
                        className="rounded bg-[#545E31] px-1.5 py-0.5 text-xs text-white"
                      >
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <button
                    onClick={() => handleTogglePause(reminder.id)}
                    aria-label={
                      reminder.isPaused
                        ? `Resume reminder: ${reminder.text}`
                        : `Pause reminder: ${reminder.text}`
                    }
                    className="focus:outline-none"
                  >
                    {reminder.isPaused ? (
                      <LiaPlayCircleSolid className="cursor-pointer text-3xl text-green-600 transition-colors hover:text-green-700" />
                    ) : (
                      <LiaPauseCircleSolid className="cursor-pointer text-3xl text-yellow-600 transition-colors hover:text-yellow-700" />
                    )}
                  </button>
                  <button
                    onClick={() => openDeleteModal(reminder.id)}
                    aria-label={`Delete reminder: ${reminder.text}`}
                    className="focus:outline-none"
                  >
                    <GoTrash className="cursor-pointer text-2xl text-red-600 transition-colors hover:text-red-700" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {showForm && (
        <ReminderForm
          setShowForm={setShowForm}
          showForm={showForm}
          onReminderSaved={fetchReminders}
        />
      )}

      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setShowDeleteModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div
            className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id="delete-modal-title"
              className="mb-4 text-center text-xl font-bold text-[#545E31]"
            >
              Delete Reminder?
            </h2>
            <p className="mb-6 text-center text-gray-600">
              Are you sure you want to delete this reminder? This action cannot
              be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="cursor-pointer rounded-lg border border-gray-400 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-gray-400 focus:outline-none"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="cursor-pointer rounded-lg bg-red-600 px-6 py-2 font-medium text-white transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-600 focus:outline-none"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyReminder;
