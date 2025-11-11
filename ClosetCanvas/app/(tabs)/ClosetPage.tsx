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
  ActivityIndicator
} from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { Link } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import MasonryList from "@react-native-seoul/masonry-list";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCredentials } from "../../util/auth";

// API endpoint for S3
const API_ENDPOINT = "https://1ag2u91ezb.execute-api.us-east-2.amazonaws.com/production/s3";

// API Types
interface S3ImageItem {
  item_id: string;
  user_id: string;
  s3_key: string;
  mainColor: number;
  accentColor?: number;
  clothingType: number;
  status: string;
}

interface ClosetDataItem extends S3ImageItem {
  source?: { uri: string } | number; // Can be require(...) or { uri: string }
}

const CATEGORIES = ["All", "Favorites", "Tops", "Pants", "Dresses", "Shoes", "Jackets"];

/*// --- Fetch user's clothing items from S3 ---
const fetchUserImagesFromS3 = async (userId: string, token: string): Promise<ClosetDataItem[]> => {
  if (!userId || !token) {
    console.warn("User not authenticated; skipping S3 fetch");
    return [];
  }

  try {
    console.log("[GET] Fetching user images from S3...");
    console.log(`[DEBUG] UserId: ${userId}`);
    console.log(`[DEBUG] Token present: ${!!token}`);
    
    console.log("[DEBUG] Making request to:", `${API_ENDPOINT}/${userId}`);
    
    
    const response = await fetch(`${API_ENDPOINT}/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[ERROR] Response status: ${response.status}`);
      console.error(`[ERROR] Response headers:`, response.headers);
      console.error(`[ERROR] Response body:`, errorText);
      throw new Error(`Failed to fetch images: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("[GET] S3 images response:", data);

    if (Array.isArray(data)) {
      return data.map((item: S3ImageItem) => ({
        ...item,
        mainColor: item.mainColor || 1,
        clothingType: item.clothingType || 0,
        status: item.status || "PROCESSED",
        source: item.s3_key ? { uri: `${API_ENDPOINT}/image/${item.s3_key}` } : undefined
      }));
    } else {
      console.warn("Response data is not an array:", data);
      return [];
    }
  } catch (err) {
    console.error("Error fetching from S3:", err);
    Alert.alert("Error", "Failed to load your closet items");
    return [];
  }
};
*/

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


