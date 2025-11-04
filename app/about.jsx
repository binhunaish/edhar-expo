import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, useState, useWindowDimensions, View } from "react-native";
import { Button, IconButton, Portal, Snackbar, Text, useTheme } from "react-native-paper";

export default function About() {
  const { colors } = useTheme();
  const router = useRouter();
  const screen = useWindowDimensions();
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <IconButton icon="arrow-left" onPress={router.back} style={{ zIndex: 1000, backgroundColor: colors.background, shadowRadius: 16, position: "absolute" }} />
      <StatusBar />
      <View style={{padding: 16, backgroundColor: colors.background, borderRadius: 64, marginVertical: 16, alignSelf: "center", display:"flex", justifyContent: "center", alignItems: "center"}}>
        <Image style={{ width: screen.width * 0.5, height: screen.width * 0.5, alignSelf: "center" }} source={require("../assets/images/logo/logo without frame.svg")} />
      </View>
      <Text variant="titleLarge" style={{ color: colors.onBackground, fontSize: 30, textAlign: "center", fontWeight: "bold", marginBottom: 8 }}>Aknan</Text>
      <Text variant="bodyLarge" style={{ marginBottom: 16 }}>
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Sint iure nisi temporibus esse voluptatibus sapiente quo aperiam deserunt laudantium, fuga dicta dolorem reiciendis voluptatem incidunt laboriosam accusantium soluta? Culpa, aut.
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptas, id numquam voluptate perferendis iure ipsum dolore aliquam. Perferendis dolore eveniet eum fugit, laborum nihil sunt ex quaerat unde impedit ipsam!
        Lorem ipsum dolor, sit amet consectetur adipisicing elit. Obcaecati ipsum, quibusdam mollitia velit, accusantium fugiat quidem beatae similique magni atque quaerat veniam tempora sunt optio totam eos eveniet corporis provident?
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Asperiores dolor error non. Quos quod amet ipsa asperiores. Sed dolor corrupti exercitationem adipisci ducimus quasi? Hic sint suscipit quos consectetur praesentium.
      </Text>
      <Button mode="contained" onPress={() => setSnackbarVisible(true)} style={{ marginBottom: 16 }}>
        <Text variant="titleMedium" style={{ color: colors.onPrimary }}>Contact Us</Text>
      </Button>
      <Button mode="outlined" onPress={() => setSnackbarVisible(true)} style={{ width: "75%", alignSelf: "center", marginBottom: 32 }}>
        <Text variant="titleMedium" style={{ color: colors.primary, outlineColor: colors.primary }}>Where are we located?</Text>
      </Button>
      <Portal>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000} // Show for 3 seconds
        >
          Not available yet.
        </Snackbar>
      </Portal>
    </ScrollView>
  );
}