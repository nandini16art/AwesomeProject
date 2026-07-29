import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

function EditProfileScreen({ route, navigation }) {
  const { profile } = route.params;

  const [title, setTitle] = useState(profile.title || '');
  const [location, setLocation] = useState(profile.location || '');
  const [about, setAbout] = useState(profile.about || '');
  const [education, setEducation] = useState(profile.education || '');
  const [image] = useState(profile.image || '');

  const handleUpdate = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      const response = await fetch('http://10.0.2.2:5000/api/profiles/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          image,
          location,
          about,
          education,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Profile Updated Successfully');
        navigation.navigate('Home');
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
