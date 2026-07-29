import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';

function CreateProfileScreen({ navigation, route, setIsLoggedIn }) {
  const routeUser = route.params?.user || null;

  const [user, setUser] = useState(routeUser);
  const [name, setName] = useState(routeUser?.name || '');
  const [role, setRole] = useState('');
  const [image, setImage] = useState('');
  const [location, setLocation] = useState('');
  const [about, setAbout] = useState('');
  const [education, setEducation] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      if (routeUser) {
        return;
      }

      try {
        const storedUser = await AsyncStorage.getItem('user');

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setName(parsedUser.name || '');
        }
      } catch (error) {
        console.log('Error loading user:', error);
      }
    };

    loadUser();
  }, [routeUser]);

  const inputData = [
    { id: '1', label: 'Name', value: name, setValue: setName },
    { id: '2', label: 'Role', value: role, setValue: setRole },
    { id: '3', label: 'Image URL', value: image, setValue: setImage },
    { id: '4', label: 'Location', value: location, setValue: setLocation },
    { id: '5', label: 'About', value: about, setValue: setAbout },
    { id: '6', label: 'Education', value: education, setValue: setEducation },
  ];

  const handleCreateProfile = async () => {
    try {
      if (!user) {
        Alert.alert(
          'Login Required',
          'Please login before creating a profile.',
        );
        navigation.replace('Login');
        return;
      }

      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert(
          'Login Required',
          'Please login before creating a profile.',
        );
        navigation.replace('Login');
        return;
      }

      const response = await fetch('http://10.0.2.2:5000/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name,
          role: role,
          image: image,
          location: location,
          followersCount: 0,
          followingCount: 0,
          about: about,
          education: education,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setIsLoggedIn?.(true);
        Alert.alert('Success', data.message);

        navigation.replace('Profile', {
          profile: data.profile,
        });
      } else {
        Alert.alert('Error', data.message || 'Profile creation failed');
      }
    } catch (error) {
      console.log('Create profile error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  const renderInput = ({ item }) => {
    return (
      <View>
        <Text style={styles.label}>{item.label}</Text>

        <TextInput
          value={item.value}
          onChangeText={item.setValue}
          style={styles.input}
          placeholder={item.label}
        />
      </View>
    );
  };

  return (
    <FlatList
      data={inputData}
      renderItem={renderInput}
      keyExtractor={item => item.id}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      ListHeaderComponent={<Text style={styles.title}>Create Profile</Text>}
      ListFooterComponent={
        <TouchableOpacity style={styles.button} onPress={handleCreateProfile}>
          <Text style={styles.buttonText}>Create Profile</Text>
        </TouchableOpacity>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e7dcdc',
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 5,
    color: '#111',
  },
  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#7f7ab8',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default CreateProfileScreen;
