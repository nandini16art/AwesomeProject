import { useState } from "react";
import api from "../services/api";
import "../styles/Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
        role,
      });

      console.log("Login response:", response.data);

      localStorage.setItem("token", response.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      setMessage("Login successful!");

      onLogin(response.data.user);
    } catch (error) {
      console.error("Login error:", error);

      setMessage(
        error.response?.data?.message || "Login failed"
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        <h1 className="login-title">
          Login
        </h1>

        {/* Admin / User selection */}

        <div className="role-switcher">

          <button
            type="button"
            className={`role-button ${
              role === "admin" ? "active" : ""
            }`}
            onClick={() => setRole("admin")}
          >
            Admin
          </button>

          <button
            type="button"
            className={`role-button ${
              role === "user" ? "active" : ""
            }`}
            onClick={() => setRole("user")}
          >
            User
          </button>

        </div>

        <form
          className="login-form"
          onSubmit={handleLogin}
        >

          {/* Email */}

          <div className="form-group">

            <label className="form-label">
              Email
            </label>

            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Email"
              required
            />

          </div>

          {/* Password */}

          <div className="form-group">

            <label className="form-label">
              Password
            </label>

            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Password"
              required
            />

          </div>

          {/* Login */}

          <button
            className="login-button"
            type="submit"
          >
            {role === "admin"
              ? "Admin Login"
              : "User Login"}
          </button>

        </form>

        {message && (
          <p className="login-message">
            {message}
          </p>
        )}

      </div>
    </div>
  );
}

export default Login;