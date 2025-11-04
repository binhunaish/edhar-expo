import { useRouter } from 'expo-router';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';

const ProductCard = ({ product }) => {
  const { colors } = useTheme();
  const router = useRouter();

  const handleProductPress = () => {
    router.push(`/product/${product.id}`); // Navigate to the product details screen by ID
  };

  const cardStyles = StyleSheet.create({
    productCard: {
      marginHorizontal: 4,
      width: 200,
    },
    card: {
      paddingBottom: 4,
      overflow: 'hidden',
      borderColor: colors.primary,
      borderWidth: 2,
      borderRadius: 16,
      backgroundColor: colors.background,
    },
    productImage: {
      height: 150,
      marginBottom: 8,
      borderRadius: 0,
      backgroundColor: colors.surface,
    },
    productContent: {
      paddingBottom: 8,
      flexDirection: 'column',
      gap: 2,
    },
    price: {
      fontWeight: 'bold',
      color: colors.onSurface,
    },
    button: {
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    titleText: {
      fontWeight: 'bold',
      color: colors.primary,
    }
  });

  return (
    <View key={product.id} style={cardStyles.productCard}>
      <TouchableOpacity onPress={handleProductPress}>
        <Card 
          mode='contained' 
          style={cardStyles.card}
        >
          <Card.Cover source={{ uri: product.image }} style={cardStyles.productImage} contentFit="contain" />
          <Card.Content style={cardStyles.productContent}>
            <Text variant='titleMedium' numberOfLines={2} style={cardStyles.titleText}>{product.title}</Text>
            <Text variant='bodySmall' style={{color: colors.onSurface}}>Category: {product.category}</Text>
            <Text variant='bodySmall' numberOfLines={3} style={{color: colors.onSurface}}>{product.description}</Text>
            <Text variant='bodySmall' style={{color: colors.onSurface}}>Price: <Text style={cardStyles.price}>${product.price}</Text></Text>
            <View style={{ marginTop: 4 }} />
            {Platform.OS === 'web' && (
              <Button 
                style={cardStyles.button} 
                labelStyle={{color: colors.onPrimary}}
                mode='contained' 
                onPress={handleProductPress}
              >
                View
              </Button>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    </View>
  );
};

export default ProductCard;
