import { View, Text, StyleSheet } from "react-native";

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>StockSense</Text>
      <Text style={styles.subtitle}>Your intelligent inventory assistant</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    marginTop: 8,
  },
});
