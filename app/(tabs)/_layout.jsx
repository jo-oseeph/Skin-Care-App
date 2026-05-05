import { Tabs } from 'expo-router';
import { colors } from '../../src/constants/colors';

// Simple text-based tab icons for now
// We'll swap these for real icons later
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,           // no top header bar
        tabBarActiveTintColor: colors.primary,    // gold when active
        tabBarInactiveTintColor: colors.textMuted, // gray when inactive
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="products"
        options={{ title: 'Products' }}
      />
      <Tabs.Screen
        name="cart"
        options={{ title: 'Cart' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
    </Tabs>
  );
}