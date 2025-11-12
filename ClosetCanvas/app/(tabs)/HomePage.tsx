import React, {
    useState,
    useRef,
    useCallback,
    useEffect,
} from "react";
import {
    View,
    Text,
    ImageBackground,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    Animated,
    Modal,
    Pressable,
    ImageStyle,
    SafeAreaView,
} from "react-native";
import {
    Ionicons,
    Entypo
} from "@expo/vector-icons";
import {
    Link
} from "expo-router";
import {
    PanGestureHandler,
    State,
    LongPressGestureHandler,
    ScrollView
} from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
const {
    width,
    height
} = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.3;
type ClosetDataItem = {
    id: number;
    source: any;
    type: "local" | "user";
    category: string;
    description: string;
    goodFor: string[];
    event: string[];
};
const outfitsData: ClosetDataItem[][] = [
    // Outfit 1
    [{
        id: 101,
        source: require("../../assets/images/WhiteShirt.png"),
        type: "user",
        category: "Tops",
        description: "A classic, crisp white cotton shirt. Versatile and timeless.",
        goodFor: ["Sunny", "Warm", "Layering"],
        event: ["Casual", "Brunch", "Work"],
    }, {
        id: 102,
        source: require("../../assets/images/BlueJeans.png"),
        type: "user",
        category: "Pants",
        description: "Comfortable slim-fit blue jeans.",
        goodFor: ["Any Weather"],
        event: ["Casual", "Everyday"],
    }, {
        id: 103,
        source: require("../../assets/images/WhiteShoes.png"),
        type: "user",
        category: "Shoes",
        description: "Clean white leather sneakers.",
        goodFor: ["Walking"],
        event: ["Casual"],
    }, ],
    // Outfit 2
    [{
        id: 201,
        source: require("../../assets/images/dress.png"),
        type: "user",
        category: "Dresses",
        description: "A light, floral sundress perfect for warm days.",
        goodFor: ["Sunny", "Warm"],
        event: ["Brunch", "Day Out", "Party"],
    }, ],
    // Outfit 3
    [{
        id: 301,
        source: require("../../assets/images/plaid.png"),
        type: "user",
        category: "Tops",
        description: "A cozy red and black plaid flannel shirt.",
        goodFor: ["Cool", "Cloudy", "Layering"],
        event: ["Casual", "Bonfire", "Study"],
    }, {
        id: 302,
        source: require("../../assets/images/BlueJeans.png"),
        type: "user",
        category: "Pants",
        description: "Comfortable slim-fit blue jeans.",
        goodFor: ["Any Weather"],
        event: ["Casual", "Everyday"],
    }, {
        id: 303,
        source: require("../../assets/images/sneakers.png"),
        type: "user",
        category: "Shoes",
        description: "High-top canvas sneakers.",
        goodFor: ["Walking", "Skating"],
        event: ["Casual"],
    }, ],
];
const shuffleArray = (array: any[]) => {
    let shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
export default function HomePage() {
    const [outfitStack, setOutfitStack] = useState(outfitsData);
    const [likeModalVisible, setLikeModalVisible] = useState(false);
    const [swipedItem, setSwipedItem] = useState < ClosetDataItem[] | null > (null);
    const [isFlipped, setIsFlipped] = useState(false);
    const pan = useRef(new Animated.ValueXY()).current;
    const flipAnim = useRef(new Animated.Value(0)).current;
    const panRef = useRef < PanGestureHandler > (null);
    const longPressRef = useRef < LongPressGestureHandler > (null);
    const innerScrollRef = useRef < ScrollView > (null);
    const rotate = pan.x.interpolate({
        inputRange: [-width / 2, 0, width / 2],
        outputRange: ["-10deg", "0deg", "10deg"],
        extrapolate: "clamp",
    });
    const cardOpacity = pan.x.interpolate({
        inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
        outputRange: [0.5, 1, 0.5],
    });
    const frontRotateY = flipAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0deg", "180deg"],
    });
    const backRotateY = flipAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ["180deg", "360deg"],
    });
    const generateNewOutfits = () => {
        setOutfitStack(shuffleArray(outfitsData));
    };
    // 2. LOGIC FOR SWIPING
    const onGestureEvent = Animated.event(
        [{
            nativeEvent: {
                translationX: pan.x,
                translationY: pan.y
            }
        }], {
            useNativeDriver: false
        });
    const likeOpacityAndScale = {
        opacity: pan.x.interpolate({
            inputRange: [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
            outputRange: [0, 0.5, 1],
            extrapolate: "clamp",
        }),
        transform: [{
            scale: pan.x.interpolate({
                inputRange: [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
                outputRange: [0.7, 0.85, 1],
                extrapolate: "clamp",
            }),
        }, ],
    };
    const nopeOpacityAndScale = {
        opacity: pan.x.interpolate({
            inputRange: [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
            outputRange: [1, 0.5, 0],
            extrapolate: "clamp",
        }),
        transform: [{
            scale: pan.x.interpolate({
                inputRange: [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
                outputRange: [1, 0.85, 0.7],
                extrapolate: "clamp",
            }),
        }, ],
    };
    const onSwipeStateChange = (event: any) => {
        if (event.nativeEvent.oldState === State.ACTIVE) {
            if (isFlipped) {
                Animated.spring(pan, {
                    toValue: {
                        x: 0,
                        y: 0
                    },
                    friction: 4,
                    useNativeDriver: false,
                }).start();
                return;
            }
            const {
                translationX
            } = event.nativeEvent;
            if (translationX > SWIPE_THRESHOLD) {
                Animated.timing(pan, {
                    toValue: {
                        x: width + 100,
                        y: 0
                    },
                    duration: 200,
                    useNativeDriver: false,
                }).start(() => handleLike());
            } else if (translationX < -SWIPE_THRESHOLD) {
                Animated.timing(pan, {
                    toValue: {
                        x: -width - 100,
                        y: 0
                    },
                    duration: 200,
                    useNativeDriver: false,
                }).start(() => removeTopCard());
            } else {
                Animated.spring(pan, {
                    toValue: {
                        x: 0,
                        y: 0
                    },
                    friction: 4,
                    useNativeDriver: false,
                }).start();
            }
        }
    };
    const onLongPressStateChange = (event: any) => {
        if (event.nativeEvent.state === State.ACTIVE) {
            handleFlip();
        }
    };
    const handleFlip = () => {
        const toValue = isFlipped ? 0 : 1;
        Animated.spring(flipAnim, {
            toValue,
            friction: 8,
            useNativeDriver: true,
        }).start();
        setIsFlipped(!isFlipped);
    };
    // 3. LOGIC FOR MODAL AND SAVING
    const handleLike = () => {
        setSwipedItem(outfitStack[0]);
        setLikeModalVisible(true);
    };
    const removeTopCard = () => {
        setOutfitStack((prev) => prev.slice(1));
        pan.setValue({
            x: 0,
            y: 0
        });
        setIsFlipped(false);
        flipAnim.setValue(0);
    };
    const handleAddToWardrobe = async (isFavorite: boolean) => {
        if (!swipedItem) return;
        try {
            // 1. Get existing data
            const storedUserItems = await AsyncStorage.getItem("userImages");
            const storedLikes = await AsyncStorage.getItem("likedOutfits");
            const userItems: ClosetDataItem[] = storedUserItems ? JSON.parse(storedUserItems) : [];
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
        return outfitStack.map((outfit, index) => {
            const isTopCard = index === 0;
            const isNextCard = index === 1;
            const panHandlers = isTopCard ? {
                onGestureEvent: onGestureEvent,
                onHandlerStateChange: onSwipeStateChange,
            } : {};
            const cardStyle = isTopCard ? {
                    transform: [{
                        translateX: pan.x
                    }, {
                        translateY: pan.y
                    }, {
                        rotate: rotate
                    }, ],
                    opacity: cardOpacity,
                } : isNextCard ? styles.nextCard // Use the static 'nextCard' style
                : styles.hiddenCard;
            if (index > 1) {
                return null;
            }
            return (<PanGestureHandler
              key={outfit[0].id}
              ref={panRef}
              waitFor={[longPressRef, innerScrollRef]} // Waits for long press to fail
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onSwipeStateChange}
              enabled = {!isFlipped}
            >
              <Animated.View 
                style={[
            
                styles.outfitCard,
                cardStyle,
                isTopCard ? styles.topCard : {}, // Add topCard zIndex
            
                ]}
              >
                
<LongPressGestureHandler
                  ref={longPressRef}
                  onHandlerStateChange={onLongPressStateChange}
                  minDurationMs={400} 
                  enabled = {isTopCard}
                >
            <View style={{ flex: 1 }}>
                  {" "}
                  <Animated.View
                    style={[
                      styles.cardSide,
                      styles.cardFront,
                      {
                        transform: [{ rotateY: isTopCard ? frontRotateY : "0deg" }],
                      },
                    ]}
                  >
<CardContent outfit={outfit} />
                  </Animated.View>
                  <Animated.View
                    style={[
                      styles.cardSide,
                      styles.cardBack,
                      {
                        transform: [
                          { rotateY: isTopCard ? backRotateY : "180deg" },
                        ],
                      },
                    ]}
                  >
                      <CardBackContent outfit={outfit} onClose={handleFlip} scrollRef={isTopCard ? innerScrollRef:null} />
                    </Animated.View>
                  </View>
                </LongPressGestureHandler>

                {/* Like / Save Indicator */}
                <Animated.View
                  style={[styles.likeIndicator, likeOpacityAndScale]}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={80}
                    color="green"
                  />
                </Animated.View>

                {/* Nope / Pass Indicator */}
                <Animated.View
                  style={[styles.nopeIndicator, nopeOpacityAndScale]}
                >
                  <Ionicons name="close-circle-outline" size={80} color="red" />
                </Animated.View>
              </Animated.View>
            </PanGestureHandler>);
        }).reverse();
    };
    const CardContent = ({
        outfit
    }: {
        outfit: ClosetDataItem[]
    }) => {
        const top = outfit.find((item) => item.category === "Tops");
        const pants = outfit.find((item) => item.category === "Pants");
        const shoes = outfit.find((item) => item.category === "Shoes");
        const dress = outfit.find((item) => item.category === "Dresses");
        return (<>
        <View style={styles.cardImageContainer}>
          {dress ? (
            <Image source={dress.source} style={styles.imageDress} />
          ) : (
            <>
              {pants && <Image source={pants.source} style={styles.imagePants} />}
              {top && <Image source={top.source} style={styles.imageShirt} />}
              {shoes && <Image source={shoes.source} style={styles.imageShoes} />}
            </>
          )}
        </View>

        {/* --- Hinge-Style Breakdown ---*/}
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
      </>);
    };
    const CardBackContent = ({
        outfit,
        onClose,
        scrollRef,
    }: {
        outfit: ClosetDataItem[];
        onClose: () => void;
        scrollRef: React.Ref < ScrollView > | null;
    }) => (<SafeAreaView style={{ flex: 1 }}>
      <TouchableOpacity style={styles.cardBackCloseButton} onPress={onClose}>
        <Ionicons name="close" size={24} color="#3C2332" />
        <Text style={styles.cardBackCloseText}>Back to outfit</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.cardBackScrollContainer} 
        contentContainerStyle={styles.cardBackScroll}
       
      >
        {outfit.map((item) => (
          <View key={item.id} style={styles.itemDetailContainer}>
            <View style={styles.itemDetailHeader}>
              <Image source={item.source} style={styles.itemDetailImage} />
              <Text style={styles.itemDetailTitle}>{item.category}</Text>
            </View>
            <Text style={styles.itemDetailDescription}>{item.description}</Text>

            <Text style={styles.itemDetailSectionTitle}>Good for...</Text>
            <View style={styles.itemDetailTagRow}>
              {item.goodFor.map((tag) => (
                <View key={tag} style={styles.itemDetailTag}>
                  <Text style={styles.itemDetailTagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.itemDetailSectionTitle}>Perfect for...</Text>
            <View style={styles.itemDetailTagRow}>
              {item.event.map((tag) => (
                <View key={tag} style={styles.itemDetailTag}>
                  <Text style={styles.itemDetailTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>);
    return (<View style={{ flex: 1 }}>
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
            Swipe to decide, or long-press for details
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
                Would you like to see more suggestions?
              </Text>

                <TouchableOpacity
              style={styles.generateButton}
              onPress={generateNewOutfits}
            >
              <Text style={styles.generateButtonText}>
                Generate New Outfits
              </Text>
            </TouchableOpacity>
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
    </View>);
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
        borderRadius: 15,
        width: width * 0.85,
        height: 520,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowRadius: 3,
        position: "absolute",
        overflow: "hidden",
    },
    topCard: {
        position: "absolute",
        width: width * 0.85,
        height: 520,
        zIndex: 1,
    },
    nextCard: {
        backgroundColor: "#714054",
        transform: [{
            scale: 0.95
        }],
        top: 20,
        zIndex: 0,
    },
    noMoreCards: {
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        paddingHorizontal: 20,
    },
    generateButton: {
        backgroundColor: "#714054", // Matches your card theme
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 20,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: {
            width: 0,
            height: 2
        },
    },
    generateButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    cardImageContainer: {
        height: "75%",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#714054",
    },
    imageShirt: {
        width: "70%",
        height: "50%",
        resizeMode: "contain",
        position: 'absolute',
        top: "-2%",
        zIndex: 2,
    },
    imagePants: {
        width: "80%",
        height: "70%",
        resizeMode: "contain",
        marginTop: "20%",
        position: 'absolute',
        top: "15%",
        zIndex: 1,
    },
    imageShoes: {
        position: 'absolute',
        width: '35%',
        height: '55%',
        resizeMode: 'contain',
        bottom: '10%',
        left: '60%',
        zIndex: 3,
        transform: [{
            rotate: '-10deg'
        }],
    },
    imageDress: {
        width: "90%",
        height: "90%",
        resizeMode: "contain",
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
        shadowOffset: {
            width: 0,
            height: 2
        },
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
    hiddenCard: {
        display: "none",
    },
    cardSide: {
        position: "absolute",
        width: "100%",
        height: "100%",
        backfaceVisibility: "hidden", // This makes the flip 3D
    },
    cardFront: {
        // No extra styles needed, it's the default
    },
    cardBack: {
        backgroundColor: "#AB8C96", // Match hinge, or choose new color
    },
    cardBackScrollContainer: {
        flex: 1, // This tells the ScrollView to take up the remaining space
    },
    cardBackCloseButton: {
        flexDirection: "row",
        alignItems: "center",
        padding: 15,
        gap: 5,
    },
    cardBackCloseText: {
        color: "#3C2332",
        fontSize: 16,
        fontWeight: "600",
    },
    cardBackScroll: {
        padding: 15,
        paddingTop: 0,
    },
    itemDetailContainer: {
        marginBottom: 20,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderRadius: 10,
        padding: 12,
    },
    itemDetailHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 8,
    },
    itemDetailImage: {
        width: 60,
        height: 60,
        resizeMode: "contain",
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 8,
    },
    itemDetailTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#3C2332",
    },
    itemDetailDescription: {
        fontSize: 14,
        color: "#3C2332",
        marginBottom: 12,
        fontStyle: "italic",
    },
    itemDetailSectionTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#3C2332",
        marginBottom: 8,
    },
    itemDetailTagRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginBottom: 12,
    },
    itemDetailTag: {
        backgroundColor: "#714054",
        borderRadius: 7,
        paddingVertical: 4,
        paddingHorizontal: 12,
    },
    itemDetailTagText: {
        color: "white",
        fontWeight: "500",
        fontSize: 13,
    },
});