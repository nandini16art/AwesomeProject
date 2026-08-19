import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import Login from "./pages/Login";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import AdminDashboard from "./pages/AdminDashboard";
import CreateProfile from "./pages/CreateProfile";

function App() {
  const storedUser = localStorage.getItem("user");

  const [user, setUser] = useState(
    storedUser ? JSON.parse(storedUser) : null
  );

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {user.role === "admin" ? (
          <Route
            path="*"
            element={<AdminDashboard onLogout={handleLogout} />}
          />
        ) : (
          <>
            <Route path="/" element={<Home />} />

            <Route
              path="/profile"
              element={<Profile />}
            />

            <Route
              path="/edit-profile"
              element={<EditProfile />}
            />

            <Route
              path="/create-profile"
              element={<CreateProfile />}
            />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
}

// function AdminDashboard({ onLogout }) {
//   return (
//     <div>
//       <h1>Admin Dashboard</h1>

//       <p>Admin logged in successfully.</p>

//       <button onClick={onLogout}>
//         Logout
//       </button>
//     </div>
//   );
// }

export default App;