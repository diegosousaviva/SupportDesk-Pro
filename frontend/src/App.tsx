import {
  Suspense,
} from "react";

import {
  BrowserRouter,
} from "react-router-dom";

import AppRoutes from "./routes";

import {
  useMaximumSessionDuration,
} from "./hooks/useMaximumSessionDuration";

import {
  useSessionTimeout,
} from "./hooks/useSessionTimeout";

import {
  useSessionValidation,
} from "./hooks/useSessionValidation";

import {
  useSlaMonitor,
} from "./hooks/useSlaMonitor";

function PageLoading() {
  return (
    <div
      style={{
        minHeight:
          "100vh",

        display:
          "flex",

        alignItems:
          "center",

        justifyContent:
          "center",

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

  useSessionTimeout();

  useMaximumSessionDuration();

  useSessionValidation();

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