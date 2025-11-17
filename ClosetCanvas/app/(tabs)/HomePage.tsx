import React, { useState, useRef, useCallback, useEffect } from "react";
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
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  PanGestureHandler,
  State,
  LongPressGestureHandler,
  ScrollView,
} from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { getCredentials } from "../../util/auth";

const { width, height } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.3;
const apiKey = Constants.expoConfig?.extra?.OPENWEATHER_API_KEY || "";

// -------- Types ----------
type ClosetDataItem = {
  id: number;
  source: any;
  type: "local" | "user";
  category: string;
  description?: string;
  goodFor?: string[];
  event?: string[];
};

type GetClosetItemsResp = {
  user_id: string | null;
  count: number;
  items: Array<{
    id?: string;
    item_id?: string;
    uri?: string | null;
    clothingType?: number | null;
  }>;
};

type GetOutfitsResp = {
  user_id: string | null;
  count: number;
  outfits: Array<{
    outfit_id: string;
    score?: number | null;
    items: Array<{
      itemId: string;
      clothingType?: number | null;
    }>;
  }>;
};

// -------- API endpoints ----------
const API_BASE = "https://3a42g82o4d.execute-api.us-east-2.amazonaws.com/dev";
const ITEMS_URL = `${API_BASE}/s3v2`;
const OUTFITS_URL = `https://1dzpo66n78.execute-api.us-east-2.amazonaws.com/production/outfits`;
const CREATE_OUTFITS_URL = `https://nx736y3txb.execute-api.us-east-2.amazonaws.com/default/createOutfits`;

// -------- helpers ----------
function getWeatherSummary(temp: number, description: string, wind: number): string {
  if (temp >= 68 && temp <= 80 && !description.includes("rain")) {
    return "Perfect Day";
  } else if (temp < 50) {
    return "Cold Day";
  } else if (temp > 85) {
    return "Hot Day";
  } else if (description.includes("rain")) {
    return "Rainy Day";
  } else if (wind > 15) {
    return "Windy";
  } else {
    return "Normal Day";
  }
}

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

// Mock item details for display (you can enhance this with real data)
const getItemDetails = (category: string) => {
  const details: Record<string, { description: string; goodFor: string[]; event: string[] }> = {
    Tops: {
      description: "A versatile top perfect for various occasions.",
      goodFor: ["Sunny", "Warm", "Layering"],
      event: ["Casual", "Work", "Brunch"],
    },
    Pants: {
      description: "Comfortable and stylish pants.",
      goodFor: ["Any Weather"],
      event: ["Casual", "Everyday"],
    },
    Shoes: {
      description: "Comfortable footwear for daily activities.",
      goodFor: ["Walking"],
      event: ["Casual"],
    },
    Dresses: {
      description: "An elegant dress for special occasions.",
      goodFor: ["Sunny", "Warm"],
      event: ["Party", "Brunch", "Day Out"],
    },
    Jackets: {
      description: "A cozy jacket for cooler weather.",
      goodFor: ["Cool", "Cloudy", "Layering"],
      event: ["Casual", "Outdoor"],
    },
  };
  return details[category] || {
    description: "A great piece for your wardrobe.",
    goodFor: ["Various occasions"],
    event: ["Multiple events"],
  };
};

