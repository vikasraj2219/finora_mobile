import { Chip } from 'react-native-paper';

// Mirrors frontend/src/components/common/StatusChip.jsx
const StatusChip = ({ isActive }) => (
  <Chip
    compact
    style={{ backgroundColor: isActive ? 'rgba(34,197,94,0.12)' : 'rgba(148,163,184,0.15)', alignSelf: 'flex-start' }}
    textStyle={{ color: isActive ? '#16A34A' : '#64748B', fontSize: 12 }}
  >
    {isActive ? 'Active' : 'Inactive'}
  </Chip>
);

export default StatusChip;
