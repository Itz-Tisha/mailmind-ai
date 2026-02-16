import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Login from "./components/Login";
import Home from "./components/Home";
import Compose from "./components/Compose"; 

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/compose" element={<Compose />} />
      </Routes>
    </ThemeProvider>
  );
}


export default App;