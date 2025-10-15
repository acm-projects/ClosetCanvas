import React, { useState } from "react";
import { View, Text, TextInput,Button, StyleSheet, Alert, Image, TouchableOpacity } from "react-native";





export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleLogin = () => {
    if (email === "test@example.com" && password === "1234") {
      Alert.alert("Success", "You are logged in!");
    } else {
      Alert.alert("Error", "Invalid credentials");
    }
  };


  return (
    <View style={styles.container}>


     <Image
      source={require("../../assets/images/logo.png")}
      style={{ width: 150, height: 150 }}
      />


      <Text style={styles.title}>Sign Up</Text>


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


      <TouchableOpacity style = {styles.button} onPress={handleLogin}>
        <Text style = {styles.buttonText}>Submit</Text>
      </TouchableOpacity>
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
  button: {
    width: "75%",
    backgroundColor:"#DACCF4",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#000000ff",
    fontSize:15 ,
    fontWeight:"bold",
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





