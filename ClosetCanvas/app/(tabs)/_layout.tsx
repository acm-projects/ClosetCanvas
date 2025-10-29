import { Tabs } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native"; // ✅ Added Image import
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";



export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#714054", // make the whole thing purple
          borderTopWidth: 0,
          height: 90,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#ddd",
      }}
      tabBar={(props) => (
        <View style={styles.mergedBar}>
          {/* --- custom icons + labels in one purple bar --- */}
          <View style={styles.iconRow}>
            {[
              { label: "Wardrobe", icon: require("../../assets/images/wardrobe.png"), route: "ClosetPage" },
              { label: "Community", icon: require("../../assets/images/community.png"), route: "CommunityPage" },
              { label: "Home", icon: require("../../assets/images/home.png"), route: "HomePage" },
              { label: "Planner", icon: require("../../assets/images/calendar.png"), route: "CalendarPage" }, // ✅ fixed spelling
              { label: "Analytics", icon: require("../../assets/images/analytics.png"), route: "AnalyticsPage" },
            ].map((tab, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => props.navigation.navigate(tab.route)}
                style={styles.tabButton}
              >
                <Image
                  source={tab.icon}
                  style={{
                    width: 30,
                    height: 25,
                    resizeMode: "contain",
                    tintColor:
                      props.state.routeNames[props.state.index] === tab.route
                        ? "#FFD700" // active = gold
                        : "#FFFFFF", // inactive = white
                  }}
                />
                <Text
                  style={[
                    styles.label,
                    {
                      color:
                        props.state.routeNames[props.state.index] === tab.route
                          ? "#FFD700"
                          : "#FFFFFF",
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    >
      <Tabs.Screen name="HomePage" options={{ title: "Home" }} />
      <Tabs.Screen name="ClosetPage" options={{ title: "Closet" }} />
      <Tabs.Screen name="CommunityPage" options={{ title: "Community" }} />
      <Tabs.Screen name="CalendarPage" options={{ title: "Planner" }} />
      <Tabs.Screen name="AnalyticsPage" options={{ title: "Analytics" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  mergedBar: {
    backgroundColor: "#714054",
    paddingTop: 8,
    paddingBottom: 18,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabButton: {
    alignItems: "center",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
});
