import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import ChartCard from './ChartCard';
import DonutWithLegend from './DonutWithLegend';
import { brand } from '../../theme/theme';

const COLORS = [brand.navy, brand.teal, '#3B82F6', '#F59E0B', '#EC4899', brand.navyLight];
const titleCase = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// Mirrors frontend/src/components/dashboard/PaymentMethodChart.jsx
const PaymentMethodChart = ({ distribution }) => {
  const data = distribution.map((d) => ({ name: titleCase(d.method), total: d.total }));

  return (
    <ChartCard title="Payment Method Distribution">
      {data.length === 0 ? (
        <Text style={styles.empty}>No transactions yet.</Text>
      ) : (
        <DonutWithLegend data={data} colors={COLORS} />
      )}
    </ChartCard>
  );
};

const styles = StyleSheet.create({
  empty: { color: '#64748B' },
});

export default PaymentMethodChart;
