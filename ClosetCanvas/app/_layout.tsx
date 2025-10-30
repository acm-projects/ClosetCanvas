import { Stack } from "expo-router";
import Toast from "react-native-toast-message";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// This is the only default export
export default function RootLayout() {
  return (
    // 1. The GestureHandlerRootView wraps everything
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* 2. The Stack navigator and Toast go INSIDE */}
      <>
        {/* app’s navigation */}
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcomepage" />
          <Stack.Screen name="Loginpage" />
          <Stack.Screen name="SignUp" />
          <Stack.Screen name="QuestionarePage" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="SettingsPage"
            options={{
              headerShown: false, // This is false, so the options below won't show
              title: "Settings",
              headerStyle: {
                backgroundColor: "#56088B", // Your purple color
              },
              headerTintColor: "#fff", // Color for the back arrow and title
              headerTitleStyle: {
                fontWeight: "bold",
              },
            }}
          />
        </Stack>
        <Toast />
      </>
    </GestureHandlerRootView>
  );
}