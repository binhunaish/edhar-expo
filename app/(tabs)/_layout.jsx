import { FontAwesome6 as FontAwesome } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTheme } from 'react-native-paper';

export default () => {
    const { colors } = useTheme();
    var op = (IconName, title) => {
        return {
            headerShown: 0,
            title: title,
            tabBarIcon: ({ color }) => <FontAwesome name={IconName} size={18} color={color} />
        }
    };
    var screen = {
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceDisabled,
        tabBarStyle: {
            backgroundColor: colors.surface,
            borderColor: "transparent",
            shadowColor: "#000",
            shadowRadius: 2,
            shadowOpacity: 0.2,
        },
    }
    return <Tabs screenOptions={{ ...screen }}>
        <Tabs.Screen name='home' options={op("house", "Home")} />
        <Tabs.Screen name='search' options={op("magnifying-glass", "Search")} />
        <Tabs.Screen name='cart' options={op("cart-shopping", "Cart")} />
    </Tabs>
}