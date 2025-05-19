import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import QuotePage from "./pages/QuotePage";
import DailyReminder from "./pages/DailyReminder";

/**
 * Main application component that sets up routing for the popup.
 * @returns The rendered App component.
 */
function App(): JSX.Element {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<QuotePage />} />
          <Route path="/DailyReminder" element={<DailyReminder />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
