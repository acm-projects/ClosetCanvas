import React, { useState,useEffect,useMemo,useCallback } from "react";
import { View,Text,Modal,StyleSheet,Image, TouchableOpacity,Pressable,Dimensions, ScrollView,Alert,ActivityIndicator} from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { Link, useFocusEffect } from "expo-router";import * as ImagePicker from "expo-image-picker";
import MasonryList from "@react-native-seoul/masonry-list";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCredentials } from "../../util/auth";
import {
  User,
  FolderClosed,
  Heart,
  Shirt,
  Footprints,
  Snowflake,
  Image as ImageIcon, 
  Plus,
  Camera,
  PersonStanding, 
  UserRoundPen,
  VenetianMask,
  LucideIcon,
} from "lucide-react-native";

const CATEGORIES = ["All","Favorites", "Tops", "Pants", "Dresses", "Shoes", "Jackets"];
  type ClosetItem = {
  id: number;
  uri: string;
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  All: FolderClosed,
  Favorites: Heart,
  Tops: Shirt,
  Pants: PersonStanding,
  Dresses: VenetianMask,
  Shoes: Footprints,
  Jackets: Snowflake,
  "User Upload": ImageIcon,
};


type Outfit = {
  id: number;
  items: ClosetItem[];
};
type ClosetDataItem = {
  id: number;
  source: any; // can be require(...) or { uri: string }
  type: "local" | "user";
  category: string
};

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
    onToggleLike: (id: number) => void;
    onDelete: (id:number) => void; 
  }) => {
    const [randomHeight] = useState(
      Math.floor(Math.random() * 100) + 180
    );

    const handleLongPress = ()=> {
        onDelete(item.id); 
      }; 
    

    return (
      <Pressable onLongPress={handleLongPress}>
      <View style={styles.card}>
        <Image
          source={item.source}
          // We now use the stable height from our state
          style={[styles.userImage, { height: randomHeight }]}
        />
        <TouchableOpacity
          style={styles.heart}
          onPress={() => onToggleLike(item.id)}
        >
        <Heart
            size={30}
            color={isLiked ? "#DE8672" : "#333"}
            fill={isLiked ? "#DE8672" : "none"} // Add fill for a solid heart
          />
        </TouchableOpacity>
      </View>
      </Pressable>
    );
  }
);

// API Configuration
const API_ENDPOINT = "https://1ag2u91ezb.execute-api.us-east-2.amazonaws.com/production/s3";

