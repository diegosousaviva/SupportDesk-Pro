import { Suspense } from "react";

import { BrowserRouter } from "react-router-dom";

import AppRoutes from "./routes";

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

function App() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={<PageLoading />}
      >
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
}

export default App;