// Component Props interfaces
interface ClosetCardProps {
  item: ClosetDataItem;
  isLiked: boolean;
  onToggleLike: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

// We use React.memo to prevent re-renders unless its props (item, isLiked, onToggleLike) change
const ClosetCard = React.memo(
  ({
    item,
    isLiked,
    onToggleLike,
    onDelete,
  }: {
    item: ClosetDataItem;
    isLiked: boolean;
    onToggleLike: (itemId: string) => void;
    onDelete: (itemId: string) => void; 
  }) => {
    const [randomHeight] = useState(
      Math.floor(Math.random() * 100) + 180
    );

    const handleLongPress = () => {
      onDelete(item.item_id);
    }; 

    // Convert clothingType to category name
    const getCategory = (type: number) => {
      switch(type) {
        case 1: return "Tops";
        case 2: return "Bottoms";
        case 3: return "Outerwear";
        case 4: return "Full Body";
        case 5: return "Footwear";
        default: return "Other";
      }
    };

    return (
      <Pressable onLongPress={handleLongPress}>
      <View style={styles.card}>
        {item.source ? (
          <Image
            source={item.source}
            style={[styles.userImage, { height: randomHeight }]}
          />
        ) : (
          <View style={[styles.userImage, { height: randomHeight, backgroundColor: '#ccc' }]} />
        )}
        <TouchableOpacity
          style={styles.heart}
          onPress={() => onToggleLike(item.item_id)}
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

// API Configuration is defined at the top

export default function ClosetPage() {
  const [likedOutfits, setLikedOutfits] = useState<string[]>([]); // Changed to string for item_id
  const [userImages, setUserImages] = useState<ClosetDataItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // User authentication state
  const [userId, setUserId] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);

  // Convert clothing type number to category name
  const getCategory = (type: number): string => {
    switch(type) {
      case 1: return "Tops";
      case 2: return "Bottoms";
      case 3: return "Outerwear";
      case 4: return "Full Body";
      case 5: return "Footwear";
      default: return "Other";
    }
  };
  

const initialLocalData: ClosetDataItem[] = [
  {
    item_id: "local-11",
    user_id: "local",
    s3_key: "",
    mainColor: 1, // black
    clothingType: 3, // outerwear for hoodie
    status: "PROCESSED",
    source: require("../../assets/images/hoodie.png")
  },
  {
    item_id: "local-12",
    user_id: "local",
    s3_key: "",
    mainColor: 4, // charcoal
    clothingType: 2, // bottoms for pants
    status: "PROCESSED",
    source: require("../../assets/images/pants.png")
  },
  {
    item_id: "local-13",
    user_id: "local",
    s3_key: "",
    mainColor: 1, // black
    clothingType: 5, // footwear
    status: "PROCESSED",
    source: require("../../assets/images/shoes.png")
  }
];
  
  const [localItems, setLocalItems] = useState<ClosetDataItem[]>(initialLocalData);

  // fetchUserImagesFromS3 is defined at the top of the file

  useEffect(() => {
    const init = async () => {
      await loadUserCredentials(); // Always fetch from backend on app start
    };
    init();
  }, []);

  useEffect(() => {
    saveData();
  }, [userImages, likedOutfits, localItems]);

  // Load user credentials
  const loadUserCredentials = async () => {
    const creds = await getCredentials();
    if (creds) {
      // Log raw credentials (truncated) for debugging
      try {
        console.log("[DEBUG] Raw credentials:", {
          uuid: creds.uuid ? (creds.uuid.substring(0, 10) + "...") : "null",
          accessToken: creds.accessToken ? (creds.accessToken.substring(0, 10) + "...") : "null",
        });
      } catch (e) {
        console.log("[DEBUG] Raw credentials logging failed", e);
      }
      // Extract the actual user ID from the JWT token (use accessToken)
      try {
        const token = creds.accessToken;
        const tokenParts = token.split('.');
        let decoded = '';
        try {
          decoded = typeof atob === 'function' ? atob(tokenParts[1]) : Buffer.from(tokenParts[1], 'base64').toString('utf8');
        } catch (e) {
          try { decoded = (globalThis as any).atob(tokenParts[1]); } catch (e2) { decoded = ''; }
        }
        const payload = decoded ? JSON.parse(decoded) : {};
        const actualUserId = payload.sub;
        setUserId(actualUserId);
        setUserToken(token);
        console.log("[DEBUG] Extracted user ID:", actualUserId);
        if (actualUserId) {
          //const fetchedImages = await fetchUserImagesFromS3(actualUserId, token);
          //setUserImages(fetchedImages);
          // Cache the latest fetched images in AsyncStorage
          // await AsyncStorage.setItem("userImages", JSON.stringify(fetchedImages));
        } else {
          console.error("[ERROR] Could not extract user ID from token");
        }
      } catch (error) {
        console.error("[ERROR] Failed to parse user ID from token:", error);
        setUserId(null);
        setUserToken(creds.accessToken);
      }
    } else {
      console.warn("No credentials found. User is not logged in.");
    }
  };


  const loadData = async () => {
    try {
      const storedUserItems = await AsyncStorage.getItem("userImages"); // Use your state name
      const storedLikes = await AsyncStorage.getItem("likedOutfits");
      const storedLocalItems = await AsyncStorage.getItem("localItems");

      if (storedUserItems) {
        setUserImages(JSON.parse(storedUserItems));
      }
      if (storedLikes) {
        setLikedOutfits(JSON.parse(storedLikes));
      }
      if (storedLocalItems) {
        // If we have saved local items (with deletions), load them
        setLocalItems(JSON.parse(storedLocalItems));
      } else {
        // Otherwise, this is the first load, so use the initial hardcoded data
        setLocalItems(initialLocalData);
      }

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

  // Updated to use string IDs
  const toggleLike = useCallback((itemId: string) => {
    setLikedOutfits((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }, []);  // Upload image to S3 via API
  const uploadImage = async (base64Image: string, mimeType: string) => {
    setModalVisible(false);
    setIsLoading(true);

    console.log("userId:", userId, "userToken:", userToken);
    if (!userId || !userToken) {
      Alert.alert("Error", "You are not logged in. Please restart the app.");
      setIsLoading(false);
      return;
    }

    const body = {
      user_id: userId,
      image: base64Image,
      filetype: mimeType || "image/jpeg",
    };

    try {
      console.log("[DEBUG] Making upload request to:", API_ENDPOINT);
      console.log("[DEBUG] Request headers (truncated):", {
        "Content-Type": "application/json",
        "Authorization": userToken ? userToken.substring(0, 10) + "..." : "null"
      });
      console.log("[DEBUG] Request body size:", base64Image ? base64Image.length : 0, "characters");

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": userToken,
        },
        body: JSON.stringify(body),
      });

      console.log("[DEBUG] Response status:", response.status);
      try {
        const headersObj: Record<string, string> = {};
        response.headers && response.headers.forEach && response.headers.forEach((v: string, k: string) => { headersObj[k] = v; });
        console.log("[DEBUG] Response headers:", headersObj);
      } catch (e) {
        console.log("[DEBUG] Could not read response headers", e);
      }

      const responseText = await response.text();
      console.log("[DEBUG] Response body:", responseText);
      let responseData = null;
      try { responseData = responseText ? JSON.parse(responseText) : null; } catch (e) { responseData = null; }

      if (!response.ok) {
        throw new Error(
          responseData.message ||
            "Upload failed with status: " + response.status
        );
      }

      Alert.alert("Success!", "Your item has been added.");

      // Also add to local state for immediate display
      const newItem: ClosetDataItem = {
        item_id: Date.now().toString(),
        user_id: userId,
        s3_key: `${Date.now()}.jpg`,
        mainColor: 1, // default to black
        clothingType: 0, // default to other
        status: "UPLOADING",
        source: { uri: `data:${mimeType};base64,${base64Image}` }
      };
      setUserImages([...userImages, newItem]);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        "Upload Failed",
        error instanceof Error ? error.message : "Could not upload image."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- Fetch user images from S3 ---
interface S3ImageItem {
  item_id: string;
  user_id: string;
  s3_key: string;
  mainColor: number;
  accentColor?: number;
  clothingType: number;
  status: string;
}


  async function pickImage() {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.base64 && asset.mimeType) {
        await uploadImage(asset.base64, asset.mimeType);
      }
    }
  }

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
        await uploadImage(asset.base64, asset.mimeType);
      }
    }
  }

  function imageSelecter() {
    setModalVisible(true);
  }

  async function onTakePhoto() {
    await takePhoto();
  }

  async function onPickImage() {
    await pickImage();
  }

  // Updated to use string IDs
  const handleDelete = useCallback((itemId: string) => {
    setItemToDelete(itemId);
    setDeleteModalVisible(true);
  }, []);

  // This function runs when the user presses "Delete"
  const confirmDelete = () => {
    if (itemToDelete === null) return;

    // Remove from user images
    setUserImages((prev) => prev.filter((item) => item.item_id !== itemToDelete));
    // Remove from local items
    setLocalItems((prev) => prev.filter((item) => item.item_id !== itemToDelete));

    // Also remove from liked outfits
    setLikedOutfits((prev) => prev.filter((likedId) => likedId !== itemToDelete));

    // Close and reset the modal
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  // This function just closes the modal
  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };


  // --- Combined data
// Combine local outfit images and user uploads into one flat array
const allData: ClosetDataItem[] = useMemo(
    () => [...localItems, ...userImages],
    [localItems, userImages] // Only re-combine when userImages changes
  );

  const filteredData = useMemo(() => {
    if (activeCategory === "All") {
      return allData;
    }
    
    if (activeCategory === "Favorites") {
      return allData.filter((item) => likedOutfits.includes(item.item_id));
    }

    // Convert category name to clothing type number
    const typeMap: Record<string, number> = {
      "Tops": 1,
      "Pants": 2,
      "Jackets": 3,
      "Dresses": 4,
      "Shoes": 5
    };

    const typeNumber = typeMap[activeCategory] || 0;
    return allData.filter((item) => item.clothingType === typeNumber);
  }, [allData, activeCategory, likedOutfits]);

  const renderMasonryItem = useCallback(
    ({ item }: { item: unknown }) => {
      const typedItem = item as ClosetDataItem;
      const isLiked = likedOutfits.includes(typedItem.item_id);

      return (
        <ClosetCard
          item={typedItem}
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
       <Link href="/SettingsPage" style = {styles.userIcon}>
            <Entypo name="user" size={28} color="white"  />
          </Link>
<View style={styles.subtitleRow}>
  
  <Ionicons
    name={CATEGORY_ICONS[activeCategory] || "grid-outline"}
    size={40}
    marginTop = {45}
    color="#714054"
    style={{ marginRight: 10, marginTop:40, marginLeft:20 }}
  />
  <Text style={styles.subtitle}>
    {activeCategory === "All" ? "Wardrobe" : activeCategory}
  </Text>
  
</View>



      <View style={{ height: 50, marginBottom: 10 }}>
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
  keyExtractor={(item: unknown) => {
    const typedItem = item as ClosetDataItem;
    return typedItem.item_id;
  }}
  numColumns={2}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingHorizontal: 5, paddingBottom: 100 }}
  renderItem={renderMasonryItem}
/>


      

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={imageSelecter}>
        <Ionicons name="add" size={30} color="#714054" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalContainer}
          onPress={() => setModalVisible(false)}
        >
          <Pressable style={styles.modalView} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add to Closet</Text>

            <TouchableOpacity style={styles.modalButton} onPress={onTakePhoto}>
              <Ionicons name="camera" size={22} color="#714054" />
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalButton} onPress={onPickImage}>
              <Ionicons name="image" size={22} color="#714054" />
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


