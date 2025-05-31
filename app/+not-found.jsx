import { Text, View, StyleSheet } from "react-native";
import {Link} from 'expo-router'

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}>
      <Text>Not Found</Text>
      <Link href="/">Get Back</Link>
      
    </View>
  );
}