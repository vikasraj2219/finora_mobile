import { Dimensions, StyleSheet } from 'react-native';
import { VictoryChart, VictoryGroup, VictoryBar, VictoryAxis, VictoryTheme, VictoryLegend } from 'victory-native';
import { Text } from 'react-native-paper';
import ChartCard from './ChartCard';
import SelectField from '../common/SelectField';
import { brand } from '../../theme/theme';
import { formatCompactCurrency } from '../../utils/formatters';

const screenWidth = Dimensions.get('window').width;
const CHART_WIDTH = screenWidth - 32 - 28;

// Mirrors frontend/src/components/dashboard/YearlySummaryChart.jsx
const YearlySummaryChart = ({ data, year, onYearChange, years }) => (
  <ChartCard
    title="Yearly Financial Summary"
    action={
      <SelectField
        label="Year"
        value={year}
        options={years.map((y) => ({ label: String(y), value: y }))}
        onSelect={onYearChange}
      />
    }
  >
    {!data.months || data.months.every((m) => m.income === 0 && m.expense === 0) ? (
      <Text style={styles.empty}>No transaction data for {year}.</Text>
    ) : (
      <>
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
          height={260}
          domainPadding={{ x: 10 }}
          theme={VictoryTheme.material}
          padding={{ top: 10, bottom: 36, left: 56, right: 12 }}
        >
          <VictoryAxis
            style={{ tickLabels: { fontSize: 9, fill: '#64748B' }, axis: { stroke: '#CBD5E1' }, grid: { stroke: 'transparent' } }}
          />
          <VictoryAxis
            dependentAxis
            tickFormat={(t) => formatCompactCurrency(t)}
            style={{ tickLabels: { fontSize: 9, fill: '#64748B' }, axis: { stroke: 'transparent' }, grid: { stroke: '#EEF2F6' } }}
          />
          <VictoryGroup offset={6} colorScale={[brand.success, brand.error]}>
            <VictoryBar data={data.months} x="label" y="income" style={{ data: { width: 5 } }} />
            <VictoryBar data={data.months} x="label" y="expense" style={{ data: { width: 5 } }} />
          </VictoryGroup>
        </VictoryChart>
      </>
    )}
  </ChartCard>
);

const styles = StyleSheet.create({
  empty: { color: '#64748B' },
});

export default YearlySummaryChart;
