
import React, { useState } from "react";
import { View, Text, TextInput,Button, StyleSheet, Alert, Image, TouchableOpacity, ScrollView } from "react-native";
// import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
//import { SafeAreaView } from "react-native-safe-area-context/lib/typescript/src/SafeAreaView";

export default function CalendarPage() {
   const [selectedDate, setSelectedDate] = useState("");
   const screenWidth = Dimensions.get("window").width;
  return (
    <ScrollView style={styles.container}>
    <SafeAreaView style={{ flex: 1 }}>
    <View style={styles.container}>
       
       <View style={styles.header}>
              <Text style={styles.title0}>ClosetCanvas</Text>
              <Entypo name="menu" size={28} color="white" />
            </View>
      
        <View style={styles.headerRow}>
      <Image source={require("../../assets/images/calendarIcon.svg")}
        style={{ width: 50, height: 50 }} />
     


      <Text style={styles.title}>Weekly Planner</Text>
      </View>


 <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: "#4B0082" },
        }}
        theme={{
          backgroundColor: "#ffffff",
          calendarBackground: "#ffffff",
          textSectionTitleColor: "#4B0082",
          selectedDayBackgroundColor: "#4B0082",
          selectedDayTextColor: "#ffffff",
          todayTextColor: "#FF5722",
          dayTextColor: "#333333",
          textDisabledColor: "#d9e1e8",
          monthTextColor: "#4B0082",
          arrowColor: "#4B0082",
          textMonthFontWeight: "bold",
          textDayFontSize: 16,
          textMonthFontSize: 20,
          textDayHeaderFontSize: 14,
        }}
      />

    
      {selectedDate ? (
        <Text style={styles.selectedText}>
          Selected Date: <Text style={{ fontWeight: "bold" }}>{selectedDate}</Text>
        </Text>
      ) : null}



         <View style={[styles.block, { backgroundColor: "#E9D8FD" }]}>
        <Text style={styles.blockTitle}>Portfolio</Text>
        <Text style={styles.blockTime}>10am - 10:30am</Text>
      </View>

      <View style={[styles.block, { backgroundColor: "#D1EFDA" }]}>
        <Text style={styles.blockTitle}>Meeting</Text>
        <Text style={styles.blockTime}>11am - 12pm</Text>
      </View>

      <View style={[styles.block, { backgroundColor: "#F9E2EA" }]}>
        <Text style={styles.blockTitle}>Lunch</Text>
        <Text style={styles.blockTime}>1pm - 2pm</Text>
      </View>

      <View style={[styles.block, { backgroundColor: "#E9D8FD" }]}>
        <Text style={styles.blockTitle}>Sleep</Text>
        <Text style={styles.blockTime}>10pm - 7am</Text>
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
  },
  icon: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  title: {
    fontSize: 46,
    fontWeight: "400",
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  blockTitle: {
    fontSize: 18,
    color: "#333",
  },
  blockTime: {
    fontSize: 14,
    color: "#555",
  },
   bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#380065",
    height: 70,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 10,
  },

  navItem: {
    alignItems: "center",
  },

  navText: {
    color: "#fafafa",
    fontSize: 12,
    marginTop: 3,
  },
});



































































// import React, { useState } from "react";
// import { View, Text, TextInput,Button, StyleSheet, Alert, Image, TouchableOpacity } from "react-native";




// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     marginTop: 80,
//     justifyContent: "flex-start",
//     alignItems: "flex-start",
//     backgroundColor: "#fff",
//   },
//   calendarImage: {
    
//     width: 50,
//     height: 50,
//     marginBottom: 20,
//   }

// });

// export default function LoginScreen() {
//  return (
//     <View style={styles.container}>

//      <Image
//       source={require("../../assets/images/calendarIcon.svg")}
//       style={{ width: 50, height:50 }}
//       />


//       <Text style={{fontSize: 24, fontWeight: "bold", marginBottom: 20}}>Calendar Page</Text>



//         </View>
//       )

// }


// nfweufhasdhfaksjdfhaksjdfaksjdfhaksjdfhasdkljfhasdlkjfhadskljfhdaskljfhaklsdjafh


// import React from 'react';

// // --- SVG Icon Components ---
// // These components replace the icons from @expo/vector-icons for web compatibility.

// const CalendarIcon = ({ className = 'w-6 h-6', color = 'currentColor' }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//     <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
//     <line x1="16" y1="2" x2="16" y2="6"></line>
//     <line x1="8" y1="2" x2="8" y2="6"></line>
//     <line x1="3" y1="10" x2="21" y2="10"></line>
//   </svg>
// );

// const MenuIcon = ({ className = 'w-6 h-6', color = 'currentColor' }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//     <line x1="3" y1="12" x2="21" y2="12"></line>
//     <line x1="3" y1="6" x2="21" y2="6"></line>
//     <line x1="3" y1="18" x2="21" y2="18"></line>
//   </svg>
// );

// const ShirtIcon = ({ className = 'w-6 h-6', color = 'currentColor' }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//         <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"></path>
//     </svg>
// );

// const UsersIcon = ({ className = 'w-6 h-6', color = 'currentColor' }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//         <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
//         <circle cx="9" cy="7" r="4"></circle>
//         <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
//         <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
//     </svg>
// );

// const HomeIcon = ({ className = 'w-6 h-6', color = 'currentColor' }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//     <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
//     <polyline points="9 22 9 12 15 12 15 22"></polyline>
//   </svg>
// );

