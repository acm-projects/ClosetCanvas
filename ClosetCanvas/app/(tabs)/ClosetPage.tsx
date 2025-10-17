import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons,Entypo } from "@expo/vector-icons"; 
import { Link } from 'expo-router';

export default function ClosetPage() {
  // State to keep track of which outfit IDs are liked
  const [likedOutfits, setLikedOutfits] = useState<number[]>([]);

  const outfits = [
    { id: 1, items: [ require("../../assets/images/hoodie.png"), require("../../assets/images/pants.png"), require("../../assets/images/shoes.png"), ], },
    { id: 2, items: [require("../../assets/images/dress.png")] },
    { id: 3, items: [ require("../../assets/images/tshirt.png"), require("../../assets/images/shorts.png"), require("../../assets/images/sneakers.png"), ], },
    { id: 4, items: [ require("../../assets/images/white-tee.png"), require("../../assets/images/jeans.png"), require("../../assets/images/sneakers.png"), ], },
    { id: 5, items: [require("../../assets/images/plaid.png")] },
    { id: 6, items: [ require("../../assets/images/white-tee.png"), require("../../assets/images/pants.png"), ], },
  ];

  // Function to add or remove an outfit from the liked list
  function toggleLike(outfitId: number) {
    if (likedOutfits.includes(outfitId)) {
      setLikedOutfits(likedOutfits.filter(id => id !== outfitId));
    } else {
      setLikedOutfits([...likedOutfits, outfitId]);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
     <View style={styles.header}>
              <Text style={styles.title0}>ClosetCanvas</Text>
              <Link href="/SettingsPage">
                <Entypo name="menu" size={28} color="white" />
              </Link>
            </View>

      {/* Favorites Title */}
      <Text style={styles.subtitle}>Wardrobe</Text>

      {/* Filters */}
      <View style={styles.filters}>
        {["Tops", "Bottoms", "Outerwear"].map((f) => (
          <TouchableOpacity key={f} style={styles.filterButton}>
            <Text style={styles.filterText}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Outfits Grid */}
      <ScrollView contentContainerStyle={styles.grid}>
        {outfits.map((outfit) => {
          const isLiked = likedOutfits.includes(outfit.id);
          return (
            <View key={outfit.id} style={styles.card}>
              <TouchableOpacity style={styles.heart} onPress={() => toggleLike(outfit.id)}>
                {isLiked ? (
                  <Ionicons name="heart" size={24} color="#ff0026ff" />
                ) : (
                  <Ionicons name="heart-outline" size={24} color="#333" />
                )}
              </TouchableOpacity>
              <View style={styles.outfitRow}>
                {outfit.items.map((item, i) => (
                  <Image key={i} source={item} style={styles.itemImage} />
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafafa",
  },
  menuIcon: {
    position: "absolute",
    right: 20,
    top: 55,
  },
  title: {
    color: "#fafafa",
    fontSize: 24,
    fontWeight: "bold",
    fontFamily: "serif",
  },
  subtitle: {
    fontSize: 25,
    color: "#4B0082",
    fontWeight: "bold",
    margin: 15,
  },
  filters: {
    flexDirection: "row",
    marginHorizontal: 10,
  },
  filterButton: {
    backgroundColor: "#BA9EEF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
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

  title0: {
    color: "#fafafa",
    fontSize: 22,
    fontFamily: "serif",
    fontWeight: "600",
  },

  filterText: {
    color: "#fafafa",
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-evenly",
    paddingBottom: 80,
  },
  card: {
    width: "40%",
    backgroundColor: "#F9CADA",
    borderRadius: 15,
    marginVertical: 10,
    padding: 10,
    alignItems: "center",
    position: "relative",
  },
  outfitRow: {
    flex:1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemImage: {
    width: 120,
    height: 100,
    resizeMode: "cover",
    marginBottom: 5,
  },
  heart: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
  },
});