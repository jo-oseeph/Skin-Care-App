import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text } from 'react-native';
import { colors } from '../../src/constants/colors';
import { useCart } from '../../src/context/CartContext';

// Basic tab icon used by Home, Products, Profile
function TabIcon({ name, color, size }) {
  return <Ionicons name={name} size={size} color={color} />;
}

// Cart icon with a badge showing item count
function CartIcon({ color, size, focused }) {
  const { totalItems } = useCart();

  return (
    <View>
      <Ionicons
        name={focused ? 'bag' : 'bag-outline'}
        size={size}
        color={color}
      />
      {/* Only render the badge when there are items in the cart */}
      {totalItems > 0 && (
        <View style={{
          position: 'absolute',
          top: -4,
          right: -6,
          backgroundColor: colors.primary,
          borderRadius: 8,
          minWidth: 16,
          height: 16,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 3,
        }}>
          <Text style={{
            color: colors.white,
            fontSize: 9,
            fontWeight: '700',
          }}>
            {totalItems > 99 ? '99+' : totalItems}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
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
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'home' : 'home-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'grid' : 'grid-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size, focused }) => (
            <CartIcon color={color} size={size} focused={focused} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name={focused ? 'person' : 'person-outline'}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}