/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState } from 'react';
import {
  Alert,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  Text,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import CreateProfileScreen from './screens/CreateProfileScreen';
import AdminDashboardScreen from './screens/AdminDashboardScreen';
import EditProfileScreen from './screens/EditProfileScreen';

const Stack = createNativeStackNavigator();

function App() {
  const [followedProfileIds, setFollowedProfileIds] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  useEffect(() => {
    checkLogin();
  }, []);

  const checkLogin = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (token) {
        setIsLoggedIn(true);
        setUserRole(user?.role || null);
      }
    } catch (error) {
      console.log('Error checking login:', error);
    }
  };

  const handleFollow = profileId => {
    if (followedProfileIds.includes(profileId)) {
      const updatedList = followedProfileIds.filter(id => id !== profileId);
      setFollowedProfileIds(updatedList);
    } else {
      setFollowedProfileIds([...followedProfileIds, profileId]);
    }
  };

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#ffffff',
            },
            headerTintColor: '#7f7ab8',
            headerTitleStyle: {
              color: '#111111',
              fontWeight: '800',
            },
            contentStyle: {
              backgroundColor: '#e7dcdc',
            },
          }}
        >
          <Stack.Screen
            name="Home"
            options={({ navigation }) => ({
              title: 'Profile',

              headerRight: () => (
                <TouchableOpacity
                  onPress={() => {
                    if (isLoggedIn) {
                      Alert.alert(
                        'Logout',
                        'Are you sure you want to logout?',
                        [
                          {
                            text: 'Cancel',
                            style: 'cancel',
                          },
                          {
                            text: 'Logout',
                            onPress: async () => {
                              await AsyncStorage.removeItem('token');
                              await AsyncStorage.removeItem('user');
                              setUserRole(null);

                              setIsLoggedIn(false);
                              navigation.replace('Login');
                            },
                          },
                        ],
                      );
                    } else {
                      navigation.navigate('Login');
                    }
                  }}
                >
                  <Text style={styles.headerButtonText}>
                    {isLoggedIn ? 'Logout' : 'Login'}
                  </Text>
                </TouchableOpacity>
              ),
            })}
          >
            {props => (
              <HomeScreen
                {...props}
                followedProfileIds={followedProfileIds}
                onToggleFollow={handleFollow}
                isLoggedIn={isLoggedIn}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Login" options={{ headerBackVisible: false }}>
            {props => (
              <LoginScreen
                {...props}
                setIsLoggedIn={setIsLoggedIn}
                setUserRole={setUserRole}
              />
            )}
          </Stack.Screen>

          <Stack.Screen
            name="AdminDashboard"
            options={{ title: 'Admin Dashboard', headerBackVisible: false }}
          >
            {props => (
              <AdminDashboardScreen
                {...props}
                setIsLoggedIn={setIsLoggedIn}
                userRole={userRole}
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="Register" component={RegisterScreen} />

          <Stack.Screen
            name="CreateProfile"
            options={{ title: 'Create Profile' }}
          >
            {props => (
              <CreateProfileScreen {...props} setIsLoggedIn={setIsLoggedIn} />
            )}
          </Stack.Screen>

          <Stack.Screen
            name="Profile"
            options={({ route }) => ({ title: route.params.profile.name })}
          >
            {props => {
              const profile = props.route.params.profile;

              return (
                <ProfileScreen
                  {...props}
                  profile={profile}
                  isFollowing={followedProfileIds.includes(profile.id)}
                  onToggleFollow={handleFollow}
                />
              );
            }}
          </Stack.Screen>

          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  headerButtonText: {
    color: '#7f7ab8',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default App;
