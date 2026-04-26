import { View, Text, StyleSheet } from "react-native";
import { Colors, FontSize } from "../../constants/theme";

export default function CompareScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Compare</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: FontSize.xl,
    fontWeight: "700",
    color: Colors.text.primary,
  },
});
