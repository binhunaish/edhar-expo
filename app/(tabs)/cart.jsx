import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Dialog, Portal, Text, TextInput, useTheme } from "react-native-paper";
import { myTheme } from '../_layout';
import ProductCartItem from "../components/ProductCartItem";

export default function Index() {
  const { colors } = useTheme();
  const [cartItems, setCartItems] = useState([]);
  const router = useRouter();
  const [showEmptyCartDialog, setShowEmptyCartDialog] = useState(false);

  // State for Checkout Dialog Form
  const [showCheckoutDialog, setShowCheckoutDialog] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [nameError, setNameError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const loadCartItems = async () => {
        try {
          const cart = await AsyncStorage.getItem('cart');
          if (cart) {
            const parsedCart = JSON.parse(cart);
            // Ensure each item has a count property, default to 1 if missing
            const cartWithCount = parsedCart.map(item => ({ ...item, count: item.count || 1 }));
            setCartItems(cartWithCount);
          }
        } catch (error) {
          console.error("Failed to load cart from AsyncStorage", error);
        }
      };

      loadCartItems();
    }, [])
  );

  const saveCartItems = useCallback(async (updatedCart) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Failed to save cart to AsyncStorage", error);
    }
  }, []);

  const handleDelete = async (itemId) => {
    try {
      const updatedCart = cartItems.filter((item) => item.id !== itemId);
      setCartItems(updatedCart);
      await saveCartItems(updatedCart);
    } catch (error) {
      console.error("Failed to remove item from cart in AsyncStorage", error);
    }
  };

  const handleCheckout = () => {
    alert(`Checking out with ${cartItems.length} items`);
  };

  const handleCountChange = async (itemId, newCount) => {
    const updatedCart = cartItems.map(item =>
      item.id === itemId ? { ...item, count: newCount } : item
    );
    setCartItems(updatedCart);
    await saveCartItems(updatedCart);
  };

  const handleEmptyCart = async () => {
    try {
      setCartItems([]);
      await AsyncStorage.removeItem('cart');
      setShowEmptyCartDialog(false);
    } catch (error) {
      console.error("Failed to empty cart in AsyncStorage", error);
    }
  };

  const grandTotal = cartItems.reduce((total, item) => total + (item.price * item.count), 0);
  const totalQuantity = cartItems.reduce((total, item) => total + item.count, 0);

  const showEmptyCartConfirmationDialog = () => setShowEmptyCartDialog(true);
  const hideEmptyCartConfirmationDialog = () => setShowEmptyCartDialog(false);

  // --- Checkout Dialog Logic ---
  const openCheckoutDialog = () => {
    if (cartItems.length > 0) {
      setName('');
      setAddress('');
      setPhoneNumber('');
      setNameError('');
      setAddressError('');
      setPhoneError('');
      setSubmissionError(null);
      setShowCheckoutDialog(true);
    } else {
      alert("Your cart is empty.");
    }
  };

  const closeCheckoutDialog = () => {
    setShowCheckoutDialog(false);
    // Optionally reset fields here if not reset on open
  };

  const validateCheckoutForm = () => {
    let isValid = true;
    if (!name.trim()) {
      setNameError('الاسم مطلوب (Name is required)');
      isValid = false;
    } else {
      setNameError('');
    }
    if (!address.trim()) {
      setAddressError('العنوان مطلوب (Address is required)');
      isValid = false;
    } else {
      setAddressError('');
    }
    if (!phoneNumber.trim()) {
      setPhoneError('رقم الهاتف مطلوب (Phone number is required)');
      isValid = false;
    } else {
      // Basic phone validation, can be enhanced
      setPhoneError('');
    }
    return isValid;
  };

  const handleSubmitRequest = async () => {
    if (!validateCheckoutForm()) {
      return;
    }

    setSubmissionLoading(true);
    setSubmissionError(null);

    const requestProducts = cartItems.map(item => ({
      product: item.id, // This should be the MongoDB ObjectId of the product from your cart item
      quantity: item.count,
    }));

    const requestPayload = {
      address,
      phoneNumber,
      name,
      products: requestProducts,
    };

    try {
      // IMPORTANT: Replace with your actual API endpoint
      const response = await fetch(process.env.EXPO_PUBLIC_API_URL + 'submit-client-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || `Request failed with status ${response.status}`);
      }

      await AsyncStorage.removeItem('cart');
      setCartItems([]); // Clear cart in UI
      setShowCheckoutDialog(false);
      alert('Your request has been submitted successfully. Our sales team will call you later.');
      // Optionally navigate or give further user feedback

    } catch (e) {
      setSubmissionError(e.message || 'An unexpected error occurred during submission.');
      console.error("Failed to submit request:", e);
    } finally {
      setSubmissionLoading(false);
    }
  };
  // --- End Checkout Dialog Logic ---

  return (
    <View style={{ flex: 1 }}>
      <Portal>
        {/* Empty Cart Confirmation Dialog */}
        <Dialog style={styles.dialog} visible={showEmptyCartDialog} onDismiss={hideEmptyCartConfirmationDialog}>
          <Dialog.Title>Confirm</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Are you sure you want to empty your cart?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideEmptyCartConfirmationDialog}>Cancel</Button>
            <Button labelStyle={{color: colors.error}} onPress={handleEmptyCart}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>

        {/* Checkout Form Dialog */}
        <Dialog style={styles.dialog} visible={showCheckoutDialog} onDismiss={closeCheckoutDialog}>
          <Dialog.Title>Complete Your Request</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              error={!!nameError}
            />
            {!!nameError && <Text style={styles.errorTextDialog}>{nameError}</Text>}

            <TextInput
              label="Address"
              value={address}
              onChangeText={setAddress}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
              error={!!addressError}
            />
            {!!addressError && <Text style={styles.errorTextDialog}>{addressError}</Text>}

            <TextInput
              label="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              error={!!phoneError}
            />
            {!!phoneError && <Text style={styles.errorTextDialog}>{phoneError}</Text>}

            {submissionError && (
              <Text style={[styles.errorTextDialog, styles.apiErrorDialog]}>{submissionError}</Text>
            )}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={closeCheckoutDialog} disabled={submissionLoading}>Cancel</Button>
            <Button onPress={handleSubmitRequest} loading={submissionLoading} disabled={submissionLoading}>Submit Request</Button>
          </Dialog.Actions>
        </Dialog>

      </Portal>
      <ScrollView 
        contentContainerStyle={styles.scrollContentContainer} 
        style={styles.scrollView}
      >
        {cartItems.length < 1 ? (
          <View style={styles.emptyCartContainer}>
            <Text variant="bodyLarge" style={styles.emptyCartText}>Your cart is empty.</Text>
            <Button mode="contained" onPress={() => router.push('/(tabs)/home')}>
              Go to Home
            </Button>
          </View>
        ) : (
          <>
            <Text variant='titleMedium' style={styles.productTitle}>
              Your Cart ({totalQuantity} {totalQuantity === 1 ? 'item' : 'items'}):
            </Text>
            
            {cartItems.map((item) => (
              <ProductCartItem
                key={item.id}
                product={item}
                onDelete={handleDelete}
                onCountChange={handleCountChange}
              />
            ))}

            <View style={styles.bottomSummaryContainer}>
              <Text variant='headlineSmall' style={styles.grandTotalText}>
                Grand Total: ${grandTotal.toFixed(2)}
              </Text>
              <View style={styles.checkoutButtonRow}>
                <Button mode="outlined" onPress={showEmptyCartConfirmationDialog} style={styles.actionButton}>
                  Empty Cart
                </Button>
                <Button mode="contained" onPress={openCheckoutDialog} style={styles.actionButton}>
                  Check Out ({totalQuantity})
                </Button>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexGrow: 1,
    width: '100%',
  },
  scrollView: {
    flex: 1,
  },
  productTitle: {
    alignSelf: 'flex-start',
    marginTop: 16,
    marginBottom: 16,
    fontWeight: 'bold',
  },
  bottomSummaryContainer: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
    width: '100%',
  },
  grandTotalText: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  checkoutButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    gap: 16
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyCartContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    marginBottom: 24,
    textAlign: 'center',
    fontSize: 18,
  },
  dialog: {
    backgroundColor: myTheme.colors.background || '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  input: {
    marginBottom: 8,
    marginTop: 8,
  },
  errorTextDialog: {
    color: myTheme.colors.error || 'red',
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 8,
  },
  apiErrorDialog: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 12,
    marginBottom: 8,
  },
});