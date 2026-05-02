import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "./supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotifications = async (userId: string) => {
  if (!Device.isDevice) {
    console.log("Push notifications require a real device");
    return;
  }

  // check exisiting permisiions
  const { status: exisitingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = exisitingStatus;

  // request if not granted
  if (exisitingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Notification permission denied");
    return;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId,
  });

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "StockSense Alerts",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  await supabase
    .from("profiles")
    .update({ push_token: token })
    .eq("id", userId);

  return token;
};

export const sendLowStockNotification = async (
  itemName: string,
  quantity: number,
  unit: string,
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Low Stock Alert 📦",
      body: `${itemName} is running low — only ${quantity} ${unit} left`,
      data: { type: "low_stock" },
    },
    trigger: null,
  });
};

export const sendOutOftockNotification = async (
  itemName: string,
  quantity: number,
  unit: string,
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Out of Stock ⚠️",
      body: `You've run out of ${itemName}. Time to restock!`,
      data: { type: "out_of_stock" },
    },
    trigger: null,
  });
};
