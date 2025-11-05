import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from "react-native";
import { Link, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import Checkbox from "expo-checkbox";
import { Feather } from "@expo/vector-icons";
import { saveCredentials, getCredentials } from "../util/auth.js";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const checkCredentials = async () => {
      const creds = await getCredentials();
      if (creds) {
        router.push("/(tabs)/HomePage");
        console.log("Credentials found, navigating to HomePage.");
      }
    };
    checkCredentials();
  }, []);

  const getUUIDFromToken = async (token: string): Promise<string | null> => {
    try {
      const response = await fetch(
        `https://hj2euvke89.execute-api.us-east-2.amazonaws.com/default/getUUID`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ accessToken: token }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response:", errorText);
        throw new Error(`Request failed with status ${response.status}`);
      }

      const userData = await response.json();
      console.log("Successfully retrieved user data:", userData);
      return userData.userSub || null;
    } catch (error) {
      console.error("Error in getUUIDFromToken:", error);
      return null;
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "❌ Missing Information",
        text2: "Please enter both email and password.",
        position: "top",
        visibilityTime: 3000,
        topOffset: 60,
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
      console.log("Response Data:", responseData["body"]);
      if (!response.ok || responseData["statusCode"] !== 200) {
        let errorMessage = "Invalid email or password. Please try again.";

        if (responseData["body"]) {
          // Parse the error to provide user-friendly messages
          const body = responseData["body"];
          if (body.includes("NotAuthorizedException") || body.includes("Incorrect username or password")) {
            errorMessage = "Incorrect email or password. Please check your credentials.";
          } else if (body.includes("UserNotFoundException")) {
            errorMessage = "No account found with this email. Please sign up.";
          } else if (body.includes("UserNotConfirmedException")) {
            errorMessage = "Please verify your email before logging in.";
          } else {
            errorMessage = body;
          }
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }

        throw new Error(errorMessage);
      } else {
        const parsedBody = JSON.parse(responseData.body);
        const accessToken =
          parsedBody.cognitoResponse.AuthenticationResult.AccessToken;
        const uuid = await getUUIDFromToken(accessToken);
        if (uuid) {
          await saveCredentials(uuid, accessToken);
        } else {
          console.error("Failed to retrieve UUID from token.");
        }

        Toast.show({
          type: "success",
          text1: "✓ Welcome Back!",
          text2: "Successfully logged in. Redirecting...",
          position: "top",
          visibilityTime: 1500,
          topOffset: 60,
        });

        setTimeout(() => {
          router.push("/(tabs)/HomePage");
        }, 1000);
      }
    } catch (error) {
      console.error("Error during sign in:", error);
      Toast.show({
        type: "error",
        text1: "❌ Login Failed",
        text2:
          error instanceof Error
            ? error.message
            : "Unable to log in. Please check your credentials and try again.",
        position: "top",
        visibilityTime: 4000,
        topOffset: 60,
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={require("../assets/images/logo.png")}
          style={{ width: 150, height: 150 }}
        />

        <Text style={styles.title}>Login</Text>

        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color="#555" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#8B7A82"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => setEmail(text)}
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#555" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#8B7A82"
            secureTextEntry={!isPasswordVisible}
            value={password}
            onChangeText={(text) => setPassword(text)}
          />
          <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
            <Feather
              name={isPasswordVisible ? "eye" : "eye-off"}
              size={20}
              color="#555"
            />
          </Pressable>
        </View>

        <View style={styles.optionsContainer}>
          <View style={styles.rememberMeContainer}>
            <Checkbox
              style={styles.checkbox}
              value={rememberMe}
              onValueChange={setRememberMe}
              color={rememberMe ? "#714054" : undefined}
            />
            <Text style={styles.rememberMeText}>Remember Me</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.text}>Don&apos;t have an account?</Text>
          <Link href="/SignUp" asChild>
            <TouchableOpacity>
              <Text style={styles.buttonText2}>Sign Up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#E5D7D7", // Off-white/beige background
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  signupContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  text: {
    fontSize: 14,
    marginRight: 10,
    color: "#3C2332", // Dark maroon text
  },
  button: {
    width: "75%",
    backgroundColor: "#714054", // Maroon color
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  button2: {
    backgroundColor: "#AB8C96", // Light maroon/dusty rose
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: "#FAFAFA", // Off-white text
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonText2: {
    color: "#3C2332", // Dark maroon
    fontSize: 12,
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
    color: "#3C2332", // Dark maroon
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "85%",
    borderBottomWidth: 1,
    borderColor: "#000000ff",
    paddingVertical: 5,
    marginBottom: 15,
    borderRadius: 5,
  },
  icon: {
    marginRight: 10,
    marginLeft: 5,
  },
  input: {
    flex: 1,
    paddingVertical: 5,
    fontSize: 16,
    borderWidth: 0,
  },
  optionsContainer: {
    width: "85%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    marginRight: 8,
    width: 18,
    height: 18,
  },
  rememberMeText: {
    fontSize: 13,
    color: "#333",
  },
  forgotPasswordText: {
    fontSize: 13,
    color: "#3C2332",
    fontWeight: "600",
  },
});
