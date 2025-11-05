import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  Alert,
  Pressable,
} from "react-native";
import { Link, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Ionicons, Feather } from "@expo/vector-icons";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [secondpassword, setSecondPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [atConfirmation, setAtConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const router = useRouter();

  const [date, setDate] = useState<Date | null>(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  // Password validation states
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecialChar: false,
    hasUppercase: false,
    hasLowercase: false,
  });

  // Validate password in real-time
  const validatePassword = (pwd: string) => {
    setPasswordRequirements({
      minLength: pwd.length >= 8,
      hasNumber: /[0-9]/.test(pwd),
      hasSpecialChar: /[!@#$%^&*]/.test(pwd),
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
    });
  };

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
        text1: "❌ Missing Confirmation Code",
        text2: "Please enter the verification code sent to your email.",
        position: "top",
        visibilityTime: 3000,
        topOffset: 60,
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
          responseData.message || `Verification failed. Please check your code.`
        );
      }
      Toast.show({
        type: "success",
        text1: "✓ Email Verified!",
        text2: "Your account has been confirmed. Redirecting to login...",
        position: "top",
        visibilityTime: 2000,
        topOffset: 60,
      });
      setTimeout(() => {
        router.push("/Loginpage");
      }, 2000);
    } catch (error) {
      console.error("Error during confirmation:", error);
      Toast.show({
        type: "error",
        text1: "❌ Verification Failed",
        text2:
          error instanceof Error
            ? error.message
            : "Invalid code. Please try again or request a new code.",
        position: "top",
        visibilityTime: 4000,
        topOffset: 60,
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
          responseData.body.message || `Failed to resend code. Please try again.`
        );
      }
      Toast.show({
        type: "success",
        text1: "✉️ Code Resent!",
        text2: "A new verification code has been sent to your email.",
        position: "top",
        visibilityTime: 3000,
        topOffset: 60,
      });
    } catch (error) {
      console.error("Error during resending confirmation code:", error);
      Toast.show({
        type: "error",
        text1: "❌ Resend Failed",
        text2:
          error instanceof Error
            ? error.message
            : "Could not resend code. Please try again later.",
        position: "top",
        visibilityTime: 3000,
        topOffset: 60,
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
      Toast.show({
        type: "error",
        text1: "❌ Missing Information",
        text2: "Please fill out all required fields to continue.",
        position: "top",
        visibilityTime: 3000,
        topOffset: 60,
      });
      setIsLoading(false);
      return;
    }

    if (password !== secondpassword) {
      Toast.show({
        type: "error",
        text1: "❌ Passwords Don't Match",
        text2: "Please make sure both password fields are identical.",
        position: "top",
        visibilityTime: 3000,
        topOffset: 60,
      });
      setIsLoading(false);
      return;
    }

    if (!passwordRegex.test(password)) {
      Toast.show({
        type: "error",
        text1: "❌ Password Too Weak",
        text2:
          "Your password must meet all requirements shown below.",
        position: "top",
        visibilityTime: 4000,
        topOffset: 60,
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
          text1: "❌ Sign Up Failed",
          text2: errorMessage,
          position: "top",
          visibilityTime: 4000,
          topOffset: 60,
        });

        throw new Error(`Error during sign up: ${errorMessage}`);
      }

      Toast.show({
        type: "success",
        text1: "🎉 Account Created!",
        text2: "Please check your email for a verification code.",
        position: "top",
        visibilityTime: 3000,
        topOffset: 60,
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

          <View style={styles.inputContainer}>
            <Feather name="user" size={20} color="#555" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#8B7A82"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather name="phone" size={20} color="#555" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number (10 digits)"
              placeholderTextColor="#8B7A82"
              value={phoneNumber}
              keyboardType="phone-pad"
              maxLength={10}
              onChangeText={setPhoneNumber}
            />
          </View>

          <TouchableOpacity style={styles.inputContainer} onPress={showDatePicker}>
            <Feather name="calendar" size={20} color="#555" style={styles.icon} />
            <Text
              style={{
                flex: 1,
                color: date ? "#3C2332" : "#8B7A82",
                paddingVertical: Platform.OS === "ios" ? 10 : 5,
                fontSize: 16,
              }}
            >
              {date ? date.toLocaleDateString() : "Select your birthdate"}
            </Text>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Feather name="mail" size={20} color="#555" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#8B7A82"
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={setEmail}
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
              onChangeText={(text) => {
                setPassword(text);
                validatePassword(text);
              }}
            />
            <Pressable onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
              <Feather
                name={isPasswordVisible ? "eye" : "eye-off"}
                size={20}
                color="#555"
              />
            </Pressable>
          </View>

          {/* Password Requirements Indicator */}
          {password.length > 0 && (
            <View style={styles.passwordRequirements}>
              <View style={styles.requirementRow}>
                <Text style={passwordRequirements.minLength ? styles.checkmark : styles.xmark}>
                  {passwordRequirements.minLength ? "✓" : "✗"}
                </Text>
                <Text style={passwordRequirements.minLength ? styles.requirementMet : styles.requirementUnmet}>
                  At least 8 characters
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <Text style={passwordRequirements.hasNumber ? styles.checkmark : styles.xmark}>
                  {passwordRequirements.hasNumber ? "✓" : "✗"}
                </Text>
                <Text style={passwordRequirements.hasNumber ? styles.requirementMet : styles.requirementUnmet}>
                  Contains at least 1 number
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <Text style={passwordRequirements.hasSpecialChar ? styles.checkmark : styles.xmark}>
                  {passwordRequirements.hasSpecialChar ? "✓" : "✗"}
                </Text>
                <Text style={passwordRequirements.hasSpecialChar ? styles.requirementMet : styles.requirementUnmet}>
                  Contains at least 1 special character (!@#$%^&*)
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <Text style={passwordRequirements.hasUppercase ? styles.checkmark : styles.xmark}>
                  {passwordRequirements.hasUppercase ? "✓" : "✗"}
                </Text>
                <Text style={passwordRequirements.hasUppercase ? styles.requirementMet : styles.requirementUnmet}>
                  Contains at least 1 uppercase letter
                </Text>
              </View>
              <View style={styles.requirementRow}>
                <Text style={passwordRequirements.hasLowercase ? styles.checkmark : styles.xmark}>
                  {passwordRequirements.hasLowercase ? "✓" : "✗"}
                </Text>
                <Text style={passwordRequirements.hasLowercase ? styles.requirementMet : styles.requirementUnmet}>
                  Contains at least 1 lowercase letter
                </Text>
              </View>
            </View>
          )}

          <View style={styles.inputContainer}>
            <Feather name="lock" size={20} color="#555" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#8B7A82"
              secureTextEntry={!isConfirmPasswordVisible}
              value={secondpassword}
              onChangeText={setSecondPassword}
            />
            <Pressable onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
              <Feather
                name={isConfirmPasswordVisible ? "eye" : "eye-off"}
                size={20}
                color="#555"
              />
            </Pressable>
          </View>

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
          <View style={styles.inputContainer}>
            <Feather name="key" size={20} color="#555" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Confirmation Code"
              placeholderTextColor="#8B7A82"
              value={confirmationCode}
              keyboardType="phone-pad"
              maxLength={10}
              onChangeText={setConfirmationCode}
            />
          </View>
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
  link: {
    color: "#714054", // Maroon color
    textDecorationLine: "underline",
  },
  button2: {
    backgroundColor: "#AB8C96", // Light maroon/dusty rose
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  buttonText2: {
    color: "#3C2332", // Dark maroon
    fontSize: 12,
    fontWeight: "bold",
  },
  button: {
    width: "75%",
    backgroundColor: "#714054", // Maroon color
    padding: 15,
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
    color: "#FAFAFA", // Off-white text
    fontSize: 16,
    fontWeight: "bold",
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
  passwordRequirements: {
    width: "85%",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#AB8C96",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  requirementRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  checkmark: {
    color: "#2E7D32", // Green
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
    width: 20,
  },
  xmark: {
    color: "#C62828", // Red
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
    width: 20,
  },
  requirementMet: {
    color: "#2E7D32", // Green
    fontSize: 12,
    flex: 1,
  },
  requirementUnmet: {
    color: "#C62828", // Red
    fontSize: 12,
    flex: 1,
  },
});
