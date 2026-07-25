import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import DashboardPage from "./pages/Dashboard/DashboardPage";
import LoginPage from "./pages/Login/LoginPage";
import CreateTicketPage from "./pages/Tickets/CreateTicketPage";
import TicketListPage from "./pages/Tickets/TicketListPage";
import TicketDetailsPage from "./pages/Tickets/TicketDetailsPage";
import EditTicketPage from "./pages/Tickets/EditTicketPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tickets/new" element={<CreateTicketPage />} />
        <Route path="/tickets" element={<TicketListPage />} />
        <Route path="/tickets/:id" element={<TicketDetailsPage />} />
        <Route path="/tickets/:id/edit" element={<EditTicketPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;