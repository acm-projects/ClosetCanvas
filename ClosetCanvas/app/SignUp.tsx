import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
<<<<<<< HEAD
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import { Link, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function SignupScreen() {
=======
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
>>>>>>> Pragya
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
<<<<<<< HEAD
  const [secondpassword, setSecondPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [atConfirmation, setAtConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const router = useRouter();

  const [date, setDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (selectedDate: Date) => {
    if (selectedDate > new Date()) {
      Toast.show({
        type: "error",
        text1: "Invalid Date",
        text2: "Birthdate cannot be in the future.",
      });
    } else {
      setDate(selectedDate);
    }
    hideDatePicker();
  };

  const formatDate = (dateObj: Date) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const handleConfirmation = async () => {
    setIsLoading(true);
    if (!confirmationCode) {
      Toast.show({
        type: "error",
        text1: "Missing Confirmation Code",
        text2: "Please enter the confirmation code sent to your email.",
      });
      setIsLoading(false);
      return;
    }
    try {
      const response = await fetch(
        "https://7w32nxhs3a.execute-api.us-east-2.amazonaws.com/demo/ConfirmUserCode",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: email,
            confirmationCode: confirmationCode,
          }),
        }
      );
      const responseData = await response.json();
      console.log("Response Status:", response.status);
      console.log("Response Data:", responseData);
      if (!response.ok) {
        throw new Error(
          responseData.message || `HTTP error! status: ${response.status}`
        );
      }
      Toast.show({
        type: "success",
        text1: "Confirmation Successful",
        text2: responseData?.message || "Your email has been confirmed!",
      });
      setTimeout(() => {
        router.push("/Loginpage");
      }, 2000);
    } catch (error) {
      console.error("Error during confirmation:", error);
      Toast.show({
        type: "error",
        text1: "Confirmation Failed",
        text2:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resendConfirmationCode = async () => {
    try {
      const response = await fetch(
        "https://ga9gd7bkck.execute-api.us-east-2.amazonaws.com/Demo/UserResendConfirmationCode",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: email,
          }),
        }
      );
      const responseData = await response.json();
      console.log("Response Status:", response.status);
      console.log("Response Data:", responseData);
      if (!response.ok) {
        throw new Error(
          responseData.body.message || `HTTP error! status: ${response.status}`
        );
      }
      Toast.show({
        type: "success",
        text1: "Confirmation Code Resent",
        text2: responseData?.message || "Please check your email.",
      });
    } catch (error) {
      console.error("Error during resending confirmation code:", error);
      Toast.show({
        type: "error",
        text1: "Resend Failed",
        text2:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      });
    }
  };

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

  const handleSignup = async () => {
    setIsLoading(true);

    if (
      !name ||
      !phoneNumber ||
      !email ||
      !password ||
      !secondpassword ||
      !date
    ) {
=======
  const [secondPassword, setSecondPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    useState(false);

  const router = useRouter();

  const handleSignUp = () => {
    if (!name || !phoneNumber || !email || !password || !secondPassword) {
>>>>>>> Pragya
      Toast.show({
        type: "error",
        text1: "Missing Information",
        text2: "Please fill out all fields.",
      });
      setIsLoading(false);
      return;
    }

    if (password !== secondPassword) {
      Toast.show({
        type: "error",
        text1: "Passwords do not match",
        text2: "Please make sure both passwords are identical.",
      });
      setIsLoading(false);
      return;
    }
<<<<<<< HEAD

    if (!passwordRegex.test(password)) {
      Toast.show({
        type: "error",
        text1: "Weak Password",
        text2:
          "Password must be at least 8 characters long and include: uppercase, lowercase, numbers, and special characters.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://iz9xyq1j9d.execute-api.us-east-2.amazonaws.com/default/UserCreation",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: email,
            password: password,
            name: name,
            phoneNumber: "+1" + phoneNumber,
            birthdate: formatDate(date),
          }),
        }
      );

      const responseData = await response.json();

      console.log("Response Status:", response.status);
      console.log("Response Data:", responseData);

      if (!response.ok) {
        let errorMessage = "An unexpected error occurred.";

        if (responseData["body"]) {
          try {
            const bodyObject = JSON.parse(responseData["body"]);
            errorMessage = bodyObject.message || errorMessage;
          } catch (error) {
            errorMessage = responseData["body"];
          }
        } else if (responseData.message) {
          errorMessage = responseData.message;
        } else {
          errorMessage = `HTTP error! status: ${response.status}`;
        }

        Toast.show({
          type: "error",
          text1: "Sign Up Failed",
          text2: errorMessage,
        });

        throw new Error(`Error during sign up: ${errorMessage}`);
      }

      Toast.show({
        type: "success",
        text1: "Success!",
        text2: "Your account has been created.",
      });

      setAtConfirmation(true);
    } catch (error) {
      console.error("Error during sign up:", error);
      // The toast for sign up failure is already handled above where we have more context.
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {!atConfirmation ? (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require("../assets/images/logo.png")}
            style={{ width: 150, height: 150, marginBottom: 10 }}
          />
          <Text style={styles.title}>Sign Up</Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone Number (10 digits)"
            value={phoneNumber}
            keyboardType="phone-pad"
            maxLength={10}
            onChangeText={setPhoneNumber}
          />

          <TouchableOpacity style={styles.input} onPress={showDatePicker}>
            <Text
              style={{
                color: date ? "#000" : "#A9A9A9",
                paddingVertical: Platform.OS === "ios" ? 10 : 5,
              }}
            >
              {date ? date.toLocaleDateString() : "Select your birthdate"}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            keyboardType="email-address"
            autoCapitalize="none"
            onChangeText={setEmail}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            value={secondpassword}
            onChangeText={setSecondPassword}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSignup}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Signing up..." : "Sign up"}
            </Text>
          </TouchableOpacity>

          <View style={styles.signupContainer}>
            <Text style={styles.text}>Already have an account?</Text>
            <Link href="/Loginpage" asChild>
              <TouchableOpacity style={styles.button2}>
                <Text style={styles.buttonText2}>Login</Text>
              </TouchableOpacity>
            </Link>
          </View>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            maximumDate={new Date()}
          />
          <Toast />
        </ScrollView>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require("../assets/images/logo.png")}
            style={{ width: 150, height: 150, marginBottom: 10 }}
          />
          <Text style={styles.title}>Confirm Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirmation Code"
            value={confirmationCode}
            keyboardType="phone-pad"
            maxLength={10}
            onChangeText={setConfirmationCode}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => handleConfirmation()}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Confirming Code..." : "Confirm Code"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.text}> Didn&apos;t receive the code? </Text>
          <TouchableOpacity onPress={resendConfirmationCode}>
            <Text style={styles.link}>Resend Code</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
=======
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
>>>>>>> Pragya
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  contentContainer: {
    flexGrow: 1, 
    justifyContent: "center",
    alignItems: "center",
<<<<<<< HEAD
    padding: 20,
  },
  signupContainer: {
=======
    backgroundColor: "#E5D7D7", // Changed background color
    padding: 20,
  },
  loginContainer: {
>>>>>>> Pragya
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  text: {
    fontSize: 14,
    marginRight: 10,
<<<<<<< HEAD
  },
  link: {
    color: "#4B0082",
    textDecorationLine: "underline",
  },
  button2: {
    backgroundColor: "#E6E6FA",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  buttonText2: {
    color: "#4B0082",
    fontSize: 12,
    fontWeight: "bold",
  },
  button: {
    width: "75%",
    backgroundColor: "#DACCF4",
    padding: 15,
=======
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
>>>>>>> Pragya
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  buttonText: {
<<<<<<< HEAD
    color: "#000000",
    fontSize: 16,
=======
    color: "#FAFAFA", // Changed button text color
    fontSize: 15,
>>>>>>> Pragya
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
<<<<<<< HEAD
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 10,
=======
    borderBottomWidth: 1,
    borderColor: "#000000ff",
    paddingVertical: 5,
>>>>>>> Pragya
    marginBottom: 15,
    borderRadius: 8,
    justifyContent: "center",
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
<<<<<<< HEAD

=======
>>>>>>> Pragya
