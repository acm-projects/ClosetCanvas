import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PieChart } from "react-native-chart-kit";
import Carousel from "react-native-reanimated-carousel";

const { width, height } = Dimensions.get("window");

export default function AnalyticsPage() {
  const screenWidth = Dimensions.get("window").width;

  const outfits = [
    {
      shirt: require("../../assets/images/WhiteShirt.png"),
      jeans: require("../../assets/images/BlueJeans.png"),
      shoes: require("../../assets/images/WhiteShoes.png"),
    },
    {
      shirt: require("../../assets/images/dress.png"),
      jeans: require("../../assets/images/BlueJeans.png"),
      shoes: require("../../assets/images/WhiteShoes.png"),
    },
    {
      shirt: require("../../assets/images/plaid.png"),
      jeans: require("../../assets/images/BlueJeans.png"),
      shoes: require("../../assets/images/sneakers.png"),
    },
  ];

  const carouselRef = useRef<any>(null);
  const [, setCurrentIndex] = useState(0);

  const goNext = () => {
    carouselRef.current?.scrollTo({ count: 1, animated: true });
  };

  const goPrev = () => {
    carouselRef.current?.scrollTo({ count: -1, animated: true });
  };
 
  const data = [
    {
      name: "Business Wear",
      population: 30,
      color: "#3C2332",
      legendFontColor: "#FFFFFF",
      legendFontSize: 14,
    },
    {
      name: "Casual Wear",
      population: 40,
      color: "#AB8C96",
      legendFontColor: "#FFFFFF",
      legendFontSize: 14,
    },
    {
      name: "Active Wear",
      population: 30,
      color: "#8E6675",
      legendFontColor: "#FFFFFF",
      legendFontSize: 14,
    },
  ];

  return (
    <View style={styles.mainContainer}> 
      {/* 1. Background (Positioned absolutely) */}
      <ImageBackground
        source={require("../../assets/images/starbackground.png")} 
        style={styles.background} 
        imageStyle={{ resizeMode: "cover" }}
      />

      {/* 2. Scrollable Content (Sibling to Background) */}
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Analytics Title */}
        <View style={styles.analyticsHeader}>
          <Ionicons name="stats-chart" size={32} color="#FFFFFF" />
          <Text style={styles.analyticsTitle}>Analytics</Text>
        </View>

        {/* RECAP Section */}
        <Text style={styles.recapText}>RECAP</Text>

        {/* Outfit Carousel */}
        <View style={styles.carouselWrapper}>
          <TouchableOpacity style={[styles.sideButton, { left: 10 }]} onPress={goPrev}>
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
            data={outfits}
            scrollAnimationDuration={500}
            onSnapToItem={setCurrentIndex}
            renderItem={({ item }: any) => (
              <View style={styles.outfitCard}> 
                  <Image source={item.shirt} style={styles.shirt} />
                  <Image source={item.jeans} style={styles.jeans} />
                  <Image source={item.shoes} style={styles.shoes} />
                  <TouchableOpacity style={styles.shareIcon}>
                      <Ionicons name="share-social-outline" size={24} color="#FFFFFF" />
                  </TouchableOpacity>
              </View>
            )}
          />
          <TouchableOpacity style={[styles.sideButton, { right: 10 }]} onPress={goNext}>
            <Ionicons name="chevron-forward" size={36} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Category Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Breakdown</Text>
          <PieChart
            data={data}
            width={screenWidth * 0.9}
            height={180}
            chartConfig={{
              backgroundGradientFrom: 'transparent',
              backgroundGradientTo: 'transparent',
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor={"population"}
            backgroundColor={"transparent"}
            paddingLeft={"15"}
            center={[10, 0]}
            absolute
            hasLegend={true}
            style={styles.pieChartStyle}
          />
        </View>

        {/* Most Worn Item */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Most Worn Item</Text>
          <Text style={styles.infoItem}>White Sneakers</Text>
          <Text style={styles.infoSub}>3x this week</Text>
        </View>

        {/* Cost per Wear */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Cost per Wear</Text>
          <Text style={styles.infoItem}>White T-Shirt</Text>
          <Text style={styles.infoSub}>$3.50 per wear</Text>
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
    position: 'absolute', 
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1, 
  },
  scrollContent: {
    paddingBottom: 90, 
    alignItems: 'center',
    paddingTop: 60, 
    paddingHorizontal: 0, 
    width: '100%',
  },
  analyticsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    gap: 10,
  },
  analyticsTitle: {
    fontSize: 28,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  recapText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  outfitContent: {
    alignItems: 'center',
   paddingTop: 30,
    paddingBottom: 80,
  },
  outfitItemImage: {
    width: '75%', 
    height: 150, 
    resizeMode: 'contain',
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
  },
  outfitCard: { 
    backgroundColor: "#714054",
    borderRadius: 15,
    alignItems: "center",
    width: '100%', 
    height: '100%', 
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  shirt: {
    width: 130,
    height: 130,
    resizeMode: "contain",
    position: 'absolute',
    top: '15%', 
    alignSelf: 'center',
    zIndex: 4,
  },
  jeans: {
    width: 160,
    height: 160,
    resizeMode: "contain",
    position: 'absolute',
    top: '45%', 
    alignSelf: 'center',
    zIndex: 3,
  },
  shoes: {
    width: 90,
    height: 70,
    resizeMode: "contain",
    position: 'absolute',
    top: '78%', 
    alignSelf: 'center',
    zIndex: 4,
  },
  shareIcon: {
      position: 'absolute',
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
    width: '90%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
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
});
