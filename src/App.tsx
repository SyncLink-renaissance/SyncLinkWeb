import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/default.css";

// * Import Here Any Page Component
import LoadingPage from "./pages/LoadingPage";
const ConnectionPage = lazy(() => import("./pages/connectionPage"));
const ProofPage = lazy(() => import("./pages/proofPage"));
import { Buffer } from "buffer";

const App = () => {
  window.Buffer = Buffer; // Make Buffer available globally like it is in Node

  const setHeight = () => {
    console.log("setting height");
    const currentHeight = window.innerHeight;
    console.log("innerHeight:", currentHeight);
    document.body.style.height = `${currentHeight}px`;
  };
  window.addEventListener("resize", setHeight);
  setHeight();

  return (
    <Suspense fallback={<LoadingPage />}>
      <Routes>
        <Route path="/connection" element={<ConnectionPage />} />
        <Route path="/proof" element={<ProofPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};

export default App;
