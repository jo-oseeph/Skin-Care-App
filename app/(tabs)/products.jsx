import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getProducts } from '../../src/services/productService';
import ProductCard from '../../src/components/common/ProductCard';
import { colors } from '../../src/constants/colors';

// These are your PRODUCT_CATEGORIES from the backend constants.
// Update this list to match whatever is in your backend utils/constants.js
const CATEGORIES = ['All', 'Moisturizer', 'Serum', 'Cleanser', 'Sunscreen', 'Toner'];

export default function ProductsScreen() {
  const router = useRouter();

  // --- State ---
  const [products, setProducts]       = useState([]);   // the list of products
  const [loading, setLoading]         = useState(true); // first load spinner
  const [refreshing, setRefreshing]   = useState(false);// pull-to-refresh spinner
  const [search, setSearch]           = useState('');   // search input text
  const [category, setCategory]       = useState('All');// active category filter
  const [error, setError]             = useState(null); // error message if fetch fails

  // --- Fetch products from backend ---
  const fetchProducts = useCallback(async () => {
    // Build the query params to send to GET /products
    const params = {};
    if (search.trim())       params.search   = search.trim();
    if (category !== 'All')  params.category = category;

    const result = await getProducts(params);

    if (result.success) {
      setProducts(result.data);  // update the list
      setError(null);
    } else {
      setError(result.message);  // show error message
    }
  }, [search, category]);

  // Run fetchProducts when screen first loads
  useEffect(() => {
    setLoading(true);
    fetchProducts().finally(() => setLoading(false));
  }, [fetchProducts]);

  // --- Pull to refresh ---
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  // --- Navigate to product detail screen ---
  const handleProductPress = (product) => {
    // We'll create this screen next
    router.push(`/product/${product._id}`);
  };

  // --- Render each product card ---
  const renderProduct = ({ item }) => (
    <ProductCard
      product={item}
      onPress={() => handleProductPress(item)}
    />
  );

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products</Text>
      </View>

      {/* ── Search bar ── */}
      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}    // updates state as user types
        />
        {/* Show a clear button only when there is text */}
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* ── Category filter pills ── */}
      <View>
        <FlatList
          data={CATEGORIES}
          horizontal                       // scrolls left/right
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.categoriesContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryPill,
                category === item && styles.categoryPillActive, // highlight active
              ]}
              onPress={() => setCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === item && styles.categoryTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* ── Main content area ── */}

      {/* Loading spinner on first load */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>

      // Error state
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="wifi-outline" size={48} color={colors.textMuted} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>

      // Empty state — no products found
      ) : products.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="search-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>No products found</Text>
        </View>

      // Product list
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            // Pull down to refresh
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 56,           // space for phone status bar
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,                  // takes remaining space in the row
    fontSize: 15,
    color: colors.text,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 8,                   // space between pills
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  categoryPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textMuted,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
});