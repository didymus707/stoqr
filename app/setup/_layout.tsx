import { useAuth } from "@/stores/auth";
import { Redirect, Stack } from "expo-router";

export default function SetupLayout() {
  const { session, loading } = useAuth();
  if (loading) return null;
  if (!session) return <Redirect href="/sign-in" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="postcode" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
