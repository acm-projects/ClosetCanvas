import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import { Link, useRouter } from "expo-router";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill out all fields.",
        visibilityTime: 2000,
      });
      return;
    }
    try {

    
    const response = await fetch(
      "https://xl75xgdpog.execute-api.us-east-2.amazonaws.com/default/InitiateAuth",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: email, password: password }),
      }
    );
    const responseData = await response.json();

    console.log("Response Status:", response.status);
    console.log("Response Data:", responseData['body']);
    if (!response.ok || responseData["statusCode"] !== 200) {
        let errorMessage = "An unexpected error occurred.";

        if (responseData["body"]) {
            errorMessage = responseData["body"];
        } else if (responseData.message) {
             errorMessage = responseData.message;
        } else {
             errorMessage = `HTTP error! status: ${response.status}`;
        }


        throw new Error(errorMessage);
        } else {
          Toast.show({
          type: "success",
          text1: "Logging In!",
          text2: "Redirecting to Home...",
          visibilityTime: 1000,
        });
            // Navigate after 2 seconds
        setTimeout(() => {
          router.push("/(tabs)/HomePage");
        }, 1000);
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      Toast.show({
        type: "error",
        text1: "Sign In Failed",

        text2:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      });
    } 


  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/logo.png")}
        style={{ width: 150, height: 150 }}
      />

      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text style={styles.text}>Don&apos;t have an account?</Text>
        <Link href="/SignUp" asChild>
          <TouchableOpacity style={styles.button2}>
            <Text style={styles.buttonText2}>Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    padding: 20,
  },
  signupContainer: {
    flexDirection: "row", // side by side
    alignItems: "center", // vertically center
    marginTop: 0.01, // spacing from other elements
  },

  text: {
    fontSize: 14,
    marginRight: 10, // space between text and button
  },
  button: {
    width: "75%",
    backgroundColor: "#DACCF4",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  button2: {
    width: "15%",
    backgroundColor: "#DACCF4",
    padding: 5,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 3,
  },
  buttonText: {
    color: "#000000ff",
    fontSize: 15,
    fontWeight: "bold",
  },
  buttonText2: {
    color: "#000000ff",
    fontSize: 10,
    fontWeight: "bold",
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    width: "85%",
    borderWidth: 0,
    borderBottomWidth: 1,
    borderColor: "#000000ff",
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
});
