import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/AdminDashboard.css";

function AdminDashboard({ onLogout }) {
  const [users, setUsers] = useState([]);
  const [adminUser, setAdminUser] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadUsers = async () => {
    try {
      const response = await api.get("/users");

      console.log("Users response:", response.data);

      if (response.data.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error("Load users error:", error);

      setMessage(
        error.response?.data?.message ||
        "Unable to load users"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      setAdminUser(JSON.parse(storedUser));
    }

    loadUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!name || !email || !password) {
      setMessage("Name, email, and password are required.");
      return;
    }

    try {
      setIsSaving(true);

      const response = await api.post("/users", {
        name,
        email,
        password,
      });

      console.log("Create user response:", response.data);

      if (response.data.success) {
        setMessage("User created successfully!");

        setName("");
        setEmail("");
        setPassword("");

      
        await loadUsers();
      }
    } catch (error) {
      console.error("Create user error:", error);

      setMessage(
        error.response?.data?.message ||
        "Unable to create user"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Delete ${user.name}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await api.delete(
        `/users/${user.id}`
      );

      console.log("Delete response:", response.data);

      if (response.data.success) {
        setUsers((currentUsers) =>
          currentUsers.filter(
            (currentUser) => currentUser.id !== user.id
          )
        );

        setMessage("User deleted successfully!");
      }
    } catch (error) {
      console.error("Delete user error:", error);

      setMessage(
        error.response?.data?.message ||
        "Unable to delete user"
      );
    }
  };

  if (loading) {
    return <h2>Loading Admin Dashboard...</h2>;
  }

  return (
    <div className="admin-page">

      

      <div className="admin-header">

        <h1 className="admin-title">
          Admin Dashboard
        </h1>

        <p className="admin-email">
          {adminUser?.email}
        </p>

      </div>

      

      <div className="admin-stats">

        <p className="admin-stat-number">
          {users.length}
        </p>

        <p className="admin-stat-label">
          Total Users
        </p>

      </div>

      

      <div className="admin-create-section">

        <h2 className="admin-section-title">
          Create User
        </h2>

        <form onSubmit={handleCreateUser}>

          <div className="admin-form-group">

            <label className="admin-label">
              Name
            </label>

            <input
              className="admin-input"
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter name"
            />

          </div>

          <div className="admin-form-group">

            <label className="admin-label">
              Email
            </label>

            <input
              className="admin-input"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter email"
            />

          </div>

          <div className="admin-form-group">

            <label className="admin-label">
              Password
            </label>

            <input
              className="admin-input"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter password"
            />

          </div>

          <button
            className="admin-create-button"
            type="submit"
            disabled={isSaving}
          >
            {isSaving
              ? "Creating..."
              : "Create User"}
          </button>

        </form>

        {message && (
          <p className="admin-message">
            {message}
          </p>
        )}

      </div>

     

      <div className="admin-users-section">

        <h2 className="admin-section-title">
          Existing Users
        </h2>

        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          users.map((user) => (
            <div
              className="admin-user-card"
              key={user.id}
            >

              <h3 className="admin-user-name">
                {user.name}
              </h3>

              <p className="admin-user-email">
                {user.email}
              </p>

              <p className="admin-user-role">
                Role: {user.role}
              </p>

              {user.role !== "admin" &&
                user.id !== adminUser?.id && (
                  <button
                    className="admin-delete-button"
                    onClick={() =>
                      handleDeleteUser(user)
                    }
                  >
                    Delete
                  </button>
                )}

            </div>
          ))
        )}

      </div>

      

      <div className="admin-logout-container">

        <button
          className="admin-logout-button"
          onClick={onLogout}
        >
          Logout
        </button>

      </div>

    </div>
  );
}

export default AdminDashboard;