export default function HomePage() {
  const [outfitStack, setOutfitStack] = useState<ClosetDataItem[][]>([]);
  const [likeModalVisible, setLikeModalVisible] = useState(false);
  const [swipedItem, setSwipedItem] = useState<ClosetDataItem[] | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [weather, setWeather] = useState<{ temp: number; condition: string; wind: number } | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Animation refs
  const pan = useRef(new Animated.ValueXY()).current;
  const flipAnim = useRef(new Animated.Value(0)).current;
  const panRef = useRef<PanGestureHandler>(null);
  const longPressRef = useRef<LongPressGestureHandler>(null);
  const innerScrollRef = useRef<ScrollView>(null);

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

  // Weather fetch
  useEffect(() => {
    async function getCurrentLocationAndWeather() {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setErrorMsg("Permission to access location was denied");
          return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        setLocation(loc);

        const lat = loc.coords.latitude;
        const lon = loc.coords.longitude;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
          console.error("OpenWeather API error:", data);
          setErrorMsg("Failed to load weather data");
          return;
        }

        setWeather({
          temp: data.main.temp,
          condition: data.weather[0].main,
          wind: data.wind.speed,
        });
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to get location or weather");
      }
    }

    getCurrentLocationAndWeather();
  }, []);

  // User ID setup
  useEffect(() => {
    (async () => {
      const creds = await getCredentials();
      
      if (!creds?.accessToken) {
        console.warn("[Home] No access token found.");
        Alert.alert("Not logged in", "Please log in again.");
        return;
      }
      
      try {
        const tokenParts = creds.accessToken.split('.');
        const payload = JSON.parse(atob(tokenParts[1]));
        const actualUserId = payload.sub;
        
        console.log("[Home] Decoded user ID from token:", actualUserId);
        setUserId(actualUserId);
      } catch (e) {
        console.error("[Home] Failed to decode token:", e);
        Alert.alert("Error", "Failed to extract user information");
      }
    })();
  }, []);

  // Load outfits
  const loadOutfitStackForUser = useCallback(
    async (uid: string) => {
      setLoading(true);
      try {
        const itemsUrl = `${ITEMS_URL}?user_id=${encodeURIComponent(uid)}&signed=1&expiresIn=3600`;
        const itemsRes = await fetch(itemsUrl);
        const itemsRaw = await itemsRes.text();
        
        const itemsJson: GetClosetItemsResp = JSON.parse(itemsRaw || "{}");
        const itemsList = itemsJson?.items || [];

        const itemsById = new Map<
          string,
          { uri: string | null | undefined; clothingType?: number | null }
        >();
        for (const it of itemsList) {
          const key = (it.id || it.item_id || "").toString();
          if (key) {
            itemsById.set(key, { uri: it.uri, clothingType: it.clothingType });
          }
        }

        const outfitsUrl = `${OUTFITS_URL}?user_id=${encodeURIComponent(uid)}`;
        const outfitsRes = await fetch(outfitsUrl);
        const outfitsRaw = await outfitsRes.text();
        
        const outfitsJson: GetOutfitsResp = JSON.parse(outfitsRaw || "{}");
        const outfits = outfitsJson?.outfits || [];

        const built: ClosetDataItem[][] = outfits.map((o) => {
          return o.items
            .map((oi) => {
              const meta = itemsById.get(oi.itemId);
              const uri = meta?.uri || null;
              if (!uri) {
                console.warn("[Home] ⚠️ No URI for item:", oi.itemId);
                return null;
              }
              const category = mapClothingTypeToCategory(oi.clothingType);
              const details = getItemDetails(category);
              
              return {
                id: uuidToInt(oi.itemId),
                source: { uri },
                type: "user",
                category,
                ...details,
              } as ClosetDataItem;
            })
            .filter(Boolean) as ClosetDataItem[];
        });

        const filtered = built.filter((arr) => arr.length > 0);
        setOutfitStack(filtered);
        await AsyncStorage.setItem("outfitStack", JSON.stringify(filtered));
      } catch (e) {
        console.error("[Home] Failed to load outfits or items:", e);
        const cached = await AsyncStorage.getItem("outfitStack");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            setOutfitStack(parsed);
          } catch {}
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    if (userId) {
      loadOutfitStackForUser(userId).then(() => {
        if (outfitStack.length === 0) {
          createOutfitsAndReload();
        }
      });
    }
  }, [userId]);

  const createOutfitsAndReload = useCallback(async () => {
    if (!userId) return;
    try {
      const body = {
        userId,
        style: "business",
        numberOfOutfits: 3,
        outfitTypes: [1, 2],
      };

      const res = await fetch(CREATE_OUTFITS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const raw = await res.text();
      if (!res.ok) {
        console.warn("[CreateOutfits] Failed to create outfits");
      }

      await loadOutfitStackForUser(userId);
    } catch (e) {
      console.error("[CreateOutfits] Error:", e);
      if (userId) await loadOutfitStackForUser(userId);
    }
  }, [userId, loadOutfitStackForUser]);

  // Flip handler
  const handleFlip = () => {
    const toValue = isFlipped ? 0 : 1;
    Animated.spring(flipAnim, {
      toValue,
      friction: 8,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const onLongPressStateChange = (event: any) => {
    if (event.nativeEvent.state === State.ACTIVE) {
      handleFlip();
    }
  };

  // Swipe handlers
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

  const onSwipeStateChange = (event: any) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      if (isFlipped) {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 4,
          useNativeDriver: false,
        }).start();
        return;
      }

      const { translationX } = event.nativeEvent;
      if (translationX > SWIPE_THRESHOLD) {
        Animated.timing(pan, {
          toValue: { x: width + 100, y: 0 },
          duration: 200,
          useNativeDriver: false,
        }).start(() => handleLike());
      } else if (translationX < -SWIPE_THRESHOLD) {
        Animated.timing(pan, {
          toValue: { x: -width - 100, y: 0 },
          duration: 200,
          useNativeDriver: false,
        }).start(() => removeTopCard());
      } else {
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          friction: 4,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const handleLike = () => {
    setSwipedItem(outfitStack[0]);
    setLikeModalVisible(true);
  };

  const removeTopCard = () => {
    setOutfitStack((prev) => {
      const next = prev.slice(1);
      if (next.length === 0) {
        createOutfitsAndReload();
      }
      return next;
    });
    pan.setValue({ x: 0, y: 0 });
    setIsFlipped(false);
    flipAnim.setValue(0);
  };

  const handleAddToWardrobe = async (isFavorite: boolean) => {
    if (!swipedItem) return;
    try {
      const storedUserItems = await AsyncStorage.getItem("userImages");
      const storedLikes = await AsyncStorage.getItem("likedOutfits");
      const userItems: ClosetDataItem[] = storedUserItems ? JSON.parse(storedUserItems) : [];
      const likedItems: number[] = storedLikes ? JSON.parse(storedLikes) : [];

      const newItems = [...userItems, ...swipedItem];
      let newLikes = [...likedItems];
      if (isFavorite) {
        newLikes = [...newLikes, ...swipedItem.map((i) => i.id)];
      }

      await AsyncStorage.setItem("userImages", JSON.stringify(newItems));
      await AsyncStorage.setItem("likedOutfits", JSON.stringify(newLikes));

      setLikeModalVisible(false);
      removeTopCard();
      setSwipedItem(null);
    } catch (e) {
      console.error("Failed to save liked outfit", e);
    }
  };

  // Card components
  const CardContent = ({ outfit }: { outfit: ClosetDataItem[] }) => (
    <>
      <View style={styles.cardImageContainer}>
        {outfit.map((item, idx) => {
          let style = styles.imageShirt;
          if (item.category === "Pants") style = styles.imagePants;
          if (item.category === "Shoes") style = styles.imageShoes;
          if (item.category === "Dresses") style = styles.imageDress;

          return <Image key={item.id + "-" + idx} source={item.source} style={style} />;
        })}
      </View>

      <View style={styles.hingeSection}>
        <Text style={styles.hingeTitle}>This outfit includes:</Text>
        <View style={styles.categoryRow}>
          {outfit.map((item, idx) => (
            <View key={item.id + "-" + idx} style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{item.category}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );

  const CardBackContent = ({
    outfit,
    onClose,
    scrollRef,
  }: {
    outfit: ClosetDataItem[];
    onClose: () => void;
    scrollRef: React.Ref<ScrollView> | null;
  }) => (
    <SafeAreaView style={{ flex: 1 }}>
      <TouchableOpacity style={styles.cardBackCloseButton} onPress={onClose}>
        <Ionicons name="close" size={24} color="#3C2332" />
        <Text style={styles.cardBackCloseText}>Back to outfit</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
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
              {item.goodFor?.map((tag) => (
                <View key={tag} style={styles.itemDetailTag}>
                  <Text style={styles.itemDetailTagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.itemDetailSectionTitle}>Perfect for...</Text>
            <View style={styles.itemDetailTagRow}>
              {item.event?.map((tag) => (
                <View key={tag} style={styles.itemDetailTag}>
                  <Text style={styles.itemDetailTagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );

  const renderCards = () => {
  return outfitStack
    .map((outfit, index) => {
      const isTopCard = index === 0;
      const isNextCard = index === 1;

      const cardStyle = isTopCard
        ? {
            transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }],
            opacity: cardOpacity,
          }
        : isNextCard
        ? styles.nextCard
        : styles.hiddenCard;

      if (index > 1) {
        return null;
      }

      return (
        <PanGestureHandler
          key={outfit[0].id}
          onGestureEvent={isTopCard ? onGestureEvent : undefined}
          onHandlerStateChange={isTopCard ? onSwipeStateChange : undefined}
          enabled={isTopCard && !isFlipped}
          simultaneousHandlers={isTopCard ? longPressRef : undefined}
        >
          <Animated.View
            style={[
              styles.outfitCard,
              cardStyle,
              isTopCard ? styles.topCard : {},
            ]}
          >
            <LongPressGestureHandler
              ref={isTopCard ? longPressRef : undefined}
              onHandlerStateChange={isTopCard ? onLongPressStateChange : undefined}
              minDurationMs={400}
              enabled={isTopCard}
              simultaneousHandlers={isTopCard ? innerScrollRef : undefined}
            >
              <View style={{ flex: 1 }}>
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
                      transform: [{ rotateY: isTopCard ? backRotateY : "180deg" }],
                    },
                  ]}
                >
                  <CardBackContent
                    outfit={outfit}
                    onClose={handleFlip}
                    scrollRef={isTopCard ? innerScrollRef : null}
                  />
                </Animated.View>
              </View>
            </LongPressGestureHandler>

            <Animated.View style={[styles.likeIndicator, likeOpacityAndScale]}>
              <Ionicons name="checkmark-circle-outline" size={80} color="green" />
            </Animated.View>

            <Animated.View style={[styles.nopeIndicator, nopeOpacityAndScale]}>
              <Ionicons name="close-circle-outline" size={80} color="red" />
            </Animated.View>
          </Animated.View>
        </PanGestureHandler>
      );
    })
    .reverse();
};

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require("../../assets/images/Group 32.png")}
        style={styles.background}
        imageStyle={{ resizeMode: "cover" }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.weatherCard}>
          <Ionicons name="cloud-outline" size={40} color="#F9E3B4" />
          <View>
            {errorMsg ? (
              <>
                <Text style={styles.weatherText}>Error</Text>
                <Text style={styles.weatherSub}>{errorMsg}</Text>
              </>
            ) : weather ? (
              <>
                <Text style={styles.weatherText}>{weather.condition}</Text>
                <Text style={styles.weatherSub}>
                  {Math.round(weather.temp)}°F -{" "}
                  {getWeatherSummary(weather.temp, weather.condition.toLowerCase(), weather.wind)}
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.weatherText}>Loading...</Text>
                <Text style={styles.weatherSub}>Fetching weather</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.textSection}>
          <Text style={styles.outfitTitle}>Today's Suggestion</Text>
          <Text style={styles.outfitSubtitle}>
            Swipe to decide, or long-press for details
          </Text>
        </View>

        <View style={styles.cardStackContainer}>
          {loading ? (
            <Text style={styles.outfitSubtitle}>Loading outfits…</Text>
          ) : outfitStack.length > 0 ? (
            renderCards()
          ) : (
            <View style={styles.noMoreCards}>
              <Text style={styles.outfitTitle}>No outfits available</Text>
              <Text style={styles.outfitSubtitle}>Upload items to generate outfits.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent
        visible={likeModalVisible}
        onRequestClose={() => setLikeModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLikeModalVisible(false)}>
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
              <Text style={[styles.modalButtonText, styles.modalButtonTextWardrobe]}>
                Add to Wardrobe
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setLikeModalVisible(false)} style={{ marginTop: 15 }}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, width, height, position: "absolute", top: 0, left: 0 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 0,
    margin: 0,
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
  weatherText: { fontWeight: "bold", color: "#F9E3B4", fontSize: 16 },
  weatherSub: { fontSize: 13, color: "#F9E3B4" },
  textSection: { alignItems: "center", marginVertical: 25 },
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

  cardStackContainer: {
    width,
    height: 550,
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
    shadowOffset: { width: 0, height: 2 },
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
    transform: [{ scale: 0.95 }],
    top: 20,
    zIndex: 0,
  },
  hiddenCard: {
    display: "none",
  },
  noMoreCards: {
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    paddingHorizontal: 20,
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
    position: "absolute",
    top: "-2%",
    zIndex: 2,
  },
  imagePants: {
    width: "80%",
    height: "70%",
    resizeMode: "contain",
    marginTop: "20%",
    position: "absolute",
    top: "15%",
    zIndex: 1,
  },
  imageShoes: {
    position: "absolute",
    width: "35%",
    height: "55%",
    resizeMode: "contain",
    bottom: "10%",
    left: "60%",
    zIndex: 3,
    transform: [{ rotate: "-10deg" }],
  },
  imageDress: {
    width: "90%",
    height: "90%",
    resizeMode: "contain",
  },

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

  likeIndicator: {
    position: "absolute",
    top: "30%",
    left: 20,
    zIndex: 10,
  },
  nopeIndicator: {
    position: "absolute",
    top: "30%",
    right: 20,
    zIndex: 10,
  },

  cardSide: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
  },
  cardFront: {},
  cardBack: {
    backgroundColor: "#AB8C96",
  },
  cardBackScrollContainer: {
    flex: 1,
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