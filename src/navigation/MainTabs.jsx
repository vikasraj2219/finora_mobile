import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import TransactionsScreen from '../screens/transactions/TransactionsScreen';
import AccountsScreen from '../screens/accounts/AccountsScreen';
import InsightsScreen from '../screens/insights/InsightsScreen';
import MoreStack from './MoreStack';
import CustomTabBar from './CustomTabBar';

const Tab = createBottomTabNavigator();

// Redesigned per brief §5: Home / Transactions / Accounts / Insights / More,
// with Add as a floating center button (CustomTabBar) rather than its own
// permanent tab slot. Import moved off the tab bar into More + the Home
// quick-actions row, freeing a slot for the new Insights tab.
const MainTabs = () => (
  <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <CustomTabBar {...props} />}>
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Transactions" component={TransactionsScreen} />
    <Tab.Screen name="Accounts" component={AccountsScreen} />
    <Tab.Screen name="Insights" component={InsightsScreen} />
    <Tab.Screen name="More" component={MoreStack} />
  </Tab.Navigator>
);

export default MainTabs;
