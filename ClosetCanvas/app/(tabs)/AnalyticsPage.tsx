import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router"; 
import { PieChart } from "react-native-gifted-charts/dist/PieChart";

const { width, height } = Dimensions.get("window");
const LOCAL_ASSET_MAP: { [key: string]: any } = {
  "WhiteShirt.png": require("../../assets/images/WhiteShirt.png"),
  "BlueJeans.png": require("../../assets/images/BlueJeans.png"),
  "WhiteShoes.png": require("../../assets/images/WhiteShoes.png"),
  "dress.png": require("../../assets/images/dress.png"),
  "plaid.png": require("../../assets/images/plaid.png"),
  "sneakers.png": require("../../assets/images/sneakers.png"),
};
  const getISODateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
const getCurrentWeekDateStrings = (): string[] => {
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay())); 

  const weekDates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + i);
    weekDates.push(getISODateString(date));
  }
  return weekDates;
};

type ClosetDataItem = {
  id: number;
  source: any;
  type: "local" | "user";
  category: string;
  name: string; 
};

type EventItem = {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  outfit?: ClosetDataItem[];
};

type EventsByDate = { [date: string]: EventItem[] };
type OutfitByDate = { [date: string]: ClosetDataItem[] };

type PieChartData = {
value: number;
  text: string;
  color: string;
  percentage?: number;
};

type RecapOutfit = ClosetDataItem[];

