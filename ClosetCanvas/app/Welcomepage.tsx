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
  SafeAreaView, 
  Dimensions, 
} from "react-native";
import { Link, useRouter,Stack } from "expo-router";
import ArrowSVG from "../assets/images/arrowsvg.svg";

const text = "...tesolC ruoY gnivoL oT         ";
const letters = text.split("");

const logoGraphicSize =340; 
const logoContainerSize = Dimensions.get("window").width; 
const letterFontSize = 24; 
const letterHeight = letterFontSize;
const letterWidth = letterFontSize * 0.6;

const textRadius = (logoGraphicSize / 2) +10; 
const totalArcAngle = Math.PI * 1.2;
const startAngleOffset = Math.PI *.6;

export default function Welcomepage() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
    <Stack.Screen options={{headerShown: false}}/>
      <Text style={styles.title}> Welcome</Text>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/ClosetCanvas_logo.png")}
            style={styles.logo} 
          />

          {letters.map((letter, index) => {
           const angle =
              startAngleOffset +
              (index / (letters.length - 1)) * totalArcAngle;

            const containerCenter = logoContainerSize / 2;
           const x =
              containerCenter + textRadius * Math.sin(angle) - letterWidth / 2;
            const y =
              containerCenter - textRadius * Math.cos(angle) - letterHeight / 2;

            return (
              <Text
                key={index}
                style={[
                  styles.circularLetter,
                  {
                    left: x,
                    top: y,
                    
                  },
                ]}
              >
                {letter === " " ? "\u00A0" : letter}
              </Text>
            );
          })}
        </View>


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
    </SafeAreaView>
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

  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginTop: 20,
    //alignitems:"center", 
    marginBottom: 10, 
    color: "#2E2E2E",
  },
  logoContainer: {
    width: logoContainerSize,
    height: logoContainerSize,
    position: "relative", // Needed for absolute positioning
    justifyContent: "center",
    alignItems: "center",
  },
circularLetter: {
    position: "absolute",
    fontSize: 20,
    color: "#2E2E2E",
    fontWeight: "500",
    // Set a fixed size to help with centering calculations
    textAlign: "center",
    width: letterWidth,
    height: letterHeight,
    lineHeight: letterHeight,
  },
  logo: {
    width: logoGraphicSize,
    height: logoGraphicSize,
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
