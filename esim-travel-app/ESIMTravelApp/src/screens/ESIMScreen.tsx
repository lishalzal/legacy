import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ESIMPlan } from '../types';

const ESIMScreen: React.FC = () => {
  const [esimPlans, setEsimPlans] = useState<ESIMPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<ESIMPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const regions = [
    { id: 'all', name: 'All Regions' },
    { id: 'europe', name: 'Europe' },
    { id: 'asia', name: 'Asia' },
    { id: 'americas', name: 'Americas' },
    { id: 'africa', name: 'Africa' },
    { id: 'oceania', name: 'Oceania' },
  ];

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockESIMPlans: ESIMPlan[] = [
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
      {
        id: '4',
        name: 'Australia & New Zealand',
        country: 'Oceania',
        countryCode: 'OC',
        dataAmount: '8GB',
        validity: '20 days',
        price: 22.99,
        currency: 'USD',
        description: 'Coverage across Australia and New Zealand',
        features: ['8GB Data', '2 Countries', 'Fast 4G'],
        coverage: ['Australia', 'New Zealand'],
        activationTime: 'Instant',
      },
      {
        id: '5',
        name: 'South America',
        country: 'South America',
        countryCode: 'SA',
        dataAmount: '3GB',
        validity: '7 days',
        price: 15.99,
        currency: 'USD',
        description: 'Coverage across major South American countries',
        features: ['3GB Data', '8 Countries', 'Reliable Coverage'],
        coverage: ['Brazil', 'Argentina', 'Chile', 'Peru'],
        activationTime: 'Instant',
      },
    ];

    setEsimPlans(mockESIMPlans);
    setFilteredPlans(mockESIMPlans);
  }, []);

  useEffect(() => {
    filterPlans();
  }, [searchQuery, selectedRegion, esimPlans]);

  const filterPlans = () => {
    let filtered = esimPlans;

    // Filter by region
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(plan => 
        plan.country.toLowerCase().includes(selectedRegion.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(plan =>
        plan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPlans(filtered);
  };

  const handleBuyPlan = (plan: ESIMPlan) => {
    Alert.alert(
      'Purchase eSIM',
      `Would you like to purchase ${plan.name} for $${plan.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Buy Now', onPress: () => handlePurchase(plan) },
      ]
    );
  };

  const handlePurchase = (plan: ESIMPlan) => {
    Alert.alert('Success', `${plan.name} has been purchased! Check your email for activation instructions.`);
  };

  const renderPlanItem = ({ item }: { item: ESIMPlan }) => (
    <TouchableOpacity style={styles.planItem}>
      <View style={styles.planHeader}>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{item.name}</Text>
          <Text style={styles.planCountry}>{item.country}</Text>
        </View>
        <View style={styles.planPriceContainer}>
          <Text style={styles.planPrice}>${item.price}</Text>
          <Text style={styles.planCurrency}>{item.currency}</Text>
        </View>
      </View>

      <View style={styles.planDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="cellular" size={16} color="#007AFF" />
          <Text style={styles.detailText}>{item.dataAmount}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time" size={16} color="#007AFF" />
          <Text style={styles.detailText}>{item.validity}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="flash" size={16} color="#007AFF" />
          <Text style={styles.detailText}>{item.activationTime}</Text>
        </View>
      </View>

      <Text style={styles.planDescription}>{item.description}</Text>

      <View style={styles.featuresContainer}>
        {item.features.slice(0, 3).map((feature, index) => (
          <View key={index} style={styles.featureTag}>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={styles.buyButton}
        onPress={() => handleBuyPlan(item)}
      >
        <Text style={styles.buyButtonText}>Buy Now</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderRegionFilter = () => (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {regions.map((region) => (
          <TouchableOpacity
            key={region.id}
            style={[
              styles.filterChip,
              selectedRegion === region.id && styles.filterChipActive,
            ]}
            onPress={() => setSelectedRegion(region.id)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedRegion === region.id && styles.filterChipTextActive,
              ]}
            >
              {region.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search eSIM plans..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {renderRegionFilter()}

      <FlatList
        data={filteredPlans}
        renderItem={renderPlanItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  planItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  planCountry: {
    fontSize: 14,
    color: '#666',
  },
  planPriceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  planCurrency: {
    fontSize: 12,
    color: '#666',
  },
  planDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 4,
  },
  planDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  featureTag: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  featureText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  buyButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ESIMScreen;