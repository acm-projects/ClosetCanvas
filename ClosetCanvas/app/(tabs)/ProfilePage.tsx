import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image, // Import Image
} from "react-native";
import { Link, useRouter } from "expo-router";
import {
  ArrowLeft,
  Settings,
  User,
  Bell,
  Eye,
  Shirt,
  Lock,
  HelpCircle,
  Info,
  LogOut, 
  LucideIcon,
  ChevronRight, 
} from "lucide-react-native";
import { removeCredentials } from "../../util/auth";

type SettingsItemProps = {
  icon: LucideIcon;
  label: string;
  onPress?: () => void;
};


const settingsItems = (router: any): SettingsItemProps[] => [
  { icon: Bell, label: "Notifications" },
  { icon: Eye, label: "Appearance" },
  { icon: Shirt, label: "Clothing Mode" },
  { icon: Lock, label: "Privacy & Security" },
  { icon: HelpCircle, label: "Help & Support" },
  { icon: Info, label: "About" },
  { icon: LogOut, label: "Log Out" },
];

export default function SettingsPage() {
  const router = useRouter();
  const items = useMemo(() => settingsItems(router), [router]);

  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: async () => {
            await removeCredentials();
            console.log("User logged out, credentials removed.");
            router.replace("/Loginpage");
          },
        },
      ],
      { cancelable: true } // Allow dismissing by tapping outside
    );
  };

  const handleEditProfile = () => {
    console.log("Navigate to Edit Profile");
  };

  return (
    <View style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={28} color="#3C2332" />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <User size={30} color="#3C2332" />
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={{ width: 28 }} />
      </View>

      <View style={styles.profileCard}>
        <View style={styles.profileAvatar}>
          <User size={40} color="white" />
        </View>
        <Text style={styles.profileName}>Your Username</Text>
        <Text style={styles.profileEmail}>your.email@example.com</Text>

        <TouchableOpacity
          style={styles.editProfileButton}
          onPress={handleEditProfile}
        >
          <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          <ChevronRight size={16} color="#3C2332" />
        </TouchableOpacity>
      </View>
      

<Text style={styles.sectionTitle}>Settings</Text>
      <ScrollView contentContainerStyle={styles.listContainer}>
        {items.map((item, index) => {
          const IconComponent = item.icon;
          const isLogout = item.label === "Log Out";

          return (
            <TouchableOpacity
              key={index}
              style={styles.row}
              onPress={
                isLogout
                  ? handleLogout
                  : item.onPress ||
                    (() => console.log(`Tapped: ${item.label}`))
              }
            >
              <IconComponent
                size={24}
                color={isLogout ? "#D90429" : "#3C2332"}
                style={styles.rowIcon}
              />
              <Text
                style={isLogout ? styles.rowLabelDestructive : styles.rowLabel}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#E5D7D7",
    paddingTop: 60,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    justifyContent: "space-between",
    paddingBottom: 20,
    paddingTop: 10,
  },
  backButton: {
    padding: 5,
  },
  headerCenter: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: "#3C2332",
    fontSize: 28,
    fontWeight: "bold",
    marginLeft: 10,
  },

  profileCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginHorizontal: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 30,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#AB8C96",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#3C2332",
  },
  profileEmail: {
    fontSize: 16,
    color: "#714054",
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: "row",
    backgroundColor: "#E5D7D7",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  editProfileButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#3C2332",
    marginRight: 5,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#714054",
    marginHorizontal: 20,
    marginBottom: 10,
    textTransform: "uppercase",
  },
  // --- END NEW STYLES ---

  listContainer: {
    paddingHorizontal: 20,
    backgroundColor: 'white', // Group settings in a white card
    marginHorizontal: 20,
    borderRadius: 12,
    paddingBottom: 10, // Add padding to bottom of list
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#E5D7D7", 
  },
  rowIcon: {
    marginRight: 15,
  },
  rowLabel: {
    flex: 1,
    fontSize: 18,
    color: "#3C2332",
  },
  logoutButton: {
    backgroundColor: "#714054",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  rowLabelDestructive: {
    flex: 1,
    fontSize: 18,
    color: "#D90429", // A strong red
    fontWeight: "600",
  },
});