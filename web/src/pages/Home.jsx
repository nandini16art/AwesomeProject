import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [myProfile, setMyProfile] = useState(null);

  const getProfiles = async () => {
    try {
      const response = await api.get("/profiles");

      console.log("Profiles response:", response.data);

      setProfiles(response.data.profiles || []);
    } catch (error) {
      console.error("Profile error:", error);

      setError(
        error.response?.data?.message || "Unable to load profiles"
      );
    } finally {
      setLoading(false);
    }
  };

  const getMyProfile = async () => {
    try {
      const response = await api.get("/profiles/me");

      console.log("My profile:", response.data);

      if (response.data.success) {
        setMyProfile(response.data.profile);
      }
    } catch (error) {
      console.log("My profile error:", error);

     
      if (error.response?.status === 404) {
        setMyProfile(null);
      }
    }
  };

  useEffect(() => {
    getProfiles();
    getMyProfile();
  }, []);

  const handleFollow = async (profile) => {
    try {
      const endpoint = `/follow/${profile.user_id}`;

      const response = profile.isFollowing
        ? await api.delete(endpoint)
        : await api.post(endpoint);

      console.log("Follow response:", response.data);

      if (response.data.success) {
        getProfiles();
      }
    } catch (error) {
      console.error("Follow error:", error);

      alert(
        error.response?.data?.message || "Unable to update follow status"
      );
    }
  };

  if (loading) {
    return <h2>Loading profiles...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div className="home-page">

      
      <div className="home-topbar">
        <h1 className="home-title">
          Home
        </h1>

        <button
          className="logout-button"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            window.location.href = "/";
          }}
        >
          Logout
        </button>
      </div>

      
      <div className="my-profile-card">

        {myProfile ? (
          <>
            <img
              src={
                myProfile.image ||
                "https://i.pravatar.cc/300?img=1"
              }
              alt={myProfile.name}
              className="my-profile-image"
            />

            <h2 className="my-profile-name">
              {myProfile.name}
            </h2>

            <p className="my-profile-role">
              {myProfile.title}
            </p>

            <p className="my-profile-location">
              {myProfile.location}
            </p>

            <p className="my-profile-about">
              {myProfile.about}
            </p>

            <button
              className="profile-action-button"
              onClick={() =>
                navigate("/profile", {
                  state: {
                    profile: myProfile,
                  },
                })
              }
            >
              View My Profile
            </button>
          </>
        ) : (
          <>
            <img
              src="https://i.pravatar.cc/300?img=1"
              alt="No profile"
              className="my-profile-image"
            />

            <h2 className="my-profile-name">
              No Profile Yet
            </h2>

            <p className="my-profile-role">
              Create your profile to get started
            </p>

            <button
              className="profile-action-button"
              onClick={() =>
                navigate("/create-profile")
              }
            >
              Create Profile
            </button>
          </>
        )}

      </div>

     
      <div className="suggested-section">

        <div className="suggested-header">
          <h2 className="suggested-title">
            Suggested Profiles
          </h2>
        </div>

        {profiles.length === 0 ? (
          <p className="home-message">
            No suggested profiles found.
          </p>
        ) : (
          <div className="profiles-list">

            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="profile-card"
              >

                
                <div
                  className="profile-card-top"
                  onClick={() =>
                    navigate("/profile", {
                      state: {
                        profile,
                      },
                    })
                  }
                >

                  <img
                    src={
                      profile.image ||
                      "https://i.pravatar.cc/300?img=1"
                    }
                    alt={profile.name}
                    className="profile-card-image"
                  />

                  <h3 className="profile-card-name">
                    {profile.name}
                  </h3>

                  <p className="profile-card-role">
                    {profile.title}
                  </p>

                </div>

              
                <button
                  className="profile-follow-button"
                  onClick={() =>
                    handleFollow(profile)
                  }
                >
                  {profile.isFollowing
                    ? "Following"
                    : "Follow"}
                </button>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default Home;