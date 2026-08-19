import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

function EditProfileScreen({ route, navigation }) {
  const { profile } = route.params;

  const [title, setTitle] = useState(profile.title || '');
  const [location, setLocation] = useState(profile.location || '');
  const [about, setAbout] = useState(profile.about || '');
  const [education, setEducation] = useState(profile.education || '');
  const [image, setImage] = useState(profile.image || '');
  const [selectedImage, setSelectedImage] = useState(null);
  const [shouldDeleteImage, setShouldDeleteImage] = useState(false);

  const pickFromGallery = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (!result.didCancel && result.assets?.length) {
      setSelectedImage(result.assets[0]);
      setImage(result.assets[0].uri);
      setShouldDeleteImage(false);
    }
  };

  const takePhoto = async () => {
    const result = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (!result.didCancel && result.assets?.length) {
      setSelectedImage(result.assets[0]);
      setImage(result.assets[0].uri);
      setShouldDeleteImage(false);
    }
  };

  const deletePicture = () => {
    setSelectedImage(null);
    setImage('');
    setShouldDeleteImage(true);
  };

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      let savedImage = image;

      if (shouldDeleteImage) {
        const deletePhotoResponse = await fetch(
          'http://10.0.2.2:5000/api/profiles/me/photo',
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const deletePhotoData = await deletePhotoResponse.json();

        if (!deletePhotoResponse.ok) {
          Alert.alert('Error', deletePhotoData.message);
          return;
        }

        savedImage = '';
      } else if (selectedImage) {
        const formData = new FormData();

        formData.append('photo', {
          uri: selectedImage.uri,
          type: selectedImage.type || 'image/jpeg',
          name: selectedImage.fileName || 'profile-photo.jpg',
        });

        const uploadResponse = await fetch(
          'http://10.0.2.2:5000/api/profiles/me/photo',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          },
        );
        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          Alert.alert('Error', uploadData.message);
          return;
        }

        savedImage = uploadData.image;
      }

      const response = await fetch('http://10.0.2.2:5000/api/profiles/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          image: savedImage,
          location,
          about,
          education,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const profileResponse = await fetch(
          'http://10.0.2.2:5000/api/profiles/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
        const profileData = await profileResponse.json();

        Alert.alert('Success', 'Profile Updated Successfully');

        if (profileResponse.ok) {
          navigation.replace('Profile', {
            profile: profileData.profile,
          });
        } else {
          navigation.navigate('Home');
        }
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.label}>Name</Text>

      <TextInput
        value={profile.name}
        editable={false}
        style={[styles.input, styles.disabledInput]}
      />

      <Text style={styles.label}>Title</Text>

      <TextInput value={title} onChangeText={setTitle} style={styles.input} />

      <Text style={styles.label}>Profile Picture</Text>

      {image ? (
        <Image source={{ uri: image }} style={styles.previewImage} />
      ) : null}

      <TouchableOpacity style={styles.photoButton} onPress={pickFromGallery}>
        <Text style={styles.photoButtonText}>Upload from Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
        <Text style={styles.photoButtonText}>Take Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deletePhotoButton}
        onPress={deletePicture}
      >
        <Text style={styles.deletePhotoText}>Delete Picture</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Location</Text>

      <TextInput
        value={location}
        onChangeText={setLocation}
        style={styles.input}
      />

      <Text style={styles.label}>About</Text>

      <TextInput
        value={about}
        onChangeText={setAbout}
        multiline
        style={[styles.input, styles.aboutInput]}
      />

      <Text style={styles.label}>Education</Text>

      <TextInput
        value={education}
        onChangeText={setEducation}
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },

  label: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 15,
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },

  disabledInput: {
    backgroundColor: '#ddd',
  },

  aboutInput: {
    height: 100,
  },

  previewImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignSelf: 'center',
    marginBottom: 14,
  },

  photoButton: {
    backgroundColor: '#7f7ab8',
    borderRadius: 12,
    alignItems: 'center',
    padding: 13,
    marginBottom: 10,
  },

  photoButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  deletePhotoButton: {
    borderColor: '#ff6268',
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    padding: 13,
    marginBottom: 6,
  },

  deletePhotoText: {
    color: '#ff6268',
    fontSize: 15,
    fontWeight: '700',
  },

  button: {
    marginTop: 30,
    backgroundColor: '#7f7ab8',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default EditProfileScreen;
