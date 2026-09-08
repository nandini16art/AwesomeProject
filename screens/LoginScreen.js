import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

function LoginScreen({ navigation, route, setIsLoggedIn, setUserRole }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState('user');

  const selectedProfile = route.params?.profile;

  const goToUserHome = () => {
    navigation.replace('Home');
  };

  const handleLogin = async () => {
    try {
      console.log('===== LOGIN REQUEST =====');
      console.log('Email:', email);
      console.log('Password:', password);
      console.log('Role:', loginRole);

      const response = await fetch('http://10.0.2.2:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
          role: loginRole,
        }),
      });

      const data = await response.json();
      console.log('Status:', response.status);
      console.log('Response:', data);
      console.log(data);

      if (response.ok && data.success) {
        Alert.alert('User Data', JSON.stringify(data.user));
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('user', JSON.stringify(data.user));

        setIsLoggedIn(true);
        setUserRole?.(data.user.role);

        if (data.user.role === 'admin') {
          navigation.replace('AdminDashboard');
          return;
        }

        if (selectedProfile) {
          navigation.replace('Profile', {
            profile: selectedProfile,
          });
          return;
        }

        goToUserHome();
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid login details');
      }
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Error', 'Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <View style={styles.roleSwitcher}>
        <TouchableOpacity
          style={[
            styles.roleButton,
            loginRole === 'admin' && styles.activeRoleButton,
          ]}
          onPress={() => setLoginRole('admin')}
        >
          <Text
            style={[
              styles.roleText,
              loginRole === 'admin' && styles.activeRoleText,
            ]}
          >
            Admin
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.roleButton,
            loginRole === 'user' && styles.activeRoleButton,
          ]}
          onPress={() => setLoginRole('user')}
        >
          <Text
            style={[
              styles.roleText,
              loginRole === 'user' && styles.activeRoleText,
            ]}
          >
            User
          </Text>
        </TouchableOpacity>
      </View>

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

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>
          {loginRole === 'admin' ? 'Admin Login' : 'User Login'}
        </Text>
      </TouchableOpacity>

      {loginRole === 'user' ? (
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerText}>Create new account</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#e7dcdc',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 22,
    alignSelf: 'center',
  },
  roleSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#d9cccc',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 10,
  },
  activeRoleButton: {
    backgroundColor: '#7f7ab8',
  },
  roleText: {
    color: '#333333',
    fontSize: 15,
    fontWeight: '700',
  },
  activeRoleText: {
    color: '#ffffff',
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
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  registerText: {
    color: '#7f7ab8',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default LoginScreen;