export default function ClosetPage() {
  const [likedOutfits, setLikedOutfits] = useState<number[]>([]);
  const [userImages, setUserImages] = useState<ClosetDataItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // User authentication state
  const [userId, setUserId] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string | null>(null);

const initialLocalData: ClosetDataItem[] = [
    { id: 11, source: require("../../assets/images/hoodie.png"), type: "local", category: "Tops" },
    { id: 12, source: require("../../assets/images/pants.png"), type: "local", category: "Pants" },
    { id: 13, source: require("../../assets/images/shoes.png"), type: "local", category: "Shoes" },
    { id: 21, source: require("../../assets/images/dress.png"), type: "local", category: "Dresses" },
    { id: 31, source: require("../../assets/images/tshirt.png"), type: "local", category: "Tops" },
    { id: 32, source: require("../../assets/images/shorts.png"), type: "local", category: "Pants" },
    { id: 33, source: require("../../assets/images/sneakers.png"), type: "local", category: "Shoes" },
    // Add any other local items here, e.g.:
    // { id: 41, source: require("../../assets/images/hat.png"), type: "local", category: "Acessories" },
  ];
  
  const [localItems, setLocalItems] = useState<ClosetDataItem[]>(initialLocalData);

useFocusEffect(
  useCallback(() => {
    loadData();
    loadUserCredentials();
  }, [])
);

  useEffect (() => {
    saveData();
  }, [userImages,likedOutfits,localItems]);

  // Load user credentials
  const loadUserCredentials = async () => {
    const creds = await getCredentials();
    if (creds) {
      setUserId(creds.accessToken); // This is actually the UUID
      setUserToken(creds.uuid); // This is actually the Access Token
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

const toggleLike = useCallback((outfitId: number) => {
    setLikedOutfits((prev) =>
      prev.includes(outfitId)
       ? prev.filter((id) => id !== outfitId)
         : [...prev, outfitId]
         );
        }, []); // <-- Add empty dependency array

  // Upload image to S3 via API
  const uploadImage = async (base64Image: string, mimeType: string) => {
    setModalVisible(false);
    setIsLoading(true);

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

      // Also add to local state for immediate display
      const newItem: ClosetDataItem = {
        id: Date.now(),
        source: { uri: `data:${mimeType};base64,${base64Image}` },
        type: "user",
        category: "User Upload",
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

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert("Permission to access media library is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      if (asset.base64 && asset.mimeType) {
        await uploadImage(asset.base64, asset.mimeType);
      }
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert("Permission to access camera is required!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 4],
      quality: 0.8,
      base64: true,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      if (asset.base64 && asset.mimeType) {
        await uploadImage(asset.base64, asset.mimeType);
      }
    }
  }

  function imageSelecter() {
    setModalVisible(true);
  }

  function onTakePhoto() {
    takePhoto();
    setModalVisible(false);
  }

  function onPickImage() {
    pickImage();
    setModalVisible(false);
  }


  // This function just opens the modal
  const handleDelete = useCallback((id: number) => {
    setItemToDelete(id);
    setDeleteModalVisible(true);
  }, []);

  // This function runs when the user presses "Delete"
  const confirmDelete = () => {
    if (itemToDelete === null) return;

   
    // Remove from user images
    setUserImages((prev) => prev.filter((item) => item.id !== itemToDelete));
    // Remove from local items
    setLocalItems((prev) => prev.filter((item) => item.id !== itemToDelete));
    // -----------------------

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
    
    // --- ADD THIS "if" BLOCK ---
     if (activeCategory === "Favorites") {
      // Return items whose ID is in the likedOutfits array
     return allData.filter((item) => likedOutfits.includes(item.id));
     }
    // -------------------------

     // This handles "Tops", "Pants", etc.
    
     return allData.filter((item) => item.category === activeCategory);

  // --- AND ADD 'likedOutfits' TO THE DEPENDENCY ARRAY ---
   }, [allData, activeCategory, likedOutfits]);

  const renderMasonryItem = useCallback(
    ({ item }: { item: unknown }) => {
      const typedItem = item as ClosetDataItem;
      const isLiked = likedOutfits.includes(typedItem.id);

      // Render your new, stable component
      return (
        <ClosetCard
          item={typedItem}
          isLiked={isLiked}
          onToggleLike={toggleLike}
          onDelete={handleDelete}
        />
      );
    },
    [likedOutfits, toggleLike, handleDelete] // Re-creates the function if likes change
  );


const ActiveCategoryIcon = CATEGORY_ICONS[activeCategory] || FolderClosed;

  return (
    <View style={styles.container}>
<View style={styles.subtitleRow}>
  
<ActiveCategoryIcon
    size={40}
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
    return typedItem.id.toString();
  }}
  numColumns={2}
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingHorizontal: 5, paddingBottom: 100 }}
  
  renderItem={renderMasonryItem}
/>


      

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={imageSelecter}>
        <Plus size={30} color="#714054" />
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
              <Camera size={22} color="#714054" />
              <Text style={styles.modalButtonText}>Take Photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalButton} onPress={onPickImage}>
              <ImageIcon size={22} color="#714054" />
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
  zIndex: 10,
  backgroundColor: "#714054", // optional for contrast
  borderRadius: 22,
  width:44,
  height:44,
  justifyContent: "center",
  alignItems: "center",
  alignContent:"center",
  // make sure it stays on top of everything
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
