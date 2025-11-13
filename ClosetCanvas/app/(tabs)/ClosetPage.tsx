import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Image,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Alert,
  ActivityIndicator,
  ImageSourcePropType,
} from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import MasonryList from "@react-native-seoul/masonry-list";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCredentials } from "../../util/auth";
import Constants from "expo-constants";

// ---------------------- Types ----------------------
type ClosetDataItem = {
  id: number;
  source: ImageSourcePropType;
  type: "local" | "user";
  category: string;
};

type Credentials = { uuid?: string; accessToken?: string };

type GetItemsResponse = {
  user_id: string | null;
  count: number;
  items: Array<{
    id?: string;
    item_id?: string;
    uri?: string | null;
    clothingType?: number | null;
  }>;
};

// ---------------------- Helpers ----------------------
const uuidToInt = (s: string): number => {
  if (!s) return Date.now();
  const hex = s.replace(/-/g, "").slice(0, 8);
  const n = parseInt(hex || "0", 16);
  return Number.isNaN(n) ? Date.now() : n;
};

const mapClothingTypeToCategory = (t?: number | null): string => {
  switch (t) {
    case 1:
      return "Tops";
    case 2:
      return "Pants";
    case 3:
      return "Jackets";
    case 4:
      return "Dresses";
    case 5:
      return "Shoes";
    default:
      return "User Upload";
  }
};

const CATEGORIES = ["All", "Favorites", "Tops", "Pants", "Dresses", "Shoes", "Jackets"];

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  All: "apps-outline",
  Favorites: "heart",
  Tops: "shirt-outline",
  Pants: "walk-outline",
  Dresses: "woman-outline",
  Shoes: "footsteps-outline",
  Jackets: "snow-outline",
  "User Upload": "images-outline",
};

const API_ENDPOINT = "https://3a42g82o4d.execute-api.us-east-2.amazonaws.com/dev/s3v2";

// ---------------------- ClosetCard ----------------------
const ClosetCard = React.memo(
  ({
    item,
    isLiked,
    onToggleLike,
    onDelete,
  }: {
    item: ClosetDataItem;
    isLiked: boolean;
    onToggleLike: (id: number) => void;
    onDelete: (id: number) => void;
  }) => {
    const [randomHeight] = useState(Math.floor(Math.random() * 100) + 180);

    return (
      <Pressable onLongPress={() => onDelete(item.id)}>
        <View style={styles.card}>
          <Image
            source={item.source}
            style={[styles.userImage, { height: randomHeight }]}
          />
          <TouchableOpacity
            style={styles.heart}
            onPress={() => onToggleLike(item.id)}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={30}
              color={isLiked ? "#DE8672" : "#333"}
            />
          </TouchableOpacity>
        </View>
      </Pressable>
    );
  }
);

