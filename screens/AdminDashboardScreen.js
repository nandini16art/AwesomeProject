import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

function AdminDashboardScreen({ navigation, setIsLoggedIn }) {
  const [users, setUsers] = useState([]);
  const [adminUser, setAdminUser] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const getAuthHeaders = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');

    return {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
    };
  }, []);

  const loadDashboard = useCallback(async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      setAdminUser(storedUser ? JSON.parse(storedUser) : null);

      const response = await fetch('http://10.0.2.2:5000/api/users', {
        headers: await getAuthHeaders(),
      });
      const data = await response.json();

      if (response.ok) {
        setUsers(Array.isArray(data.users) ? data.users : []);
      } else {
        Alert.alert('Error', data.message || 'Could not load users');
      }
    } catch (error) {
      console.log('Admin dashboard error:', error);
      Alert.alert('Error', 'Could not load dashboard data');
    }
  }, [getAuthHeaders]);

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, [loadDashboard]),
  );

  const handleCreateUser = async () => {
    try {
      if (!name.trim() || !email.trim() || !password) {
        Alert.alert(
          'Missing Details',
          'Name, email, and password are required.',
        );
        return;
      }

      setIsSaving(true);

      const response = await fetch('http://10.0.2.2:5000/api/users', {
        method: 'POST',
        headers: await getAuthHeaders(),
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setName('');
        setEmail('');
        setPassword('');
        Alert.alert('Success', data.message);
        loadDashboard();
      } else {
        Alert.alert('Error', data.message || 'Could not create user');
      }
    } catch (error) {
      console.log('Create user error:', error);
      Alert.alert('Error', 'Could not create user');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteUser = async user => {
    try {
      const response = await fetch(
        'http://10.0.2.2:5000/api/users/' + user.id,
        {
          method: 'DELETE',
          headers: await getAuthHeaders(),
        },
      );
      const data = await response.json();

      if (response.ok) {
        setUsers(currentUsers =>
          currentUsers.filter(currentUser => currentUser.id !== user.id),
        );
        Alert.alert('Success', data.message);
      } else {
        Alert.alert('Error', data.message || 'Could not delete user');
      }
    } catch (error) {
      console.log('Delete user error:', error);
      Alert.alert('Error', 'Could not delete user');
    }
  };

  const handleDeleteUser = user => {
    Alert.alert('Delete User', 'Delete ' + user.name + '?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteUser(user),
      },
    ]);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setIsLoggedIn(false);
    navigation.replace('Login');
  };

  const renderUser = ({ item }) => {
    const canDelete = item.role !== 'admin' && item.id !== adminUser?.id;

    return (
      <View style={styles.userRow}>
        <View style={styles.userTextBlock}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userMeta}>{item.email}</Text>
          <Text style={styles.userMeta}>
            {item.role} {item.title ? '- ' + item.title : ''}
          </Text>
        </View>

        {canDelete ? (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteUser(item)}
          >
            <Text style={styles.deleteText}>Delete</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  };

  return (
    <FlatList
      data={users}
      renderItem={renderUser}
      keyExtractor={item => String(item.id)}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      ListHeaderComponent={
        <View>
          <View style={styles.header}>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>{adminUser?.email}</Text>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>{users.length}</Text>
                <Text style={styles.statLabel}>Users</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.createPanel}>
            <Text style={styles.sectionTitle}>Create User</Text>

            <TextInput
              placeholder="Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />

            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              style={styles.input}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateUser}
              disabled={isSaving}
            >
              <Text style={styles.createText}>
                {isSaving ? 'Creating...' : 'Create User'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Existing Users</Text>
        </View>
      }
      ListEmptyComponent={<Text style={styles.emptyText}>No users found.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e7dcdc',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    backgroundColor: '#d2e0b9',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#111111',
  },
  subtitle: {
    fontSize: 14,
    color: '#555555',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#7f7ab8',
  },
  statLabel: {
    fontSize: 13,
    color: '#555555',
    marginTop: 4,
  },
  logoutButton: {
    marginTop: 16,
    backgroundColor: '#ff6268',
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 10,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  createPanel: {
    backgroundColor: '#e8e4e4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
  },
  sectionTitle: {
    color: '#111111',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#ffffff',
    borderColor: '#cccccc',
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  createButton: {
    alignItems: 'center',
    backgroundColor: '#7f7ab8',
    borderRadius: 20,
    paddingVertical: 10,
  },
  createText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8e4e4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  userTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111111',
  },
  userMeta: {
    fontSize: 13,
    color: '#555555',
    marginTop: 3,
  },
  deleteButton: {
    backgroundColor: '#ff6268',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  deleteText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    color: '#555555',
    marginTop: 30,
  },
});

export default AdminDashboardScreen;
