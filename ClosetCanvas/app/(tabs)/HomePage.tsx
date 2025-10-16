import React from "react";
import {View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,} from "react-native";
import { Ionicons, MaterialCommunityIcons, Entypo } from "@expo/vector-icons";
import { Link } from 'expo-router';
export default function HomePage() {
  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>ClosetCanvas</Text>
        <Link href="/SettingsPage">
          <Entypo name="menu" size={28} color="white" />
        </Link>
      </View>

      {/* Weather Section */}
      <View style={styles.weatherCard}>
        <Ionicons name="sunny-outline" size={40} color="#F7B91C" />
        <View>
          <Text style={styles.weatherText}>Sunny</Text>
          <Text style={styles.weatherSub}>72° - Perfect weather</Text>
        </View>
      </View>

      {/* Outfit Description */}
      <View style={styles.textSection}>
        <Text style={styles.outfitTitle}>Casual & Comfortable</Text>
        <Text style={styles.outfitSubtitle}>
          Perfect for your 2 PM hang out
        </Text>
      </View>

      {/* Outfit Display with Side Rectangles */}
      <View style={styles.outfitContainer}>
        {/* Left Rectangle */}
        <View style={styles.sideRectangleLeft}></View>
        {/* Right Rectangle */}
        <View style={styles.sideRectangleRight}></View>

        {/* Center Outfit Card */}
        <View style={styles.outfitCard}>
          <Image
          source={require("../../assets/images/WhiteShirt.png")} 
           style={styles.shirt}
          />
          <Image
            source={require("../../assets/images/BlueJeans.png")} 
            style={styles.jeans}
          />
          <Image
            source={require("../../assets/images/WhiteShoes.png")} 
            style={styles.shoes}
          />
        </View>
      </View>

      {/* Love this outfit button */}
      
      <TouchableOpacity style={styles.loveButton}>
         <Link href="/ClosetPage"> 
        <Text style={styles.loveButtonText}>Love this outfit!</Text>
         </Link>
      </TouchableOpacity>
    
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },

  header: {
    backgroundColor: "#56088B",
    height: 60,
    paddingHorizontal: 20,
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  title: {
    color: "#fafafa",
    fontSize: 22,
    fontFamily: "serif",
    fontWeight: "600",
  },

  weatherCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E2E9FF",
    width: 330,
    height: 58,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 25,
    gap: 10,
  },

  weatherText: {
    fontWeight: "bold",
    fontSize: 16,
  },

  weatherSub: {
    fontSize: 13,
    color: "#767575",
  },

  textSection: {
    alignItems: "center",
    marginVertical: 25,
  },

  outfitTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 5,
  },

  outfitSubtitle: {
    color: "#767575",
  },

  outfitContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    height: 520,
  },

  sideRectangleLeft: {
    position: "absolute",
    width: 255,
    height: 493,
    backgroundColor: "#F9CADA",
    borderRadius: 10,
    left: 35,
    top: 10,
    opacity: 0.8,
  },

  sideRectangleRight: {
    position: "absolute",
    width: 255,
    height: 493,
    backgroundColor: "#F9CADA",
    borderRadius: 10,
    right: 35,
    top: 10,
    opacity: 0.8,
  },

  outfitCard: {
    backgroundColor: "#F9CADA",
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    width: 270,
    height: 500,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    zIndex: 2,
  },

  shirt: {
    width: 160,
    height: 160,
    resizeMode: "contain",
  },

  jeans: {
    width: 220,
    height: 220,
    resizeMode: "cover",
    marginTop: -20,
  },

  shoes: {
    width: 100,
    height: 90,
    resizeMode: "cover",
    marginTop: -10,
  },

  loveButton: {
    backgroundColor: "#D8C7FF",
    alignSelf: "center",
    marginTop: 25,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 25,
  },

  loveButtonText: {
    color: "#3C1A72",
    fontWeight: "600",
    fontSize: 16,
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#4A148C",
    height: 70,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 40,
  },

  navItem: {
    alignItems: "center",
  },

  navText: {
    color: "white",
    fontSize: 12,
    marginTop: 3,
  },
});
