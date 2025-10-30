<<<<<<< HEAD
import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, SafeAreaView,Image } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Entypo } from "@expo/vector-icons";
import { useRouter } from 'expo-router';
import { removeCredentials } from '../util/auth.js';

type SettingsRowProps = {
=======
import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons"; // Used for all icons in settings

// Define the structure for each settings item
type SettingsItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
>>>>>>> Pragya
  label: string;
  onPress?: () => void;
};

// Settings items, defined as a function to accept the router
const settingsItems = (router: any): SettingsItemProps[] => [
  {
    icon: "person-outline",
    label: "Account",
    // Example: onPress: () => router.push('/AccountPage')
    // Add navigation logic here when ready
  },
  { icon: "notifications-outline", label: "Notifications" },
  { icon: "eye-outline", label: "Appearance" },
  { icon: "shirt-outline", label: "Clothing Mode" },
  { icon: "lock-closed-outline", label: "Privacy & Security" },
  { icon: "help-buoy-outline", label: "Help & Support" },
  { icon: "information-circle-outline", label: "About" },
];

export default function SettingsPage() {
  const router = useRouter();
  const items = useMemo(() => settingsItems(router), [router]);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            // Add any actual logout logic here (e.g., clearing tokens)
            console.log("Logging out...");
            // Navigate to Login page and prevent going back
            router.replace('/Loginpage'); 
          }
        }
      ]
    );
  };

  const handleLogout = async () => {
    await removeCredentials();
    router.replace('/Loginpage');
    console.log('User logged out, credentials removed.');
  };

  return (
    <View style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#3C2332" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Ionicons name="settings-outline" size={32} color="#3C2332" />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Spacer (Right) - balances the back button */}
        <View style={{ width: 28 }} />
      </View>

      {/* Settings List */}
      <ScrollView contentContainerStyle={styles.listContainer}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.row}
            onPress={item.onPress || (() => console.log(`Tapped: ${item.label}`))}
          >
            <Ionicons name={item.icon} size={24} color="#3C2332" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

<<<<<<< HEAD

        <View style={styles.card}>
          <SettingsRow
            label="Dark Mode"
            value={darkMode}
            onValueChange={setDarkMode}
          />
          <SettingsRow
            label="Notifications"
            value={notifications}
            onValueChange={setNotifications}
          />
          <SettingsRow
            label="Modesty Mode"
            value={modesty}
            onValueChange={setModesty}
          />
         
        </View>

        <TouchableOpacity onPress={handleSave} style={styles.button}>
         <Link href="/(tabs)/HomePage">
          <Text style={styles.buttonText}>Save</Text>
          </Link>
        </TouchableOpacity>

        
        <TouchableOpacity onPress={handleLogout} style={styles.button}>
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
    </SafeAreaView>
=======
      {/* Logout Button */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
>>>>>>> Pragya
  );
}

// Styles
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#E5D7D7',
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: "space-between", 
    paddingBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 5, // Increases the tap area
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#3C2332',
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#AB8C96',
  },
  rowIcon: {
      marginRight: 15,
  },
  rowLabel: {
    flex: 1,
    fontSize: 18,
    color: '#3C2332',
  },
  logoutButton: {
    backgroundColor: '#714054', // App theme color
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 20, // Match list padding
    marginTop: 20, // Space above the button
    marginBottom: 40, // More space at the bottom
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

