import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import QuotePage from "./pages/QuotePage";
import DailyReminder from "./pages/DailyReminder";

function App() {

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<QuotePage />} />
        <Route path="/DailyReminder" element={<DailyReminder />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
