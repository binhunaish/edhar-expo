import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Appbar, IconButton, Menu, Text, useTheme } from "react-native-paper";
import ProductCard from "./components/ProductCard";

// const data = require('./data.json'); // This will be removed

export default () => {
  const router = useRouter();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const { colors } = useTheme();

  console.log(favoriteProducts);
  

  const loadFavoriteProducts = useCallback(async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        // Favorites are now stored as an array of product objects
        setFavoriteProducts(JSON.parse(storedFavorites));
      } else {
        setFavoriteProducts([]); // Ensure it's an empty array if nothing is stored
      }
    } catch (error) {
      console.error("Failed to load favorites from AsyncStorage", error);
      setFavoriteProducts([]); // Set to empty array on error
    }
  }, []);

  useEffect(() => {
    loadFavoriteProducts();
  }, [loadFavoriteProducts]);

  const handleDeleteFavorite = async (productId) => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      let currentFavoriteProducts = storedFavorites ? JSON.parse(storedFavorites) : [];
      // Filter out the product by its _id (assuming product objects have _id)
      currentFavoriteProducts = currentFavoriteProducts.filter(product => product._id !== productId);
      await AsyncStorage.setItem('favorites', JSON.stringify(currentFavoriteProducts));
      setFavoriteProducts(currentFavoriteProducts); // Update state directly from the modified list
    } catch (error) {
      console.error("Failed to remove favorite from AsyncStorage", error);
    }
  };

  const handleAddAllToCart = async () => {
    try {
      const cart = await AsyncStorage.getItem('cart');
      let cartItems = cart ? JSON.parse(cart) : [];
      // Ensure favoriteProducts are mapped to the structure expected by cart (e.g., using _id as id if cart expects 'id')
      const newItemsToAdd = favoriteProducts.filter(
        favProduct => !cartItems.some(cartItem => cartItem.id === favProduct._id)
      ).map(favProduct => ({
        id: favProduct._id, // Ensure cart items use 'id' if that's the convention
        title: favProduct.title,
        price: favProduct.price,
        image: favProduct.images?.[0] // Assuming ProductCard and cart expect 'image' not 'images' array
        // Add other necessary fields for cart items
      }));

      const newCartItems = [...cartItems, ...newItemsToAdd];
      await AsyncStorage.setItem('cart', JSON.stringify(newCartItems));
      setMenuVisible(false);
      alert('All available favorites added to cart!');
    } catch (error) {
      console.error("Failed to add all favorites to cart in AsyncStorage", error);
    }
  };

  const handleRemoveAllFavorites = async () => {
    try {
      await AsyncStorage.removeItem('favorites');
      setFavoriteProducts([]);
      setMenuVisible(false);
    } catch (error) {
      console.error("Failed to remove all favorites from AsyncStorage", error);
    }
  };

  return (
    <View style={styles.screen}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Favorites" />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action icon="ellipsis-vertical" onPress={() => setMenuVisible(true)} />
          }
        >
          <Menu.Item onPress={handleAddAllToCart} title="Add All to Cart" />
          <Menu.Item onPress={handleRemoveAllFavorites} title="Remove All Favorites" />
        </Menu>
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.container}>
        {favoriteProducts.length > 0 ? (
          <View style={Platform.OS === 'web' ? styles.gridContainer : null}>
            {favoriteProducts.map((product) => (
              <View key={product._id}>
                <ProductCard product={{...product, image: product.images[0], id: product._id}} />
                <IconButton
                  iconColor={colors.error}
                  icon="x"
                  size={20}
                  style={styles.deleteButton}
                  onPress={() => handleDeleteFavorite(product._id)}
                />
              </View>
            ))}
          </View>
        ) : (
          <Text>No Favorites</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
    flex: 1
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    margin: 0,
  },
});



