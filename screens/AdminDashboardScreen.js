import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

function AdminDashboardScreen({ navigation, setIsLoggedIn }) {
  const [profiles, setProfiles] = useState([]);
  const [adminUser, setAdminUser] = useState(null);

  const loadDashboard = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      setAdminUser(storedUser ? JSON.parse(storedUser) : null);

      const response = await fetch('http://10.0.2.2:5000/api/profiles');
      const data = await response.json();
      setProfiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log('Admin dashboard error:', error);
      Alert.alert('Error', 'Could not load dashboard data');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboard();
    }, []),
  );

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    setIsLoggedIn(false);
    navigation.replace('Login');
  };

  const renderProfile = ({ item }) => (
    <View style={styles.profileRow}>
      <View style={styles.profileTextBlock}>
        <Text style={styles.profileName}>{item.name}</Text>
        <Text style={styles.profileMeta}>{item.email}</Text>
        <Text style={styles.profileMeta}>{item.role}</Text>
      </View>
      <Text style={styles.profileLocation}>{item.location}</Text>
    </View>
  );

  return (
    <FlatList
      data={profiles}
      renderItem={renderProfile}
      keyExtractor={item => item.id}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>{adminUser?.email}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{profiles.length}</Text>
              <Text style={styles.statLabel}>Profiles</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>No profiles found.</Text>
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
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e8e4e4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  profileTextBlock: {
    flex: 1,
    paddingRight: 12,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111111',
  },
  profileMeta: {
    fontSize: 13,
    color: '#555555',
    marginTop: 3,
  },
  profileLocation: {
    fontSize: 12,
    color: '#7f7ab8',
    fontWeight: '700',
  },
  emptyText: {
    textAlign: 'center',
    color: '#555555',
    marginTop: 30,
  },
});

export default AdminDashboardScreen;
