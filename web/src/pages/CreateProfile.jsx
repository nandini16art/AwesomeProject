import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/CreateProfile.css";

function CreateProfile() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const [name, setName] = useState(user?.name || "");
  const [role, setRole] = useState("");
  const [image, setImage] = useState("");
  const [location, setLocation] = useState("");
  const [about, setAbout] = useState("");
  const [education, setEducation] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateProfile = async (e) => {
    e.preventDefault();

    setMessage("");

    if (!user) {
      setMessage("Please login before creating a profile.");
      navigate("/");
      return;
    }

    try {
      setIsSaving(true);

      const response = await api.post("/profiles", {
        name,
        title: role,
        image,
        location,
        followersCount: 0,
        followingCount: 0,
        about,
        education,
      });

      console.log("Create profile response:", response.data);

      if (response.data.success) {
        setMessage("Profile created successfully!");

        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else {
        setMessage(
          response.data.message || "Profile creation failed."
        );
      }
    } catch (error) {
      console.error("Create profile error:", error);

      setMessage(
        error.response?.data?.message ||
        "Profile creation failed."
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="create-profile-page">

      <div className="create-profile-container">

        <button
          className="create-profile-back"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <h1 className="create-profile-title">
          Create Profile
        </h1>

        <form
          className="create-profile-form"
          onSubmit={handleCreateProfile}
        >

          <div className="create-profile-group">
            <label className="create-profile-label">
              Name
            </label>

            <input
              className="create-profile-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
            />
          </div>

          <div className="create-profile-group">
            <label className="create-profile-label">
              Role
            </label>

            <input
              className="create-profile-input"
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="Role"
            />
          </div>

          <div className="create-profile-group">
            <label className="create-profile-label">
              Image URL
            </label>

            <input
              className="create-profile-input"
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="Image URL"
            />
          </div>

          <div className="create-profile-group">
            <label className="create-profile-label">
              Location
            </label>

            <input
              className="create-profile-input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
            />
          </div>

          <div className="create-profile-group">
            <label className="create-profile-label">
              About
            </label>

            <textarea
              className="create-profile-textarea"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              placeholder="About"
            />
          </div>

          <div className="create-profile-group">
            <label className="create-profile-label">
              Education
            </label>

            <input
              className="create-profile-input"
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="Education"
            />
          </div>

          <button
            className="create-profile-button"
            type="submit"
            disabled={isSaving}
          >
            {isSaving
              ? "Creating..."
              : "Create Profile"}
          </button>

        </form>

        {message && (
          <p className="create-profile-message">
            {message}
          </p>
        )}

      </div>

    </div>
  );
    
}

export default CreateProfile;