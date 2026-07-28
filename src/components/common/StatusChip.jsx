import { Chip } from 'react-native-paper';
import { brand } from '../../theme/theme';

// Mirrors frontend/src/components/common/StatusChip.jsx
const StatusChip = ({ isActive }) => (
  <Chip
    compact
    style={{ backgroundColor: isActive ? `${brand.success}1A` : '#EEF2F6', alignSelf: 'flex-start' }}
    textStyle={{ color: isActive ? brand.success : '#64748B', fontSize: 12, fontWeight: '600' }}
  >
    {isActive ? 'Active' : 'Inactive'}
  </Chip>
);

export default StatusChip;
