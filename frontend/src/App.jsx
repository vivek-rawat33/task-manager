import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/Login-page.jsx";
import SignupPage from "./pages/Signup-page.jsx";
import Page from "./pages/Dashboard.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signup" replace />} />

      <Route path="/signup" element={<SignupPage />} />
      <Route path="/signin" element={<LoginPage />} />

      <Route path="/dashboard" element={<Page />} />
      

     
      <Route path="/dashboard/:teamId/*" element={<Page />} />

      <Route path="*" element={<Navigate to="/signup" replace />} />
    </Routes>
  );
}

export default App;