// ---------------------- Main ----------------------
export default function ClosetPage() {
  const [likedOutfits, setLikedOutfits] = useState<number[]>([]);
  const [userImages, setUserImages] = useState<ClosetDataItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [localItems, setLocalItems] = useState<ClosetDataItem[]>([]);

useFocusEffect(
  useCallback(() => {
    loadData();
    loadUserCredentials();
  }, [])
);

  useEffect(() => {
    saveData();
  }, [userImages, likedOutfits, localItems]);

  const loadUserCredentials = async () => {
    const creds = (await getCredentials()) as Credentials;
    console.log("[Creds] getCredentials() →", creds);
    if (creds?.uuid) {
      setUserId(creds.uuid);
    } else {
      console.warn("[Creds] No credentials found. User not logged in.");
    }
  };

  // ---------------------- GET ----------------------
  const refreshFromServer = useCallback(async () => {
    if (!userId) {
      console.log("[GET] No userId, skipping refresh");
      return;
    }
    const url = `${API_ENDPOINT}?user_id=${encodeURIComponent(userId)}&signed=1&expiresIn=3600`;
    console.log("[GET] Fetching from:", url);

    try {
      const res = await fetch(url);
      const raw = await res.text();
      console.log("[GET] Status:", res.status);
      console.log("[GET] Raw response:", raw.substring(0, 200));

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}: ${raw}`);
      }

      const json: GetItemsResponse = JSON.parse(raw || "{}");
      const items = json.items || [];

      console.log("[GET] Parsed items count:", items.length);

      const serverItems: ClosetDataItem[] = items
        .filter((it) => it.uri && typeof it.uri === "string" && it.uri.trim() !== "")
        .map((it) => ({
          id: uuidToInt(String(it.id || it.item_id || "")),
          source: { uri: it.uri! },
          type: "user" as const,
          category: mapClothingTypeToCategory(it.clothingType),
        }));

      console.log("[GET] Valid items:", serverItems.length);
      setUserImages(serverItems);
      await AsyncStorage.setItem("userImages", JSON.stringify(serverItems));
    } catch (e) {
      console.error("[GET] Error:", e);
      Alert.alert("Load Failed", "Could not load items from server");
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      console.log("[Effect] userId changed, refreshing:", userId);
      refreshFromServer();
    }
  }, [userId, refreshFromServer]);

  // ---------------------- POST ----------------------
  // Accepts asset: ImagePickerAsset
  const uploadImage = async (asset: { uri: string; type?: string; mimeType?: string }) => {
    if (!userId) {
      Alert.alert("Error", "You are not logged in.");
      return;
    }
    const bgApi = Constants.expoConfig?.extra?.BG_REMOVAL_API_KEY || "";
    setIsLoading(true);
    try {
      // Use asset.uri for FormData (React Native style)
      const formData = new FormData();
      formData.append('image_file', {
        uri: asset.uri,
        name: 'upload.jpg',
        type: asset.mimeType || asset.type || 'image/jpeg',
      } as any);
      formData.append('size', 'auto');

      const bgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": bgApi,
        },
        body: formData,
      });

      if (!bgResponse.ok) {
        const errorText = await bgResponse.text();
        throw new Error(`Background removal failed: ${bgResponse.status} - ${errorText}`);
      }

      // Convert response to base64
      const arrayBuffer = await bgResponse.arrayBuffer();
      let binary = "";
      const bytes = new Uint8Array(arrayBuffer);
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const bgRemovedBase64 = btoa(binary);

      if (!bgRemovedBase64) {
        throw new Error("No background-removed image returned");
      }

      // Step 2: Upload to S3
      const uploadBody = {
        user_id: userId,
        image: bgRemovedBase64,
        filetype: "image/png",
      };

      const uploadResponse = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(uploadBody),
      });

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        throw new Error(
          uploadData.message || `Upload failed: ${uploadResponse.status}`
        );
      }

      Alert.alert("Success", "Item uploaded successfully!");
      await refreshFromServer();
    } catch (e) {
      Alert.alert(
        "Upload Failed",
        e instanceof Error ? e.message : "An error occurred during upload"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------- Pickers ----------------------
  const pickImage = async () => {
    console.log('[Picker] pickImage called');
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      console.log('[Picker] Media library permission:', permission.status);
      
      if (!permission.granted) {
        Alert.alert("Permission Required", "Please allow access to your photo library.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: false,
        quality: 0.7,
        base64: true,
      });
      
      console.log('[Picker] Result canceled:', result.canceled);
      
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        console.log('[Picker] Asset:', { 
          hasBase64: !!asset.base64, 
          mimeType: asset.mimeType,
          uri: asset.uri 
        });
        
      await uploadImage(asset);
      }
    } catch (e) {
      console.error('[Picker] Error:', e);
      Alert.alert('Error', 'Failed to pick image: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  const takePhoto = async () => {
    console.log('[Camera] takePhoto called');
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      console.log('[Camera] Permission:', permission.status);
      
      if (!permission.granted) {
        Alert.alert("Permission Required", "Please allow access to your camera.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
        base64: true,
      });
      
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
      await uploadImage(asset);
      }
    } catch (e) {
      console.error('[Camera] Error:', e);
      Alert.alert('Error', 'Failed to take photo: ' + (e instanceof Error ? e.message : String(e)));
    }
  };

  // ---------------------- Local storage ----------------------
  const loadData = async () => {
    try {
      const storedUserItems = await AsyncStorage.getItem("userImages");
      const storedLikes = await AsyncStorage.getItem("likedOutfits");
      const storedLocalItems = await AsyncStorage.getItem("localItems");
      
      if (storedUserItems) {
        const parsed = JSON.parse(storedUserItems);
        console.log("[Storage] Loaded user items:", parsed.length);
        setUserImages(parsed);
      }
      if (storedLikes) setLikedOutfits(JSON.parse(storedLikes));
      if (storedLocalItems) setLocalItems(JSON.parse(storedLocalItems));
    } catch (e) {
      console.error("[Storage] Failed to load data", e);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem("userImages", JSON.stringify(userImages));
      await AsyncStorage.setItem("likedOutfits", JSON.stringify(likedOutfits));
      await AsyncStorage.setItem("localItems", JSON.stringify(localItems));
    } catch (e) {
      console.error("[Storage] Failed to save data", e);
    }
  };

  const toggleLike = useCallback((outfitId: number) => {
    setLikedOutfits((prev) =>
      prev.includes(outfitId)
        ? prev.filter((id) => id !== outfitId)
        : [...prev, outfitId]
    );
  }, []);


  function imageSelecter() {
    setModalVisible(true);
  }

  function onTakePhoto() {
    console.log('onTakePhoto modal action');
    setModalVisible(false);
    takePhoto();
  }

  function onPickImage() {
    console.log('onPickImage modal action');
    setModalVisible(false);
    pickImage();
  }

  const handleDelete = useCallback((id: number) => {
    setItemToDelete(id);
    setDeleteModalVisible(true);
  }, []);

  const confirmDelete = () => {
    if (itemToDelete === null) return;

    setUserImages((prev) => prev.filter((item) => item.id !== itemToDelete));
    setLocalItems((prev) => prev.filter((item) => item.id !== itemToDelete));
    setLikedOutfits((prev) => prev.filter((likedId) => likedId !== itemToDelete));

    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const allData = useMemo(() => [...localItems, ...userImages], [localItems, userImages]);

  const filteredData = useMemo(() => {
    if (activeCategory === "All") return allData;
    if (activeCategory === "Favorites") return allData.filter((x) => likedOutfits.includes(x.id));
    return allData.filter((x) => x.category === activeCategory);
  }, [allData, activeCategory, likedOutfits]);

  const renderMasonryItem = useCallback(
    ({ item, i }: { item: unknown; i: number }) => {
      const it = item as ClosetDataItem;
      const isLiked = likedOutfits.includes(it.id);
      
      return (
        <ClosetCard
          item={it}
          isLiked={isLiked}
          onToggleLike={toggleLike}
          onDelete={handleDelete}
        />
      );
    },
    [likedOutfits, toggleLike, handleDelete]
  );

  return (
    <View style={styles.container}>
      <Link href="/SettingsPage" style={styles.userIcon}>
        <Entypo name="user" size={28} color="white" />
      </Link>

      <View style={styles.subtitleRow}>
        <Ionicons
          name={
            activeCategory === "Favorites" ? "heart" :
            activeCategory === "Tops" ? "shirt" :
            activeCategory === "Pants" ? "man" :
            activeCategory === "Dresses" ? "woman" :
            activeCategory === "Shoes" ? "walk" :
            activeCategory === "Jackets" ? "snow" :
            "grid-outline"
          }
          size={40}
          color="#714054"
          style={{ marginRight: 10, marginTop: 40, marginLeft: 20 }}
        />
        <Text style={styles.subtitle}>
          {activeCategory === "All" ? "Wardrobe" : activeCategory}
        </Text>
      </View>

      <View style={styles.categoryBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContainer}
        >
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                activeCategory === category && styles.categoryButtonActive,
              ]}
              onPress={() => setActiveCategory(category)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.categoryText,
                  activeCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <MasonryList
        data={filteredData}
        keyExtractor={(item: unknown) => (item as ClosetDataItem).id.toString()}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 5, paddingBottom: 100 }}
        renderItem={renderMasonryItem}
      />

      <TouchableOpacity style={styles.addButton} onPress={imageSelecter}>
        <Ionicons name="add" size={30} color="#714054" />
      </TouchableOpacity>

      {/* Add Image Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <Pressable style={styles.modalContainer} onPress={() => setModalVisible(false)}>
          <Pressable style={styles.modalView}>
            <Text style={styles.modalTitle}>Add to Closet</Text>

            <TouchableOpacity style={styles.modalButton} onPress={takePhoto}>
              <Ionicons name="camera" size={22} color="#714054" />
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalButton} onPress={pickImage}>
              <Ionicons name="image" size={22} color="#714054" />
              <Text style={styles.modalButtonText}>Choose from Library</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.modalButtonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <Pressable style={styles.modalContainer} onPress={cancelDelete}>
          <Pressable style={styles.modalView}>
            <Text style={styles.modalTitle}>Delete Item</Text>
            <Text style={styles.deleteModalText}>
              Are you sure you want to delete this item?
            </Text>

            <View style={styles.deleteModalButtonRow}>
              <TouchableOpacity
                style={[styles.deleteButton, styles.deleteButtonCancel]}
                onPress={cancelDelete}
              >
                <Text style={[styles.deleteButtonText, styles.deleteButtonTextCancel]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.deleteButton, styles.deleteButtonConfirm]}
                onPress={confirmDelete}
              >
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Loading Modal */}
      <Modal transparent visible={isLoading}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#714054" />
          <Text style={styles.loadingText}>Processing image...</Text>
        </View>
      </Modal>
    </View>
  );
}

// ---------------------- Styles ----------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E5D7D7" },
  subtitle: { fontSize: 25, marginTop: 42, color: "#2E2E2E", fontWeight: "bold", margin: 5 },
  subtitleRow: { flexDirection: "row", alignItems: "center", marginLeft: 5, marginBottom: 5 },
  categoryBar: { height: 56, marginBottom: 10 },
  categoryContainer: { paddingHorizontal: 15, alignItems: "center" },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#714054",
    borderRadius: 20,
    marginRight: 10,
    alignSelf: "center",
  },
  categoryButtonActive: { backgroundColor: "#DE8672" },
  categoryText: { color: "#FAFAFA", fontWeight: "600" },
  categoryTextActive: { color: "#FFF", fontWeight: "600" },
  card: { backgroundColor: "#714054", borderRadius: 16, margin: 5, overflow: "hidden", elevation: 3 },
  userImage: { width: "100%", resizeMode: "contain", borderRadius: 12 },
  heart: { position: "absolute", top: 8, right: 8 },
  addButton: { 
    position: "absolute", 
    bottom: 20, 
    right: 20, 
    backgroundColor: "#fff", 
    borderRadius: 50, 
    padding: 10,
    elevation: 5,
  },
  modalContainer: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalView: { 
    backgroundColor: "white", 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20, 
    paddingVertical: 20, 
    paddingHorizontal: 20,
    alignItems: "center" 
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  modalButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 12, 
    justifyContent: "center", 
    width: "100%" 
  },
  modalButtonText: { color: "#2E2E2E", fontSize: 16, fontWeight: "600", marginLeft: 10 },
  cancelButton: {
    backgroundColor: "#E5D7D7",
    borderRadius: 10,
    marginTop: 10,
    width: "60%",
  },
  cancelButtonText: { color: "#2E2E2E", fontWeight: "600", fontSize: 16 },
  deleteModalText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
  },
  deleteModalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 12,
  },
  deleteButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonCancel: { backgroundColor: "#E5D7D7" },
  deleteButtonConfirm: { backgroundColor: "#D90429" },
  deleteButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  deleteButtonTextCancel: { color: "#3C2332" },
  userIcon: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: "#714054",
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
  },
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
});