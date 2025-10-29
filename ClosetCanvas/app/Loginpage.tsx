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
  Pressable,
} from "react-native";
import { Link, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import Checkbox from "expo-checkbox";
import { Feather } from "@expo/vector-icons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false); // <-- NEW: State for checkbox
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleLogin = () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill out all fields.",
        visibilityTime: 2000,
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "Logging In!",
      text2: "Redirecting to Home...",
      visibilityTime: 1000,
    });

    // Navigate after 1 seconds
    setTimeout(() => {
      router.push("/QuestionarePage");
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/TransBG.png")}
        style={{ width: 150, height: 150 }}
      />

      <Text style={styles.title}>Login</Text>

      <View style={styles.inputContainer}>
        <Feather name="mail" size={20} color="#555" style={styles.icon} />
        {/* --- FIX: Added missing TextInput for email --- */}
        <TextInput
          style={styles.input}
          placeholder="Email"
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
          secureTextEntry={!isPasswordVisible} // <-- Use state here
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
        <Text style={styles.text}>Don't have an account?</Text>
        <Link href="/SignUp" asChild>
          <TouchableOpacity>
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
    backgroundColor: "#E5D7D7",
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
    marginTop: 5,
  },
  button: {
    width: "80%",
    height: "5%",
    backgroundColor: "#714054",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#FAFAFA",
    fontSize: 15,
    fontWeight: 300,
  },
  buttonText2: {
    color: "#3C2332",
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 7.5,
    borderBottomWidth: 2,
    borderBottomColor: "#++3C2332", // underline color
    paddingBottom: 0, // no extra space
    lineHeight: 18,
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
  // input: {
  //   width: "85%",
  //   borderWidth: 0,
  //   borderBottomWidth: 1,
  //   borderColor: "#000000ff",
  //   padding: 10,
  //   marginBottom: 15,
  //   borderRadius: 5,
  // },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "85%",
    borderBottomWidth: 1,
    borderColor: "#000000ff",
    paddingVertical: 5, // <-- Adjusted padding
    marginBottom: 15,
    borderRadius: 5,
  },
  icon: {
    marginRight: 10,
    marginLeft: 5, // <-- Added left margin
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
