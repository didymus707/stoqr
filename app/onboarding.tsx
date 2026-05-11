import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors, FontSize, Spacing, BorderRadius } from "@/constants/theme";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    emoji: "🛒",
    title: "Running out at\nthe worst time?",
    subtitle:
      "Most people only realise they're out of milk when they need it most. There's a better way.",
    accent: "#4F46E5",
  },
  {
    id: "2",
    emoji: "📦",
    title: "Track what you have.\nGet alerted early.",
    subtitle:
      "StoQr monitors your household inventory and tells you before you run out — not after.",
    accent: "#059669",
  },
  {
    id: "3",
    emoji: "💰",
    title: "Find the cheapest\nprices near you.",
    subtitle:
      "Compare prices across Tesco, Aldi, Lidl and more. Never overpay for your weekly shop again.",
    accent: "#D97706",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleFinish = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/");
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleFinish();
    }
  };

  const handleSkip = () => handleFinish();

  const slide = SLIDES[currentIndex];
  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <View style={styles.slideContainer}>
        <View
          style={[
            styles.emojiContainer,
            { backgroundColor: slide.accent + "15" },
          ]}
        >
          <Text style={styles.emoji}>{slide.emoji}</Text>
        </View>

        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
                index === currentIndex && { backgroundColor: slide.accent },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: slide.accent }]}
          onPress={handleNext}
        >
          <Text style={styles.buttonText}>
            {isLast ? "Get started" : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  skipButton: {
    alignSelf: "flex-end",
    padding: Spacing.sm,
  },
  skipText: {
    fontSize: FontSize.sm,
    color: Colors.text.muted,
  },
  slideContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.lg,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  emoji: {
    fontSize: 56,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "700",
    color: Colors.text.primary,
    textAlign: "center",
    lineHeight: 36,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  footer: {
    gap: Spacing.lg,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 24,
  },
  button: {
    padding: Spacing.md,
    borderRadius: BorderRadius.full,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: FontSize.md,
    fontWeight: "600",
  },
});
