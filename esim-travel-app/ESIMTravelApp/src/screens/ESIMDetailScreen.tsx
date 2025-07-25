import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ESIMPlan } from '../types';

interface ESIMDetailScreenProps {
  route: {
    params: {
      plan: ESIMPlan;
    };
  };
}

const ESIMDetailScreen: React.FC<ESIMDetailScreenProps> = ({ route }) => {
  const { plan } = route.params;
  const [selectedOption, setSelectedOption] = useState<'buy' | 'info'>('info');

  const handlePurchase = () => {
    Alert.alert(
      'Purchase eSIM',
      `Confirm purchase of ${plan.name} for $${plan.price}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Purchase', onPress: () => handleConfirmPurchase() },
      ]
    );
  };

  const handleConfirmPurchase = () => {
    Alert.alert(
      'Purchase Successful!',
      `Your ${plan.name} eSIM has been purchased. Check your email for activation instructions.`,
      [{ text: 'OK', onPress: () => console.log('Purchase completed') }]
    );
  };

  const renderPlanHeader = () => (
    <View style={styles.planHeader}>
      <Text style={styles.planName}>{plan.name}</Text>
      <Text style={styles.planCountry}>{plan.country}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>${plan.price}</Text>
        <Text style={styles.currency}>{plan.currency}</Text>
      </View>
    </View>
  );

  const renderPlanDetails = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Plan Details</Text>
      
      <View style={styles.detailRow}>
        <Ionicons name="cellular" size={20} color="#007AFF" />
        <View style={styles.detailInfo}>
          <Text style={styles.detailLabel}>Data Amount</Text>
          <Text style={styles.detailValue}>{plan.dataAmount}</Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="time" size={20} color="#007AFF" />
        <View style={styles.detailInfo}>
          <Text style={styles.detailLabel}>Validity</Text>
          <Text style={styles.detailValue}>{plan.validity}</Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Ionicons name="flash" size={20} color="#007AFF" />
        <View style={styles.detailInfo}>
          <Text style={styles.detailLabel}>Activation</Text>
          <Text style={styles.detailValue}>{plan.activationTime}</Text>
        </View>
      </View>
    </View>
  );

  const renderFeatures = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Features</Text>
      {plan.features.map((feature, index) => (
        <View key={index} style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.featureText}>{feature}</Text>
        </View>
      ))}
    </View>
  );

  const renderCoverage = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Coverage</Text>
      <View style={styles.coverageContainer}>
        {plan.coverage.map((country, index) => (
          <View key={index} style={styles.coverageItem}>
            <Text style={styles.coverageText}>{country}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderDescription = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.descriptionText}>{plan.description}</Text>
    </View>
  );

  const renderPurchaseSection = () => (
    <View style={styles.purchaseSection}>
      <View style={styles.priceDisplay}>
        <Text style={styles.priceLabel}>Total Price</Text>
        <Text style={styles.priceAmount}>${plan.price} {plan.currency}</Text>
      </View>
      
      <TouchableOpacity style={styles.purchaseButton} onPress={handlePurchase}>
        <Ionicons name="card" size={20} color="#fff" />
        <Text style={styles.purchaseButtonText}>Purchase Now</Text>
      </TouchableOpacity>
      
      <View style={styles.purchaseInfo}>
        <Ionicons name="shield-checkmark" size={16} color="#4CAF50" />
        <Text style={styles.purchaseInfoText}>Secure payment • Instant activation</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderPlanHeader()}
        {renderPlanDetails()}
        {renderFeatures()}
        {renderCoverage()}
        {renderDescription()}
      </ScrollView>
      
      {renderPurchaseSection()}
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
  planHeader: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  planName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  planCountry: {
    fontSize: 18,
    color: '#666',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  currency: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailInfo: {
    marginLeft: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  coverageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
  },
  coverageItem: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  coverageText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    padding: 16,
  },
  purchaseSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  priceDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  purchaseButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  purchaseButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  purchaseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  purchaseInfoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});

export default ESIMDetailScreen;