import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Trip, ActiveESIM } from '../types';

const TravelScreen: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeESIMs, setActiveESIMs] = useState<ActiveESIM[]>([]);
  const [selectedTab, setSelectedTab] = useState<'trips' | 'esims'>('trips');

  useEffect(() => {
    // Mock data - in real app, this would come from API
    const mockTrips: Trip[] = [
      {
        id: '1',
        destination: 'Paris, France',
        countryCode: 'FR',
        startDate: '2024-08-15',
        endDate: '2024-08-22',
        status: 'upcoming',
        notes: 'Business trip for conference',
      },
      {
        id: '2',
        destination: 'Tokyo, Japan',
        countryCode: 'JP',
        startDate: '2024-07-10',
        endDate: '2024-07-17',
        status: 'completed',
        esimPlan: {
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
        },
        notes: 'Vacation with family',
      },
      {
        id: '3',
        destination: 'New York, USA',
        countryCode: 'US',
        startDate: '2024-06-20',
        endDate: '2024-06-25',
        status: 'completed',
        esimPlan: {
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
        notes: 'Business meetings',
      },
    ];

    const mockActiveESIMs: ActiveESIM[] = [
      {
        id: '1',
        planId: '1',
        plan: {
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
        },
        activationDate: '2024-08-01',
        expiryDate: '2024-08-31',
        dataUsed: 2.5,
        dataTotal: 999999, // Unlimited
        status: 'active',
        iccid: '89001012345678901234',
      },
    ];

    setTrips(mockTrips);
    setActiveESIMs(mockActiveESIMs);
  }, []);

  const getStatusColor = (status: Trip['status']) => {
    switch (status) {
      case 'upcoming':
        return '#FFA500';
      case 'active':
        return '#4CAF50';
      case 'completed':
        return '#666';
      default:
        return '#666';
    }
  };

  const getStatusText = (status: Trip['status']) => {
    switch (status) {
      case 'upcoming':
        return 'Upcoming';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const renderTripItem = ({ item }: { item: Trip }) => (
    <TouchableOpacity style={styles.tripItem}>
      <View style={styles.tripHeader}>
        <View style={styles.tripInfo}>
          <Text style={styles.tripDestination}>{item.destination}</Text>
          <Text style={styles.tripDates}>
            {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      {item.notes && (
        <Text style={styles.tripNotes}>{item.notes}</Text>
      )}

      {item.esimPlan && (
        <View style={styles.esimInfoRow}>
          <Ionicons name="cellular" size={16} color="#007AFF" />
          <Text style={styles.esimText}>
            eSIM: {item.esimPlan.name} ({item.esimPlan.dataAmount})
          </Text>
        </View>
      )}

      <View style={styles.tripActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="eye" size={16} color="#007AFF" />
          <Text style={styles.actionText}>View Details</Text>
        </TouchableOpacity>
        {item.status === 'upcoming' && (
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle" size={16} color="#007AFF" />
            <Text style={styles.actionText}>Add eSIM</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderESIMItem = ({ item }: { item: ActiveESIM }) => (
    <TouchableOpacity style={styles.esimItem}>
      <View style={styles.esimHeader}>
        <View style={styles.esimInfo}>
          <Text style={styles.esimName}>{item.plan.name}</Text>
          <Text style={styles.esimCountry}>{item.plan.country}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'active' ? '#4CAF50' : '#FF6B6B' }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.dataUsageContainer}>
        <View style={styles.dataUsageBar}>
          <View
            style={[
              styles.dataUsageFill,
              { width: `${(item.dataUsed / item.dataTotal) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.dataUsageText}>
          {item.dataUsed}GB / {item.dataTotal === 999999 ? 'Unlimited' : `${item.dataTotal}GB`} used
        </Text>
      </View>

      <View style={styles.esimDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={16} color="#666" />
          <Text style={styles.detailText}>
            Activated: {new Date(item.activationDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time" size={16} color="#666" />
          <Text style={styles.detailText}>
            Expires: {new Date(item.expiryDate).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="card" size={16} color="#666" />
          <Text style={styles.detailText}>ICCID: {item.iccid}</Text>
        </View>
      </View>

      <View style={styles.esimActions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="refresh" size={16} color="#007AFF" />
          <Text style={styles.actionText}>Refresh Data</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="settings" size={16} color="#007AFF" />
          <Text style={styles.actionText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderTabHeader = () => (
    <View style={styles.tabHeader}>
      <TouchableOpacity
        style={[styles.tabButton, selectedTab === 'trips' && styles.tabButtonActive]}
        onPress={() => setSelectedTab('trips')}
      >
        <Text style={[styles.tabText, selectedTab === 'trips' && styles.tabTextActive]}>
          My Trips ({trips.length})
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tabButton, selectedTab === 'esims' && styles.tabButtonActive]}
        onPress={() => setSelectedTab('esims')}
      >
        <Text style={[styles.tabText, selectedTab === 'esims' && styles.tabTextActive]}>
          Active eSIMs ({activeESIMs.length})
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderTabHeader()}

      {selectedTab === 'trips' ? (
        <FlatList
          data={trips}
          renderItem={renderTripItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={activeESIMs}
          renderItem={renderESIMItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  tripItem: {
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
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tripInfo: {
    flex: 1,
  },
  tripDestination: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tripDates: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tripNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  esimInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  esimText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
  },
  tripActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  esimItem: {
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
  esimHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  esimInfo: {
    flex: 1,
  },
  esimName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  esimCountry: {
    fontSize: 14,
    color: '#666',
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
  esimDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  esimActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});

export default TravelScreen;