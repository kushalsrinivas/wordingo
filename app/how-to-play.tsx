import { GlassCard } from "@/components/ui/GlassCard";
import { MinimalButton } from "@/components/ui/MinimalButton";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface GameType {
  title: string;
  description: string;
  example: string;
  tips: string[];
}

const gameTypes: GameType[] = [
  {
    title: "Anagram Solver",
    description: "Rearrange the given letters to form a valid word.",
    example: "LISTEN → SILENT",
    tips: [
      "Look for common letter patterns",
      "Try different combinations systematically",
      "Think of words that use all the letters",
    ],
  },
  {
    title: "Word Association",
    description: "Find the word that has the opposite or related meaning.",
    example: "Hot → Cold (opposite)",
    tips: [
      "Think about antonyms (opposites)",
      "Consider related concepts",
      "Eliminate obviously wrong choices",
    ],
  },
  {
    title: "Fill in the Blanks",
    description: "Complete the sentence by filling in the missing word.",
    example: "The cat sat on the ___ → mat",
    tips: [
      "Read the sentence carefully",
      "Think about what makes sense",
      "Consider grammar and context",
    ],
  },
  {
    title: "Spelling Challenge",
    description: "Spell the word correctly based on its definition.",
    example: "A large African animal with a trunk → elephant",
    tips: [
      "Sound out the word in your head",
      "Think about common spelling patterns",
      "Break complex words into parts",
    ],
  },
];

export default function HowToPlayScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const goBack = () => {
    router.back();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: colors.text }]}>
              ← Back
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            How to Play
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Game Overview */}
          <GlassCard style={styles.overviewCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Game Overview
            </Text>
            <Text
              style={[styles.overviewText, { color: colors.textSecondary }]}
            >
              Wordingo is a challenging word game where you face different types
              of word puzzles in random order. You must answer correctly to
              continue - one wrong answer ends your streak!
            </Text>

            <View style={styles.rulesList}>
              <View style={styles.ruleItem}>
                <View
                  style={[styles.ruleDot, { backgroundColor: colors.text }]}
                />
                <Text
                  style={[styles.ruleText, { color: colors.textSecondary }]}
                >
                  Answer all questions correctly to build your streak
                </Text>
              </View>

              <View style={styles.ruleItem}>
                <View
                  style={[styles.ruleDot, { backgroundColor: colors.text }]}
                />
                <Text
                  style={[styles.ruleText, { color: colors.textSecondary }]}
                >
                  Games are presented in random order
                </Text>
              </View>

              <View style={styles.ruleItem}>
                <View
                  style={[styles.ruleDot, { backgroundColor: colors.text }]}
                />
                <Text
                  style={[styles.ruleText, { color: colors.textSecondary }]}
                >
                  Difficulty increases with each round
                </Text>
              </View>

              <View style={styles.ruleItem}>
                <View
                  style={[styles.ruleDot, { backgroundColor: colors.text }]}
                />
                <Text
                  style={[styles.ruleText, { color: colors.textSecondary }]}
                >
                  One wrong answer resets your streak to 0
                </Text>
              </View>

              <View style={styles.ruleItem}>
                <View
                  style={[styles.ruleDot, { backgroundColor: colors.text }]}
                />
                <Text
                  style={[styles.ruleText, { color: colors.textSecondary }]}
                >
                  Play daily to maintain your streak
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Game Types */}
          <Text style={[styles.gameTypesTitle, { color: colors.text }]}>
            Game Types
          </Text>

          {gameTypes.map((gameType, index) => (
            <GlassCard key={index} style={styles.gameTypeCard}>
              <Text style={[styles.gameTypeTitle, { color: colors.text }]}>
                {gameType.title}
              </Text>
              <Text
                style={[
                  styles.gameTypeDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {gameType.description}
              </Text>

              <View style={styles.exampleSection}>
                <Text
                  style={[styles.exampleLabel, { color: colors.textTertiary }]}
                >
                  Example:
                </Text>
                <Text style={[styles.exampleText, { color: colors.text }]}>
                  {gameType.example}
                </Text>
              </View>

              <View style={styles.tipsSection}>
                <Text
                  style={[styles.tipsLabel, { color: colors.textTertiary }]}
                >
                  Tips:
                </Text>
                {gameType.tips.map((tip, tipIndex) => (
                  <View key={tipIndex} style={styles.tipItem}>
                    <View
                      style={[
                        styles.tipDot,
                        { backgroundColor: colors.textTertiary },
                      ]}
                    />
                    <Text
                      style={[styles.tipText, { color: colors.textSecondary }]}
                    >
                      {tip}
                    </Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          ))}

          {/* Scoring Section */}
          <GlassCard style={styles.scoringCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Scoring & Streaks
            </Text>
            <Text style={[styles.scoringText, { color: colors.textSecondary }]}>
              Your goal is to build the longest streak possible. Each correct
              answer extends your streak, while a wrong answer resets it to
              zero. Daily streaks are maintained by playing at least once per
              day.
            </Text>
          </GlassCard>
        </ScrollView>

        {/* Back Button */}
        <View style={styles.actionContainer}>
          <MinimalButton
            title="Start Playing"
            onPress={() => router.replace("/game")}
            variant="primary"
            style={styles.startButton}
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 60,
  },
  scrollContainer: {
    flex: 1,
  },
  overviewCard: {
    marginBottom: 32,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  overviewText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  rulesList: {
    gap: 12,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  ruleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 8,
    marginRight: 12,
  },
  ruleText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  gameTypesTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 20,
    letterSpacing: -0.2,
  },
  gameTypeCard: {
    marginBottom: 20,
    padding: 20,
  },
  gameTypeTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  gameTypeDescription: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  exampleSection: {
    marginBottom: 16,
  },
  exampleLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 4,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  exampleText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
  tipsSection: {
    gap: 8,
  },
  tipsLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tipDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginTop: 6,
    marginRight: 10,
  },
  tipText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 18,
    letterSpacing: 0.3,
  },
  scoringCard: {
    marginBottom: 24,
    padding: 24,
  },
  scoringText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  actionContainer: {
    paddingBottom: 40,
  },
  startButton: {
    width: "100%",
  },
});
