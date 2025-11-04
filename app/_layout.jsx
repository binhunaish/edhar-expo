import { FontAwesome6 } from '@expo/vector-icons';
import { Stack } from "expo-router";
import { useMemo } from 'react';
import { StatusBar, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DefaultTheme, PaperProvider, Text } from 'react-native-paper';
import { SafeAreaProvider } from "react-native-safe-area-context";
import { light } from '../constants/Colors';

const baseElevation = {
  shadowColor: '#d4aa00',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.2,
};

const elevationLevels = Object.fromEntries(
  Array.from({ length: 6 }, (_, i) => {
    const level = i;
    const height = i;
    const shadowRadius = i * 1.5;
    return [
      `level${level}`,
      {
        ...baseElevation,
        shadowOffset: { width: 0, height: height },
        shadowRadius: shadowRadius,
        elevation: level,
      },
    ];
  })
);

export default function RootLayout() {
  const myTheme = useMemo(() => ({
    ...DefaultTheme,
    colors: {
      green: '#008000',
      ...DefaultTheme.colors,
      primary: '#d4aa00',
      primaryContainer: light.tint,
      secondary: '#757575',
      tertiary: '#a1887f',
      background: light.background,
      surface: light.background,
      error: '#B00020',
      onPrimary: '#FFFFFF',
      onSecondary: '#FFFFFF',
      onTertiary: '#FFFFFF',
      onError: '#FFFFFF',
      onBackground: light.text,
      onSurface: light.text,
    },
    customElevations: elevationLevels,
  }), []);

  const currentTheme = myTheme;

  const setting = {
    icon: (props) => <FontAwesome6 style={{ textAlign: "center" }} {...props} />
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider
        theme={currentTheme}
        settings={setting}  >
        <SafeAreaProvider>
          <StatusBar animated={true} barStyle="dark-content" backgroundColor={currentTheme.colors.background} />
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="favorite" options={{ headerShown: false }} />
            <Stack.Screen name="search/[item]" options={{ headerShown: false }} />
            <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="productsSection" options={{ headerShown: false }} />
            <Stack.Screen name="about" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
          </Stack>
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}