import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Linking, Platform } from "react-native";
import { unitLabel } from "./unit";

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

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "StoQr Alerts",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  // check exisiting permisiions
  const { status: exisitingStatus } = await Notifications.getPermissionsAsync();

  // request if not granted
  if (exisitingStatus === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();

  if (Platform.OS === "web") return;

  return status === "granted";
};

export const sendLowStockNotification = async (
  itemName: string,
  quantity: number,
  unit: string,
) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${itemName} is running low`,
      body: `${quantity} ${unitLabel(quantity, unit)} left. Added to your shopping list.`,
      data: { type: "low_stock" },
    },
    trigger: null,
  });
};

export const sendOutOfStockNotification = async (itemName: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: `${itemName} is out`,
      body: "Added to your shopping list.",
      data: { type: "out_of_stock" },
    },
    trigger: null,
  });
};

export const turnOnAlerts = async () => {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) {
    Linking.openSettings();
    return false;
  }
  return (await requestNotificationPermissions()) === true;
};
