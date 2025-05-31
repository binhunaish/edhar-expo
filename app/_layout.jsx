import { FontAwesome6 } from '@expo/vector-icons';
import { Stack } from "expo-router";
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DefaultTheme, PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from "react-native-safe-area-context";


export default function RootLayout() {

  const setting = {
    icon: (props) => <FontAwesome6 style={{ textAlign: "center" }} {...props} />
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider
        theme={myTheme}
        settings={setting}  >
        <SafeAreaProvider>
          <StatusBar animated={true} barStyle="dark-content" backgroundColor={myTheme.colors.background} />
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="favorite" options={{ headerShown: false }} />
            <Stack.Screen name="search/[item]" options={{ headerShown: false }} />
            <Stack.Screen name="product/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="productsSection" options={{ headerShown: false }} />
          </Stack>
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

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

export const myTheme = {
  ...DefaultTheme,
  colors: {
    green: '#008000',
    ...DefaultTheme.colors,
    primary: '#d4aa00',
    primaryContainer: '#fff0b3',
    secondary: '#757575',
    tertiary: '#a1887f',
    background: '#f5f5f5',
    surface: '#fff',
    error: '#B00020',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onTertiary: '#FFFFFF',
    onError: '#FFFFFF',
    onBackground: '#000000',
    onSurface: '#000000',
    ...elevationLevels,
  },
}