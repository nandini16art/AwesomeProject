import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const DEFAULT_PROFILE_IMAGE = 'https://i.pravatar.cc/300?img=1';

function HomeScreen({ navigation, isLoggedIn }) {
  const [myProfile, setMyProfile] = useState(null);
  const [suggestedProfiles, setSuggestedProfiles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const sectionsData = [
    { id: '1', type: 'header' },
    { id: '5', type: 'suggestedProfiles' },
  ];

  const getMyProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        setMyProfile(null);
        return;
      }

      const response = await fetch('http://10.0.2.2:5000/api/profiles/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMyProfile(data.profile);
      } else {
        setMyProfile(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getSuggestedProfiles = async () => {
    try {
      console.log('getSuggestedProfiles called');

      const token = await AsyncStorage.getItem('token');
      console.log('Token:', token);

      const response = await fetch('http://10.0.2.2:5000/api/profiles', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response Status:', response.status);

      const data = await response.json();
      console.log('API Response:', data);

      if (response.ok) {
        const storedUser = await AsyncStorage.getItem('user');
        const user = storedUser ? JSON.parse(storedUser) : null;
        setCurrentUser(user);

        const filteredProfiles = data.profiles.filter(
          profile => profile.user_id !== user?.id,
        );

        setSuggestedProfiles(filteredProfiles);
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getMyProfile();
      getSuggestedProfiles();
    }, []),
  );

  const profilesToShow = suggestedProfiles.slice(0, 5);

  const handleProfilePress = profile => {
    if (isLoggedIn) {
      navigation.navigate('Profile', { profile });
    } else {
      navigation.navigate('Login', { profile });
    }
  };

  const handleFollow = async profile => {
    try {
      const token = await AsyncStorage.getItem('token');

      const response = await fetch(
        `http://10.0.2.2:5000/api/follow/${profile.user_id}`,
        {
          method: profile.isFollowing ? 'DELETE' : 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (response.ok) {
        getSuggestedProfiles();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleMainProfileAction = () => {
    if (myProfile) {
      navigation.navigate('Profile', {
        profile: myProfile,
      });
      return;
    }

    navigation.navigate('CreateProfile', {
      user: currentUser,
    });
  };

  const renderProfileCard = ({ item }) => {
    const profileIsFollowing = item.isFollowing;

    return (
      <View style={styles.profileCard}>
        <TouchableOpacity
          style={styles.profileTopArea}
          onPress={() => handleProfilePress(item)}
        >
          <Image
            source={{ uri: item.image || DEFAULT_PROFILE_IMAGE }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{item.name}</Text>
          <Text style={styles.profileRole}>{item.title}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => handleFollow(item)}
        >
          <Text style={styles.profileButtonText}>
            {profileIsFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSection = ({ item }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.card}>
          <Image
            source={{ uri: myProfile?.image || DEFAULT_PROFILE_IMAGE }}
            style={styles.mainImage}
          />

          <Text style={styles.name}>{myProfile?.name || 'No profile yet'}</Text>
          <Text style={styles.title}>
            {myProfile?.title || 'Create your profile to get started'}
          </Text>
          <Text style={styles.designation}>{myProfile?.location || ''}</Text>

          <Text style={styles.aboutText}>
            {myProfile?.about || 'Your profile details will appear here.'}
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.profileActionButton}
              onPress={handleMainProfileAction}
            >
              <Text style={styles.profileActionText}>
                {myProfile ? 'View Profile' : 'Create Profile'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    } else if (item.type === 'suggestedProfiles') {
      return (
        <View>
          <View style={styles.profilesHeader}>
            <Text style={styles.sectionTitle}>Suggested Profiles</Text>
          </View>

          <FlatList
            data={profilesToShow}
            renderItem={renderProfileCard}
            keyExtractor={profile => profile.id}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.profilesList}
          />
        </View>
      );
    }

    return null;
  };

  return (
    <FlatList
      data={sectionsData}
      renderItem={renderSection}
      keyExtractor={item => item.id}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e7dcdc',
  },
  contentContainer: {
    paddingTop: 18,
    paddingBottom: 24,
  },
  card: {
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
    backgroundColor: '#d2e0b9',
    borderRadius: 28,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 5,
  },
  mainImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111111',
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#222222',
    marginTop: 3,
    textAlign: 'center',
  },
  designation: {
    fontSize: 15,
    color: '#555555',
    marginTop: 6,
    marginBottom: 12,
  },
  aboutText: {
    color: '#555555',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  profileActionButton: {
    flex: 1,
    backgroundColor: '#7f7ab8',
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
  },
  deleteOwnButton: {
    flex: 1,
    backgroundColor: '#ff6268',
    paddingVertical: 10,
    borderRadius: 30,
    alignItems: 'center',
  },
  profileActionText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  section: {
    width: '90%',
    alignSelf: 'center',
    padding: 16,
    backgroundColor: '#e8e4e4',
    borderRadius: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    color: '#555555',
    lineHeight: 20,
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#737187',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  skillText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  postsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  postItem: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  internshipItem: {
    borderLeftWidth: 4,
    borderLeftColor: '#7f7ab8',
    paddingLeft: 12,
  },
  internshipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  internshipCompany: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#111111',
  },
  internshipDates: {
    fontSize: 12,
    color: '#999999',
  },
  internshipRole: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f7ab8',
    marginBottom: 6,
  },
  internshipDescription: {
    fontSize: 13,
    color: '#555555',
    lineHeight: 18,
  },
  profilesHeader: {
    backgroundColor: '#e8e4e4',
    paddingHorizontal: '5%',
    paddingTop: 16,
    marginBottom: 12,
  },
  profilesList: {
    paddingHorizontal: '5%',
    gap: 12,
  },
  seeMoreButton: {
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#7f7ab8',
  },
  seeMoreText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  profileCard: {
    width: 130,
    backgroundColor: '#d9cccc',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  profileTopArea: {
    width: '100%',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 11,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 10,
  },
  profileButton: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#7f7ab8',
    paddingVertical: 7,
    borderRadius: 15,
  },
  profileButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default HomeScreen;
