import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { Link, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function SignupScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [secondpassword, setSecondPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [atConfirmation, setAtConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const router = useRouter();

  const [date, setDate] = useState(new Date());
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

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/;

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
            text1: "Missing Information",
            text2: "Please fill out all fields.",
        });
        setIsLoading(false);
        return;
    }

    if (password !== secondpassword) {
        Toast.show({
            type: "error",
            text1: "Passwords do not match",
            text2: "Please make sure both passwords are identical.",
        });
        setIsLoading(false);
        return;
    }


    if (!passwordRegex.test(password)) {
        Toast.show({
            type: "error",
            text1: "Weak Password",
            text2: "Password must be at least 8 characters long and include: uppercase, lowercase, numbers, and special characters.",
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

      // Toast.show({
      //   type: "success",
      //   text1: "Account Created!",
      //   text2: responseData?.message || "Welcome to ClosetCanvas!",
      // });

      // setTimeout(() => {
      //   router.push("/Loginpage");
      // }, 2000);
      setAtConfirmation(true);
    } catch (error) {
      console.error("Error during sign up:", error);
      Toast.show({
        type: "error",
        text1: "Sign Up Failed",

        text2:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!atConfirmation ? (
        <View style={styles.container}>
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
        </View>
      ) : (
        <View style={styles.container}>
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
        </View>
      )}
    </>
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
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  text: {
    fontSize: 14,
    marginRight: 10,
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
    color: "#000000",
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: "bold",
  },
  input: {
    width: "85%",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DDD",
    padding: 10,
    marginBottom: 15,
    borderRadius: 8,
    justifyContent: "center",
  },
});
