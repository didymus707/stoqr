import { useAuth } from "@/stores/auth";
import { Tabs, Redirect } from "expo-router";
import { Colors, Fonts } from "../../constants/theme";
import { View, ActivityIndicator, useWindowDimensions } from "react-native";
import { Icon } from "@/components/ui/Icon";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const c = Colors.light;

export default function TabLayout() {
  const { session, loading } = useAuth();
  const [onboarded, setOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    setOnboarded(null);
    if (!session) return;
    supabase
      .from("profiles")
      .select("onboarded_at")
      .eq("id", session.user.id)
      .single()
      .then(({ data, error }) =>
        setOnboarded(error ? true : !!data?.onboarded_at),
      );
  }, [session]);

  if (loading) return <LoadingScreen />;
  if (!session) return <Redirect href="/sign-in" />;
  if (onboarded === null) return <LoadingScreen />;
  if (!onboarded) return <Redirect href="/setup/postcode" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.ink,
        tabBarInactiveTintColor: c.inkSubtle,
        tabBarStyle: {
          backgroundColor: c.surfaceRaised,
          borderTopColor: c.line,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.bodyMedium,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Icon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="cupboard"
        options={{
          title: "Cupboard",
          tabBarIcon: ({ color }) => <Icon name="cupboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="shopping"
        options={{
          title: "List",
          tabBarIcon: ({ color }) => <Icon name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: "Compare",
          tabBarIcon: ({ color }) => <Icon name="budget" color={color} />,
        }}
      />
    </Tabs>
  );
}

function LoadingScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: c.surface,
      }}
    >
      <ActivityIndicator color={c.accent} />
    </View>
  );
}