// const BarChartIcon = ({ className = 'w-6 h-6', color = 'currentColor' }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//     <line x1="12" y1="20" x2="12" y2="10"></line>
//     <line x1="18" y1="20" x2="18" y2="4"></line>
//     <line x1="6" y1="20" x2="6" y2="16"></line>
//   </svg>
// );

// const ChevronLeftIcon = ({ className = 'w-6 h-6', color = 'currentColor' }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//     <polyline points="15 18 9 12 15 6"></polyline>
//   </svg>
// );

// const ChevronRightIcon = ({ className = 'w-6 h-6', color = 'currentColor' }) => (
//   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
//     <polyline points="9 18 15 12 9 6"></polyline>
//   </svg>
// );


// // --- Mock Data ---
// const scheduleData = [
//   { title: 'Portfolio', time: '10am-10:30am', color: 'bg-purple-200', textColor: 'text-purple-800' },
//   { title: 'Meeting', time: '11am-12pm', color: 'bg-green-200', textColor: 'text-green-800' },
//   { title: 'Lunch', time: '1pm-2pm', color: 'bg-pink-200', textColor: 'text-pink-800' },
//   { title: 'Sleep', time: '10pm-7am', color: 'bg-indigo-200', textColor: 'text-indigo-800' },
// ];

// const calendarDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
// const calendarDates = [
//   ...Array.from({ length: 31 }, (_, i) => ({ day: i + 1, currentMonth: true })),
//   ...Array.from({ length: 4 }, (_, i) => ({ day: i + 1, currentMonth: false })),
// ];

// const bottomNavItems = [
//     { name: 'Wardrobe', Icon: ShirtIcon, active: false },
//     { name: 'Community', Icon: UsersIcon, active: false },
//     { name: 'Home', Icon: HomeIcon, active: false },
//     { name: 'Planner', Icon: CalendarIcon, active: true },
//     { name: 'Analytics', Icon: BarChartIcon, active: false },
// ];


// // --- Main App Component ---
// export default function App() {
//   return (
//     <div className="bg-violet-800 font-sans antialiased text-gray-800">
//         <div className="relative min-h-screen bg-gray-100 md:w-96 md:mx-auto md:shadow-lg">
//             <Header />
//             <main className="pt-20 pb-24">
//                 <div className="p-4">
//                     <div className="flex items-center mb-4">
//                         <CalendarIcon className="w-8 h-8 text-violet-500" />
//                         <h2 className="text-3xl font-bold text-gray-800 ml-3">Weekly Planner</h2>
//                     </div>

//                     <ScheduleList />
//                     <Calendar />
//                 </div>
//             </main>
//             <BottomNavBar />
//         </div>
//     </div>
//   );
// }

// // --- Reusable Components ---

// const Header = () => (
//     <header className="bg-violet-800 h-16 flex items-center justify-between px-4 fixed top-0 w-full md:w-96 z-10">
//         <h1 style={{fontFamily: 'serif', fontWeight: 'bold'}} className="text-white text-3xl italic">ClosetCanvas</h1>
//         <MenuIcon className="w-7 h-7 text-white" />
//     </header>
// );

// const ScheduleList = () => (
//     <div className="mb-6 space-y-3">
//         {scheduleData.map((item, index) => (
//             <div key={index} className={`flex justify-between items-center p-4 rounded-xl ${item.color}`}>
//                 <p className={`text-lg font-semibold ${item.textColor}`}>{item.title}</p>
//                 <p className={`text-base font-medium ${item.textColor}`}>{item.time}</p>
//             </div>
//         ))}
//     </div>
// );

// const Calendar = () => (
//     <div className="bg-white rounded-2xl p-4 shadow-md">
//         <div className="flex justify-between items-center mb-4">
//             <ChevronLeftIcon className="w-6 h-6 text-gray-400 cursor-pointer" />
//             <p className="text-xl font-bold text-gray-800">May 2023</p>
//             <ChevronRightIcon className="w-6 h-6 text-gray-400 cursor-pointer" />
//         </div>

//         <div className="grid grid-cols-7 gap-y-2 text-center mb-2">
//             {calendarDays.map((day) => (
//                 <div key={day} className="text-gray-500 font-medium text-sm">{day}</div>
//             ))}
//         </div>

//         <div className="grid grid-cols-7 gap-y-2 text-center">
//             {/* Placeholder for empty days at the start of the month */}
//             <div className="w-10 h-10"></div>
//             <div className="w-10 h-10"></div>


//             {calendarDates.map(({day, currentMonth}, index) => {
//                 const isSelected = day === 18 && currentMonth;
//                 const textColor = isSelected ? 'text-white' : currentMonth ? 'text-gray-700' : 'text-gray-300';
//                 const dayStyle = isSelected ? 'bg-violet-600' : '';
//                 return (
//                     <div key={index} className={`w-10 h-10 flex items-center justify-center rounded-full mx-auto ${dayStyle} cursor-pointer`}>
//                         <span className={`text-base ${textColor}`}>{day}</span>
//                     </div>
//                 );
//             })}
//         </div>
//     </div>
// );

// const BottomNavBar = () => (
//     <footer className="absolute bottom-0 left-0 right-0 h-20 bg-violet-800 flex justify-around items-center rounded-t-3xl">
//         {bottomNavItems.map(({ name, Icon, active }, index) => {
//             const color = active ? 'white' : '#A78BFA'; // Active: white, Inactive: violet-300
//             return (
//                 <div key={index} className="flex flex-col items-center cursor-pointer">
//                     <Icon className="w-6 h-6" color={color} />
//                     <p style={{color}} className="text-xs mt-1">{name}</p>
//                 </div>
//             );
//         })}
//     </footer>
// );

