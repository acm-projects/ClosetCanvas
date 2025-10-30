import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Pressable,
  FlatList,
  Alert,
} from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context"; // <-- REMOVED
import { Ionicons, Entypo } from "@expo/vector-icons";
import { Link } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

// --- 1. Data Structures ---
type EventItem = {
  id: string;
  title: string;
  startTime: string; // e.g., "09:00"
  endTime: string; // e.g., "10:30"
  color?: string; // Optional color
};

type EventsByDate = {
  [date: string]: EventItem[];
};

type OutfitByDate = {
  [date: string]: ClosetDataItem[];
};

type ClosetDataItem = {
  id: number;
  source: any;
  type: "local" | "user";
  category: string;
};

// --- Helper: Get Current Week Days ---
const getWeekDays = (
  selected: string
): { key: string; dayName: string; dayNum: string }[] => {
  // Placeholder
  const today = new Date(); // Or parse 'selected'
  return [
    { key: "2025-10-26", dayName: "SUN", dayNum: "26" },
    { key: "2025-10-27", dayName: "MON", dayNum: "27" },
    { key: "2025-10-28", dayName: "TUE", dayNum: "28" },
    { key: "2025-10-29", dayName: "WED", dayNum: "29" },
    { key: "2025-10-30", dayName: "THU", dayNum: "30" },
    { key: "2025-10-31", dayName: "FRI", dayNum: "31" },
    { key: "2025-11-01", dayName: "SAT", dayNum: "1" },
  ];
};

