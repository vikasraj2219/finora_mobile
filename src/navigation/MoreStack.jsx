import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MoreScreen from '../screens/more/MoreScreen';
import AllocationScreen from '../screens/allocation/AllocationScreen';
import CategoriesScreen from '../screens/categories/CategoriesScreen';
import TypesScreen from '../screens/types/TypesScreen';
import SubcategoriesScreen from '../screens/subcategories/SubcategoriesScreen';
import MerchantsScreen from '../screens/merchants/MerchantsScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import { brand } from '../theme/theme';

const Stack = createNativeStackNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: brand.navy },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '600' },
};

const MoreStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="MoreMenu" component={MoreScreen} options={{ title: 'More', ...headerOptions }} />
    <Stack.Screen name="Allocation" component={AllocationScreen} options={headerOptions} />
    <Stack.Screen name="Categories" component={CategoriesScreen} options={headerOptions} />
    <Stack.Screen name="Types" component={TypesScreen} options={headerOptions} />
    <Stack.Screen name="Subcategories" component={SubcategoriesScreen} options={headerOptions} />
    <Stack.Screen name="Merchants" component={MerchantsScreen} options={headerOptions} />
    <Stack.Screen name="Reports" component={ReportsScreen} options={headerOptions} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={headerOptions} />
  </Stack.Navigator>
);

export default MoreStack;
