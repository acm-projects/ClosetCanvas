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
import { Link } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import MasonryList from "@react-native-seoul/masonry-list";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCredentials } from "../../util/auth";

// ---------------------- Types ----------------------
type ClosetDataItem = {
  id: number;
  source: ImageSourcePropType; // require(...) or { uri: string }
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
          <Image source={item.source} style={[styles.userImage, { height: randomHeight }]} />
          <TouchableOpacity style={styles.heart} onPress={() => onToggleLike(item.id)}>
            <Ionicons name={isLiked ? "heart" : "heart-outline"} size={30} color={isLiked ? "#DE8672" : "#333"} />
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

  const initialLocalData: ClosetDataItem[] = [];

  const [localItems, setLocalItems] = useState<ClosetDataItem[]>(initialLocalData);

  // ---------------------- Init ----------------------
  useEffect(() => {
    loadData();
    loadUserCredentials();
  }, []);

  useEffect(() => {
    saveData();
  }, [userImages, likedOutfits, localItems]);

  const loadUserCredentials = async () => {
    const creds = (await getCredentials()) as Credentials;
    //console.log("[Creds] getCredentials() →", creds);
    // ✅ use uuid as your API's user_id
    if (creds?.uuid) setUserId(creds.accessToken);
    else console.warn("[Creds] No credentials found. User not logged in.");
  };

  // ---------------------- GET ----------------------
  const refreshFromServer = useCallback(async () => {
    if (!userId) return;
    const url = `${API_ENDPOINT}?user_id=${encodeURIComponent(userId)}&signed=1&expiresIn=3600`;
    // console.log("[GET] Request URL:", url);

    try {
      const res = await fetch(url);
      const raw = await res.text();
      console.log("[GET] Status:", res.status);
      console.log("[GET] Raw body:", raw);

      const json: GetItemsResponse = JSON.parse(raw || "{}");
      const items = json.items || [];

      console.log("[GET] Parsed items:", items.length);

      const serverItems: ClosetDataItem[] = (json.items || [])
      .filter((it) => it.uri && typeof it.uri === "string" && it.uri.trim() !== "")
      .map((it) => ({
        id: uuidToInt(String(it.id || it.item_id || "")),
        source: { uri: it.uri! },
        type: "user",
        category: mapClothingTypeToCategory(it.clothingType),
      }));


      console.log("[GET] Mapped ClosetDataItems:", serverItems);
      setUserImages(serverItems);
      await AsyncStorage.setItem("userImages", JSON.stringify(serverItems));
    } catch (e) {
      console.error("[GET] Error:", e);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) refreshFromServer();
  }, [userId, refreshFromServer]);

  // ---------------------- POST ----------------------
  const uploadImage = async (base64Image: string, mimeType: string) => {
    if (!userId) {
      Alert.alert("Error", "You are not logged in.");
      return;
    }

    const body = {
      user_id: userId,
      image: base64Image,
      filetype: mimeType || "image/jpeg",
    };

    // console.log("[POST] Sending upload:", { ...body, image: `<base64 len=${base64Image.length}>` });

    setIsLoading(true);
    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const raw = await res.text();
      // console.log("[POST] Status:", res.status, "Raw:", raw);

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      Alert.alert("Success", "Image uploaded.");
      await refreshFromServer();
    } catch (e) {
      console.error("[POST] Error:", e);
      Alert.alert("Upload Failed", e instanceof Error ? e.message : "Error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------- Pickers ----------------------
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return alert("Permission to access media library required.");
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]?.base64 && result.assets?.[0]?.mimeType)
      await uploadImage(result.assets[0].base64, result.assets[0].mimeType);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return alert("Permission to access camera required.");
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]?.base64 && result.assets?.[0]?.mimeType)
      await uploadImage(result.assets[0].base64, result.assets[0].mimeType);
  };

  // ---------------------- Local storage ----------------------
  const loadData = async () => {
    try {
      const storedUserItems = await AsyncStorage.getItem("userImages");
      const storedLikes = await AsyncStorage.getItem("likedOutfits");
      const storedLocalItems = await AsyncStorage.getItem("localItems");
      if (storedUserItems) setUserImages(JSON.parse(storedUserItems));
      if (storedLikes) setLikedOutfits(JSON.parse(storedLikes));
      if (storedLocalItems) setLocalItems(JSON.parse(storedLocalItems));
    } catch (e) {
      console.error("Failed to load data", e);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem("userImages", JSON.stringify(userImages));
      await AsyncStorage.setItem("likedOutfits", JSON.stringify(likedOutfits));
      await AsyncStorage.setItem("localItems", JSON.stringify(localItems));
    } catch (e) {
      console.error("Failed to save data", e);
    }
  };

  // ---------------------- UI ----------------------
  const handleDelete = useCallback((id: number) => setItemToDelete(id), []);
  const confirmDelete = () => {
    if (itemToDelete === null) return;
    setUserImages((prev) => prev.filter((x) => x.id !== itemToDelete));
    setLocalItems((prev) => prev.filter((x) => x.id !== itemToDelete));
    setLikedOutfits((prev) => prev.filter((id) => id !== itemToDelete));
    setItemToDelete(null);
    setDeleteModalVisible(false);
  };
  const cancelDelete = () => setDeleteModalVisible(false);

  const toggleLike = useCallback(
    (id: number) =>
      setLikedOutfits((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    []
  );

  const allData = useMemo(() => [...localItems, ...userImages], [localItems, userImages]);

  const filteredData = useMemo(() => {
    if (activeCategory === "All") return allData;
    if (activeCategory === "Favorites") return allData.filter((x) => likedOutfits.includes(x.id));
    return allData.filter((x) => x.category === activeCategory);
  }, [allData, activeCategory, likedOutfits]);

  

// 1) Replace your current renderMasonryItem with this:
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
          name={CATEGORY_ICONS[activeCategory] || "grid-outline"}
          size={40}
          color="#714054"
          style={{ marginRight: 10, marginTop: 40, marginLeft: 20 }}
        />
        <Text style={styles.subtitle}>{activeCategory === "All" ? "Wardrobe" : activeCategory}</Text>
      </View>

      {/* Category strip (fixed height so pills don't stretch) */}
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


      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={30} color="#714054" />
      </TouchableOpacity>

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

      <Modal transparent visible={isLoading}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#714054" />
          <Text style={styles.loadingText}>Uploading...</Text>
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

  // Category strip
  categoryBar: {
    height: 56, // keeps pills short
    marginBottom: 10,
  },
  categoryContainer: {
    paddingHorizontal: 15,
    alignItems: "center", // center chips vertically in the 56px bar
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#714054",
    borderRadius: 20,
    marginRight: 10, // spacing between chips
    alignSelf: "center",
  },
  categoryButtonActive: { backgroundColor: "#DE8672" },
  categoryText: { color: "#FAFAFA", fontWeight: "600" },
  categoryTextActive: { color: "#FFF", fontWeight: "600" },

  // Cards
  card: { backgroundColor: "#714054", borderRadius: 16, margin: 5, overflow: "hidden", elevation: 3 },
  userImage: { width: "100%", resizeMode: "contain", borderRadius: 12 },
  heart: { position: "absolute", top: 8, right: 8 },

  // Modals & buttons
  addButton: { position: "absolute", bottom: 20, right: 20, backgroundColor: "#fff", borderRadius: 50, padding: 10 },
  modalContainer: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  modalView: { backgroundColor: "white", borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingVertical: 20, alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  modalButton: { flexDirection: "row", alignItems: "center", padding: 12, justifyContent: "center", width: "100%" },
  modalButtonText: { color: "#2E2E2E", fontSize: 16, fontWeight: "600", marginLeft: 10 },
  cancelButton: {
    backgroundColor: "#E5D7D7",
    borderRadius: 10,
    marginTop: 10,
    width: "60%",
  },
  cancelButtonText: {
    color: "#2E2E2E",
    fontWeight: "600",
    fontSize: 16,
  },


  // Loading
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  loadingText: { color: "white", marginTop: 10, fontSize: 16, fontWeight: "600" },

  userIcon: { position: "absolute", top: 40, right: 20, backgroundColor: "#714054", borderRadius: 50, padding: 6, zIndex: 10 },
});
