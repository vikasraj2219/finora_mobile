import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, ScrollView, StyleSheet, RefreshControl, Pressable } from 'react-native';
import { Text, Surface, Button, ActivityIndicator } from 'react-native-paper';
import EmptyState from '../../components/common/EmptyState';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../../api/notificationApi';
import { brand } from '../../theme/theme';

// Mirrors frontend/src/components/layout/NotificationBell.jsx — a full page instead
// of a small popover, since there's no toolbar bell slot on mobile; reached via More.
const NotificationsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = useCallback(async () => {
    const { data } = await listNotifications({ limit: 50 });
    setItems(data.data.items);
    setUnreadCount(data.data.unreadCount);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load()
        .catch(() => {})
        .finally(() => setLoading(false));
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await load();
    } finally {
      setRefreshing(false);
    }
  };

  const handleItemPress = async (n) => {
    if (!n.isRead) {
      await markNotificationRead(n._id);
      load();
    }
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    load();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator animating color={brand.teal} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {unreadCount > 0 && (
        <View style={styles.headerRow}>
          <Text variant="bodyMedium" style={{ color: '#64748B' }}>
            {unreadCount} unread
          </Text>
          <Button compact onPress={handleMarkAll}>
            Mark all read
          </Button>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[brand.teal]} />}
      >
        {items.length === 0 ? (
          <EmptyState icon="bell-outline" title="You're all caught up" description="No notifications right now." />
        ) : (
          items.map((n) => (
            <Pressable key={n._id} onPress={() => handleItemPress(n)}>
              <Surface style={[styles.card, !n.isRead && styles.unreadCard]} elevation={1}>
                {!n.isRead && <View style={styles.unreadDot} />}
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" style={{ fontWeight: n.isRead ? '400' : '700' }}>
                    {n.title}
                  </Text>
                  <Text variant="bodySmall" style={{ color: '#64748B', marginTop: 2 }}>
                    {n.message}
                  </Text>
                </View>
              </Surface>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: brand.bg },
  container: { flex: 1, backgroundColor: brand.bg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8 },
  content: { padding: 16, paddingBottom: 48 },
  card: { flexDirection: 'row', borderRadius: 12, padding: 14, backgroundColor: '#FFFFFF', marginBottom: 10, gap: 10, alignItems: 'flex-start' },
  unreadCard: { backgroundColor: '#F8FAFC' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: brand.teal, marginTop: 6 },
});

export default NotificationsScreen;
