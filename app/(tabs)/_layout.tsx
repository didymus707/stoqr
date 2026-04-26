import { useAuth } from "@/stores/auth";
import { Tabs, Redirect } from "expo-router";
import { Colors } from "../../constants/theme";
import {
  Text,
  View,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";

export default function TabLayout() {
  const { session, loading } = useAuth();
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 700;

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.text.muted,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          borderTopWidth: 0.5,
          paddingBottom: 0,
          paddingTop: isSmallScreen ? 4 : 8,
          height: isSmallScreen ? 90 : 65,
        },
        tabBarLabelStyle: {
          fontSize: isSmallScreen ? 14 : 16,
          marginBottom: isSmallScreen ? 6 : 8,
        },
        tabBarIconStyle: {
          marginTop: isSmallScreen ? 4 : 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
          tabBarIcon: ({ color }) => <TabIcon emoji="📦" color={color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ color }) => <TabIcon emoji="📸" color={color} />,
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: "Compare",
          tabBarIcon: ({ color }) => <TabIcon emoji="💰" color={color} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  const { width } = useWindowDimensions();
  return (
    <Text style={{ fontSize: width < 700 ? 18 : 20, color }}>{emoji}</Text>
  );
}
