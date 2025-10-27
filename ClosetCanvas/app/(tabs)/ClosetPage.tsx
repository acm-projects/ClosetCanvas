import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  // Platform, // <-- Removed
} from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { Link } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { getCredentials } from "../../util/auth";

// --- REMOVED: Background removal and file system libraries ---

// API & User Configuration
const API_ENDPOINT =
  "https://1ag2u91ezb.execute-api.us-east-2.amazonaws.com/production/s3";

// Hardcoded outfits
const outfits = [
  {
    id: 1,
    items: [
      require("../../assets/images/hoodie.png"),
      require("../../assets/images/pants.png"),
      require("../../assets/images/shoes.png"),
    ],
  },
  { id: 2, items: [require("../../assets/images/dress.png")] },
  {
    id: 3,
    items: [
      require("../../assets/images/tshirt.png"),
      require("../../assets/images/shorts.png"),
      require("../../assets/images/sneakers.png"),
    ],
  },
  {
    id: 4,
    items: [
      require("../../assets/images/white-tee.png"),
      require("../../assets/images/jeans.png"),
      require("../../assets/images/sneakers.png"),
    ],
  },
  { id: 5, items: [require("../../assets/images/plaid.png")] },
  {
    id: 6,
    items: [
      require("../../assets/images/white-tee.png"),
      require("../../assets/images/pants.png"),
    ],
  },
];

export default function ClosetPage() {
  const [likedOutfits, setLikedOutfits] = useState<number[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State for user data
  const [userId, setUserId] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);

  // --- REMOVED: isNativeRemoval state ---

  function toggleLike(outfitId: number) {
    if (likedOutfits.includes(outfitId)) {
      setLikedOutfits(likedOutfits.filter((id) => id !== outfitId));
    } else {
      setLikedOutfits([...likedOutfits, outfitId]);
    }
  }

  // Load credentials when the page loads
  useEffect(() => {
    const loadUserData = async () => {
      const creds = await getCredentials();
      if (creds) {
        setUserId(creds.accessToken); // This is actually the UUID
        setUserToken(creds.uuid); // This is actually the Access Token
      } else {
        console.warn("No credentials found. User is not logged in.");
      }
    };

    // --- REMOVED: checkBgRemovalSupport() ---

    loadUserData();
  }, []); // Runs once on mount

  // --- Image Upload (POST) ---
  const uploadImage = async (base64Image: string, mimeType: string) => {
    // --- MOVED: Loading state is now handled here ---
    setModalVisible(false);
    setIsLoading(true);

    if (!userId || !userToken) {
      Alert.alert("Error", "You are not logged in. Please restart the app.");
      setIsLoading(false); // Make sure to stop loading on error
      return;
    }

    const body = {
      user_id: userId,
      image: base64Image,
      filetype: mimeType || "image/jpeg",
    };

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: userToken,
        },
        body: JSON.stringify(body),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.message ||
            "Upload failed with status: " + response.status
        );
      }

      Alert.alert("Success!", "Your item has been added.");
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        "Upload Failed",
        error instanceof Error ? error.message : "Could not upload image."
      );
    } finally {
      setIsLoading(false); // This stops the spinner after upload is done
    }
  };

  // --- REMOVED: handleImageProcessingAndUpload function ---

  /**
   * Opens the Image Library to pick an image.
   */
  async function pickImage() {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Kept fix
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.base64 && asset.mimeType) {
        // --- UPDATED: Call uploadImage directly ---
        await uploadImage(asset.base64, asset.mimeType);
      }
    }
  }

  /**
   * Opens the Camera to take a photo.
   */
  async function takePhoto() {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.base64 && asset.mimeType) {
        // --- UPDATED: Call uploadImage directly ---
        await uploadImage(asset.base64, asset.mimeType);
      }
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title0}>ClosetCanvas</Text>
        <Link href="/SettingsPage">
          <Entypo name="user" size={28} color="white" />
        </Link>
      </View>

      {/* Wardrobe Title */}
      <Text style={styles.subtitle}>Wardrobe</Text>
      {/* Filters */}
      <View style={styles.filters}>
        {["Tops", "Bottoms", "Outerwear"].map((f) => (
          <TouchableOpacity key={f} style={styles.filterButton}>
            <Text style={styles.filterText}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Items Grid (mapping over static 'outfits') */}
      <ScrollView contentContainerStyle={styles.grid}>
        {outfits.map((outfit) => {
          const isLiked = likedOutfits.includes(outfit.id);
          return (
            <View key={outfit.id} style={styles.card}>
              <View style={styles.outfitRow}>
                {outfit.items.map((item, i) => (
                  <Image key={i} source={item} style={styles.itemImage} />
                ))}
              </View>
              <TouchableOpacity
                style={styles.heart}
                onPress={() => toggleLike(outfit.id)}
              >
                {isLiked ? (
                  <Ionicons name="heart" size={24} color="#ff0026ff" />
                ) : (
                  <Ionicons name="heart-outline" size={24} color="#333" />
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#4B0082" />
      </TouchableOpacity>

      {/* --- Modals --- */}
      <Modal
        transparent={true}
        animationType="none"
        visible={isLoading}
        onRequestClose={() => {}}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B0082" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalContainer}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalView} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add to Closet</Text>
            <TouchableOpacity style={styles.modalButton} onPress={takePhoto}>
              <Ionicons name="camera" size={22} color="#4B0082" />
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
              <Ionicons name="image" size={22} color="#4B0082" />
              <Text style={styles.modalButtonText}>Choose from Library</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// STYLES
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
  title0: {
    color: "#fafafa",
    fontSize: 22,
    fontFamily: "serif",
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 25,
    color: "#4B0082",
    fontWeight: "bold",
    margin: 15,
  },
  filters: {
    flexDirection: "row",
    marginHorizontal: 10,
  },
  filterButton: {
    backgroundColor: "#BA9EEF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterText: {
    color: "#fafafa",
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    paddingBottom: 80,
  },
  card: {
    width: "40%",
    backgroundColor: "#F9CADA",
    borderRadius: 15,
    marginVertical: 10,
    padding: 10,
    alignItems: "center",
    position: "relative",
  },
  itemImage: {
    width: 120,
    height: 100,
    resizeMode: "cover",
    marginBottom: 5,
  },
  heart: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
    zIndex: 1,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 6,
    elevation: 5,
  },
  // --- Modal Styles ---
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 0,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4B0082",
    marginBottom: 20,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9CADA",
    borderRadius: 10,
    padding: 12,
    width: "100%",
    marginBottom: 10,
  },
  modalButtonText: {
    color: "#4B0082",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 15,
  },
  cancelButton: {
    backgroundColor: "#D1EFDA",
    justifyContent: "center",
    width: "50%",
    marginBottom: 20,
  },
  cancelButtonText: {
    color: "#4B0082",
    marginLeft: 0,
    textAlign: "center",
  },
  // --- Loading Modal Styles ---
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  loadingText: {
    color: "white",
    marginTop: 10,
    fontSize: 16,
    fontWeight: "600",
  },
  outfitRow: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIcon: {
    position: "absolute",
    right: 20,
    top: 55,
  },
  title: {
    color: "#fafafa",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "serif",
  },
  addText: {
    marginLeft: 8,
    fontSize: 18,
    color: "#4B0082",
    fontWeight: "600",
  },
});
