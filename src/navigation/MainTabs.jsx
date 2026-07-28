import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import TransactionsScreen from '../screens/transactions/TransactionsScreen';
import AccountsScreen from '../screens/accounts/AccountsScreen';
import ImportsScreen from '../screens/imports/ImportsScreen';
import MoreStack from './MoreStack';
import { brand } from '../theme/theme';

const Tab = createBottomTabNavigator();

// Same five destinations, same order, as frontend/src/components/layout/MobileBottomNav.jsx
// — Dashboard / Transactions / Accounts / Import stay thumb-reachable; everything else
// (Allocation, Categories, Types, Subcategories, Merchants, Reports, Settings) sits one tap
// deeper behind "More", matching the web app's hamburger-drawer split.
const ICONS = {
  Dashboard: 'view-dashboard-outline',
  Transactions: 'swap-horizontal',
  Accounts: 'bank-outline',
  Import: 'upload-outline',
  More: 'dots-horizontal',
};

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: brand.navy,
      tabBarInactiveTintColor: '#94A3B8',
      tabBarIcon: ({ color, size }) => (
        <MaterialCommunityIcons name={ICONS[route.name]} color={color} size={size} />
      ),
    })}
  >
    <Tab.Screen name="Dashboard" component={DashboardScreen} />
    <Tab.Screen name="Transactions" component={TransactionsScreen} />
    <Tab.Screen name="Accounts" component={AccountsScreen} />
    <Tab.Screen name="Import" component={ImportsScreen} />
    <Tab.Screen name="More" component={MoreStack} />
  </Tab.Navigator>
);

export default MainTabs;
