
import React, { useState } from "react";
import { View, Text, TextInput,Button, StyleSheet, Alert, Image, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from 'expo-router';

//import { SafeAreaView } from "react-native-safe-area-context/lib/typescript/src/SafeAreaView";

export default function CommunityPage() {
  
   
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

});

































































