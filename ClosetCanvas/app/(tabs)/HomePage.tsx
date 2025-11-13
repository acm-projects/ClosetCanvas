import React, { useState, useRef, useCallback, useEffect } from "react";

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
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PanGestureHandler, State } from "react-native-gesture-handler";
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
  source: any; // { uri } or require(...)
  type: "local" | "user";
  category: string;
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

// =========================================================
//                     COMPONENT
// =========================================================
export default function HomePage() {
  const [outfitStack, setOutfitStack] = useState<ClosetDataItem[][]>([]);
  const [likeModalVisible, setLikeModalVisible] = useState(false);
  const [swipedItem, setSwipedItem] = useState<ClosetDataItem[] | null>(null);

   const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [weather, setWeather] = useState<{ temp: number; condition: string; wind: number } | null>(null);

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

        // Fetch weather using lat/lon
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
    function getWeatherSummary(temp: number, description: string, wind: number) {
    if (temp >= 20 && temp <= 27 && !description.includes("rain")) {
      return "Perfect Day 🌞";
    } else if (temp < 10) {
      return "Cold Day 🧣";
    } else if (temp > 30) {
      return "Hot Day 🥵";
    } else if (description.includes("rain")) {
      return "Rainy Day ☔";
    } else if (wind > 15) {
            return "Windy";
    } else {
      return "Normal Day 🌤️";
    }
  }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to get location or weather");
      }
    }

    getCurrentLocationAndWeather();
  }, []);

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // animation
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

  // --------------------------------
  //           DATA LOAD
  // --------------------------------
