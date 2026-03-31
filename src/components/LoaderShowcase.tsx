import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Loader from '../components/Loader';
import { Colors } from '../theme/colors';

const LoaderShowcase = () => {
  const loaderTypes: Array<'spinner' | 'dots' | 'pulse' | 'bars' | 'ring' | 'bounce' | 'wave' | 'gradient'> = [
    'spinner', 'dots', 'pulse', 'bars', 'ring', 'bounce', 'wave', 'gradient'
  ];

  const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Loader Component Showcase</Text>

      {/* Different Types */}
      <Text style={styles.sectionTitle}>Loader Types (Medium Size)</Text>
      <View style={styles.grid}>
        {loaderTypes.map((type) => (
          <View key={type} style={styles.loaderItem}>
            <Loader type={type} size="medium" />
            <Text style={styles.loaderLabel}>{type}</Text>
          </View>
        ))}
      </View>

      {/* Different Sizes */}
      <Text style={styles.sectionTitle}>Sizes (Spinner Type)</Text>
      <View style={styles.sizeRow}>
        {sizes.map((size) => (
          <View key={size} style={styles.sizeItem}>
            <Loader type="spinner" size={size} />
            <Text style={styles.sizeLabel}>{size}</Text>
          </View>
        ))}
      </View>

      {/* Custom Colors */}
      <Text style={styles.sectionTitle}>Custom Colors</Text>
      <View style={styles.colorRow}>
        <View style={styles.colorItem}>
          <Loader type="pulse" color="#FF4757" />
          <Text style={styles.colorLabel}>Error Red</Text>
        </View>
        <View style={styles.colorItem}>
          <Loader type="dots" color="#7ED321" />
          <Text style={styles.colorLabel}>Success Green</Text>
        </View>
        <View style={styles.colorItem}>
          <Loader type="ring" color="#FFA726" />
          <Text style={styles.colorLabel}>Warning Orange</Text>
        </View>
      </View>

      {/* With Text */}
      <Text style={styles.sectionTitle}>With Loading Text</Text>
      <View style={styles.textLoaders}>
        <Loader
          type="bars"
          size="large"
          text="Loading data..."
          textColor={Colors.textMedium}
        />
        <Loader
          type="gradient"
          size="large"
          text="Processing..."
          textColor={Colors.gradientStart}
        />
      </View>

      {/* Gradient Loaders */}
      <Text style={styles.sectionTitle}>Custom Gradients</Text>
      <View style={styles.gradientLoaders}>
        <Loader
          type="spinner"
          size="large"
          gradientColors={['#FF6B6B', '#4ECDC4', '#45B7D1']}
        />
        <Loader
          type="gradient"
          size="large"
          gradientColors={['#667EEA', '#764BA2']}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FCFE',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textMedium,
    marginTop: 30,
    marginBottom: 15,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  loaderItem: {
    width: '23%',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    backgroundColor: Colors.white,
    borderRadius: 8,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  loaderLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  sizeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  sizeItem: {
    alignItems: 'center',
  },
  sizeLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
  },
  colorRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  colorItem: {
    alignItems: 'center',
  },
  colorLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
  },
  textLoaders: {
    alignItems: 'center',
    gap: 30,
  },
  gradientLoaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

export default LoaderShowcase;