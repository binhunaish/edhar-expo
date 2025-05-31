import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Chip, Text, TextInput } from "react-native-paper";
import ProductCard from '../components/ProductCard';
import { useFetch } from '../hooks/useFetch';

export default function Search() {
  const [history, setHistory] = useState([]);
  const [searchText, setSearchText] = useState('');
  const navigation = useRouter();
  const { data: searchPageData, loading: searchPageLoading, error: searchPageError } = useFetch(process.env.EXPO_PUBLIC_API_URL + 'search_page');

  useEffect(() => {
    const loadSearchHistory = async () => {
      try {
        const storedHistory = await AsyncStorage.getItem('searchHistory');
        if (storedHistory) {
          setHistory(JSON.parse(storedHistory));
        }
      } catch (error) {
        console.error("Failed to load search history from AsyncStorage", error);
        await AsyncStorage.removeItem('searchHistory');
        setHistory([]);
      }
    };

    loadSearchHistory();
  }, []);

  const saveSearchHistory = async (newSearchTerm) => {
    try {
      const updatedHistory = [
        { id: Date.now().toString(), title: newSearchTerm },
        ...history.filter((item, index) => item.title !== newSearchTerm && index < 4),
      ];
      await AsyncStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (error) {
      console.error("Failed to save search history to AsyncStorage", error);
    }
  };

  const removeFromHistory = async (itemId) => {
    try {
      const updatedHistory = history.filter((item) => item.id !== itemId);
      await AsyncStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (error) {
      console.error("Failed to remove search history item from AsyncStorage", error);
    }
  };

  const removeAllHistory = () => {
    setHistory([]);
    AsyncStorage.removeItem('searchHistory');
  };

  const handleSearch = useCallback(() => {
    if (searchText.trim() !== '') {
      saveSearchHistory(searchText);
      navigation.push(`/search/${searchText}`);
    }
  }, [searchText]);

  if (searchPageLoading) {
    return (
      <View style={[mainStyles.page, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (searchPageError) {
    return (
      <View style={[mainStyles.page, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text>Error: {searchPageError}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={mainStyles.page}>
      <TextInput
        label="Search"
        inputMode="search"
        mode="outlined"
        style={mainStyles.search}
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={handleSearch}
        right={<TextInput.Icon icon="magnifying-glass" onPress={handleSearch} />}
      />
      {history.length > 0 && (
        <HistoryChips
          topic="History"
          data={history}
          onDelete={removeFromHistory}
          onDeleteAll={removeAllHistory}
        />
      )}
      {searchPageData && searchPageData.tags && <Chips topic="Suggested" tags={searchPageData.tags} />}

      <Text variant='titleMedium' style={mainStyles.productTitle}>Some Products:</Text>
      <ScrollView horizontal style={mainStyles.productScroll}>
        {searchPageData && searchPageData.products && searchPageData.products.map((product) => {
          const imageUrl = Array.isArray(product.images) && product.images.length > 0 
                           ? product.images[0] 
                           : typeof product.image === 'string' ? product.image : null;
          
          return (
            <ProductCard 
              key={product.id || product._id} 
              product={{...product, image: imageUrl}}
            />
          );
        })}
      </ScrollView>

    </ScrollView>
  );
}

// components
const Chips = ({ topic, tags }) => {
  const router = useRouter();

  const handleSelect = (item) => {
    router.push(`/search/${item}`);
  };

  return (
    <View style={mainStyles.recent}>
      <Text variant='titleMedium'>{topic}:</Text>
      <View style={mainStyles.chips}>
        {tags?.map((item) => (
          <Chip
            key={item}
            mode='outlined'
            closeIcon="x"
            onPress={() => handleSelect(item)}
          >
            <Text>{item}</Text>
          </Chip>
        ))}
      </View>
    </View>
  );
};

const HistoryChips = ({ topic, data, onDelete, onDeleteAll }) => {
  const router = useRouter();

  const handleSelect = (item) => {
    router.push(`/search/${item.title}`);
  };

  return (
    <View style={mainStyles.recent}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <Text variant='titleMedium'>{topic}:</Text>
        <Button variant='titleMedium' onPress={onDeleteAll}>clear</Button>
      </View>
      <View style={mainStyles.chips}>
        {data?.map((item) => {
          const title = item?.title || '';
          const titlePart = typeof title === 'string' ? title.split(" ")[0] : '';
          return (
            <Chip
              onPress={() => handleSelect(item)}
              key={item.id}
              mode='outlined'
              onClose={() => onDelete(item.id)}
              style={mainStyles.historyChip}
              closeIconStyle={mainStyles.historyChipCloseIcon}
            >
              <Text>{titlePart}</Text>
            </Chip>
          );
        })}
      </View>
    </View>
  );
};

// style
const mainStyles = StyleSheet.create({
  page: {
    paddingTop: 16,
    paddingBottom: 0,
  },
  chips: {
    paddingTop: 8,
    flexWrap: 'wrap',
    gap: 4,
    flexDirection: 'row',
  },
  recent: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  selectedChip: {
    backgroundColor: 'lightblue',
  },
  productScroll: {
    marginBottom: 0,
    paddingBottom: 0,
    paddingHorizontal: 16,
  },
  productTitle: {
    marginLeft: 16,
    marginTop: 0,
    marginBottom: 8,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 18,
  },
  price: {
    fontWeight: 'bold',
  },
  search: {
    marginBottom: 10,
    marginHorizontal: 16,
  },
  historyChip: {

  },
  historyChipCloseIcon: {
    fontSize: 16,
    color: '#757575',
  },
});