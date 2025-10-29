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
import ArrowSVG from "../assets/images/arrowsvg.svg";

export default function Welcomepage() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/TransBG.png")}
        style={{ width: 350, height: 350 }}
      />

      <Text style={styles.title}> Welcome</Text>
      <Text style={styles.subtitle}> Love Your Closet...</Text>

      <View style={styles.bottomRightContainer}>
        <Link href="/SignUp" asChild>
          <TouchableOpacity style={{ width: 180, height: 70 }}>
            <Image
              source={require("../assets/images/circle.png")}
              style={styles.circle}
            />
            <ArrowSVG width={45} height={40} style={styles.arrow} />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 65,
    backgroundColor: "#E5D7D7",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 20,
    alignItems: "center",
    marginBottom: 10,
    color: "#2E2E2E",
  },
  subtitle: {
    fontSize: 20,
    alignItems: "center",
    marginLeft: 15,
    marginBottom: 30,
    color: "#2E2E2E",
  },

  bottomRightContainer: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 120, // enough space for line + circle
    height: 70,
    justifyContent: "center",
    alignItems: "flex-end",
    overflow: "visible", // allows line/arrow to extend beyond
  },

  circle: {
    position: "absolute",
    width: 60,
    height: 60,
    bottom: 0,
    right: 0,
  },

  line: {
    position: "absolute",
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    height: 7,
    right: 70, // position to the left of circle
    bottom: 27, // vertically centered on circle
  },

  arrow: {
    position: "absolute",
    width: 180,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    bottom: 10, // centered inside circle
    right: 8,
    zIndex: 10,
  },
});
