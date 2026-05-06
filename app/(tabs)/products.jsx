import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
  Image,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getProducts } from '../../src/services/productService';
import ProductCard from '../../src/components/common/ProductCard';
import { colors } from '../../src/constants/colors';

const CATEGORIES = [
  'All','cleanser','serum','moisturizer','sunscreen',
  'toner','exfoliant','mask','eye_cream','spot_treatment','oil',
];

const formatCategory = (cat) => {
  if (cat === 'All') return 'All';
  return cat.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

// Static Unsplash banner image — skincare themed
const BANNER_IMAGE = 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&q=80';

export default function ProductsScreen() {
  const router = useRouter();

  const [products, setProducts]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory]     = useState('All');
  const [error, setError]           = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch]         = useState('');

  const fetchProducts = useCallback(async () => {
    const params = {};
    if (category !== 'All') params.category = category;
    if (search.trim()) params.search = search.trim();

    const result = await getProducts(params);
    if (result.success) {
      setProducts(result.products);
      setError(null);
    } else {
      setError(result.message);
    }
  }, [category, search]);

  useEffect(() => {
    setLoading(true);
    fetchProducts().finally(() => setLoading(false));
  }, [fetchProducts]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  // This renders everything above the product grid as the list header
  // so the whole screen scrolls together as one FlatList
  const ListHeader = () => (
    <View>

      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="menu-outline" size={26} color={colors.primary} />
        </TouchableOpacity>

        <Text style={styles.topBarTitle}>Skincare</Text>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => setShowSearch((prev) => !prev)}
        >
          <Ionicons name="search-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Search bar — shown only when search icon is tapped ── */}
      {showSearch && (
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={16} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={setSearch}
            autoFocus
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* ── Hero banner ── */}
      <View style={styles.banner}>
        <View style={styles.bannerTextCol}>
          <Text style={styles.bannerTitle}>Glow up your{'\n'}skincare routine</Text>
          <TouchableOpacity style={styles.bannerBtn}>
            <Text style={styles.bannerBtnText}>Explore</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={{ uri: BANNER_IMAGE }}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </View>

      {/* ── Categories ── */}
      <Text style={styles.sectionTitle}>Categories</Text>
      <FlatList
        data={CATEGORIES}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.pillsRow}
        renderItem={({ item }) => {
          const isActive = category === item;
          return (
            <TouchableOpacity
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => setCategory(item)}
              activeOpacity={0.75}
            >
              <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                {formatCategory(item)}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      {/* ── Popular label ── */}
      <Text style={styles.sectionTitle}>Popular</Text>

    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>

      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="wifi-outline" size={44} color={colors.textMuted} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchProducts}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>

      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => router.push(`/product/${item._id}`)}
            />
          )}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="leaf-outline" size={44} color={colors.textMuted} />
              <Text style={styles.emptyText}>No products found</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 0.3,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 20,
    marginBottom: 14,
    paddingHorizontal: 12,
    height: 42,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingVertical: 0,
  },

  // Banner
  banner: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: colors.primary,   // deep forest green banner
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    height: 140,
  },
  bannerTextCol: {
    flex: 1,
    paddingLeft: 20,
    paddingVertical: 20,
    gap: 14,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 23,
  },
  bannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.accent,     // blush button on green banner
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
  },
  bannerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,              // green text on blush button
  },
  bannerImage: {
    width: 140,
    height: '100%',
  },

  // Section titles
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: 20,
    marginBottom: 12,
  },

  // Category pills
  pillsRow: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 8,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  pillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  pillTextActive: {
    color: colors.white,
    fontWeight: '600',
  },

  // Grid
  listContent: {
    paddingBottom: 30,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },

  // States
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingTop: 60,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  retryBtn: {
    paddingHorizontal: 22,
    paddingVertical: 9,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 13,
  },
});