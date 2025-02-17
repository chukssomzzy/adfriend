import React, { useState } from "react";
import { BsArrowRightCircle } from "react-icons/bs";
import { Link } from "react-router-dom";
import motivationalQuotes from '../utils/quotes.ts'


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
		{quote.text}
		</p>
		<p className="mt-4 text-right font-bold text-[#6C783F]">
		- {quote.author}
		</p>
		<button onClick={handleNewQuote} className="mt-4 bg-[#545E31] text-white py-2 px-4 rounded-lg hover:bg-[#6C783F]">
		New Quote
		</button>
		</div>

		{/* Footer Button */}
		<Link
		to="/DailyReminder"
		className="bg-[#545E31] w-full flex justify-center items-center text-white text-lg font-bold py-3 px-6 rounded-lg shadow-md mt-10 gap-2"
		>
		Daily Reminders <span className="text-xl"><BsArrowRightCircle /></span>
		</Link>
		</div>
		</div>
	);
};

export default QuotePage;
