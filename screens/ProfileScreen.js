import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

function ProfileScreen({ navigation, route, isFollowing, onToggleFollow }) {
  const { profile } = route.params;

  console.log(profile);
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const user = await AsyncStorage.getItem('user');

      if (user) {
        setLoggedInUser(JSON.parse(user));
      }
    };

    loadUser();
  }, []);
  const followersCount = profile.followers;

  const followingCount = profile.following;

  const handleFollow = () => {
    onToggleFollow(profile.id);
  };

  const sectionsData = [
    { id: '1', type: 'header' },
    { id: '2', type: 'stats' },
    { id: '3', type: 'about' },
    { id: '4', type: 'skills' },
    { id: '5', type: 'education' },
    { id: '6', type: 'experience' },
  ];

  const isMyProfile = loggedInUser?.id === profile.user_id;

  const renderSection = ({ item }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.profileHeader}>
          <Image source={{ uri: profile.image }} style={styles.profileImage} />
          <Text style={styles.profileName}>{profile.name}</Text>
          <Text style={styles.profileRole}>{profile.title}</Text>
          <Text style={styles.profileLocation}>{profile.location}</Text>

          <View style={styles.buttonContainer}>
            {isMyProfile ? (
              <TouchableOpacity
                style={styles.followButton}
                onPress={() => navigation.navigate('EditProfile', { profile })}
              >
                <Text style={styles.followButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.followButton}
                  onPress={handleFollow}
                >
                  <Text style={styles.followButtonText}>
                    {isFollowing ? 'Following' : 'Follow'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.messageButton}>
                  <Text style={styles.messageButtonText}>Message</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      );
    } else if (item.type === 'stats') {
      return (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{followersCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>
      );
    } else if (item.type === 'about') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.sectionContent}>{profile.about}</Text>
        </View>
      );
    } else if (item.type === 'skills') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>

          <View style={styles.skillsContainer}>
            {profile.skills.map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      );
    } else if (item.type === 'education') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          <Text style={styles.sectionContent}>{profile.education}</Text>
        </View>
      );
    } else if (item.type === 'experience') {
      return (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>

          <View style={styles.experienceHeader}>
            <Text style={styles.experienceRole}>{profile.title}</Text>
            <Text style={styles.experienceDate}>2024 - Present</Text>
          </View>

          <Text style={styles.sectionContent}>
            Working with a collaborative team to design and deliver reliable
            digital products.
          </Text>
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
  profileHeader: {
    width: '90%',
    alignSelf: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#d2e0b9',
    borderRadius: 28,
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
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111',
  },
  profileRole: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginTop: 5,
  },
  profileLocation: {
    fontSize: 14,
    color: '#555',
    marginTop: 6,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  followButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#7f7ab8',
    paddingVertical: 10,
    borderRadius: 25,
  },
  followButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  messageButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#7f7ab8',
  },
  messageButtonText: {
    color: '#7f7ab8',
    fontSize: 17,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8e4e4',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 15,
    paddingVertical: 15,
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
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#7f7ab8',
  },
  statLabel: {
    fontSize: 13,
    color: '#555',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#bbb',
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
    color: '#111',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#7f7ab8',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  skillText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  experienceRole: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#111',
  },
  experienceDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default ProfileScreen;
