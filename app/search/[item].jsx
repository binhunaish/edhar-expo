import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Banner, Text, TextInput } from 'react-native-paper';
import ProductCard from '../components/ProductCard';

export default function SearchScreen() {
  const { back } = useRouter();
  const { item: initialSearchTerm } = useLocalSearchParams();
  const [searchText, setSearchText] = useState(initialSearchTerm || '');
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchTerm, setCurrentSearchTerm] = useState(initialSearchTerm || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = useCallback(async (termToSearch) => {
    if (!termToSearch || termToSearch.trim() === '') {
      setSearchResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    setCurrentSearchTerm(termToSearch);
    setLoading(true);
    setError(null);
    setSearchResults([]); 

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}search/${encodeURIComponent(termToSearch)}`);
      const jsonData = await response.json();

      if (!response.ok) {
        throw new Error(jsonData.message || `Failed to fetch search results for "${termToSearch}"`);
      }
      setSearchResults(jsonData.data || []);
    } catch (e) {
      setError(e.message);
      setSearchResults([]); 
      console.error(`Search error for term "${termToSearch}":`, e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (initialSearchTerm) {
      setSearchText(initialSearchTerm);
      handleSearch(initialSearchTerm); 
    } else {
      setSearchResults([]); 
      setCurrentSearchTerm('');
    }
  }, [initialSearchTerm, handleSearch]);

  const handleChangeText = (text) => {
    setSearchText(text);
  };

  const handleSubmit = () => {
    handleSearch(searchText); 
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar />
      <Appbar.Header>
        <Appbar.BackAction onPress={back} />
        <Appbar.Content title={currentSearchTerm ? `Results: ${currentSearchTerm}` : "Search"} />
      </Appbar.Header>

      {error && (
        <Banner
          visible={!!error}
          actions={[
            {
              label: 'Dismiss',
              onPress: () => setError(null),
            },
          ]}
          icon="alert-octagon"
          style={{ backgroundColor: 'rgba(255,0,0,0.1)'}}
        >
          <Text style={{ color: 'red' }}>Error: {error}</Text>
        </Banner>
      )}

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TextInput
          label="Search Products..."
          mode="outlined"
          style={styles.searchBar}
          value={searchText}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmit}
          right={<TextInput.Icon icon="magnifying-glass" onPress={handleSubmit} />}
        />
        
        {loading ? (
          <ActivityIndicator animating={true} size="large" style={styles.loader} />
        ) : (
          <>
            {searchResults.length > 0 ? (
              <View style={styles.resultsContainer}>
                {searchResults.map((product) => {
                  const imageUrl = Array.isArray(product.images) && product.images.length > 0 
                                   ? product.images[0] 
                                   : typeof product.image === 'string' ? product.image : null;
                  
                  return (
                    <ProductCard 
                      key={product.id || product._id} 
                      product={{...product, id: product._id, image: imageUrl}}
                    />
                  );
                })}
              </View>
            ) : (
              <Text style={styles.noResultsText}>
                {currentSearchTerm && !loading ? `No products found for "${currentSearchTerm}".` : "Enter a term to search."}
              </Text>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1, 
  },
  searchBar: {
    marginBottom: 16,
  },
  resultsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  loader: {
    marginTop: 20,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  }
});
