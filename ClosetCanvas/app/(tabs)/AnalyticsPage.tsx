import * as React from "react";
import {View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,} from "react-native";
import { Ionicons, Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { Link } from 'expo-router';

export default function AnalyticsPage() {
  const screenWidth = Dimensions.get("window").width;

  const data = [
    {
      name: "Business Wear",
      population: 30,
      color: "#BA9EEF",
      legendFontColor: "#380065",
      legendFontSize: 12,
    },
    {
      name: "Casual Wear",
      population: 40,
      color: "#F9CADA",
      legendFontColor: "#380065",
      legendFontSize: 12,
    },
    {
      name: "Active Wear",
      population: 30,
      color: "#D1EFDA",
      legendFontColor: "#380065",
      legendFontSize: 12,
    },
  ];

  return React.createElement(
    ScrollView,
    { style: styles.container },
    // Header
    React.createElement(
      View,
      { style: styles.header },
      React.createElement(Text, { style: styles.title }, "ClosetCanvas"),
       <Link href="/SettingsPage">
          <Entypo name="menu" size={28} color="white" />
        </Link>
    ),

    // Analytics Title
    React.createElement(
      View,
      { style: styles.analyticsHeader },
      React.createElement(Ionicons, { name: "stats-chart-outline", size: 28, color: "#380065" }),
      React.createElement(Text, { style: styles.analyticsTitle }, "Analytics")
    ),

    // RECAP
    React.createElement(Text, { style: styles.recapText }, "RECAP"),

    // Outfit Display
    React.createElement(
      View,
      { style: styles.outfitContainer },
      React.createElement(View, { style: styles.sideRectangleLeft }),
      React.createElement(View, { style: styles.sideRectangleRight }),
      React.createElement(
        View,
        { style: styles.outfitCard },
        React.createElement(Image, { source: require("../../assets/images/WhiteShirt.png"), style: styles.shirt }),
        React.createElement(Image, { source: require("../../assets/images/BlueJeans.png"), style: styles.jeans }),
        React.createElement(Image, { source: require("../../assets/images/WhiteShoes.png"), style: styles.shoes })
      )
    ),

    // Category Breakdown
    React.createElement(
      View,
      { style: styles.section },
      React.createElement(Text, { style: styles.sectionTitle }, "Category Breakdown"),
      React.createElement(PieChart, {
        data: data,
        width: screenWidth - 30,
        height: 180,
        chartConfig: {
          color: () => `#4A148C`,
        },
        accessor: "population",
        backgroundColor: "transparent",
        paddingLeft: "15",
        absolute: true,
      })
    ),

    // Most Worn Item
    React.createElement(
      View,
      { style: styles.infoBoxGreen },
      React.createElement(Text, { style: styles.infoTitle }, "Most Worn Item"),
      React.createElement(Text, { style: styles.infoItem }, "White Sneakers"),
      React.createElement(Text, { style: styles.infoSub }, "3x this week")
    ),

    // Cost per Wear
    React.createElement(
      View,
      { style: styles.infoBoxPurple },
      React.createElement(Text, { style: styles.infoTitle }, "Cost per Wear"),
      React.createElement(Text, { style: styles.infoItem }, "White T-Shirt"),
      React.createElement(Text, { style: styles.infoSub }, "$3.50 per wear")
    ),

   
    
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

  analyticsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
    gap: 6,
  },

  analyticsTitle: {
    fontSize: 22,
    color: "#56088B",
    fontWeight: "600",
  },

  recapText: {
    fontSize: 20,
    color: "#56088B",
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
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
    resizeMode: "cover",
  },

  jeans: {
    width: 220,
    height: 220,
    resizeMode: "cover",
    marginTop: -20,
  },

  shoes: {
    width: 110,
    height: 90,
    resizeMode: "cover",
    marginTop: -10,
  },

  section: {
    alignItems: "center",
    marginTop: 10,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#56088B",
    marginBottom: 10,
  },

  infoBoxGreen: {
    backgroundColor: "#D1EFDA",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 25,
    marginTop: 15,
  },

  infoBoxPurple: {
    backgroundColor: "#BA9EEF",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 25,
    marginTop: 15,
    marginBottom: 30,
  },

  infoTitle: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#380065",
  },

  infoItem: {
    fontSize: 16,
    color: "#380065",
    fontWeight: "600",
    marginTop: 3,
  },

  infoSub: {
    fontSize: 13,
    color: "#767575",
    marginTop: 2,
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#380065",
    height: 70,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 10,
  },

  navItem: {
    alignItems: "center",
  },

  navText: {
    color: "#fafafa",
    fontSize: 12,
    marginTop: 3,
  },
});
