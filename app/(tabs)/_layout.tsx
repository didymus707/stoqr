import { useAuth } from "@/stores/auth";
import { Tabs, Redirect } from "expo-router";
import { Colors } from "../../constants/theme";
import {
  View,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import { Icon } from "@/components/ui/Icon";

const c = Colors.light;

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
        tabBarActiveTintColor: c.ink,
        tabBarInactiveTintColor: c.inkSubtle,
        tabBarStyle: {
          backgroundColor: c.surfaceRaised,
          borderTopColor: c.line,
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
          tabBarIcon: ({ color }) => (
            <Icon name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: "Inventory",
          tabBarIcon: ({ color }) => (
            <Icon name="cupboard" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: "List",
          tabBarIcon: ({ color }) => (
            <Icon name="list" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: "Compare",
          tabBarIcon: ({ color }) => (
            <Icon name="budget" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
