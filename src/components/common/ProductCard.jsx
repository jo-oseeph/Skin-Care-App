import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../constants/colors';

const CARD_WIDTH = (Dimensions.get('window').width - 56) / 2;

export default function ProductCard({ product, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>

      {/* Product image — shows first image or a gray placeholder */}
      {product.images && product.images.length > 0 ? (
        <Image
          source={{ uri: product.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      )}

      {/* Card content */}
      <View style={styles.info}>

        {/* Category label */}
        <Text style={styles.category}>{product.category}</Text>

        {/* Product name — max 2 lines */}
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        {/* Price and stock row */}
        <View style={styles.bottom}>
          <Text style={styles.price}>KSh {product.price.toLocaleString()}</Text>

          {product.stock === 0 && (
            <Text style={styles.outOfStock}>Out of stock</Text>
          )}
        </View>

      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    width: CARD_WIDTH,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 140,
  },
  imagePlaceholder: {
    width: '100%',
    height: 140,
    backgroundColor: colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  info: {
    padding: 10,
  },
  category: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  name: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 6,
    lineHeight: 19,
  },
  bottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '700',
  },
  outOfStock: {
    fontSize: 10,
    color: colors.error,
    fontWeight: '500',
  },
});