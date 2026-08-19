import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/EditProfile.css';

function EditProfile() {
  const location = useLocation();
  const navigate = useNavigate();

  const profile = location.state?.profile;

  const [title, setTitle] = useState(profile?.title || '');
  const [image, setImage] = useState(profile?.image || '');
  const [previewImage, setPreviewImage] = useState(profile?.image || '');
  const [selectedImage, setSelectedImage] = useState(null);
  const [shouldDeleteImage, setShouldDeleteImage] = useState(false);
  const [profileLocation, setProfileLocation] = useState(
    profile?.location || '',
  );
  const [about, setAbout] = useState(profile?.about || '');
  const [education, setEducation] = useState(profile?.education || '');
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  if (!profile) {
    return (
      <div>
        <h2>Profile not found</h2>

        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }

  const handlePhotoChange = event => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
    setShouldDeleteImage(false);
  };

  const deletePicture = () => {
    setSelectedImage(null);
    setPreviewImage('');
    setImage('');
    setShouldDeleteImage(true);
  };

  const handleUpdate = async e => {
    e.preventDefault();

    try {
      let savedImage = image;

      if (shouldDeleteImage) {
        await api.delete('/profiles/me/photo');
        savedImage = '';
      } else if (selectedImage) {
        const formData = new FormData();

        formData.append('photo', selectedImage);

        const uploadResponse = await api.post('/profiles/me/photo', formData);

        savedImage = uploadResponse.data.image;
      }

      const response = await api.put('/profiles/me', {
        title,
        image: savedImage,
        location: profileLocation,
        about,
        education,
      });

      console.log('Update response:', response.data);

      if (response.data.success) {
        alert('Profile Updated Successfully');

        // Get the updated profile
        const profileResponse = await api.get('/profiles/me');

        if (profileResponse.data.success) {
          navigate('/profile', {
            state: {
              profile: profileResponse.data.profile,
            },
          });
        }
      }
    } catch (error) {
      console.error('Update profile error:', error);

      alert(error.response?.data?.message || 'Unable to update profile');
    }
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-container">
        <button className="edit-profile-back" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <h1 className="edit-profile-title">Edit Profile</h1>

        <form className="edit-profile-form" onSubmit={handleUpdate}>
          {/* Name */}

          <div className="edit-profile-group">
            <label className="edit-profile-label">Name</label>

            <input
              className="edit-profile-input"
              type="text"
              value={profile.name || ''}
              disabled
            />
          </div>

          {/* Title */}

          <div className="edit-profile-group">
            <label className="edit-profile-label">Title</label>

            <input
              className="edit-profile-input"
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Title"
            />
          </div>

          {/* Profile Picture */}

          <div className="edit-profile-group">
            <label className="edit-profile-label">Profile Picture</label>

            {previewImage ? (
              <img
                className="edit-profile-preview"
                src={previewImage}
                alt={profile.name || 'Profile'}
              />
            ) : null}

            <input
              ref={galleryInputRef}
              className="edit-profile-file"
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
            />

            <input
              ref={cameraInputRef}
              className="edit-profile-file"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoChange}
            />

            <div className="edit-profile-photo-actions">
              <button
                className="edit-profile-photo-button"
                type="button"
                onClick={() => galleryInputRef.current?.click()}
              >
                Upload from Gallery
              </button>

              <button
                className="edit-profile-photo-button"
                type="button"
                onClick={() => cameraInputRef.current?.click()}
              >
                Take Photo
              </button>

              <button
                className="edit-profile-delete-photo"
                type="button"
                onClick={deletePicture}
              >
                Delete Picture
              </button>
            </div>
          </div>

          {/* Location */}

          <div className="edit-profile-group">
            <label className="edit-profile-label">Location</label>

            <input
              className="edit-profile-input"
              type="text"
              value={profileLocation}
              onChange={e => setProfileLocation(e.target.value)}
              placeholder="Location"
            />
          </div>

          {/* About */}

          <div className="edit-profile-group">
            <label className="edit-profile-label">About</label>

            <textarea
              className="edit-profile-textarea"
              value={about}
              onChange={e => setAbout(e.target.value)}
              placeholder="About"
            />
          </div>

          {/* Education */}

          <div className="edit-profile-group">
            <label className="edit-profile-label">Education</label>

            <input
              className="edit-profile-input"
              type="text"
              value={education}
              onChange={e => setEducation(e.target.value)}
              placeholder="Education"
            />
          </div>

          <button className="edit-profile-button" type="submit">
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
