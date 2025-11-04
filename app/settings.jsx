import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, View } from "react-native";
import { Appbar, Divider, Portal, Snackbar, Switch, Text, TextInput, useTheme } from "react-native-paper";

export default function Settings() {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const theme = useTheme();
  const { colors } = theme;
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const router = useRouter();

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('customerData', JSON.stringify({ name, address, phone }));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const loadData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('customerData');
      if (jsonValue != null) {
        const data = JSON.parse(jsonValue);
        setName(data.name || '');
        setAddress(data.address || '');
        setPhone(data.phone || '');
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    saveData();
    }, [name, address, phone]);

  return (
    <View style={{flex: 1}}>
    <StatusBar />
    <Appbar.Header>
      <Appbar.BackAction onPress={() => router.back()} />
      <Appbar.Content title="Setting" />
    </Appbar.Header>
    <View style={styles.container}>

      <Text variant="titleLarge" style={{marginBottom: 8}}>Personal Information</Text>

      <TextInput
        label="Name"
        value={name}
        mode="outlined"
        onChangeText={text => setName(text)}
        style={[styles.input, {backgroundColor: colors.surface}]}
      />
      <TextInput
        label="Address"
        value={address}
        mode="outlined"
        onChangeText={text => setAddress(text)}
        style={[styles.input, {backgroundColor: colors.surface}]}
      />
      <TextInput
        label="Phone Number"
        value={phone}
        mode="outlined"
        onChangeText={text => setPhone(text)}
        keyboardType="phone-pad"
        style={[styles.input, {backgroundColor: colors.surface}]}
      />
      <Divider />
      <Text variant="titleLarge" style={{marginVertical: 8}}>User Interface</Text>
      <View style={styles.settingItem}>
        <Text>Dark Mode</Text>
        <Switch
          value={false} // Assuming dark mode is off by default
          onValueChange={() => setSnackbarVisible(true)}
        />
      </View>
      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000} // Show for 3 seconds
        >
          Not ready yet.
        </Snackbar>
      </Portal>
    </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 16,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
});