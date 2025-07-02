import { Routes, Route } from "react-router-dom";
import WelcomePage from "./pages/WelcomePage";
import LoginPage from "./pages/LoginPage";
import AdminPage from "./pages/AdminPage";
import UserSearchPage from "./pages/UserSearchPage"; 
import UserHotelDetailPage from "./pages/UserHotelDetailPage"; 

function App() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/user" element={<UserSearchPage />} />
      <Route path="/hotel/:roomId" element={<UserHotelDetailPage />} />



      {/* Devamında: /admin, /user vs */}
    </Routes>
  );
}

export default App;
