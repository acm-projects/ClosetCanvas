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
  outfit?: ClosetDataItem[]; 
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

const getWeekDays = (
  selected: string
): { key: string; dayName: string; dayNum: string }[] => {
  // Placeholder
  const today = new Date(); 
  return [
    { key: "2025-12-03", dayName: "WED", dayNum: "3" },
    { key: "2025-12-04", dayName: "THU", dayNum: "4" },
    { key: "2025-12-05", dayName: "FRI", dayNum: "5" },
    { key: "2025-12-06", dayName: "SAT", dayNum: "6" },
    { key: "2025-12-07", dayName: "SUN", dayNum: "7" },
    { key: "2025-12-08", dayName: "MON", dayNum: "8" },
    { key: "2025-12-09", dayName: "TUE", dayNum: "9" },
  ];
};

const APP_EVENT_COLORS = [
  "#DE8672",
  "#F9E3B4",
  "#714054",
  "#3C2332",
  "#FDAF41",
  "#AB8C96",
];

function formatTime12(time24: string): { time12: string; ampm: string } {
  const [hourStr, minuteStr] = time24.split(":");
  const hour = parseInt(hourStr);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12; // 0 becomes 12
  return {
    time12: `${hour12.toString().padStart(2, "0")}:${minuteStr}`,
    ampm: ampm,
  };
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [events, setEvents] = useState<EventsByDate>({});
  const [outfits, setOutfits] = useState<OutfitByDate>({});

  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventStartTime, setNewEventStartTime] = useState("");
  const [newEventEndTime, setNewEventEndTime] = useState("");
  const [startAmPm, setStartAmPm] = useState("AM");
  const [endAmPm, setEndAmPm] = useState("AM");
  const [newEventOutfit, setNewEventOutfit] = useState<ClosetDataItem[]>([]);

  const [isOutfitModalVisible, setIsOutfitModalVisible] = useState(false);
  const [availableOutfits, setAvailableOutfits] = useState<ClosetDataItem[]>(
    []
  );
  const [tempSelectedOutfits, setTempSelectedOutfits] = useState<
    ClosetDataItem[]
  >([]);
  const [outfitModalMode, setOutfitModalMode] = useState<"day" | "event" | null>(
    null
  );
  const [isGeneratingOutfit, setIsGeneratingOutfit] = useState(false);

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

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
  );

  const handleSaveEvent = () => {
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

    if (editingEventId) {
      setEvents((prev) => {
        const dayEvents = prev[selectedDate] || [];
        const updatedEvents = dayEvents.map((event) => {
          if (event.id === editingEventId) {
            return {
              ...event, 
              title: newEventTitle,
              startTime: startTime24,
              endTime: endTime24,
              outfit: newEventOutfit,
            };
          }
          return event; 
        });
        return { ...prev, [selectedDate]: updatedEvents };
      });
    } else {
      const newEvent: EventItem = {
        id: Date.now().toString(),
        title: newEventTitle,
        startTime: startTime24,
        endTime: endTime24,
        color:
          APP_EVENT_COLORS[Math.floor(Math.random() * APP_EVENT_COLORS.length)],
        outfit: newEventOutfit,
      };
      setEvents((prev) => ({
        ...prev,
        [selectedDate]: [...(prev[selectedDate] || []), newEvent],
      }));
    }

    closeEventModal();
  };

  const openAddEventModal = () => {
    setEditingEventId(null);
    setNewEventTitle("");
    setNewEventStartTime("");
    setNewEventEndTime("");
    setStartAmPm("AM");
    setEndAmPm("AM");
    setNewEventOutfit([]);
    setIsEventModalVisible(true);
  };

  const openEditEventModal = (event: EventItem) => {
    setEditingEventId(event.id);
    setNewEventTitle(event.title);
    setNewEventOutfit(event.outfit || []);

    const start = formatTime12(event.startTime);
    const end = formatTime12(event.endTime);

    setNewEventStartTime(start.time12);
    setStartAmPm(start.ampm);
    setNewEventEndTime(end.time12);
    setEndAmPm(end.ampm);

    setIsEventModalVisible(true);
  };

  const closeEventModal = () => {
    setIsEventModalVisible(false);
    setEditingEventId(null);
    setNewEventTitle("");
    setNewEventStartTime("");
    setNewEventEndTime("");
    setStartAmPm("AM");
    setEndAmPm("AM");
    setNewEventOutfit([]);
  };

  const handleAddOutfit = () => {
    const currentOutfit = outfits[selectedDate] || [];
    setTempSelectedOutfits(currentOutfit);
    setOutfitModalMode("day");
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
    if (outfitModalMode === "day") {
      setOutfits((prev) => ({ ...prev, [selectedDate]: tempSelectedOutfits }));
    } else if (outfitModalMode === "event") {
      setNewEventOutfit(tempSelectedOutfits);
    }
    setIsOutfitModalVisible(false);
    setOutfitModalMode(null);
    setTempSelectedOutfits([]);
  };

  const handleRemoveOutfit = () => {
    setOutfits((prev) => ({ ...prev, [selectedDate]: [] }));
  };

  const openOutfitForEvent = () => {
    setTempSelectedOutfits(newEventOutfit);
    setOutfitModalMode("event");
    setIsOutfitModalVisible(true);
  };

  const handleGenerateOutfit = async () => {
    setIsGeneratingOutfit(true);

    // Hard-coded test outfit from another account (user_id: 61fb15c0-d0b1-70ef-94ae-358b706515c2)
    const testUserId = "61fb15c0-d0b1-70ef-94ae-358b706515c2";
    const targetItemIds = [
      // "78cd3d43-694f-4ab8-94b7-9d21710cc7e8", // shirt

      // "4051cbd9-6039-4870-b55a-c488613a58f6", // pants
      // "0746fca7-ffb3-43a8-b4e3-d6f6e2cd293a",  // shoes
      "blazer", // shirt

      "shirt", // pants
      "pants",  // shoes
      "shoe"


    ];

    try {
      // Use the same API endpoint as HomePage
      const API_BASE = "https://3a42g82o4d.execute-api.us-east-2.amazonaws.com/dev";
      const itemsUrl = `${API_BASE}/s3v2?user_id=${encodeURIComponent(testUserId)}&signed=1&expiresIn=3600`;

      const response = await fetch(itemsUrl);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        console.log("API returned items:", data.items);

        // Filter for our specific 3 items
        const selectedItems: ClosetDataItem[] = [];

        for (const itemId of targetItemIds) {
          const item = data.items.find((i: any) => {
            const apiId = (i.id || i.item_id || "").toString().toLowerCase();
            const targetId = itemId.toLowerCase();
            return apiId.includes(targetId) || targetId.includes(apiId);
          });

          if (item && item.uri) {
            const category =
              itemId === targetItemIds[0] ? "Tops" :
              itemId === targetItemIds[1] ? "Pants" : "Shoes";

            console.log(`Found item: ${itemId}, category: ${category}, uri: ${item.uri}`);

            selectedItems.push({
              id: Date.now() + selectedItems.length,
              source: { uri: item.uri },
              type: "user",
              category
            });
          } else {
            console.log(`Item not found: ${itemId}`);
          }
        }

        console.log(`Selected ${selectedItems.length} items`);

        // Wait 1 second before showing the results
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (selectedItems.length > 0) {
          setNewEventOutfit(selectedItems);
        } else {
          Alert.alert("Error", "Could not load test outfit images.");
        }
      }
    } catch (error) {
      console.error("Error loading test outfit:", error);
      Alert.alert("Error", "Failed to load test outfit.");
    } finally {
      setIsGeneratingOutfit(false);
    }
  };

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

     <ScrollView
      style={styles.contentArea}
      contentContainerStyle={{
        paddingHorizontal: 15, 
        paddingTop: 15,        
        paddingBottom: 100,    
      }}
    >
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

            {(() => {
              const eventBlocks = [];
              let currentOverlapLevel = 0;
              let maxEndTimeInGroup = -1; 

              for (const event of selectedDayEvents) {
                const timeRegex = /^\d{2}:\d{2}$/;
                if (
                  !event.startTime ||
                  !event.endTime ||
                  !timeRegex.test(event.startTime) ||
                  !timeRegex.test(event.endTime)
                ) {
                  continue;
                }
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
                if (startMinutes >= maxEndTimeInGroup) {
                  currentOverlapLevel = 0;
                } else {
                  currentOverlapLevel++;
                }
                maxEndTimeInGroup = Math.max(maxEndTimeInGroup, endMinutes);
                const overlapOffset = (currentOverlapLevel % 4) * 10;
                const zIndex = currentOverlapLevel;

                eventBlocks.push(
                  <Pressable
                    key={event.id}
                    onLongPress={() => handleDeleteEvent(event.id)}
                    onPress={() => openEditEventModal(event)} 
                    style={[
                      styles.eventBlock,
                      {
                        top: clampedTop,
                        height: adjustedHeight,
                        backgroundColor: event.color || "#4A90E2",
                        borderLeftColor: event.color
                          ? darkenColor(event.color, 20)
                          : "#357ABD",
                        left: 4 + overlapOffset,
                        right: 10,
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
                    {event.outfit && event.outfit.length > 0 && (
                      <Ionicons
                        name="shirt"
                        size={12}
                        color="white"
                        style={styles.eventOutfitIcon}
                      />
                    )}
                  </Pressable>
                );
              }
              return eventBlocks;
            })()}
          </View>
        </View>

        {selectedDayEvents.length === 0 && (
          <Text style={styles.noEventsText}>
            No events scheduled for this day.
          </Text>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={isEventModalVisible}
        onRequestClose={closeEventModal} 
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={closeEventModal} 
        >
          <Pressable style={styles.modalView} onPress={() => {}}>
            <Text style={styles.modalTitle}>
              {editingEventId ? "Edit Event" : "Add New Event"}
            </Text>

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

            <View style={styles.outfitHeaderRow}>
              <Text style={styles.modalSubTitle}>Outfit</Text>
              <TouchableOpacity
                style={styles.generateOutfitButton}
                onPress={handleGenerateOutfit}
              >
                <Ionicons name="sparkles" size={18} color="#714054" />
                <Text style={styles.generateOutfitText}>Generate Outfit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.eventOutfitPreviewContainer}>
              {isGeneratingOutfit ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="sparkles" size={24} color="#714054" />
                  <Text style={styles.loadingText}>Generating outfit...</Text>
                </View>
              ) : newEventOutfit.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {newEventOutfit.map((item) => (
                    <Image
                      key={item.id}
                      source={item.source}
                      style={styles.eventOutfitPreviewImage}
                    />
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.noOutfitText}>No outfit selected.</Text>
              )}
              {!isGeneratingOutfit && (
                <TouchableOpacity
                  style={styles.addEventOutfitButton}
                  onPress={openOutfitForEvent}
                >
                  <Ionicons
                    name={newEventOutfit.length > 0 ? "pencil" : "add"}
                    size={20}
                    color="#714054"
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={[styles.modalButtonBase, styles.modalButtonCancel]}
                onPress={closeEventModal} 
              >
                <Text
                  style={[styles.modalButtonText, styles.modalButtonTextCancel]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButtonBase, styles.modalButtonConfirm]}
                onPress={handleSaveEvent}
              >
                <Text style={styles.modalButtonText}>
                  {editingEventId ? "Save Changes" : "Add Event"}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

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
              Select Outfit{" "}
              {outfitModalMode === "day" && `for ${selectedDate}`}
              {outfitModalMode === "event" && `for Event`}
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
        onPress={openAddEventModal} 
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
}

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
    backgroundColor: "#714054",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    bottom: 30, 
    right: 30, 
    zIndex: 10, 
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
    backgroundColor: "#4A90E2", 
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 6,
    overflow: "hidden",
    borderLeftWidth: 3,
    elevation: 1, 
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
  eventOutfitIcon: {
    position: "absolute",
    bottom: 3,
    right: 5,
    opacity: 0.8,
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
  modalSubTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#444",
    alignSelf: "flex-start",
    marginBottom: 10,
    marginTop: 10,

  },
  eventOutfitPreviewContainer: {
    width: "100%",
    height: 70,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderColor: "#eee",
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eventOutfitPreviewImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: "#f0f0f0",
  },
  noOutfitText: {
    flex: 1,
    fontStyle: "italic",
    color: "#888",
  },
  addEventOutfitButton: {
    padding: 10,
    backgroundColor: "#eee",
    borderRadius: 20,
  },
  outfitHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
    marginTop: 10,
  },
  generateOutfitButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9E3B4",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 5,
  },
  generateOutfitText: {
    color: "#714054",
    fontSize: 14,
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    color: "#714054",
    fontSize: 14,
    fontStyle: "italic",
  },
});