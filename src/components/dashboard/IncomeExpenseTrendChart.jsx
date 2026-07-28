import { View, Dimensions, StyleSheet } from 'react-native';
import { VictoryChart, VictoryGroup, VictoryBar, VictoryAxis, VictoryTheme, VictoryLegend } from 'victory-native';
import { Text } from 'react-native-paper';
import ChartCard from './ChartCard';
import { brand } from '../../theme/theme';
import { formatCompactCurrency } from '../../utils/formatters';

const screenWidth = Dimensions.get('window').width;
const CHART_WIDTH = screenWidth - 32 - 28; // screen padding + card padding

// Mirrors frontend/src/components/dashboard/IncomeExpenseTrendChart.jsx
const IncomeExpenseTrendChart = ({ trends }) => {
  if (!trends || trends.length === 0) {
    return (
      <ChartCard title="Income vs Expense">
        <Text style={styles.empty}>No transaction data yet.</Text>
      </ChartCard>
    );
  }

  return (
    <ChartCard title="Income vs Expense">
      <VictoryLegend
        x={CHART_WIDTH / 2 - 90}
        y={0}
        orientation="horizontal"
        gutter={16}
        style={{ labels: { fontSize: 11, fill: '#475569' } }}
        data={[
          { name: 'Income', symbol: { fill: brand.success } },
          { name: 'Expense', symbol: { fill: brand.error } },
        ]}
      />
      <VictoryChart
        width={CHART_WIDTH}
        height={240}
        domainPadding={{ x: 18 }}
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
        <VictoryGroup offset={12} colorScale={[brand.success, brand.error]}>
          <VictoryBar
            data={trends}
            x="label"
            y="income"
            style={{ data: { width: 10, borderRadius: 3 } }}
          />
          <VictoryBar
            data={trends}
            x="label"
            y="expense"
            style={{ data: { width: 10, borderRadius: 3 } }}
          />
        </VictoryGroup>
      </VictoryChart>
    </ChartCard>
  );
};

const styles = StyleSheet.create({
  empty: { color: '#64748B' },
});

export default IncomeExpenseTrendChart;
