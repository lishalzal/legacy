import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ESIMPlan, ActiveESIM } from '../types';

const HomeScreen: React.FC = () => {
  const [activeESIM, setActiveESIM] = useState<ActiveESIM | null>(null);
  const [featuredPlans, setFeaturedPlans] = useState<ESIMPlan[]>([]);

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockFeaturedPlans: ESIMPlan[] = [
      {
        id: '1',
        name: 'Europe Unlimited',
        country: 'Europe',
        countryCode: 'EU',
        dataAmount: 'Unlimited',
        validity: '30 days',
        price: 29.99,
        currency: 'USD',
        description: 'Unlimited data across 30+ European countries',
        features: ['Unlimited Data', '30 Countries', '24/7 Support'],
        coverage: ['France', 'Germany', 'Italy', 'Spain', 'Netherlands'],
        activationTime: 'Instant',
        isPopular: true,
      },
      {
        id: '2',
        name: 'Asia Explorer',
        country: 'Asia',
        countryCode: 'AS',
        dataAmount: '10GB',
        validity: '15 days',
        price: 19.99,
        currency: 'USD',
        description: 'High-speed data across major Asian destinations',
        features: ['10GB Data', '15 Countries', 'Fast 4G'],
        coverage: ['Japan', 'South Korea', 'Thailand', 'Singapore'],
        activationTime: 'Instant',
        isRecommended: true,
      },
      {
        id: '3',
        name: 'USA & Canada',
        country: 'North America',
        countryCode: 'NA',
        dataAmount: '5GB',
        validity: '10 days',
        price: 24.99,
        currency: 'USD',
        description: 'Reliable coverage across USA and Canada',
        features: ['5GB Data', '2 Countries', 'Nationwide Coverage'],
        coverage: ['United States', 'Canada'],
        activationTime: 'Instant',
      },
    ];

    setFeaturedPlans(mockFeaturedPlans);
  }, []);

  const handleQuickAction = (action: string) => {
    Alert.alert('Quick Action', `${action} feature coming soon!`);
  };

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => handleQuickAction('Find eSIM')}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="search" size={24} color="#007AFF" />
          </View>
          <Text style={styles.quickActionText}>Find eSIM</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => handleQuickAction('My Trips')}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="airplane" size={24} color="#007AFF" />
          </View>
          <Text style={styles.quickActionText}>My Trips</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => handleQuickAction('Support')}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="help-circle" size={24} color="#007AFF" />
          </View>
          <Text style={styles.quickActionText}>Support</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => handleQuickAction('Settings')}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="settings" size={24} color="#007AFF" />
          </View>
          <Text style={styles.quickActionText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderActiveESIM = () => {
    if (!activeESIM) {
      return (
        <View style={styles.noActiveESIM}>
          <Ionicons name="cellular-outline" size={48} color="#ccc" />
          <Text style={styles.noActiveESIMText}>No active eSIM</Text>
          <Text style={styles.noActiveESIMSubtext}>
            Purchase an eSIM plan to get started
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.activeESIMCard}>
        <View style={styles.activeESIMHeader}>
          <Ionicons name="cellular" size={24} color="#4CAF50" />
          <Text style={styles.activeESIMTitle}>Active eSIM</Text>
        </View>
        <Text style={styles.activeESIMName}>{activeESIM.plan.name}</Text>
        <View style={styles.dataUsageContainer}>
          <View style={styles.dataUsageBar}>
            <View
              style={[
                styles.dataUsageFill,
                { width: `${(activeESIM.dataUsed / activeESIM.dataTotal) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.dataUsageText}>
            {activeESIM.dataUsed}GB / {activeESIM.dataTotal}GB used
          </Text>
        </View>
        <Text style={styles.expiryText}>
          Expires: {new Date(activeESIM.expiryDate).toLocaleDateString()}
        </Text>
      </View>
    );
  };

  const renderFeaturedPlans = () => (
    <View style={styles.featuredContainer}>
      <Text style={styles.sectionTitle}>Featured Plans</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {featuredPlans.map((plan) => (
          <TouchableOpacity key={plan.id} style={styles.planCard}>
            {plan.isPopular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>Popular</Text>
              </View>
            )}
            {plan.isRecommended && (
              <View style={styles.recommendedBadge}>
                <Text style={styles.recommendedText}>Recommended</Text>
              </View>
            )}
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planCountry}>{plan.country}</Text>
            <Text style={styles.planData}>{plan.dataAmount}</Text>
            <Text style={styles.planValidity}>{plan.validity}</Text>
            <Text style={styles.planPrice}>
              ${plan.price} {plan.currency}
            </Text>
            <TouchableOpacity style={styles.buyButton}>
              <Text style={styles.buyButtonText}>Buy Now</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome to</Text>
          <Text style={styles.appTitle}>Travel eSIM</Text>
        </View>

        {renderActiveESIM()}
        {renderQuickActions()}
        {renderFeaturedPlans()}
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
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  welcomeText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 4,
  },
  noActiveESIM: {
    margin: 20,
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noActiveESIMText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  noActiveESIMSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  activeESIMCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeESIMHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activeESIMTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  activeESIMName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  dataUsageContainer: {
    marginBottom: 12,
  },
  dataUsageBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8,
  },
  dataUsageFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  dataUsageText: {
    fontSize: 14,
    color: '#666',
  },
  expiryText: {
    fontSize: 14,
    color: '#666',
  },
  quickActionsContainer: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f8ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  featuredContainer: {
    margin: 20,
  },
  planCard: {
    width: 200,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  recommendedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recommendedText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  planCountry: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  planData: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  planValidity: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  buyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default HomeScreen;