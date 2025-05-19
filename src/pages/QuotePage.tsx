import React, { useState, useCallback } from "react";
import { BsArrowRightCircle } from "react-icons/bs";
import { Link } from "react-router-dom";
import motivationalQuotes from "@/shared/quotes";
import type { Quote } from "@/shared/types";

/**
 * Page component to display a random motivational quote.
 * @returns The rendered QuotePage component.
 */
const QuotePage: React.FC = (): JSX.Element => {
  /**
   * Gets a random quote from the predefined list.
   * @returns A Quote object.
   */
  const getRandomQuote = useCallback((): Quote => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
  }, []);

  const [quote, setQuote] = useState<Quote>(getRandomQuote());

  /**
   * Handles the action of displaying a new random quote.
   */
  const handleNewQuote = (): void => {
    setQuote(getRandomQuote());
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-white p-4">
      <header className="w-full max-w-md rounded-lg bg-[#545E31] px-6 py-4 text-center text-2xl font-bold text-white shadow-md">
        Ad-Friend
      </header>

      <section className="mt-10 w-full max-w-md rounded-lg border-2 border-[#545E31] bg-white p-6 text-center shadow-[2px_2px_2px_2px_#545E31]">
        <h2 className="text-xl font-bold text-[#545E31]">Quote of the Day</h2>
        <blockquote className="mt-4">
          <p className="min-h-[6em] text-lg font-medium text-[#6C783F]">
            "{quote.text}"
          </p>
          <cite className="mt-4 block text-right font-bold text-[#6C783F]">
            - {quote.author}
          </cite>
        </blockquote>
        <button
          onClick={handleNewQuote}
          className="focus:ring-opacity-50 mt-6 rounded-lg bg-[#545E31] px-4 py-2 text-white transition-colors hover:bg-[#6C783F] focus:ring-2 focus:ring-[#6C783F] focus:outline-none"
          aria-label="Get a new quote"
        >
          New Quote
        </button>
      </section>

      <nav className="mt-10 w-full max-w-md">
        <Link
          to="/DailyReminder"
          className="flex items-center justify-center gap-2 rounded-lg bg-[#545E31] px-6 py-3 text-lg font-bold text-white shadow-md transition-colors hover:bg-[#6C783F]"
        >
          Daily Reminders{" "}
          <span className="text-xl" aria-hidden="true">
            <BsArrowRightCircle />
          </span>
        </Link>
      </nav>
    </div>
  );
};

export default QuotePage;
