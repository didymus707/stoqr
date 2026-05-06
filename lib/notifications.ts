import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { supabase } from "./supabase";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const requestNotificationPermissions = async () => {
  if (!Device.isDevice) {
    return false;
  }

  // check exisiting permisiions
  const { status: exisitingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = exisitingStatus;

  // request if not granted
  if (exisitingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "StoQr Alerts",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return finalStatus === "granted";
};

export const sendLowStockNotification = async (
  itemName: string,
  quantity: number,
  unit: string,
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "📦 Running Low",
      body: `${itemName} is running low — only ${quantity} ${unit} left`,
      data: { type: "low_stock" },
    },
    trigger: null,
  });
};

export const sendOutOfStockNotification = async (itemName: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Out of Stock ⚠️",
      body: `You've run out of ${itemName}. Add it to your shopping list!`,
      data: { type: "out_of_stock" },
    },
    trigger: null,
  });
};
