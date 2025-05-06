import React, { useState } from "react";
import { BsArrowRightCircle } from "react-icons/bs";
import { Link } from "react-router-dom";
import motivationalQuotes from "../utils/quotes.ts";

const QuotePage: React.FC = () => {
  const getRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
  };

  const [quote, setQuote] = useState(getRandomQuote());

  const handleNewQuote = () => {
    setQuote(getRandomQuote());
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="flex max-w-md flex-col items-center p-4">
        {/* Header */}
        <div className="w-full rounded-lg bg-[#545E31] px-6 py-4 text-center text-2xl font-bold text-white shadow-md">
          Ad-friend
        </div>

        {/* Quote Card */}
        <div className="mt-10 max-w-md rounded-lg border-2 border-[#545E31] bg-white p-6 text-center shadow-[2px_2px_2px_2px_#545E31]">
          <h2 className="text-xl font-bold text-[#545E31]">Quote of the Day</h2>
          <p className="mt-4 text-lg font-medium text-[#6C783F]">
            {quote.text}
          </p>
          <p className="mt-4 text-right font-bold text-[#6C783F]">
            - {quote.author}
          </p>
          <button
            onClick={handleNewQuote}
            className="mt-4 rounded-lg bg-[#545E31] px-4 py-2 text-white hover:bg-[#6C783F]"
          >
            New Quote
          </button>
        </div>

        {/* Footer Button */}
        <Link
          to="/DailyReminder"
          className="mt-10 flex w-full items-center justify-center gap-2 rounded-lg bg-[#545E31] px-6 py-3 text-lg font-bold text-white shadow-md"
        >
          Daily Reminders{" "}
          <span className="text-xl">
            <BsArrowRightCircle />
          </span>
        </Link>
      </div>
    </div>
  );
};

export default QuotePage;
