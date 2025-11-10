import { FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { ActivityIndicator, Appbar, Button, Chip, IconButton, Text, useTheme } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFetch } from '../../hooks/useFetch';
import ProductCard from '../components/ProductCard';

export default function ProductDetails() {
  const { id } = useLocalSearchParams();
  const { colors } = useTheme();
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const { data: apiResponse, loading, error } = useFetch(
    process.env.EXPO_PUBLIC_API_URL + 'bars/details/' + id
  );

  const product = apiResponse?.product;
  const suggestedProducts = apiResponse?.suggestedProducts;

  const [isFavorite, setIsFavorite] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  
  // State for slideshow
  const [activeSlide, setActiveSlide] = useState(0);
  const scrollViewRef = useRef(null);
  const intervalRef = useRef(null);

  // Autoplay slideshow effect
  useEffect(() => {
    if (product?.images && product.images.length > 1) {
      setActiveSlide(0);
      const slideWidth = windowWidth - 16;
      intervalRef.current = setInterval(() => {
        setActiveSlide(prevActiveSlide => {
          const nextSlide = prevActiveSlide === product.images.length - 1 ? 0 : prevActiveSlide + 1;
          scrollViewRef.current?.scrollTo({
            x: nextSlide * slideWidth,
            animated: true,
          });
          return nextSlide;
        });
      }, 3000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [product?.images, windowWidth]);

  // Manual scroll handler to update active slide for pagination dots
  const onScroll = (event) => {
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }
    const slideWidth = windowWidth - 16;
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / slideWidth);
    if (currentIndex !== activeSlide) {
        setActiveSlide(currentIndex);
    }
  };
  
  // Function to handle dot press for pagination
  const onDotPress = (index) => {
    if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
    }
    const slideWidth = windowWidth - 16;
    scrollViewRef.current?.scrollTo({
        x: index * slideWidth,
        animated: true,
    });
    setActiveSlide(index);
  };

  useEffect(() => {
    const checkCart = async () => {
      if (!product) return;
      try {
        const cart = await AsyncStorage.getItem('cart');
        if (cart) {
          const cartItems = JSON.parse(cart);
          setIsInCart(cartItems.some(item => item.id === product._id));
        }
      } catch (e) {
        console.error("Failed to load cart from AsyncStorage", e);
      }
    };

    const checkFavorite = async () => {
      if (!product) return;
      try {
        const storedFavorites = await AsyncStorage.getItem('favorites');
        if (storedFavorites) {
          // Favorites are now stored as an array of product objects
          const favoriteProducts = JSON.parse(storedFavorites);
          setIsFavorite(favoriteProducts.some(favProduct => favProduct._id === product._id));
        }
      } catch (e) {
        console.error("Failed to load favorites from AsyncStorage", e);
      }
    };

    if (product) {
      checkCart();
      checkFavorite();
    }
  }, [product]);

  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    try {
      const cart = await AsyncStorage.getItem('cart');
      let cartItems = cart ? JSON.parse(cart) : [];
      if (isInCart) {
        cartItems = cartItems.filter(item => item.id !== product._id);
        setIsInCart(false);
      } else {
        cartItems.push({ 
          id: product._id, 
          title: product.title, 
          price: product.price, 
          image: product.images?.[0]
        });
        setIsInCart(true);
      }
      await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save/remove cart item to AsyncStorage", e);
    }
  }, [product, isInCart]);

  const handleFavorite = useCallback(async () => {
    if (!product) return;
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      let favoriteProducts = storedFavorites ? JSON.parse(storedFavorites) : [];

      if (isFavorite) {
        // Remove the product object from favorites
        favoriteProducts = favoriteProducts.filter(favProduct => favProduct._id !== product._id);
        setIsFavorite(false);
      } else {
        // Add the full product object to favorites
        // Ensure we are not adding a duplicate if somehow state is out of sync
        if (!favoriteProducts.some(favProduct => favProduct._id === product._id)) {
            // Create a new object with only the necessary fields to avoid storing too much or circular references
            const favoriteProductData = {
                _id: product._id,
                title: product.title,
                price: product.price,
                images: product.images, // Storing all images for consistency, ProductCard takes first
                description: product.description, // Optional: if needed on favorite card
                // Add other essential fields that ProductCard in favorite.jsx might need
            };
            favoriteProducts.push(favoriteProductData);
        }
        setIsFavorite(true);
      }
      await AsyncStorage.setItem('favorites', JSON.stringify(favoriteProducts));
    } catch (e) {
      console.error("Failed to save/remove favorite item to AsyncStorage", e);
    }
  }, [product, isFavorite]);

  const handleCall = () => {
    Linking.openURL('tel:1234567890');
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.errorText}>Error: {error.message || 'Failed to load product'}</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={styles.errorText}>Product not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title={product.title} />
      </Appbar.Header>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.container, { paddingBottom: insets.bottom }]}>
          {product.images && product.images.length > 0 && (
            <View style={styles.slideshowWrapper}>
              <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                style={[styles.slideshowContainer, { width: windowWidth - 16, backgroundColor: colors.background, borderRadius: 16}]}
                onScroll={onScroll}
                scrollEventThrottle={16}
              >
                {product.images.map((imgUrl, index) => (
                  <View key={index} style={{ flex: 1}}>
                    <Image source={{ uri: imgUrl }} height={300} style={{width: windowWidth - 16, height: 300, resizeMode: 'contain'}} />
                  </View>
                ))}
              </ScrollView>
              {/* Pagination Dots */}
              {product.images.length > 1 && (
                <View style={styles.paginationContainer}>
                  {product.images.map((_, index) => (
                    <TouchableOpacity key={index} onPress={() => onDotPress(index)}>
                        <View 
                            style={[
                                styles.paginationDot,
                                activeSlide === index ? styles.paginationDotActive : null,
                                { backgroundColor: activeSlide === index ? colors.primary : colors.disabled || 'gray' }
                            ]}
                        />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
          <Text variant="bodyLarge" style={styles.description}>
            {product.description}
          </Text>
          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={styles.tagsTitle}>Tags:</Text>
              <View style={styles.tagsList}>
                {product.tags.map((tag, index) => {
                  const tagName = tag.name || tag;
                  return (
                    <Chip 
                      key={index} 
                      mode="outlined" 
                      style={styles.tagChip}
                      onPress={() => router.push(`/search/${tagName}`)}
                    >
                      {tagName}
                    </Chip>
                  );
                })}
              </View>
            </View>
          )}
          <Text variant="headlineSmall" style={styles.price}>
            Price: ${product.price}
          </Text>
          <Text style={[styles.stockStatus, { color: product.inStock ? colors.green : colors.error }]}>
            {product.inStock ? 'In Stock' : 'Out of Stock'}
          </Text>
          {product.properties && Object.keys(product.properties).length > 0 && (
            <View style={styles.propertiesSection}>
              <Text variant="titleMedium" style={styles.propertiesTitle}>Product Details</Text>
              {Object.entries(product.properties).map(([key, value]) => (
                <View key={key} style={styles.propertyRow}>
                  <Text style={styles.propertyKey}>{key.charAt(0).toUpperCase() + key.slice(1)}:</Text>
                  <Text style={styles.propertyValue}>{value}</Text>
                </View>
              ))}
            </View>
          )}
          <View style={styles.buttonContainer}>
            <Button 
              mode="contained" 
              style={styles.button} 
              onPress={handleAddToCart}
              disabled={!product.inStock} 
            >
              {product.inStock ? (isInCart ? "Remove from Cart" : "Add to Cart") : "Out of Stock"}
            </Button>
            <IconButton
              icon={() => (
                <FontAwesome
                  name={isFavorite ? "heart" : "heart-o"}
                  size={24}
                  color={isFavorite ? colors.error : colors.primary}
                />
              )}
              mode="outlined"
              onPress={handleFavorite}
            />
            <IconButton
              icon={() => (
                <FontAwesome
                  name="phone"
                  size={24}
                  color={colors.primary}
                />
              )}
              mode="outlined"
              onPress={handleCall}
            />
          </View>
          {suggestedProducts && suggestedProducts.length > 0 && (
            <View style={styles.suggestionSection}>
              <Text variant="titleMedium" style={styles.suggestionTitle}>
                Suggested Products
              </Text>
              <ScrollView horizontal contentContainerStyle={styles.suggestionList}>
                {suggestedProducts.map((item) => (
                  <ProductCard 
                    key={item._id}
                    product={{
                      id: item._id,
                      title: item.title,
                      description: item.description,
                      price: item.price,
                      image: item.images?.[0],
                    }}
                  />
                ))}
              </ScrollView>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    alignItems: 'flex-start',
    flexGrow: 1,
  },
  image: {
    width: '100%',
    height: 300,
    contentFit: 'contain',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'left',
    width: '100%',
  },
  description: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'left',
    width: '100%',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'left',
    width: '100%',
  },
  button: {
    flex: 1,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  property: {
    padding: 8,
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'left',
    width: '100%',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  category: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 8,
    textAlign: 'left',
    width: '100%',
  },
  suggestionSection: {
    marginTop: 24,
    width: '100%',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    marginBottom: 16,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  suggestionList: {
    paddingHorizontal: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    gap: 4,
    marginBottom: 16,
  },
  slideshowContainer: {
    height: '100%',
  },
  tagsContainer: {
    marginTop: 8,
    marginBottom: 16,
    width: '100%',
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagChip: {
  },
  stockStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'left',
    width: '100%',
  },
  propertiesSection: {
    marginTop: 24,
    width: '100%',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    marginBottom: 16,
  },
  propertiesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  propertyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  propertyKey: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  propertyValue: {
    fontSize: 16,
  },
  slideshowWrapper: {
    marginBottom: 16,
    alignItems: 'center',
    height: 300,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    width: 16,
  },
});
