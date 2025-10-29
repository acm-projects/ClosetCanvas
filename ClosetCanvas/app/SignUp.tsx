import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import { Link, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import Checkbox from "expo-checkbox";
import { Feather } from "@expo/vector-icons";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [secondPassword, setSecondPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const router = useRouter();

  const handleSignUp = () => {
    if (!name || !phoneNumber || !email || !password || !secondPassword) {
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill out all fields.",
        visibilityTime: 2000,
      });
      return;
    }

    if (password !== secondPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords do not match",
        text2: "Please make sure both passwords are identical.",
        visibilityTime: 2000,
      });
      return;
    }
    // Continue authentication (fake check for now)
    Toast.show({
      type: "success",
      text1: "Account Created!",
      text2: "Redirecting to Home...",
      visibilityTime: 1000,
    });

    // Navigate after 2 seconds
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

      <Text style={styles.title}>Sign Up</Text>

      <View style={styles.inputContainer}>
        <Feather name="user" size={20} color="#555" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Name"
          value={name}
          onChangeText={(text) => setName(text)}
        />
      </View>

      <View style={styles.inputContainer}>
        <Feather name="phone" size={20} color="#555" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={(text) => setPhoneNumber(text)}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Feather name="mail" size={20} color="#555" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Feather name="lock" size={20} color="#555" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Password"
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
      <View style={styles.inputContainer}>
        <Feather name="lock" size={20} color="#555" style={styles.icon} />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          secureTextEntry={!isConfirmPasswordVisible}
          value={secondPassword}
          onChangeText={(text) => setSecondPassword(text)}
        />
        <Pressable
          onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
        >
          <Feather
            name={isConfirmPasswordVisible ? "eye" : "eye-off"}
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

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>SUBMIT</Text>
      </TouchableOpacity>

      {/* --- Login Link --- */}
      <View style={styles.loginContainer}>
        <Text style={styles.text}>Already have an account?</Text>
        <Link href="/Loginpage" asChild>
          <TouchableOpacity>
            <Text style={styles.buttonText2}>Log in</Text>
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
    backgroundColor: "#E5D7D7", // Changed background color
    padding: 20,
  },
  loginContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  text: {
    fontSize: 14,
    marginRight: 10,
  },
  buttonText2: {
    color: "#3C2332",
    fontSize: 13,
    fontWeight: "bold",
    borderBottomWidth: 2,
    borderBottomColor: "#3C2332",
    paddingBottom: 0,
    lineHeight: 18,
  },
  button: {
    width: "75%",
    backgroundColor: "#714054", // Changed button color
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#FAFAFA", // Changed button text color
    fontSize: 15,
    fontWeight: "bold",
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: "bold",
  },
  // --- NEW/UPDATED STYLES ---
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
    marginTop: 5, // Added some margin
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
