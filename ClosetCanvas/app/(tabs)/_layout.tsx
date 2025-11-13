import { Tabs } from "expo-router";
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Colors } from "@/constants/theme"; 
import { useColorScheme } from "@/hooks/use-color-scheme";

import {
  Shirt,
  CalendarDays,
  Home,
  BarChart3,
  User,
  LucideIcon, 
} from "lucide-react-native";

type TabItem = {
  label: string;
  icon: LucideIcon;
  route: string;
};

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#714054",
          borderTopWidth: 0,
          height: 90,
        },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#ddd",
      }}
      tabBar={(props) => (
        <View style={styles.mergedBar}>
          <View style={styles.iconRow}>
            {[
              { label: "Wardrobe", 
                icon: Shirt, 
                route: "ClosetPage" 
              },
              {
                label: "Planner",
                icon: CalendarDays,
                route: "CalendarPage",
              },
              { label: "Home", icon: Home, route: "HomePage" },
              {
                label: "Analytics",
                icon: BarChart3,
                route: "AnalyticsPage",
              },
              { label: "Profile", icon: User, route: "ProfilePage" },
            ].map((tab: TabItem, index) => {
              const isActive =
                props.state.routeNames[props.state.index] === tab.route;
              const activeColor = "#FFD700";
              const inactiveColor = "#FFFFFF";
              const iconColor = isActive ? activeColor : inactiveColor;

              const IconComponent = tab.icon;

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => props.navigation.navigate(tab.route)}
                  style={styles.tabButton}
                >
                  <IconComponent size={32} color={iconColor} />

                  <Text
                    style={[
                      styles.label,
                      {
                        color: iconColor, 
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    >
      <Tabs.Screen name="HomePage" options={{ title: "Home" }} />
      <Tabs.Screen name="AnalyticsPage" options={{ title: "Analytics" }} />
      <Tabs.Screen name="ClosetPage" options={{ title: "Wardrobe" }} />
      <Tabs.Screen name="CalendarPage" options={{ title: "Planner" }} />
      <Tabs.Screen name="ProfilePage" options={{ title: "Profile" }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  mergedBar: {
    backgroundColor: "#714054",
    paddingTop: 15, // Adjusted padding
    paddingBottom: 34, // Padding for safe area
    height: 90,
  },
  iconRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tabButton: {
    alignItems: "center",
    width: 60,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
});