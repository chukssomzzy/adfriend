import React from "react";
import { BsArrowRightCircle } from "react-icons/bs";
import { Link } from "react-router-dom";

const QuotePage: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-white p-4">
        <div className="flex flex-col items-center max-w-md p-4">
                 {/* Header */}
      <div className="bg-[#545E31] text-white text-2xl font-bold py-4 px-6 rounded-lg shadow-md w-full text-center">
        Ad-friend
      </div>

      {/* Quote Card */}
      <div className="bg-white rounded-lg p-6 mt-10 max-w-md text-center border-2 border-[#545E31] shadow-[2px_2px_2px_2px_#545E31]">
        <h2 className="text-xl text-[#545E31] font-bold">Quote of the Day</h2>
        <p className="mt-4 text-lg font-medium text-[#6C783F]">
          "Strength doesn't come from what you can do. It comes from overcoming
          the things you once thought you couldn't."
        </p>
        <p className="mt-4 text-right font-bold text-[#6C783F]">- Rikki Rogers</p>
      </div>

      {/* Footer Button */}
      <Link
       to="/DailyReminder" 
       className="bg-[#545E31] w-full flex justify-center items-center text-white text-lg font-bold py-3 px-6 rounded-lg shadow-md mt-10 gap-2">
        Daily Reminders <span className="text-xl"><BsArrowRightCircle /></span>
      </Link> 
        </div>
    </div>
  );
};

export default QuotePage;
