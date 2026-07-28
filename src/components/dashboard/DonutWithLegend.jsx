import { View, StyleSheet } from 'react-native';
import { VictoryPie } from 'victory-native';
import { Text } from 'react-native-paper';
import { brand } from '../../theme/theme';
import { formatCurrency } from '../../utils/formatters';

// Side-by-side legends (as on the web app) don't fit a phone width, so the donut sits on top
// and a scrollable colored-dot legend list — the same data VictoryPie renders — sits below it.
const DonutWithLegend = ({ data, colors }) => (
  <View style={styles.container}>
    <View style={styles.pieWrap}>
      <VictoryPie
        data={data}
        x="name"
        y="total"
        colorScale={colors}
        innerRadius={55}
        padAngle={1.5}
        width={200}
        height={200}
        style={{ labels: { fill: 'transparent' } }}
      />
    </View>
    <View style={styles.legend}>
      {data.map((item, i) => (
        <View key={item.name + i} style={styles.legendRow}>
          <View style={[styles.dot, { backgroundColor: colors[i % colors.length] }]} />
          <Text variant="bodySmall" style={styles.legendLabel} numberOfLines={1}>
            {item.name}
          </Text>
          <Text variant="bodySmall" style={styles.legendValue}>
            {formatCurrency(item.total)}
          </Text>
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  pieWrap: { alignItems: 'center', justifyContent: 'center' },
  legend: { width: '100%', marginTop: 8 },
  legendRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  dot: { width: 9, height: 9, borderRadius: 5, marginRight: 8 },
  legendLabel: { color: brand.navy, flex: 1 },
  legendValue: { color: '#64748B', fontWeight: '600', marginLeft: 8 },
});

export default DonutWithLegend;
