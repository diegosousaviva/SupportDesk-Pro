import {
  Suspense,
} from "react";

import {
  BrowserRouter,
} from "react-router-dom";

import AppRoutes from "./routes";

import {
  useSlaMonitor,
} from "./hooks/useSlaMonitor";

function PageLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "Roboto, Arial, sans-serif",
      }}
    >
      Carregando...
    </div>
  );
}

function AppContent() {
  useSlaMonitor();

  return (
    <Suspense
      fallback={
        <PageLoading />
      }
    >
      <AppRoutes />
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;