// --- App Color Palette for Events ---
const APP_EVENT_COLORS = [
  "#DE8672",
  "#F9E3B4",
  "#714054",
  "#3C2332",
  "#FDAF41",
  "#AB8C96",
];

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [events, setEvents] = useState<EventsByDate>({});
  const [outfits, setOutfits] = useState<OutfitByDate>({});
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventStartTime, setNewEventStartTime] = useState("");
  const [newEventEndTime, setNewEventEndTime] = useState("");

  const [isOutfitModalVisible, setIsOutfitModalVisible] = useState(false);
  const [availableOutfits, setAvailableOutfits] = useState<ClosetDataItem[]>(
    []
  );
  const [tempSelectedOutfits, setTempSelectedOutfits] = useState<
    ClosetDataItem[]
  >([]);
  const [startAmPm, setStartAmPm] = useState("AM");
  const [endAmPm, setEndAmPm] = useState("AM");

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  // --- Load and Save Data ---
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const storedEvents = await AsyncStorage.getItem("plannerEvents");
      const storedOutfits = await AsyncStorage.getItem("plannerOutfits");
      const storedUserImages = await AsyncStorage.getItem("userImages");
      const storedLocalItems = await AsyncStorage.getItem("localItems");

      if (storedEvents) setEvents(JSON.parse(storedEvents));
      if (storedOutfits) setOutfits(JSON.parse(storedOutfits));

      const userImagesData = storedUserImages
        ? JSON.parse(storedUserImages)
        : [];
      const localItemsData = storedLocalItems
        ? JSON.parse(storedLocalItems)
        : [];
      setAvailableOutfits([...localItemsData, ...userImagesData]);
    } catch (e) {
      console.error("Failed to load planner data", e);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem("plannerEvents", JSON.stringify(events));
      await AsyncStorage.setItem("plannerOutfits", JSON.stringify(outfits));
    } catch (e) {
      console.error("Failed to save planner data", e);
    }
  };

  useEffect(() => {
    saveData();
  }, [events, outfits]);

  // --- MOVED handleDeleteEvent to be its own function ---
  const handleDeleteEvent = useCallback(
    (eventId: string) => {
      Alert.alert(
        "Delete Event",
        "Are you sure you want to permanently delete this event?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              const updatedDayEvents = (events[selectedDate] || []).filter(
                (e) => e.id !== eventId
              );
              setEvents((prev) => ({
                ...prev,
                [selectedDate]: updatedDayEvents,
              }));
            },
          },
        ]
      );
    },
    [events, selectedDate]
  ); // Add dependencies

  const handleAddEvent = () => {
    const timeRegex = /^(0[1-9]|1[0-2]):([0-5]\d)$/;
    if (
      !newEventTitle ||
      !newEventStartTime ||
      !newEventEndTime ||
      !timeRegex.test(newEventStartTime) ||
      !timeRegex.test(newEventEndTime)
    ) {
      Alert.alert(
        "Invalid Input",
        "Please enter a title, and start/end times in HH:MM format (e.g., 09:30)."
      );
      return;
    }

    const convertTo24Hour = (time: string, ampm: string): string => {
      const [hour, minute] = time.split(":");
      let hourInt = parseInt(hour);
      if (ampm === "PM" && hourInt !== 12) {
        hourInt += 12;
      }
      if (ampm === "AM" && hourInt === 12) {
        hourInt = 0;
      }
      return `${hourInt.toString().padStart(2, "0")}:${minute}`;
    };

    const startTime24 = convertTo24Hour(newEventStartTime, startAmPm);
    const endTime24 = convertTo24Hour(newEventEndTime, endAmPm);

    const startMinutes =
      parseInt(startTime24.split(":")[0]) * 60 +
      parseInt(startTime24.split(":")[1]);
    const endMinutes =
      parseInt(endTime24.split(":")[0]) * 60 +
      parseInt(endTime24.split(":")[1]);
    if (startMinutes >= endMinutes) {
      Alert.alert("Invalid Time", "End time must be after start time.");
      return;
    }

    const newEvent: EventItem = {
      id: Date.now().toString(),
      title: newEventTitle,
      startTime: startTime24,
      endTime: endTime24,
      color:
        APP_EVENT_COLORS[Math.floor(Math.random() * APP_EVENT_COLORS.length)],
    };

    setEvents((prev) => ({
      ...prev,
      [selectedDate]: [...(prev[selectedDate] || []), newEvent],
    }));

    setNewEventTitle("");
    setNewEventStartTime("");
    setNewEventEndTime("");
    setStartAmPm("AM");
    setEndAmPm("AM");
    setIsEventModalVisible(false);
  };

  const handleAddOutfit = () => {
    const currentOutfit = outfits[selectedDate] || [];
    setTempSelectedOutfits(currentOutfit);
    setIsOutfitModalVisible(true);
  };

  const toggleOutfitItem = (item: ClosetDataItem) => {
    setTempSelectedOutfits((prev) => {
      const isSelected = prev.some(
        (selectedItem) => selectedItem.id === item.id
      );
      if (isSelected) {
        return prev.filter((selectedItem) => selectedItem.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const confirmOutfitSelection = () => {
    setOutfits((prev) => ({ ...prev, [selectedDate]: tempSelectedOutfits }));
    setIsOutfitModalVisible(false);
  };

  const handleRemoveOutfit = () => {
    setOutfits((prev) => ({ ...prev, [selectedDate]: [] }));
  };

  // --- MODIFIED: Added .sort() ---
  const selectedDayEvents = (events[selectedDate] || []).sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );
  const selectedDayOutfit = outfits[selectedDate] || [];

  return (
    <View style={styles.flexContainer}>
      <View style={styles.calendarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.weekScroll}
        >
          {weekDays.map((day) => (
            <TouchableOpacity
              key={day.key}
              style={styles.dayContainer}
              onPress={() => setSelectedDate(day.key)}
            >
              <Text
                style={[
                  styles.dayName,
                  selectedDate === day.key && styles.selectedTextPurple,
                ]}
              >
                {day.dayName}
              </Text>
              <View
                style={[
                  styles.dayNumberCircle,
                  selectedDate === day.key && styles.selectedDayNumberCircle,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumber,
                    selectedDate === day.key && styles.selectedTextWhite,
                  ]}
                >
                  {day.dayNum}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.contentArea}>
        <Text style={styles.sectionTitle}>Outfit for {selectedDate}</Text>
        <View style={styles.outfitSection}>
          {selectedDayOutfit.length > 0 ? (
            <View style={styles.outfitDisplayContainer}>
              <View style={styles.outfitDisplay}>
                {selectedDayOutfit.map((item) => (
                  <Image
                    key={item.id}
                    source={item.source}
                    style={styles.outfitImage}
                  />
                ))}
              </View>
              <TouchableOpacity
                onPress={handleRemoveOutfit}
                style={styles.removeOutfitButton}
              >
                <Ionicons name="close-circle" size={24} color="#D32F2F" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddOutfit}
                style={styles.editOutfitButton}
              >
                <Entypo name="edit" size={20} color="#4B0082" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.addOutfitButton}
              onPress={handleAddOutfit}
            >
              <Ionicons name="add-circle-outline" size={30} color="#4B0082" />
              <Text style={styles.addOutfitText}>Add Outfit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.eventsHeader}>
          <Text style={styles.sectionTitle}>Events for {selectedDate}</Text>
        </View>

        <View style={styles.timeGridContainer}>
          <View style={styles.timeLabelsColumn}>
            {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
              <View key={`label-${hour}`} style={styles.timeLabelCell}>
                <Text style={styles.timeLabelText}>
                  {hour === 0
                    ? "12 AM"
                    : hour === 12
                    ? "12 PM"
                    : hour > 12
                    ? `${hour - 12} PM`
                    : `${hour} AM`}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.eventsColumn}>
            {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
              <View key={`line-${hour}`} style={styles.gridLine} />
            ))}

            {/* --- MODIFIED: Replaced .map with new logic --- */}
            {(() => {
              const eventBlocks = [];
              let currentOverlapLevel = 0;
              let maxEndTimeInGroup = -1; // End time in minutes

              for (const event of selectedDayEvents) {
                // 1. Validation
                const timeRegex = /^\d{2}:\d{2}$/;
                if (
                  !event.startTime ||
                  !event.endTime ||
                  !timeRegex.test(event.startTime) ||
                  !timeRegex.test(event.endTime)
                ) {
                  console.warn(`Skipping event...`);
                  continue; // Use continue instead of return null
                }

                // 2. Calculation
                const hourHeight = 60;
                const startHour = parseInt(event.startTime.split(":")[0]);
                const startMinute = parseInt(event.startTime.split(":")[1]);
                const endHour = parseInt(event.endTime.split(":")[0]);
                const endMinute = parseInt(event.endTime.split(":")[1]);

                if (
                  isNaN(startHour) ||
                  isNaN(startMinute) ||
                  isNaN(endHour) ||
                  isNaN(endMinute)
                )
                  continue;

                const startMinutes = startHour * 60 + startMinute;
                const endMinutes = endHour * 60 + endMinute;
                const durationMinutes = Math.max(15, endMinutes - startMinutes);

                const gridStartHour = 0;
                const gridStartMinutes = gridStartHour * 60;
                const topPosition =
                  ((startMinutes - gridStartMinutes) / 60) * hourHeight;
                const eventHeight = (durationMinutes / 60) * hourHeight;
                const totalGridHeight = hourHeight * 24;

                if (
                  endMinutes <= gridStartMinutes ||
                  startMinutes >= (gridStartHour + 24) * 60 ||
                  eventHeight <= 0
                ) {
                  continue;
                }
                const clampedTop = Math.max(0, topPosition);
                const adjustedHeight = Math.min(
                  eventHeight - (clampedTop - topPosition),
                  totalGridHeight - clampedTop
                );

                // 3. --- NEW Overlap Logic ---
                if (startMinutes >= maxEndTimeInGroup) {
                  // This event does NOT overlap. Reset the level.
                  currentOverlapLevel = 0;
                } else {
                  // This event DOES overlap. Increment the level.
                  currentOverlapLevel++;
                }
                maxEndTimeInGroup = Math.max(maxEndTimeInGroup, endMinutes);

                const overlapOffset = (currentOverlapLevel % 4) * 10;
                const zIndex = currentOverlapLevel;
                // --- End of New Logic ---

                // 4. Create and push the component
                eventBlocks.push(
                  <Pressable
                    key={event.id}
                    onLongPress={() => handleDeleteEvent(event.id)} // Add delete handler
                    style={[
                      styles.eventBlock, // Use updated style (no left/right)
                      {
                        top: clampedTop,
                        height: adjustedHeight,
                        backgroundColor: event.color || "#4A90E2",
                        borderLeftColor: event.color
                          ? darkenColor(event.color, 20)
                          : "#357ABD",
                        // Apply dynamic layout styles
                        left: 4 + overlapOffset,
                        right: 10, // Gives space for other items
                        zIndex: zIndex,
                      },
                    ]}
                  >
                    <Text style={styles.eventBlockTitle} numberOfLines={1}>
                      {event.title}
                    </Text>
                    <Text style={styles.eventBlockTime} numberOfLines={1}>
                      {formatTime(event.startTime)} -{" "}
                      {formatTime(event.endTime)}
                    </Text>
                  </Pressable>
                );
              }
              return eventBlocks; // Render the array of components
            })()}
            {/* End of Render Events */}
          </View>
        </View>

        {selectedDayEvents.length === 0 && (
          <Text style={styles.noEventsText}>
            No events scheduled for this day.
          </Text>
        )}
      </ScrollView>

      {/* --- Add Event Modal --- */}
      <Modal
        animationType="slide"
        transparent
        visible={isEventModalVisible}
        onRequestClose={() => setIsEventModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsEventModalVisible(false)}
        >
          <Pressable style={styles.modalView} onPress={() => {}}>
            <Text style={styles.modalTitle}>Add New Event</Text>
            <TextInput
              style={styles.input}
              placeholder="Event Title"
              placeholderTextColor="#aaa"
              value={newEventTitle}
              onChangeText={setNewEventTitle}
            />

            <View style={styles.timeInputContainer}>
              <TextInput
                style={[styles.input, styles.timeInput]}
                placeholder="Start Time (HH:MM)"
                placeholderTextColor="#aaa"
                value={newEventStartTime}
                onChangeText={setNewEventStartTime}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
              <TouchableOpacity
                style={styles.amPmToggle}
                onPress={() =>
                  setStartAmPm((prev) => (prev === "AM" ? "PM" : "AM"))
                }
              >
                <Text style={styles.amPmText}>{startAmPm}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeInputContainer}>
              <TextInput
                style={[styles.input, styles.timeInput]}
                placeholder="End Time (HH:MM)"
                placeholderTextColor="#aaa"
                value={newEventEndTime}
                onChangeText={setNewEventEndTime}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
              />
              <TouchableOpacity
                style={styles.amPmToggle}
                onPress={() =>
                  setEndAmPm((prev) => (prev === "AM" ? "PM" : "AM"))
                }
              >
                <Text style={styles.amPmText}>{endAmPm}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButtonBase, styles.modalButtonCancel]}
                onPress={() => setIsEventModalVisible(false)}
              >
                <Text
                  style={[styles.modalButtonText, styles.modalButtonTextCancel]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButtonBase, styles.modalButtonConfirm]}
                onPress={handleAddEvent}
              >
                <Text style={styles.modalButtonText}>Add Event</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* --- Outfit Selection Modal --- */}
      <Modal
        animationType="slide"
        transparent
        visible={isOutfitModalVisible}
        onRequestClose={() => setIsOutfitModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsOutfitModalVisible(false)}
        >
          <Pressable
            style={[styles.modalView, styles.outfitModalView]}
            onPress={() => {}}
          >
            <Text style={styles.modalTitle}>
              Select Outfit for {selectedDate}
            </Text>
            {availableOutfits.length === 0 ? (
              <Text style={styles.noEventsText}>
                No outfits found in your closet.
              </Text>
            ) : (
              <FlatList
                data={availableOutfits}
                keyExtractor={(item) => item.id.toString()}
                numColumns={3}
                renderItem={({ item }) => {
                  const isSelected = tempSelectedOutfits.some(
                    (selected) => selected.id === item.id
                  );
                  return (
                    <TouchableOpacity
                      style={[
                        styles.outfitSelectItem,
                        isSelected && styles.outfitSelectItem_Selected,
                      ]}
                      onPress={() => toggleOutfitItem(item)}
                    >
                      <Image
                        source={item.source}
                        style={styles.outfitSelectImage}
                      />
                      {isSelected && (
                        <View style={styles.selectedCheckmark}>
                          <Ionicons
                            name="checkmark-circle"
                            size={24}
                            color="#714054"
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={styles.outfitListContainer}
              />
            )}
            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButtonBase, styles.modalButtonCancel]}
                onPress={() => setIsOutfitModalVisible(false)}
              >
                <Text
                  style={[styles.modalButtonText, styles.modalButtonTextCancel]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButtonBase, styles.modalButtonConfirm]}
                onPress={confirmOutfitSelection}
              >
                <Text style={styles.modalButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={() => setIsEventModalVisible(true)}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

// --- Helper functions ---
function darkenColor(hex: string, percent: number): string {
  hex = hex.replace(/^\s*#|\s*$/g, "");
  if (hex.length === 3) {
    hex = hex.replace(/(.)/g, "$1$1");
  }
  let r = parseInt(hex.substring(0, 2), 16),
    g = parseInt(hex.substring(2, 4), 16),
    b = parseInt(hex.substring(4, 6), 16);
  const factor = (100 - percent) / 100;
  r = Math.min(255, Math.max(0, Math.round(r * factor)));
  g = Math.min(255, Math.max(0, Math.round(g * factor)));
  b = Math.min(255, Math.max(0, Math.round(b * factor)));
  return `#${r.toString(16).padStart(2, "0")}${g
    .toString(16)
    .padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function formatTime(time24: string): string {
  const [hourStr, minuteStr] = time24.split(":");
  const hour = parseInt(hourStr);
  const minute = parseInt(minuteStr);
  if (isNaN(hour) || isNaN(minute)) return time24;
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minuteStr} ${ampm}`;
}

// --- Styles ---
const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    backgroundColor: "#E5D7D7",
  },
  eventsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  calendarContainer: {
    backgroundColor: "#714054",
    paddingHorizontal: 10,
    paddingTop: 50,
    paddingBottom: 15,
  },
  weekScroll: {
    alignItems: "center",
    paddingVertical: 5,
  },
  dayContainer: {
    alignItems: "center",
    marginHorizontal: 10,
    paddingVertical: 5,
  },
  dayName: {
    fontSize: 12,
    color: "#E0D0F8",
    marginBottom: 8,
  },
  dayNumberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  selectedDayNumberCircle: {
    backgroundColor: "white",
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  selectedTextPurple: {
    color: "white",
    fontWeight: "bold",
  },
  selectedTextWhite: {
    color: "#714054",
  },
  contentArea: {
    flex: 1,
    padding: 15,
    backgroundColor: "#E5D7D7",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3C2332",
    marginBottom: 15,
  },
  outfitSection: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    alignItems: "center",
    minHeight: 100,
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  addOutfitButton: {
    alignItems: "center",
  },
  addOutfitText: {
    marginTop: 5,
    color: "#4B0082",
    fontSize: 14,
  },
  outfitDisplayContainer: {
    position: "relative",
    width: "100%",
    alignItems: "center",
  },
  outfitDisplay: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  outfitImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
    borderRadius: 8,
    margin: 4,
    backgroundColor: "#f0f0f0",
  },
  removeOutfitButton: {
    position: "absolute",
    top: -12,
    right: -5,
    backgroundColor: "white",
    borderRadius: 15,
    zIndex: 10,
  },
  editOutfitButton: {
    position: "absolute",
    top: -10,
    left: -5,
    backgroundColor: "white",
    borderRadius: 15,
    zIndex: 10,
    padding: 2,
  },
  floatingAddButton: {
    position: "absolute",
    width: 50,
    height: 50,
    borderRadius: 30,
    backgroundColor: "#714054", // Your theme color
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    bottom: 30, // Distance from bottom
    right: 30, // Distance from right
    zIndex: 10, // Make sure it's on top
  },
  noEventsText: {
    textAlign: "center",
    color: "#888",
    marginTop: 40,
    fontSize: 15,
  },
  timeGridContainer: {
    flexDirection: "row",
    marginTop: 10,
    backgroundColor: "white",
    borderRadius: 8,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: 60 * 24,
  },
  timeLabelsColumn: {
    width: 60,
    paddingRight: 10,
  },
  timeLabelCell: {
    height: 60,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 5,
  },
  timeLabelText: {
    fontSize: 12,
    color: "#666",
  },
  eventsColumn: {
    flex: 1,
    position: "relative",
    borderLeftWidth: 1,
    borderLeftColor: "#eee",
  },
  gridLine: {
    height: 60,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  eventBlock: {
    position: "absolute",
    backgroundColor: "#4A90E2", // Default color
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 6,
    overflow: "hidden",
    borderLeftWidth: 3,
    elevation: 1, // Subtle shadow
  },
  eventBlockTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    marginBottom: 1,
  },
  eventBlockTime: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.85)",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 45,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  timeInputContainer: {
    flexDirection: "row",
    width: "100%",
    alignItems: "center",
  },
  timeInput: {
    flex: 1,
    marginRight: 10,
  },
  amPmToggle: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#eee",
    borderRadius: 8,
    height: 45,
    justifyContent: "center",
    marginBottom: 15,
  },
  amPmText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#714054",
  },
  modalButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  modalButtonBase: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 12,
    marginHorizontal: 5,
    alignItems: "center",
  },
  modalButtonCancel: {
    backgroundColor: "#eee",
  },
  modalButtonConfirm: {
    backgroundColor: "#714054",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  modalButtonTextCancel: {
    color: "#555",
  },
  outfitModalView: {
    height: "80%",
  },
  outfitListContainer: {
    paddingVertical: 10,
    alignItems: "center",
  },
  outfitSelectItem: {
    width: (width * 0.9 - 50) / 3,
    aspectRatio: 1,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "transparent",
    borderRadius: 10,
  },
  outfitSelectItem_Selected: {
    borderColor: "#714054",
  },
  outfitSelectImage: {
    width: "90%",
    height: "90%",
    resizeMode: "contain",
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  selectedCheckmark: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "white",
    borderRadius: 12,
  },
});
