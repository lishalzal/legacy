export interface ESIMPlan {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  dataAmount: string;
  validity: string;
  price: number;
  currency: string;
  description: string;
  features: string[];
  coverage: string[];
  activationTime: string;
  isPopular?: boolean;
  isRecommended?: boolean;
}

export interface Country {
  name: string;
  code: string;
  flag: string;
  region: string;
  popularPlans: ESIMPlan[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  preferences: {
    language: string;
    currency: string;
    notifications: boolean;
  };
}

export interface Trip {
  id: string;
  destination: string;
  countryCode: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  esimPlan?: ESIMPlan;
  notes?: string;
}

export interface ActiveESIM {
  id: string;
  planId: string;
  plan: ESIMPlan;
  activationDate: string;
  expiryDate: string;
  dataUsed: number;
  dataTotal: number;
  status: 'active' | 'expired' | 'suspended';
  iccid: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  currency: string;
  notifications: {
    lowData: boolean;
    expiryReminder: boolean;
    newPlans: boolean;
  };
}

export type RootStackParamList = {
  Home: undefined;
  ESIMList: undefined;
  ESIMDetail: { plan: ESIMPlan };
  Travel: undefined;
  Profile: undefined;
};

export type TabParamList = {
  Home: undefined;
  eSIM: undefined;
  Travel: undefined;
  Profile: undefined;
};