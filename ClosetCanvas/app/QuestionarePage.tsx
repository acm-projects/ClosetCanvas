import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Pressable, // Added Pressable
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Camera, Image as ImageIcon } from "lucide-react-native"; // Added icons

export default function QuestionarePage() {
  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();
  const [userImages, setUserImages] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const stylesList = [
    {
      id: "1",
      name: "Minimalistic",
      image: require("../assets/images/minimalistic.png"),
    },
    {
      id: "2",
      name: "Y2K",
      image: require("../assets/images/Y2K.png"),
    },
    {
      id: "3",
      name: "Active",
      image: require("../assets/images/active.png"),
    },
    {
      id: "4",
      name: "Business",
      image: require("../assets/images/business.png"),
    },
  ];

  const toggleSelect = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter((item) => item !== id));
    } else {
      setSelected([...selected, id]);
    }
  };
  const handleNext = () => {
    // We use replace() so the user can't go "back" to the questionnaire
    router.replace("/(tabs)/HomePage");
  };

  async function pickImage() {
    // Request permission to access media library
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera roll is required!");
      return;
    }

    // Launch the image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0].uri;
      setUserImages([...userImages, selectedImage]);
    }
  }
  async function takePhoto() {
    // Request permission to access camera
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera is required!");
      return;
    }

    // Launch the camera
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 4],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0].uri;
      setUserImages([...userImages, selectedImage]);
    }
  }
  function imageSelecter() {
    setModalVisible(true);
  }
  function onTakePhoto() {
    takePhoto(); // Call your existing function
    setModalVisible(false); // Close the modal
  }

  function onPickImage() {
    pickImage(); // Call your existing function
    setModalVisible(false); // Close the modal
  }

  return (
    <View style={styles.container}>
      {/* Title */}
      <Text style={styles.title}>Find Your Style</Text>

      {/* Styles Grid */}
      <ScrollView contentContainerStyle={styles.grid}>
        {stylesList.map((style) => (
          <TouchableOpacity
            key={style.id}
            style={[
              styles.card,
              selected.includes(style.id) ? styles.selectedCard : null,
            ]}
            onPress={() => toggleSelect(style.id)}
          >
            <Image source={style.image} style={styles.image} />
            <Text style={styles.cardText}>{style.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Upload & Skip */}
      <View style={styles.bottom}>
        <TouchableOpacity style={styles.uploadBtn} onPress={imageSelecter}>
          <Ionicons name="camera" size={18} color="white" />
          <Text style={styles.uploadText}>Upload</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadBtnTwo} onPress={handleNext}>
          <Text style={styles.uploadText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleNext}>
          <Text style={styles.skipText}>SKIP</Text>
        </TouchableOpacity>

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
            {/* This inner Pressable stops the tap from closing the modal */}
            <Pressable style={styles.modalView} onPress={() => {}}>
              <Text style={styles.modalTitle}>Add to Closet</Text>

              {/* Take Photo Button */}
              <TouchableOpacity style={styles.modalButton} onPress={onTakePhoto}>
                <Camera size={22} color="#714054" />
                <Text style={styles.modalButtonText}>Take Photo</Text>
              </TouchableOpacity>

              {/* Choose from Library Button */}
              <TouchableOpacity
                style={styles.modalButton}
                onPress={onPickImage}
              >
                <ImageIcon size={22} color="#714054" />
                <Text style={styles.modalButtonText}>Choose from Library</Text>
              </TouchableOpacity>

              {/* Cancel Button */}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E5D7D7",
  },
  header: {
    backgroundColor: "#5B2C9D",
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  logo: {
    color: "white",
    fontFamily: "serif",
    fontSize: 22,
  },
  title: {
    textAlign: "center",
    fontSize: 45,
    fontWeight: "600",
    marginTop: 40,
    marginBottom: 10,
    color: "#3C2332",
  },
  grid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "47%",
    backgroundColor: "#714054",
    borderRadius: 20,
    marginTop: 20,
    alignItems: "center",
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedCard: {
    borderColor: "#DE8672",
  },
  image: {
    width: "100%",
    height: 235,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  overlay: {
    position: "absolute",
    right: 8,
    bottom: 35,
    borderRadius: 100,
    padding: 1,
  },
  cardText: {
    fontSize: 16,
    marginTop: 5,
    color: "white",
  },
  bottom: {
    alignItems: "center",
    marginVertical: 20,
  },
  uploadBtn: {
    flexDirection: "row",
    backgroundColor: "#714054",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 120,
    alignItems: "center",
    marginBottom: 5,
  },
  uploadBtnTwo: {
    flexDirection: "row",
    backgroundColor: "#DE8672",
    borderRadius: 8,
    marginTop: 5,
    paddingVertical: 5,
    paddingHorizontal: 90,
    alignItems: "center",
    marginBottom: 5,
  },
  uploadText: {
    color: "white",
    marginLeft: 8,
    fontSize: 16,
  },
  skipText: {
    marginTop: 5,
    marginBottom: 10,
    fontSize: 15,
    color: "#2E2E2E",
    textDecorationLine: "underline",
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    marginLeft: 0,
  },

});