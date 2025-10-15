
import React, { useState } from "react";
import { View, Text, TextInput,Button, StyleSheet, Alert, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from 'expo-router';
//import { SafeAreaView } from "react-native-safe-area-context/lib/typescript/src/SafeAreaView";

export default function ClosetPage() {
  
   
  return (
    <ScrollView style={styles.container}>
    <SafeAreaView style={{ flex: 1 }}>
    <View style={styles.container}>
       
       <View style={styles.header}>
              <Text style={styles.title0}>ClosetCanvas</Text>
               <Link href="/SettingsPage">
                <Entypo name="menu" size={28} color="white" />
               </Link>
            </View>
      
        <View style={styles.headerRow}>
      <Image source={require("../../assets/images/wardrobeTitle.png")}
        style={styles.wardrobeIcon} />
        <View>
      <Text style={styles.title}>Wardrobe</Text>
      <Text style={styles.subtitle}>Filters:</Text>
      </View>
      </View>
    

         <View style={[styles.block, { backgroundColor: "#E9D8FD" }]}>
        
      </View>


           
    </View>
   </SafeAreaView>
   </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 3,
   
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

  headerRow: {
    flexDirection: "row", // <-- makes icon + title side by side
    alignItems: "center",
    marginBottom: 20,
    paddingLeft: 10,
  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
   wardrobeIcon: { 
    width: 60,
    height: 50,
    marginTop: -15, 
    marginRight: 5, 
   }, 
  title: {
    fontSize: 46,
    fontWeight: "400",
    marginTop: 5,
    color: "#4B0082",
   
   
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "300",
    marginTop: -5,
    marginLeft: -65,
    color: "#4B0082",
  
  },
  selectedText: {
    fontSize: 16,
    color: "#4B0082",
    marginVertical: 10,
  },
  block: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: "#000",
    width: 300,
    height: 300,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },


});

































































