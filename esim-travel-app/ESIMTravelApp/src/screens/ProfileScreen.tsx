import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile, AppSettings } from '../types';

const ProfileScreen: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    language: 'English',
    currency: 'USD',
    notifications: {
      lowData: true,
      expiryReminder: true,
      newPlans: false,
    },
  });

  useEffect(() => {
    // Mock user profile data
    const mockUserProfile: UserProfile = {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567',
      avatar: undefined,
      preferences: {
        language: 'English',
        currency: 'USD',
        notifications: true,
      },
    };

    setUserProfile(mockUserProfile);
  }, []);

  const handleSettingToggle = (setting: keyof AppSettings['notifications']) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [setting]: !prev.notifications[setting],
      },
    }));
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: () => console.log('Logout') },
      ]
    );
  };

  const renderProfileHeader = () => (
    <View style={styles.profileHeader}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color="#fff" />
        </View>
      </View>
      <Text style={styles.userName}>{userProfile?.name}</Text>
      <Text style={styles.userEmail}>{userProfile?.email}</Text>
      <Text style={styles.userPhone}>{userProfile?.phone}</Text>
    </View>
  );

  const renderSettingsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Settings</Text>
      
      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="color-palette" size={20} color="#007AFF" />
          <Text style={styles.settingText}>Theme</Text>
        </View>
        <View style={styles.settingValue}>
          <Text style={styles.settingValueText}>{settings.theme}</Text>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="language" size={20} color="#007AFF" />
          <Text style={styles.settingText}>Language</Text>
        </View>
        <View style={styles.settingValue}>
          <Text style={styles.settingValueText}>{settings.language}</Text>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="card" size={20} color="#007AFF" />
          <Text style={styles.settingText}>Currency</Text>
        </View>
        <View style={styles.settingValue}>
          <Text style={styles.settingValueText}>{settings.currency}</Text>
          <Ionicons name="chevron-forward" size={16} color="#666" />
        </View>
      </TouchableOpacity>
    </View>
  );

  const renderNotificationsSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notifications</Text>
      
      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="warning" size={20} color="#FF6B6B" />
          <Text style={styles.settingText}>Low Data Warning</Text>
        </View>
        <Switch
          value={settings.notifications.lowData}
          onValueChange={() => handleSettingToggle('lowData')}
          trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="time" size={20} color="#FFA500" />
          <Text style={styles.settingText}>Expiry Reminder</Text>
        </View>
        <Switch
          value={settings.notifications.expiryReminder}
          onValueChange={() => handleSettingToggle('expiryReminder')}
          trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="notifications" size={20} color="#4CAF50" />
          <Text style={styles.settingText}>New Plans</Text>
        </View>
        <Switch
          value={settings.notifications.newPlans}
          onValueChange={() => handleSettingToggle('newPlans')}
          trackColor={{ false: '#e0e0e0', true: '#007AFF' }}
          thumbColor="#fff"
        />
      </View>
    </View>
  );

  const renderAccountSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account</Text>
      
      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="person" size={20} color="#007AFF" />
          <Text style={styles.settingText}>Edit Profile</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="lock-closed" size={20} color="#007AFF" />
          <Text style={styles.settingText}>Change Password</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="card" size={20} color="#007AFF" />
          <Text style={styles.settingText}>Payment Methods</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderSupportSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Support</Text>
      
      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="help-circle" size={20} color="#007AFF" />
          <Text style={styles.settingText}>Help Center</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="chatbubble" size={20} color="#007AFF" />
          <Text style={styles.settingText}>Contact Support</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="document-text" size={20} color="#007AFF" />
          <Text style={styles.settingText}>Terms of Service</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#666" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingInfo}>
          <Ionicons name="shield-checkmark" size={20} color="#007AFF" />
          <Text style={styles.settingText}>Privacy Policy</Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#666" />
      </TouchableOpacity>
    </View>
  );

  const renderLogoutButton = () => (
    <View style={styles.section}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out" size={20} color="#FF6B6B" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderProfileHeader()}
        {renderSettingsSection()}
        {renderNotificationsSection()}
        {renderAccountSection()}
        {renderSupportSection()}
        {renderLogoutButton()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  profileHeader: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    paddingBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;