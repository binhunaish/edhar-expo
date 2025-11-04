import { Link } from 'expo-router';
import { StatusBar, Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}>
      <StatusBar />
      <Text>Not Found</Text>
      <Link href="/">Get Back</Link>
      
    </View>
  );
}