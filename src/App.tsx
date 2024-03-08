import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "./styles/default.css";

// * Import Here Any Page Component
import LoadingPage from "./pages/LoadingPage";
const LandingPage = lazy(() => import("./pages/LandingPage"));

const App = () => {
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
        <Route path="/" element={<LandingPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};

export default App;
