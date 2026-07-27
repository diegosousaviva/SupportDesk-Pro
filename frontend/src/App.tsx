import {
  lazy,
  Suspense,
} from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

const DashboardPage = lazy(
  () => import("./pages/Dashboard/DashboardPage")
);

const LoginPage = lazy(
  () => import("./pages/Login/LoginPage")
);

const CreateTicketPage = lazy(
  () => import("./pages/Tickets/CreateTicketPage")
);

const TicketListPage = lazy(
  () => import("./pages/Tickets/TicketListPage")
);

const TicketDetailsPage = lazy(
  () => import("./pages/Tickets/TicketDetailsPage")
);

const EditTicketPage = lazy(
  () => import("./pages/Tickets/EditTicketPage")
);

const UserListPage = lazy(
  () => import("./pages/Users/UserListPage")
);

const CreateUserPage = lazy(
  () => import("./pages/Users/CreateUserPage")
);

const UserDetailsPage = lazy(
  () => import("./pages/Users/UserDetailsPage")
);

const EditUserPage = lazy(
  () => import("./pages/Users/EditUserPage")
);

function PageLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Roboto, Arial, sans-serif",
      }}
    >
      Carregando...
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/login" replace />}
          />

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />

          <Route
            path="/tickets"
            element={<TicketListPage />}
          />

          <Route
            path="/tickets/new"
            element={<CreateTicketPage />}
          />

          <Route
            path="/tickets/:id"
            element={<TicketDetailsPage />}
          />

          <Route
            path="/tickets/:id/edit"
            element={<EditTicketPage />}
          />

          <Route
            path="/users"
            element={<UserListPage />}
          />

          <Route
            path="/users/new"
            element={<CreateUserPage />}
          />

          <Route
            path="/users/:id"
            element={<UserDetailsPage />}
          />

          <Route
            path="/users/:id/edit"
            element={<EditUserPage />}
          />

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;