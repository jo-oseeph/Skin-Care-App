import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../constants/colors';

// Props this component expects:
// product  → the product object from your API
// onPress  → function to call when the card is tapped
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

        {/* Category label — small tag above the name */}
        <Text style={styles.category}>{product.category}</Text>

        {/* Product name */}
        <Text style={styles.name} numberOfLines={2}>{product.name}</Text>

        {/* Price and stock row */}
        <View style={styles.bottom}>
          <Text style={styles.price}>KSh {product.price.toLocaleString()}</Text>

          {/* Show out of stock label if stock is 0 */}
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
    overflow: 'hidden',         // clips the image to the card's rounded corners
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 180,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: colors.inputBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.textMuted,
    fontSize: 13,
  },
  info: {
    padding: 12,
  },
  category: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',   // MOISTURIZER, SERUM etc
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 21,
  },
  bottom: {
    flexDirection: 'row',         // price and out-of-stock side by side
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '700',
  },
  outOfStock: {
    fontSize: 11,
    color: colors.error,
    fontWeight: '500',
  },
});