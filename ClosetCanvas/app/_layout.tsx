import { Stack } from "expo-router";
import Toast from "react-native-toast-message";

export default function Layout() {
  return (
    <>
      {/* app’s navigation */}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Loginpage" />
        <Stack.Screen name="SignUp" />
        <Stack.Screen name="(tabs)" />
      </Stack>

      <Toast />
    </>
  );
}