useEffect(() => {
  (async () => {
    const creds = await getCredentials();
    
    if (!creds?.accessToken) {
      console.warn("[Home] No access token found.");
      Alert.alert("Not logged in", "Please log in again.");
      return;
    }
    
    // Decode the JWT to get the actual user ID from the 'sub' claim
    try {
      const tokenParts = creds.accessToken.split('.');
      const payload = JSON.parse(atob(tokenParts[1]));
      const actualUserId = payload.sub; // This is the real user UUID
      
      console.log("[Home] Decoded user ID from token:", actualUserId);
      setUserId(actualUserId);
    } catch (e) {
      console.error("[Home] Failed to decode token:", e);
      Alert.alert("Error", "Failed to extract user information");
    }
  })();
}, []);

  // single reusable loader (used on first load and after createOutfits)
  const loadOutfitStackForUser = useCallback(
  async (uid: string) => {
    //console.log("[Home] Loading outfits for UUID:", uid);
    setLoading(true);
    try {
      // 1) fetch items (for URIs)
      const itemsUrl = `${ITEMS_URL}?user_id=${encodeURIComponent(uid)}&signed=1&expiresIn=3600`;
      //console.log("[Home] GET Items URL:", itemsUrl);
      const itemsRes = await fetch(itemsUrl);
      const itemsRaw = await itemsRes.text();
      //console.log("[Home] Items status:", itemsRes.status);
      //console.log("[Home] Items raw (first 500 chars):", itemsRaw.substring(0, 500));
      
      const itemsJson: GetClosetItemsResp = JSON.parse(itemsRaw || "{}");
      const itemsList = itemsJson?.items || [];
      console.log("[Home] Total items fetched:", itemsList.length);

      const itemsById = new Map<
        string,
        { uri: string | null | undefined; clothingType?: number | null }
      >();
      for (const it of itemsList) {
        const key = (it.id || it.item_id || "").toString();
        if (key) {
          itemsById.set(key, { uri: it.uri, clothingType: it.clothingType });
          //console.log("[Home] Added item to map:", key, "clothingType:", it.clothingType);
        }
      }
      //console.log("[Home] itemsById size:", itemsById.size);

      // 2) fetch outfits
      const outfitsUrl = `${OUTFITS_URL}?user_id=${encodeURIComponent(uid)}`;
      //console.log("[Home] GET Outfits URL:", outfitsUrl);
      const outfitsRes = await fetch(outfitsUrl);
      const outfitsRaw = await outfitsRes.text();
      //console.log("[Home] Outfits status:", outfitsRes.status);
      //console.log("[Home] Outfits RAW response:", outfitsRaw); // ✅ KEY LOG
      
      const outfitsJson: GetOutfitsResp = JSON.parse(outfitsRaw || "{}");
      //console.log("[Home] Outfits JSON parsed:", JSON.stringify(outfitsJson, null, 2)); // ✅ KEY LOG
      
      const outfits = outfitsJson?.outfits || [];

      //console.log("First outfit:", JSON.stringify(outfits[0], null, 2));
      //console.log("[Home] Outfits returned from backend:", outfits.length);

      // 3) build stack
      const built: ClosetDataItem[][] = outfits.map((o, idx) => {
        console.log(`[Home] Processing outfit ${idx}:`, o.outfit_id, "with", o.items?.length, "items");
        return o.items
          .map((oi) => {
            console.log("[Home] Looking up itemId:", oi.itemId);
            const meta = itemsById.get(oi.itemId);
            console.log("[Home] Found meta:", meta ? `URI exists: ${!!meta.uri}` : "NOT FOUND");
            const uri = meta?.uri || null;
            if (!uri) {
              console.warn("[Home] ⚠️ No URI for item:", oi.itemId);
              return null;
            }
            return {
              id: uuidToInt(oi.itemId),
              source: { uri },
              type: "user",
              category: mapClothingTypeToCategory(oi.clothingType),
            } as ClosetDataItem;
          })
          .filter(Boolean) as ClosetDataItem[]
      });

      const filtered = built.filter((arr) => arr.length > 0);
      console.log("[Home] Built outfits for display:", filtered.length);
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
        // If no outfits exist after loading, create them
        if (outfitStack.length === 0) {
          console.log("[Home] No outfits found, triggering createOutfits...");
          createOutfitsAndReload();
        }
      });
    }
  }, [userId]);

  // --------------------------------
  //     CREATE OUTFITS WHEN EMPTY
  // --------------------------------
  const createOutfitsAndReload = useCallback(async () => {
    if (!userId) return;
    try {
      //console.log("[CreateOutfits] POST", CREATE_OUTFITS_URL);
      const body = {
        userId,               // ⚠️ Uses the user's UserID from state (your working auth)
        style: "y2k",
        numberOfOutfits: 3,
        outfitTypes: [1, 2],
      };
      //console.log("[CreateOutfits] body:", body);

      const res = await fetch(CREATE_OUTFITS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const raw = await res.text();
      //console.log("[CreateOutfits] status:", res.status, "raw:", raw);
      if (!res.ok) {
        console.warn("[CreateOutfits] Failed to create outfits");
      }

      // after creation returns, pull latest stack
      await loadOutfitStackForUser(userId);
    } catch (e) {
      console.error("[CreateOutfits] Error:", e);
      // even if it fails, try to reload so user sees any existing outfits
      if (userId) await loadOutfitStackForUser(userId);
    }
  }, [userId, loadOutfitStackForUser]);

  // --------------------------------
  //         SWIPE BEHAVIOR
  // --------------------------------
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

  // 🔔 Trigger createOutfits when the stack becomes empty
  const removeTopCard = () => {
    setOutfitStack((prev) => {
      const next = prev.slice(1);
      if (next.length === 0) {
        // call your createOutfits endpoint, then reload
        createOutfitsAndReload();
      }
      return next;
    });
    pan.setValue({ x: 0, y: 0 });
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

  // --------------------------------
  //            RENDER
  // --------------------------------
  const CardContent = ({ outfit }: { outfit: ClosetDataItem[] }) => (
    <>
      <View style={styles.cardImageContainer}>
        {outfit.map((item, idx) => {
          let style: ImageStyle = styles.imageShirt;
          if (item.category === "Pants") style = styles.imagePants;
          if (item.category === "Shoes") style = styles.imageShoes;
          if (item.category === "Dresses") style = styles.imageDress;

          return <Image key={item.id + '-' + idx} source={item.source} style={style} />;
        })}
      </View>

      <View style={styles.hingeSection}>
        <Text style={styles.hingeTitle}>This outfit includes:</Text>
        <View style={styles.categoryRow}>
          {outfit.map((item, idx) => (
            <View key={item.id + '-' + idx} style={styles.categoryTag}>
              <Text style={styles.categoryTagText}>{item.category}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );

  const renderCards = () => {
    return outfitStack
      .map((outfit, index) => {
        const cardKey = outfit[0].id + '-' + index;
        if (index === 0) {
          return (
            <PanGestureHandler
              key={cardKey}
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
            >
              <Animated.View
                style={[
                  styles.outfitCard,
                  styles.topCard,
                  {
                    transform: [{ translateX: pan.x }, { translateY: pan.y }, { rotate }],
                    opacity: cardOpacity,
                  },
                ]}
              >
                <CardContent outfit={outfit} />
                <Animated.View style={[styles.likeIndicator, likeOpacityAndScale]}>
                  <Ionicons name="checkmark-circle-outline" size={80} color="green" />
                </Animated.View>
                <Animated.View style={[styles.nopeIndicator, nopeOpacityAndScale]}>
                  <Ionicons name="close-circle-outline" size={80} color="red" />
                </Animated.View>
              </Animated.View>
            </PanGestureHandler>
          );
        }
        if (index === 1) {
          return (
            <Animated.View key={cardKey} style={[styles.outfitCard, styles.nextCard]}>
              <CardContent outfit={outfit} />
            </Animated.View>
          );
        }
        return null;
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

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
          {Math.round(weather.temp)}°F - {getWeatherSummary(weather.temp, weather.condition.toLowerCase(), weather.wind)}
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


     {/* Outfit Description */}
        <View style={styles.textSection}>
          <Text style={styles.outfitTitle}>Today's Suggestion</Text>
          <Text style={styles.outfitSubtitle}>Swipe right to save, left to pass</Text>
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

      <Modal animationType="fade" transparent visible={likeModalVisible} onRequestClose={() => setLikeModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setLikeModalVisible(false)}>
          <Pressable style={styles.modalView} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add to Wardrobe</Text>
            <Text style={styles.modalText}>Save this outfit to your favorites, or just to your base wardrobe?</Text>

            <TouchableOpacity style={[styles.modalButton, styles.modalButtonFavorite]} onPress={() => handleAddToWardrobe(true)}>
              <Ionicons name="heart" size={20} color="white" />
              <Text style={styles.modalButtonText}>Add to Favorites</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalButton, styles.modalButtonWardrobe]} onPress={() => handleAddToWardrobe(false)}>
              <Ionicons name="add" size={20} color="#4B0082" />
              <Text style={[styles.modalButtonText, styles.modalButtonTextWardrobe]}>Add to Wardrobe</Text>
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

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { flex: 1, width, height, position: "absolute", top: 0, left: 0 },
  scrollContent: { flexGrow: 1, justifyContent: "flex-start", alignItems: "center", width: "100%", paddingHorizontal: 0, margin: 0 },

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
  outfitTitle: { fontFamily: "monospace", fontSize: 22, fontWeight: "700", textAlign: "center", color: "#3C2A4D" },
  outfitSubtitle: { fontFamily: "monospace", fontSize: 14, color: "#444", textAlign: "center" },

  cardStackContainer: { width, height: 550, justifyContent: "center", alignItems: "center", marginBottom: 20 },
  outfitCard: {
    backgroundColor: "#714054",
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
  topCard: {},
  nextCard: { transform: [{ scale: 0.95 }], top: 20 },
  noMoreCards: { justifyContent: "center", alignItems: "center", height: "100%" },

  cardImageContainer: { height: "75%", justifyContent: "center", alignItems: "center" },
  imageShirt: { width: 210, height: 230, resizeMode: "contain", marginHorizontal: 4, marginBottom: -25, zIndex: 2 },
  imagePants: { width: 180, height: 234, resizeMode: "contain", marginHorizontal: 4,marginTop: -35, zIndex: 1 },
  imageShoes: { width: 70, height: 50, resizeMode: "contain", marginHorizontal: 4, zIndex: 1, alignSelf: "flex-end" },
  imageDress: { width: 110, height: 160, resizeMode: "contain", marginHorizontal: 4, zIndex: 1 },

  hingeSection: { height: "25%", backgroundColor: "#AB8C96", borderTopWidth: 0, borderColor: "#ddd", padding: 15 },
  hingeTitle: { fontSize: 20, fontWeight: "600", color: "#3C2332", marginBottom: 10 },
  categoryRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryTag: { backgroundColor: "#714054", borderRadius: 7, paddingVertical: 5, paddingHorizontal: 20 },
  categoryTagText: { color: "white", fontWeight: "600", fontSize: 15 },

  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.6)" },
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
  modalTitle: { fontSize: 22, fontWeight: "bold", color: "#333", marginBottom: 10 },
  modalText: { fontSize: 16, color: "#555", textAlign: "center", marginBottom: 24 },
  modalButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", width: "100%", borderRadius: 10, paddingVertical: 12, marginBottom: 10 },
  modalButtonFavorite: { backgroundColor: "#ff0026ff" },
  modalButtonWardrobe: { backgroundColor: "#E6E6FA" },
  modalButtonText: { color: "white", fontSize: 16, fontWeight: "bold", marginLeft: 10 },
  modalButtonTextWardrobe: { color: "#4B0082" },
  modalCancelText: { fontSize: 14, color: "#767575", fontWeight: "500" },

  likeIndicator: { position: "absolute", top: "30%", left: 20, zIndex: 10 },
  nopeIndicator: { position: "absolute", top: "30%", right: 20, zIndex: 10 },
});
