import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { Appbar, Text, useTheme } from 'react-native-paper';
import ProductCard from './components/ProductCard';

export default function ProductsSection() {
  const { title, data: dataString } = useLocalSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const { colors } = useTheme();

  useEffect(() => {
    if (dataString) {
      try {
        const parsedData = JSON.parse(dataString);
        setProducts(parsedData);
      } catch (error) {
        console.error("Failed to parse data", error);
      }
    }
  }, [dataString]);

  return (
    <View style={styles.container}>
      <StatusBar />
      <Appbar.Header style={{ backgroundColor: colors.surface }}>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={title} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {products.length > 0 ? (
          <View style={Platform.OS === 'web' ? styles.gridContainer : null}>
            {products.map((product) => {
              const imageUrl = Array.isArray(product.images) && product.images.length > 0 
                               ? product.images[0] 
                               : typeof product.image === 'string' ? product.image : null;
              
              const productData = {
                ...product,
                id: product._id || product.id,
                image: imageUrl,
              };

              return (
                <ProductCard key={productData.id} product={productData} />
              );
            })}
          </View>
        ) : (
          <Text>No products found in this section.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    alignItems: 'flex-start',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    gap: 8,
  },
});