export default function AnalyticsPage() {
  const screenWidth = Dimensions.get("window").width;
  const carouselRef = useRef<any>(null);
  const [, setCurrentIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [pieData, setPieData] = useState<PieChartData[]>([]);
  const [mostWorn, setMostWorn] = useState<{ name: string; count: number } | null>(
    null
  );
  const [recapOutfits, setRecapOutfits] = useState<RecapOutfit[]>([]);
  const [animationKey, setAnimationKey] = useState(0);

  const CATEGORY_COLORS = [
    "#3C2332",
    "#AB8C96",
    "#8E6675",
    "#DE8672",
    "#F9E3B4",
    "#714054",
  ];

  const loadAnalyticsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const eventsJson = await AsyncStorage.getItem("plannerEvents");
      const outfitsJson = await AsyncStorage.getItem("plannerOutfits");
      const localItemsJson = await AsyncStorage.getItem("localItems");
      const userImagesJson = await AsyncStorage.getItem("userImages");

      const plannerEvents: EventsByDate = eventsJson
        ? JSON.parse(eventsJson)
        : {};
      const plannerOutfits: OutfitByDate = outfitsJson
        ? JSON.parse(outfitsJson)
        : {};

      const localItems: ClosetDataItem[] = localItemsJson
        ? JSON.parse(localItemsJson)
        : [];
      const userImages: ClosetDataItem[] = userImagesJson
        ? JSON.parse(userImagesJson)
        : [];

      const masterClosetList = [...localItems, ...userImages];

      const allWornOutfits: RecapOutfit[] = [];
      const categoryCount: { [key: string]: number } = {};
      const itemCount: { [key: number]: number } = {};

      const processItem = (item: ClosetDataItem) => {
        if (!item.category) {
          console.warn("!!! FOUND ITEM WITH NO CATEGORY:", item);
        }
        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
        itemCount[item.id] = (itemCount[item.id] || 0) + 1;
      };

      Object.values(plannerOutfits).forEach((outfitArray) => {
        if (outfitArray.length > 0) {
          allWornOutfits.push(outfitArray);
          outfitArray.forEach(processItem);
        }
      });

      Object.values(plannerEvents).forEach((eventArray) => {
        eventArray.forEach((event) => {
          if (event.outfit && event.outfit.length > 0) {
            allWornOutfits.push(event.outfit);
            event.outfit.forEach(processItem);
          }
        });
      });


      const hydratedOutfits = allWornOutfits.map((outfit) =>
        outfit.map((item) => {
          if (item.type === "local" && typeof item.source === 'string') {
            const staticSource = LOCAL_ASSET_MAP[item.source];
            if (staticSource) {
              return { ...item, source: staticSource };
            }
          }
          return item;
        })
      );

      const totalItems = Object.values(categoryCount).reduce(
        (sum, count) => sum + count,
        0
      );
      const newPieData = Object.keys(categoryCount).map((category, index) => ({
        value: categoryCount[category],
        text: category,
        percentage:
          totalItems > 0
            ? Math.round((categoryCount[category] / totalItems) * 100)
            : 0,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
      }));
      setPieData(newPieData);

      let maxCount = 0;
      let mostWornId = -1;
      Object.entries(itemCount).forEach(([id, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostWornId = parseInt(id, 10);
        }
      });

      if (mostWornId !== -1) {
        const itemData = masterClosetList.find(
          (item: ClosetDataItem) => item.id === mostWornId
        );
        setMostWorn({
          name: itemData?.name || itemData?.category || "Unknown Item",
          count: maxCount,
        });
      } else {
        setMostWorn(null);
      }

      setRecapOutfits(hydratedOutfits);
    } catch (e) {
      console.error("Failed to load analytics data", e);
    } finally {
      setIsLoading(false);
      setAnimationKey((prevKey) => prevKey + 1);
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(loadAnalyticsData, 30000); 

    return () => clearInterval(intervalId);
  }, [loadAnalyticsData]);

  useFocusEffect(
    useCallback(() => {
      loadAnalyticsData(); 
    }, [loadAnalyticsData])
  );



  const goNext = () => {
    carouselRef.current?.scrollTo({ count: 1, animated: true });
  };
  const goPrev = () => {
    carouselRef.current?.scrollTo({ count: -1, animated: true });
  };

  const renderRecapItem = ({ item }: { item: RecapOutfit }) => {
    const top = item.find(i => ["Top", "Shirt", "Jacket"].includes(i.category));
    const bottom = item.find(i => ["Bottom", "Pants", "Jeans", "Skirt"].includes(i.category));
    const shoes = item.find(i => i.category === "Shoes");
    const dress = item.find(i => i.category === "Dress");

    return (
      <View style={styles.outfitCard}>
        {dress ? (
          <Image source={dress.source} style={styles.dress} />
        ) : (
          <>
            {top && <Image source={top.source} style={styles.shirt} />}
            {bottom && <Image source={bottom.source} style={styles.jeans} />}
          </>
        )}
        {shoes && <Image source={shoes.source} style={styles.shoes} />}
        
        <TouchableOpacity style={styles.shareIcon}>
          <Ionicons name="share-social-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.mainContainer}>
      <ImageBackground
        source={require("../../assets/images/starbackground.png")}
        style={styles.background}
        imageStyle={{ resizeMode: "cover" }}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.analyticsHeader}>
          <Ionicons name="stats-chart" size={50} color="#3C2332" />
          <Text style={styles.analyticsTitle}>Analytics</Text>
        </View>


        {/* 1. Category Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#FFFFFF" />
        ) : pieData.length > 0 ? (
          <>
            <PieChart
              key={animationKey}
              data={pieData}
              donut
              isAnimated 
              animationDuration={1000}
              innerRadius={50}
              radius={120} 
              centerLabelComponent={() => (
                <Ionicons name="stats-chart" size={30} color="#3C2332" />
              )}
            />


      <View style={styles.legendContainer}>
        {pieData.map((entry) => (
          <View key={entry.text} style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: entry.color }]} />
            <Text style={styles.legendText}>
              {`${entry.text} (${entry.percentage}%)`}
            </Text>
          </View>
        ))}
      </View>
    </>
  ) : (
    <Text style={styles.noDataText}>No category data yet. Wear some outfits!</Text>
  )}
</View>

        {/* 2. Most Worn Item */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Most Worn Item</Text>
          {isLoading ? (
             <ActivityIndicator size="small" color="#3C2332" />
          ) : mostWorn ? (
            <>
              <Text style={styles.infoItem}>{mostWorn.name}</Text>
              <Text style={styles.infoSub}>{mostWorn.count}x this month</Text>
            </>
          ) : (
             <Text style={styles.infoItem}>Wear some items!</Text>
          )}
        </View>

        {/* 3. Cost per Wear (Still static, as we don't track cost) */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Cost per Wear</Text>
          <Text style={styles.infoItem}>White T-Shirt</Text>
          <Text style={styles.infoSub}>$3.50 per wear</Text>
        </View>

        {/* 4. RECAP Section */}
        <Text style={styles.recapText}>RECAP</Text>

        {/* 5. Outfit Carousel */}
        <View style={styles.carouselWrapper}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#FFFFFF" />
          ) : recapOutfits.length > 0 ? (
            <>
              <TouchableOpacity
                style={[styles.sideButton, { left: 10 }]}
                onPress={goPrev}
              >
                <Ionicons name="chevron-back" size={36} color="white" />
              </TouchableOpacity>
              <Carousel
                ref={carouselRef}
                width={width * 0.75}
                height={500}
                loop={true}
                pagingEnabled={true}
                snapEnabled={true}
                autoPlay={false}
                data={recapOutfits} // Use dynamic data
                scrollAnimationDuration={500}
                onSnapToItem={setCurrentIndex}
                renderItem={renderRecapItem} // Use new dynamic renderer
              />
              <TouchableOpacity
                style={[styles.sideButton, { right: 10 }]}
                onPress={goNext}
              >
                <Ionicons name="chevron-forward" size={36} color="white" />
              </TouchableOpacity>
            </>
          ) : (
             <Text style={styles.noDataText}>No outfits to recap!</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#3C2332",
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120, 
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 0,
    width: "100%",
  },
  analyticsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    gap: 10,
  },
  analyticsTitle: {
    fontSize: 50,
    color: "#3C2332",
    fontWeight: "bold",
  },
  recapText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 30, // Added more space
    marginBottom: 5,
    textTransform: "uppercase",
  },
  outfitContent: {
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 80,
  },
  outfitItemImage: {
    width: "75%",
    height: 150,
    resizeMode: "contain",
    marginVertical: 15,
  },
  carouselWrapper: {
    height: 500,
    width: width,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 30,
    minHeight: 150, // For loading/empty state
  },
  outfitCard: {
    backgroundColor: "#714054",
    borderRadius: 15,
    alignItems: "center",
    width: "100%",
    height: "100%",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    position: "relative",
    overflow: "hidden",
  },
  dress: {
    width: 200,
    height: 350,
    resizeMode: "contain",
    position: 'absolute',
    top: '20%',
    alignSelf: 'center',
    zIndex: 3,
  },
  shirt: {
    width: 130,
    height: 130,
    resizeMode: "contain",
    position: "absolute",
    top: "15%",
    alignSelf: "center",
    zIndex: 4,
  },
  jeans: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    position: "absolute",
    top: "45%",
    alignSelf: "center",
    zIndex: 3,
  },
  shoes: {
    width: 90,
    height: 70,
    resizeMode: "contain",
    position: "absolute",
    top: "78%",
    alignSelf: "center",
    zIndex: 4,
  },
  shareIcon: {
    position: "absolute",
    bottom: 15,
    left: 15,
    zIndex: 5,
  },
  sideButton: {
    position: "absolute",
    top: "45%",
    backgroundColor: "rgba(113, 64, 84, 0.6)",
    padding: 8,
    borderRadius: 30,
    zIndex: 10,
  },
  section: {
    alignItems: "center",
    marginTop: 10,
    width: "90%",
    minHeight: 180, // For loading/empty state
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3C2332",
    marginBottom: 10,
  },
  pieChartStyle: {
    borderRadius: 10,
    marginTop: -10,
  },
  infoBox: {
    backgroundColor: "#AB8C96",
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 25,
    marginTop: 20,
    width: width * 0.85,
    minHeight: 80, // For loading state
  },
  infoTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#3C2332",
  },
  infoItem: {
    fontSize: 17,
    color: "#3C2332",
    fontWeight: "600",
    marginTop: 4,
  },
  infoSub: {
    fontSize: 14,
    color: "#714054",
    marginTop: 3,
  },
  noDataText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontStyle: 'italic',
    marginTop: 20,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    width: '90%',
    marginTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  legendColorBox: {
    width: 14,
    height: 14,
    borderRadius: 2,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
});