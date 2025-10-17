import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, SafeAreaView,Image } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons, MaterialCommunityIcons, Entypo } from "@expo/vector-icons";
import { useRouter } from 'expo-router';


type SettingsRowProps = {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};
const SettingsRow: React.FC<SettingsRowProps> = ({ label, value, onValueChange }) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Switch
      trackColor={{ false: "#767577", true: "#BA9EEF" }}
      thumbColor={value ? "#f5dd4b" : "#f4f3f4"}
      onValueChange={onValueChange}
      value={value}
    />
  </View>
);

export default function SettingsPage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [modesty, setModesty] = useState(false);


  function handleSave() {
    // Replace with real save logic
    console.log({ darkMode, notifications, modesty });
    alert('Settings saved');
  }

  return (
    // safeareaview is deprecated we need to change that for next update
    // <View style={styles.container}> for the header of settings
    <SafeAreaView style={styles.page}>
       <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
         
         <View style={styles.headerCenter}>
          <Image
            source={require("../assets/images/Settings.png")}
            style={styles.headerIcon}
          />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
       
       
        <View style={{ width: 28 }} />{/* This is a spacer to center the title */}
      </View>
        
       
       
       



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
    </SafeAreaView>
  );
}

// ✅ Styles using React Native's StyleSheet
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#DACCF4',
  },
   header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#56088B',
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 15,
    borderTopLeftRadius: 20, // ✅ Your rounded corners
    borderTopRightRadius: 20, // ✅ Your rounded corners
  },
   headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Adds a small space between the icon and text
  },
  headerIcon: {
    width: 32, // Adjusted size for better alignment
    height: 32,
  },
  headerTitle: {
    color: 'white',
    fontSize: 25,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 5, // Makes it easier to tap
  },
  container: {
    flex: 1,
    padding: 24,
    
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 10, // Add vertical padding
    paddingHorizontal: 20,
    elevation: 10,
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16, // Space out the rows
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  rowLabel: {
    fontSize: 16,
    color: '#111827',
  },
  button: {
    marginTop: 24,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#56088B',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },



});