      {/* Loading Modal */}
      <Modal
        transparent={true}
        animationType="none"
        visible={isLoading}
        onRequestClose={() => {}}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#714054" />
          <Text style={styles.loadingText}>Uploading...</Text>
        </View>
      </Modal>

      {/* Delete Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={deleteModalVisible}
        onRequestClose={cancelDelete}
      >
        <Pressable
          style={styles.deleteModalOverlay}
          onPress={cancelDelete}
        >
          <Pressable style={styles.deleteModalView} onPress={() => {}}>
            <Text style={styles.deleteModalTitle}>Delete Item?</Text>
            <Text style={styles.deleteModalText}>
              Are you sure you want to permanently delete this item? This action
              cannot be undone.
            </Text>

            <View style={styles.deleteModalButtonRow}>
              <TouchableOpacity
                style={[styles.deleteButton, styles.deleteButtonCancel]}
                onPress={cancelDelete}
              >
                <Text
                  style={[
                    styles.deleteButtonText,
                    styles.deleteButtonTextCancel,
                  ]}
                >
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
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#E5D7D7" },
  header: {
    backgroundColor: "#714054",
    height: 60,
    paddingHorizontal: 20,
    paddingTop: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title0: {
    color: "#fafafa",
    fontSize: 22,
    fontFamily: "serif",
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 25,
    alignContent: "center", 
    marginTop: 42, 
    color: "#2E2E2E",
    fontWeight: "bold",
    margin: 5,
  },
card: {
  backgroundColor: "#714054",
  borderRadius: 16,
  margin: 5,
  overflow: "hidden",
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
subtitleRow: {
  flexDirection: "row",
  alignItems: "center",
  marginLeft: 5,
  marginBottom: 5,
},

  outfitRow: {
    alignItems: "center",
    padding: 8,
  },
  itemImage: {
    width: 100,
    height: 100,
    justifyContent:"center", 
    resizeMode: "cover",
  },
 userImage: {
  width: "100%",
  resizeMode: "contain",
  justifyContent: "center", 
  borderRadius: 12,
  padding: 13, 
  paddingHorizontal: 10, 
},
  heart: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 10,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E2E2E",
    marginBottom: 20,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    justifyContent: "center",
    width: "100%",
  },
  modalButtonText: {
    color: "#2E2E2E",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  cancelButton: {
    backgroundColor: "#E5D7D7",
    borderRadius: 10,
    marginTop: 10,
    width: "60%",
  },
  cancelButtonText: {
    color: "#2E2E2E",
  },
  categoryContainer: {
    paddingHorizontal: 15,
    alignItems: "center",
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    backgroundColor: "#714054",
    borderRadius: 20,
  },
  categoryButtonActive: {
    backgroundColor: "#DE8672",
    
  },
  categoryText: {
    color: "#FAFAFA",
    fontWeight: "600",
  },
  categoryTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  deleteModalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  deleteModalView: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  deleteModalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  deleteModalText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
  },
  deleteModalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  deleteButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    marginHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonCancel: {
    backgroundColor: "#E5D7D7",
  },
  deleteButtonConfirm: {
    backgroundColor: "#D90429", // Destructive red
  },
  deleteButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButtonTextCancel: {
    color: "#3C2332",
  },
  userIcon: {
  position: "absolute",
  top: 40, // adjust as needed
  right: 20, // distance from right edge
  backgroundColor: "#714054", // optional for contrast
  borderRadius: 50,
  padding: 6,
  zIndex: 10, // make sure it stays on top of everything
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
