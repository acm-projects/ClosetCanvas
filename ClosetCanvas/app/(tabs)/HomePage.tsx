import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Modal,
  Pressable,
  ImageStyle,
} from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { Link } from "expo-router";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width, height } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.3; // How far to swipe to trigger action

// 1. DEFINE YOUR OUTFITS
// Each outfit is an *array* of clothing items.
// This structure is crucial for adding them to the ClosetPage.
const outfitsData: ClosetDataItem[][] = [
  // Outfit 1
  [
    {
      id: 101, // Give items unique IDs
      source: require("../../assets/images/WhiteShirt.png"),
      type: "user", // "user" type means it can be "saved"
      category: "Tops",
    },
    {
      id: 102,
      source: require("../../assets/images/BlueJeans.png"),
      type: "user",
      category: "Pants",
    },
    {
      id: 103,
      source: require("../../assets/images/WhiteShoes.png"),
      type: "user",
      category: "Shoes",
    },
  ],
  // Outfit 2
  [
    {
      id: 201,
      source: require("../../assets/images/dress.png"),
      type: "user",
      category: "Dresses",
    },
  ],
  // Outfit 3
  [
    {
      id: 301,
      source: require("../../assets/images/plaid.png"),
      type: "user",
      category: "Tops",
    },
    {
      id: 302,
      source: require("../../assets/images/BlueJeans.png"),
      type: "user",
      category: "Pants",
    },
    {
      id: 303,
      source: require("../../assets/images/sneakers.png"),
      type: "user",
      category: "Shoes",
    },
  ],
];

// Helper type from your ClosetPage (put it at the top)
type ClosetDataItem = {
  id: number;
  source: any;
  type: "local" | "user";
  category: string;
};

