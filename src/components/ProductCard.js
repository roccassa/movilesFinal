// src/components/ProductCard.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';

const CATEGORY_EMOJI = {
  cafe:        '☕',
  te:          '🍵',
  bebida_fria: '🧊',
  postre:      '🍰',
  snack:       '🥐',
  otro:        '🍴',
};

export default function ProductCard({ product, onPress, onAddToOrder }) {
  const emoji = CATEGORY_EMOJI[product.category] || '🍴';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.emojiContainer}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{product.description}</Text>
        <View style={styles.footer}>
          <Text style={styles.price}>${product.price.toFixed(2)}</Text>
          {!product.available && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>No disponible</Text>
            </View>
          )}
        </View>
      </View>
      {product.available && onAddToOrder && (
        <TouchableOpacity style={styles.addBtn} onPress={() => onAddToOrder(product)}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection:   'row',
    backgroundColor: '#fff',
    borderRadius:    14,
    marginHorizontal: 16,
    marginVertical:  6,
    padding:         14,
    alignItems:      'center',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 2 },
    shadowOpacity:   0.08,
    shadowRadius:    6,
    elevation:       3,
  },
  emojiContainer: {
    width:           56,
    height:          56,
    borderRadius:    28,
    backgroundColor: '#FFF4E6',
    alignItems:      'center',
    justifyContent:  'center',
    marginRight:     12,
  },
  emoji:       { fontSize: 26 },
  info:        { flex: 1 },
  name:        { fontSize: 16, fontWeight: '700', color: '#2D1B00', marginBottom: 2 },
  description: { fontSize: 13, color: '#888', marginBottom: 6 },
  footer:      { flexDirection: 'row', alignItems: 'center' },
  price:       { fontSize: 16, fontWeight: '800', color: '#C8622A' },
  unavailableBadge: {
    marginLeft:      8,
    backgroundColor: '#FFE5E5',
    borderRadius:    6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  unavailableText: { fontSize: 11, color: '#E53935' },
  addBtn: {
    width:           36,
    height:          36,
    borderRadius:    18,
    backgroundColor: '#C8622A',
    alignItems:      'center',
    justifyContent:  'center',
    marginLeft:      8,
  },
  addBtnText: { color: '#fff', fontSize: 22, fontWeight: '700', lineHeight: 28 },
});
