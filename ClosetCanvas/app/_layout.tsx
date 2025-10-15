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
         <Stack.Screen name="SettingsPage" 
         options={{ headerShown: false, title: "Settings", 
          headerStyle: {
              backgroundColor: "#56088B", // Your purple color
              //borderTopLeftRadius: 15,
             // borderTopRightRadius: 15,
            },
            headerTintColor: "#fff", // Color for the back arrow and title
            headerTitleStyle: {
              fontWeight: "bold", // Optional: style the title text
              
            },
         }}
        />
      </Stack>

       
     

      <Toast />
    </>
  );
}