export default function HomePage() {
  const [outfitStack, setOutfitStack] = useState(outfitsData);
  const [likeModalVisible, setLikeModalVisible] = useState(false);
  const [swipedItem, setSwipedItem] = useState<ClosetDataItem[] | null>(null);

  // Animated values for the top card
  const pan = useRef(new Animated.ValueXY()).current;
  const rotate = pan.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });
  const cardOpacity = pan.x.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    outputRange: [0.5, 1, 0.5],
  });

  // 2. LOGIC FOR SWIPING
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: pan.x, translationY: pan.y } }],
    { useNativeDriver: false }
  );
  const likeOpacityAndScale = {
    opacity: pan.x.interpolate({
      inputRange: [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
      outputRange: [0, 0.5, 1],
      extrapolate: "clamp",
    }),
    transform: [
      {
        scale: pan.x.interpolate({
          inputRange: [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
          outputRange: [0.7, 0.85, 1],
          extrapolate: "clamp",
        }),
      },
    ],
  };
  const nopeOpacityAndScale = {
    opacity: pan.x.interpolate({
      inputRange: [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: "clamp",
    }),
    transform: [
      {
        scale: pan.x.interpolate({
          inputRange: [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
          outputRange: [1, 0.85, 0.7],
          extrapolate: "clamp",
        }),
      },
    ],
  };

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      const { translationX } = event.nativeEvent;

      if (translationX > SWIPE_THRESHOLD) {
        // --- SWIPE RIGHT (LIKE) ---
        Animated.timing(pan, {
          toValue: { x: width + 100, y: 0 },
          duration: 200, // Make it disappear quickly (e.g., 200 milliseconds)
          useNativeDriver: false,
        }).start(() => handleLike());
      } else if (translationX < -SWIPE_THRESHOLD) {
        // --- SWIPE LEFT (NOPE) ---
        Animated.timing(pan, {
          toValue: { x: -width - 100, y: 0 },
          duration: 200,
          useNativeDriver: false,
        }).start(() => removeTopCard());
      } else {
        // --- RETURN TO CENTER ---
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 4,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  // 3. LOGIC FOR MODAL AND SAVING
  const handleLike = () => {
    // Store the item and show the modal
    setSwipedItem(outfitStack[0]);
    setLikeModalVisible(true);
  };

  const removeTopCard = () => {
    // Remove the card from state and reset animation
    setOutfitStack((prev) => prev.slice(1));
    pan.setValue({ x: 0, y: 0 });
  };

  const handleAddToWardrobe = async (isFavorite: boolean) => {
    if (!swipedItem) return;

    try {
      // 1. Get existing data
      const storedUserItems = await AsyncStorage.getItem("userImages");
      const storedLikes = await AsyncStorage.getItem("likedOutfits");
      const userItems: ClosetDataItem[] = storedUserItems
        ? JSON.parse(storedUserItems)
        : [];
      const likedItems: number[] = storedLikes ? JSON.parse(storedLikes) : [];

      // 2. Add the new items
      const newItems = [...userItems, ...swipedItem];
      let newLikes = [...likedItems];
      if (isFavorite) {
        const itemIds = swipedItem.map((item) => item.id);
        newLikes = [...newLikes, ...itemIds];
      }

      // 3. Save back to storage
      await AsyncStorage.setItem("userImages", JSON.stringify(newItems));
      await AsyncStorage.setItem("likedOutfits", JSON.stringify(newLikes));

      // 4. Close modal and remove card
      setLikeModalVisible(false);
      removeTopCard();
      setSwipedItem(null);
    } catch (e) {
      console.error("Failed to save liked outfit", e);
    }
  };

  // 4. RENDER THE CARDS
  const renderCards = () => {
    // We reverse so the card at index 0 is on top
    return outfitStack
      .map((outfit, index) => {
        // Check if this is the top card
        if (index === 0) {
          return (
            <PanGestureHandler
              key={outfit[0].id} // Use first item's ID as key
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
            >
              <Animated.View
                style={[
                  styles.outfitCard,
                  styles.topCard,
                  {
                    transform: [
                      { translateX: pan.x },
                      { translateY: pan.y },
                      { rotate: rotate },
                    ],
                    opacity: cardOpacity,
                  },
                ]}
              >
                <CardContent outfit={outfit} />
                {/* Like / Save Indicator (Green Checkmark) */}
                <Animated.View
                  style={[styles.likeIndicator, likeOpacityAndScale]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={80}
                    color="green"
                  />
                </Animated.View>

                {/* Nope / Pass Indicator (Red X) */}
                <Animated.View
                  style={[styles.nopeIndicator, nopeOpacityAndScale]}
                >
                  <Ionicons name="close-circle-outline" size={80} color="red" />
                </Animated.View>
              </Animated.View>
            </PanGestureHandler>
          );
        }

        // --- Render the next card beneath it ---
        if (index === 1) {
          return (
            <Animated.View
              key={outfit[0].id}
              style={[styles.outfitCard, styles.nextCard]}
            >
              <CardContent outfit={outfit} />
            </Animated.View>
          );
        }

        // Other cards aren't visible
        return null;
      })
      .reverse(); // Crucial: reverses the .map() output
  };

  // This is the content inside each card
  const CardContent = ({ outfit }: { outfit: ClosetDataItem[] }) => (
    <>
      <View style={styles.cardImageContainer}>
        {outfit.map((item) => {
          // Dynamically style based on category
          let style: ImageStyle = styles.imageShirt; // Default
          if (item.category === "Pants") style = styles.imagePants;
          if (item.category === "Shoes") style = styles.imageShoes;
          if (item.category === "Dresses") style = styles.imageDress;

          return <Image key={item.id} source={item.source} style={style} />;
        })}
      </View>

      {/* --- Hinge-Style Breakdown --- */}
      <View style={styles.hingeSection}>
        <Text style={styles.hingeTitle}>This outfit includes:</Text>
        <View style={styles.categoryRow}>
          {outfit.map((item) => (
            <View key={item.id} style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{item.category}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* 1. Background (stays absolute, but is now a sibling) */}
      <ImageBackground
        source={require("../../assets/images/Group 32.png")}
        style={styles.background}
        imageStyle={{ resizeMode: "cover" }}
      />

      {/* 2. Scrollable Content (on top of the background) */}
      <ScrollView
        style={styles.container} // Add this style back so the ScrollView fills the screen
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Weather Section */}
        <View style={styles.weatherCard}>
          <Ionicons name="sunny-outline" size={40} color="#F9E3B4" />
          <View>
            <Text style={styles.weatherText}>Sunny</Text>
            <Text style={styles.weatherSub}>72° - Perfect weather</Text>
          </View>
        </View>

        {/* Outfit Description */}
        <View style={styles.textSection}>
          <Text style={styles.outfitTitle}>Today's Suggestion</Text>
          <Text style={styles.outfitSubtitle}>
            Swipe right to save, left to pass
          </Text>
        </View>

        {/* 5. THE SWIPE STACK */}
        <View style={styles.cardStackContainer}>
          {outfitStack.length > 0 ? (
            renderCards()
          ) : (
            <View style={styles.noMoreCards}>
              <Text style={styles.outfitTitle}>All done for today!</Text>
              <Text style={styles.outfitSubtitle}>
                Check back tomorrow for new outfits.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* 6. THE "LIKE" MODAL (Stays as a sibling) */}
      <Modal
        animationType="fade"
        transparent
        visible={likeModalVisible}
        onRequestClose={() => setLikeModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setLikeModalVisible(false)}
        >
          <Pressable style={styles.modalView} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add to Wardrobe</Text>
            <Text style={styles.modalText}>
              Save this outfit to your favorites, or just to your base wardrobe?
            </Text>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonFavorite]}
              onPress={() => handleAddToWardrobe(true)}
            >
              <Ionicons name="heart" size={20} color="white" />
              <Text style={styles.modalButtonText}>Add to Favorites</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonWardrobe]}
              onPress={() => handleAddToWardrobe(false)}
            >
              <Ionicons name="add" size={20} color="#4B0082" />
              <Text
                style={[styles.modalButtonText, styles.modalButtonTextWardrobe]}
              >
                Add to Wardrobe
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setLikeModalVisible(false)}
              style={{ marginTop: 15 }}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// 7. STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  title: {
    color: "#fafafa",
    fontSize: 22,
    fontFamily: "serif",
    fontWeight: "600",
  },
  background: {
    flex: 1,
    width: width,
    height: height,
    position: "absolute",
    top: 0,
    left: 0,
  },

  overlay: {
    flex: 1,
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%", // important
    paddingHorizontal: 0, // remove default ScrollView padding
    margin: 0,
  },

  screenContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  weatherCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    backgroundColor: "#714054",
    width: 330,
    height: 58,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 55,
    paddingHorizontal: 15,
    gap: 10,
  },
  weatherText: {
    fontWeight: "bold",
    color: "#F9E3B4",
    fontSize: 16,
  },
  weatherSub: {
    fontSize: 13,
    color: "#F9E3B4",
  },
  textSection: {
    alignItems: "center",
    marginVertical: 25,
  },
  outfitTitle: {
    fontFamily: "monospace",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#3C2A4D",
  },
  outfitSubtitle: {
    fontFamily: "monospace",
    fontSize: 14,
    color: "#444",
    textAlign: "center",
  },

  // --- CARD STACK STYLES ---
  cardStackContainer: {
    width: width,
    height: 550, // Set a fixed height for the stack
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  outfitCard: {
    backgroundColor: "#714054",
    borderRadius: 15,
    width: width * 0.85, // Card width
    height: 520, // Card height
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    position: "absolute", // This is key for stacking
    overflow: "hidden", // Hides the "hinge" section until card is ready
  },
  topCard: {
    // This card is interactive
  },
  nextCard: {
    // The card underneath
    transform: [{ scale: 0.95 }],
    top: 20,
  },
  noMoreCards: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },

  // --- CARD CONTENT STYLES ---
  cardImageContainer: {
    height: "75%",
    justifyContent: "center", // Keeps items vertically centered overall
    alignItems: "center", // Keeps items horizontally centered overall
    // backgroundColor: 'lightblue', // Optional: Add BG color for debugging layout
  },
  imageShirt: {
    width: "80%", // Use percentage for responsiveness
    height: "50%", // Adjust height proportion
    resizeMode: "contain",
    // position: 'absolute', // You might need absolute positioning for precise layering
    top: "15%", // Adjust top position if using absolute
    zIndex: 2, // Ensure shirt is on top
  },
  imagePants: {
    width: "90%", // Use percentage
    height: "80%", // Adjust height proportion
    resizeMode: "contain",
    marginTop: "-15%", // Adjust negative margin using percentage
    // position: 'absolute',
    top: "5%", // Adjust top position if using absolute
    zIndex: 1, // Pants below shirt
  },
  imageShoes: {
    width: "50%", // Use percentage
    height: "30%", // Adjust height proportion
    resizeMode: "contain",
    marginTop: "-10%", // Adjust negative margin using percentage
    //position: 'absolute',
    top: "-10%", // Adjust top position if using absolute
    zIndex: 1, // Shoes below pants
  },
  imageDress: {
    width: "90%", // Use percentage for responsiveness
    height: "90%", // Allow dress to take more space
    resizeMode: "contain", // Changed to contain to avoid cropping dresses
    // position: 'absolute', // If you need absolute positioning
    // top: '5%',
    zIndex: 1, // Ensure it layers correctly if needed
  },

  // --- HINGE-STYLE STYLES ---
  hingeSection: {
    height: "25%",
    backgroundColor: "#AB8C96",
    borderTopWidth: 0,
    borderColor: "#ddd",
    padding: 15,
  },
  hingeTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3C2332",
    marginBottom: 10,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryTag: {
    backgroundColor: "#714054",
    borderRadius: 7,
    paddingVertical: 5,
    paddingHorizontal: 20,
  },
  categoryTagText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalView: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 24,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 10,
  },
  modalButtonFavorite: {
    backgroundColor: "#ff0026ff",
  },
  modalButtonWardrobe: {
    backgroundColor: "#E6E6FA",
  },
  modalButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  modalButtonTextWardrobe: {
    color: "#4B0082",
  },
  modalCancelText: {
    fontSize: 14,
    color: "#767575",
    fontWeight: "500",
  },
  // --- INDICATOR STYLES ---
  likeIndicator: {
    position: "absolute",
    top: "30%", // Adjust positioning as needed
    left: 20,
    zIndex: 10, // Ensure it's above the card content
  },
  nopeIndicator: {
    position: "absolute",
    top: "30%", // Adjust positioning as needed
    right: 20,
    zIndex: 10, // Ensure it's above the card content
  },
});
