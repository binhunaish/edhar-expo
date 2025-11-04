import { useRouter } from 'expo-router';
import { useState } from "react";
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Button, Menu, Portal, Snackbar, Text, useTheme } from "react-native-paper";
import { useFetch } from '../../hooks/useFetch';
import ProductCard from '../components/ProductCard';

// main
export default function Home() {
  const [menuVisible, setMenuVisible] = useState(false);
  const { data, loading, error } = useFetch(process.env.EXPO_PUBLIC_API_URL + 'bars');
  const sections = data ? data.filter(section => section.products && section.products.length > 0) : [];
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const handleBarPress = () => {
    setMenuVisible(true);
  }
  const navigator = useRouter().navigate;
  const theme = useTheme();

  if (loading) {
    return (
      <View style={[styles.page, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" animating={true} color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.page, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (<>
    <Appbar.Header style={styles.header}>
      <Appbar.Action icon={require('../../assets/images/logo/logo_without_frame.png')} size={28} />
      <Appbar.Content titleStyle={{ fontWeight: "bold" }} title="Enjoy Shoping" />
      <Appbar.Action onPress={() => navigator("/favorite")} icon="heart" />
      <Menu
        elevation={3}
        contentStyle={{ borderRadius: 8, padding: 8, backgroundColor: '#FFFFFF' }}
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={<Appbar.Action onPress={handleBarPress} icon="ellipsis-vertical" />}
        children={<MenuView setMenuVisible={setMenuVisible} setSnackbarVisible={setSnackbarVisible} />}
        statusBarHeight={StatusBar.currentHeight}
        />
    </Appbar.Header>
    <ScrollView>
      <View style={styles.page}>
        {sections.map((section, index) => (
          <Section 
            key={index}
            title={section.title} 
            data={section.products} 
            allData={section.products} 
          />
        ))}
      </View>
    </ScrollView>
    <Portal>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        Not available yet.
      </Snackbar>
    </Portal>
  </>);
}


// components
const MenuView = ({ setMenuVisible, setSnackbarVisible }) => {
  const { colors } = useTheme();
  const router = useRouter();
  
  return <View>
    <Menu.Item title="Settings" leadingIcon="gear" onPress={() => { router.push("/settings"); setMenuVisible(false); }} />
    <Menu.Item title="Contact Us" leadingIcon="phone" onPress={() => { setSnackbarVisible(true); setMenuVisible(false); }} />
    <Menu.Item title="About" leadingIcon="info" onPress={() => { router.push("/about"); setMenuVisible(false); }} />
  </View>
}

const Section = ({ title, data, allData }) => {
  const { colors } = useTheme();
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/productsSection',
      params: {
        title: title,
        data: JSON.stringify(allData)
      }
    });
  }

  const displayedData = data.slice(0, 5);

  return (
    <View style={[styles.section, { backgroundColor: colors.surface, elevation: 2 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.sectionTitle} variant="labelLarge">{title}</Text>
        <Button style={styles.sectionButton} onPress={handlePress}>Go See More</Button>
      </View>
      <ScrollView horizontal contentContainerStyle={styles.list}>
        {displayedData.map((item) => (
          <ProductCard 
            key={item._id} 
            product={{
              id: item._id,
              title: item.title,
              description: item.description,
              price: item.price,
              image: item.images[0],
              inStock: item.inStock
            }} 
          />
        ))}
      </ScrollView>
    </View>
  );
}

// styling
const styles = StyleSheet.create({
  page: {
    paddingVertical: 4,
    flex: 1
  },
  section: {
    width: "100%",
    marginVertical: 4,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    padding: 8,
    paddingStart: 16,
  },
  list: {
    padding: 8,
    flexDirection: 'row',
    gap: 8,
  },
  header: {
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  menu: {
    // Removed as styling is now handled by contentStyle prop of Menu component
    }
});