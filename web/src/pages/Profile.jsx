import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Profile.css";

function Profile() {
  const location = useLocation();
  const navigate = useNavigate();

  const profile = location.state?.profile;

  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(
    Boolean(profile?.isFollowing)
  );

  useEffect(() => {
    const user = localStorage.getItem("user");

    if (user) {
      setLoggedInUser(JSON.parse(user));
    }
  }, []);

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="profile-not-found">
          <h2>Profile not found</h2>

          <button
            className="profile-primary-button"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isMyProfile =
    String(loggedInUser?.id) === String(profile.user_id) ||
    loggedInUser?.email === profile.email;

  const handleFollow = async () => {
    try {
      const endpoint = `/follow/${profile.user_id}`;

      const response = isFollowing
        ? await api.delete(endpoint)
        : await api.post(endpoint);

      if (response.data.success) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error("Follow error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to update follow status"
      );
    }
  };

  return (
    <div className="profile-page">

      {/* Back button */}

      <div className="profile-topbar">
        <button
          className="back-button"
          onClick={() => navigate("/")}
        >
          ← Back
        </button>
      </div>

      {/* Profile Header */}

      <div className="profile-header-card">

        <img
          src={
            profile.image ||
            "https://i.pravatar.cc/300?img=1"
          }
          alt={profile.name}
          className="profile-main-image"
        />

        <h1 className="profile-name">
          {profile.name}
        </h1>

        <h3 className="profile-title">
          {profile.title}
        </h3>

        <p className="profile-location">
          {profile.location}
        </p>

        {/* Stats */}

        <div className="profile-stats">

          <div className="profile-stat">
            <span className="profile-stat-number">
              {profile.followers ??
                profile.followersCount ??
                0}
            </span>

            <span className="profile-stat-label">
              Followers
            </span>
          </div>

          <div className="profile-stat">
            <span className="profile-stat-number">
              {profile.following ??
                profile.followingCount ??
                0}
            </span>

            <span className="profile-stat-label">
              Following
            </span>
          </div>

        </div>

        {/* Actions */}

        <div className="profile-actions">

          {isMyProfile ? (
            <button
              className="profile-primary-button"
              onClick={() =>
                navigate("/edit-profile", {
                  state: { profile },
                })
              }
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                className="profile-primary-button"
                onClick={handleFollow}
              >
                {isFollowing
                  ? "Following"
                  : "Follow"}
              </button>

              <button className="profile-secondary-button">
                Message
              </button>
            </>
          )}

        </div>

      </div>

      {/* About */}

      <div className="profile-section">

        <h2 className="profile-section-title">
          About
        </h2>

        <p className="profile-section-text">
          {profile.about ||
            "No information available."}
        </p>

      </div>

      {/* Skills */}

      <div className="profile-section">

        <h2 className="profile-section-title">
          Skills
        </h2>

        {profile.skills?.length > 0 ? (
          <div className="skills-container">
            {profile.skills.map((skill, index) => (
              <span
                className="skill-tag"
                key={index}
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="profile-section-text">
            No skills available.
          </p>
        )}

      </div>

      {/* Education */}

      <div className="profile-section">

        <h2 className="profile-section-title">
          Education
        </h2>

        <div className="profile-item">

          <p className="profile-item-title">
            Education
          </p>

          <p className="profile-item-text">
            {profile.education ||
              "No education information available."}
          </p>

        </div>

      </div>

      {/* Experience */}

      <div className="profile-section">

        <h2 className="profile-section-title">
          Experience
        </h2>

        <div className="profile-item">

          <p className="profile-item-title">
            Experience
          </p>

          <p className="profile-item-text">
            {profile.experience ||
              "No experience information available."}
          </p>

        </div>

      </div>

    </div>
  );
}

export default Profile;