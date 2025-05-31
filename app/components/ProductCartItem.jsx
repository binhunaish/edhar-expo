import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, IconButton, Text, useTheme } from 'react-native-paper';
import { myTheme } from '../_layout';

const ProductCartItem = ({ product, onDelete, onCountChange }) => {
    const [count, setCount] = useState(product.count || 1);
    const { colors } = useTheme();
    const [imageWidth, setImageWidth] = useState(100);
    const [imageHeight, setImageHeight] = useState(100);
    const router = useRouter();

    const totalPrice = count * product.price;

    const handleIncrement = () => {
        setCount(count + 1);
        onCountChange(product.id, count + 1);
    };

    const handleDecrement = () => {
        if (count > 1) {
            setCount(count - 1);
            onCountChange(product.id, count - 1);
        }
    };

    const handleVisit = () => {
        router.push(`/product/${product.id}`);
    };

    const handleDelete = () => {
        onDelete(product.id);
    };

    useEffect(() => {
        if (product.image) {
            Image.getSize(product.image, (width, height) => {
                const containerWidth = 100; // Fixed container width
                const aspectRatio = width / height;

                if (aspectRatio > 1) {
                    // Landscape or square image
                    setImageWidth(containerWidth);
                    setImageHeight(containerWidth / aspectRatio);
                } else {
                    // Portrait image
                    setImageWidth(containerWidth * aspectRatio);
                    setImageHeight(containerWidth);
                }
            }, (error) => {
                console.error("Failed to load image", error);
            });
        }
    }, [product.image]);

    return (
        <Card mode='contained' style={[styles.card, Platform.OS === 'web' ? styles.webCard : null]}>
            <Card.Content style={styles.content}>
                <TouchableOpacity onPress={handleVisit}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: product.image }}
                            style={[styles.image, { width: imageWidth, height: imageHeight }]}
                            resizeMode="contain"
                        />
                    </View>
                </TouchableOpacity>
                <View style={styles.details}>
                    <TouchableOpacity onPress={handleVisit}>
                        <Text variant="titleMedium" numberOfLines={2} style={styles.title}>{product.title}</Text>
                        <Text variant="bodySmall" numberOfLines={3}>{product.description}</Text>
                    </TouchableOpacity>
                    <Text variant="bodyMedium">Price: <Text style={{ fontWeight: 'bold' }}>${product.price}</Text></Text>
                    <View style={styles.counter}>
                        <IconButton icon="minus" size={20} onPress={handleDecrement} disabled={count === 1} />
                        <Text variant="titleMedium" style={{ flex: 1, textAlign: 'center' }}>{count}</Text>
                        <IconButton icon="plus" size={20} onPress={handleIncrement} />
                    </View>
                    <View style={styles.totalContainer}>
                        <Text variant="titleMedium">Total: <Text style={{ fontWeight: 'bold' }}>${totalPrice.toFixed(2)}</Text></Text>
                        <IconButton
                            icon="trash"
                            size={18}
                            onPress={handleDelete}
                            iconColor={colors.error}
                            style={[styles.deleteButton,]}
                        />
                    </View>
                </View>
            </Card.Content>
        </Card>
    );
};

const styles = StyleSheet.create({
    card: {
        width: "100%",
        marginVertical: 4,
        backgroundColor: '#fff',
        borderColor: myTheme.colors.primary,
        borderWidth: 1,
    },
    webCard: {
        minWidth: 250,
    },
    content: {
        flexDirection: 'row',
        padding: 16,
    },
    image: {
        maxWidthidth: '100%',
        maxHeight: '100%',
        borderRadius: 8,
    },
    imageContainer: {
        width: 100,
        height: 100,
        borderRadius: 8,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    details: {
        flex: 1,
    },
    title: {
        fontWeight: 'bold',
    color: myTheme.colors.primary,
    },
    counter: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
        borderWidth: 1,
        borderColor: '#888',
        borderRadius: 8,
        paddingHorizontal: 8,
    },
    price: {
        fontWeight: 'bold',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 8,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    deleteButton: {
        height: 30,
        width: 30,
        margin: 0,
    },
});

export default ProductCartItem;
