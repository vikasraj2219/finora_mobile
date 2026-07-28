import { Dimensions, StyleSheet } from 'react-native';
import { VictoryChart, VictoryArea, VictoryAxis, VictoryTheme, VictoryScatter } from 'victory-native';
import { Text } from 'react-native-paper';
import ChartCard from './ChartCard';
import { brand } from '../../theme/theme';
import { formatCompactCurrency } from '../../utils/formatters';

const screenWidth = Dimensions.get('window').width;
const CHART_WIDTH = screenWidth - 32 - 28;

// Mirrors frontend/src/components/dashboard/CashFlowChart.jsx
const CashFlowChart = ({ trends }) => {
  if (!trends || trends.length === 0) {
    return (
      <ChartCard title="Monthly Cash Flow">
        <Text style={styles.empty}>No transaction data yet.</Text>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Monthly Cash Flow">
      <VictoryChart
        width={CHART_WIDTH}
        height={220}
        theme={VictoryTheme.material}
        padding={{ top: 10, bottom: 36, left: 56, right: 12 }}
      >
        <VictoryAxis
          style={{ tickLabels: { fontSize: 10, fill: '#64748B' }, axis: { stroke: '#CBD5E1' }, grid: { stroke: 'transparent' } }}
        />
        <VictoryAxis
          dependentAxis
          tickFormat={(t) => formatCompactCurrency(t)}
          style={{ tickLabels: { fontSize: 9, fill: '#64748B' }, axis: { stroke: 'transparent' }, grid: { stroke: '#EEF2F6' } }}
        />
        <VictoryArea
          data={trends}
          x="label"
          y="netFlow"
          interpolation="monotoneX"
          style={{ data: { fill: 'rgba(18, 165, 157, 0.15)', stroke: brand.teal, strokeWidth: 2 } }}
        />
        <VictoryScatter data={trends} x="label" y="netFlow" size={3} style={{ data: { fill: brand.teal } }} />
      </VictoryChart>
    </ChartCard>
  );
};

const styles = StyleSheet.create({
  empty: { color: '#64748B' },
});

export default CashFlowChart;
