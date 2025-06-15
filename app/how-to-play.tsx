import { GlassCard } from "@/components/ui/GlassCard";
import { MinimalButton } from "@/components/ui/MinimalButton";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
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
  icon: React.ComponentProps<typeof Ionicons>["name"];
  color: string;
}

interface Rule {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  description: string;
}

const gameTypes: GameType[] = [
  {
    title: "Anagram Solver",
    description: "Rearrange the given letters to form a valid word.",
    example: "LISTEN → SILENT",
    icon: "shuffle",
    color: "#FF6B6B",
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
    icon: "link",
    color: "#4ECDC4",
    tips: [
      "Think about antonyms (opposites)",
      "Consider related concepts",
      "Eliminate obviously wrong choices",
    ],
  },
  {
    title: "Wordle",
    description:
      "Guess the secret 5-letter word in 6 tries. After each guess you'll see colored feedback.",
    example: "Secret word: CRANE  |  Guess: SLATE → S⬜ L⬜ A🟩 T⬜ E🟩",
    icon: "grid",
    color: "#45B7D1",
    tips: [
      "Start with common vowels and consonants",
      "Use the color feedback to eliminate letters",
      "Think strategically – each guess should give you new information",
    ],
  },
  {
    title: "Spelling Challenge",
    description: "Spell the word correctly based on its definition.",
    example: "A large African animal with a trunk → elephant",
    icon: "text",
    color: "#96CEB4",
    tips: [
      "Sound out the word in your head",
      "Think about common spelling patterns",
      "Break complex words into parts",
    ],
  },
];

const gameRules: Rule[] = [
  {
    icon: "checkmark-circle",
    title: "Perfect Streak",
    description: "Answer all questions correctly to build your streak",
  },
  {
    icon: "shuffle",
    title: "Random Order",
    description: "Games are presented in random order for variety",
  },
  {
    icon: "trending-up",
    title: "Progressive Difficulty",
    description: "Difficulty increases with each round you complete",
  },
  {
    icon: "close-circle",
    title: "One Strike Rule",
    description: "One wrong answer resets your streak to 0",
  },
  {
    icon: "calendar",
    title: "Daily Challenge",
    description: "Play daily to maintain your streak and improve",
  },
];

export default function HowToPlayScreen() {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [cardAnimations] = useState(gameTypes.map(() => new Animated.Value(0)));
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

    // Stagger card animations
    const cardAnimationSequence = cardAnimations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      })
    );

    setTimeout(() => {
      Animated.parallel(cardAnimationSequence).start();
    }, 300);
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
            <Ionicons name="arrow-back" size={24} color={colors.text} />
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
          {/* Hero Section */}
          <GlassCard style={styles.heroCard}>
            <View style={styles.heroContent}>
              <View style={styles.heroIconContainer}>
                <Ionicons
                  name="game-controller"
                  size={48}
                  color={colors.highlight}
                />
              </View>
              <Text style={[styles.heroTitle, { color: colors.text }]}>
                Master the Word Challenge
              </Text>
              <Text
                style={[styles.heroSubtitle, { color: colors.textSecondary }]}
              >
                Test your vocabulary skills across multiple game types. Build
                streaks, challenge yourself, and become a word master!
              </Text>
            </View>
          </GlassCard>

          {/* Quick Rules */}
          <View style={styles.rulesSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Game Rules
            </Text>
            <View style={styles.rulesGrid}>
              {gameRules.map((rule, index) => (
                <GlassCard key={index} style={styles.ruleCard}>
                  <View style={styles.ruleContent}>
                    <View
                      style={[
                        styles.ruleIconContainer,
                        { backgroundColor: colors.highlight + "20" },
                      ]}
                    >
                      <Ionicons
                        name={rule.icon}
                        size={20}
                        color={colors.text}
                      />
                    </View>
                    <Text style={[styles.ruleTitle, { color: colors.text }]}>
                      {rule.title}
                    </Text>
                    <Text
                      style={[
                        styles.ruleDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {rule.description}
                    </Text>
                  </View>
                </GlassCard>
              ))}
            </View>
          </View>

          {/* Game Types */}
          <View style={styles.gameTypesSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Game Types
            </Text>
            <Text
              style={[styles.sectionSubtitle, { color: colors.textSecondary }]}
            >
              Master these four different word challenges
            </Text>

            {gameTypes.map((gameType, index) => (
              <Animated.View
                key={index}
                style={{
                  opacity: cardAnimations[index],
                  transform: [
                    {
                      translateY: cardAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                }}
              >
                <GlassCard style={styles.gameTypeCard}>
                  <View style={styles.gameTypeHeader}>
                    <View
                      style={[
                        styles.gameTypeIconContainer,
                        { backgroundColor: gameType.color + "20" },
                      ]}
                    >
                      <Ionicons
                        name={gameType.icon}
                        size={24}
                        color={gameType.color}
                      />
                    </View>
                    <View style={styles.gameTypeHeaderText}>
                      <Text
                        style={[styles.gameTypeTitle, { color: colors.text }]}
                      >
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
                    </View>
                  </View>

                  <View style={styles.exampleContainer}>
                    <View
                      style={[
                        styles.exampleBadge,
                        { backgroundColor: colors.highlight + "15" },
                      ]}
                    >
                      <Text
                        style={[styles.exampleLabel, { color: colors.text }]}
                      >
                        Example
                      </Text>
                    </View>
                    <Text style={[styles.exampleText, { color: colors.text }]}>
                      {gameType.example}
                    </Text>
                  </View>

                  <View style={styles.tipsContainer}>
                    <Text style={[styles.tipsTitle, { color: colors.text }]}>
                      Pro Tips
                    </Text>
                    {gameType.tips.map((tip, tipIndex) => (
                      <View key={tipIndex} style={styles.tipItem}>
                        <View
                          style={[
                            styles.tipBullet,
                            { backgroundColor: gameType.color },
                          ]}
                        />
                        <Text
                          style={[
                            styles.tipText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {tip}
                        </Text>
                      </View>
                    ))}
                  </View>
                </GlassCard>
              </Animated.View>
            ))}
          </View>

          {/* Scoring Section */}
          <GlassCard style={styles.scoringCard}>
            <View style={styles.scoringHeader}>
              <View
                style={[
                  styles.scoringIconContainer,
                  { backgroundColor: colors.success + "20" },
                ]}
              >
                <Ionicons name="trophy" size={32} color={colors.success} />
              </View>
              <Text style={[styles.scoringTitle, { color: colors.text }]}>
                Scoring & Streaks
              </Text>
            </View>
            <Text style={[styles.scoringText, { color: colors.textSecondary }]}>
              Your goal is to build the longest streak possible. Each correct
              answer extends your streak, while a wrong answer resets it to
              zero. Daily streaks are maintained by playing at least once per
              day.
            </Text>
            <View style={styles.scoringFeatures}>
              <View style={styles.scoringFeature}>
                <Ionicons name="flame" size={16} color={colors.warning} />
                <Text
                  style={[
                    styles.scoringFeatureText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Daily streak tracking
                </Text>
              </View>
              <View style={styles.scoringFeature}>
                <Ionicons name="star" size={16} color={colors.highlight} />
                <Text
                  style={[
                    styles.scoringFeatureText,
                    { color: colors.textSecondary },
                  ]}
                >
                  Personal best records
                </Text>
              </View>
            </View>
          </GlassCard>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <MinimalButton
            title="Start Playing"
            onPress={() => router.replace("/game")}
            variant="accent"
            iconName="play"
            style={styles.startButton}
          />
          <MinimalButton
            title="View Stats"
            onPress={() => router.push("/stats")}
            variant="secondary"
            iconName="stats-chart"
            style={styles.statsButton}
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },

  // Hero Section
  heroCard: {
    marginBottom: 32,
    padding: 0,
    overflow: "hidden",
  },
  heroContent: {
    padding: 32,
    alignItems: "center",
    textAlign: "center",
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 235, 59, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  heroTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    marginBottom: 12,
    letterSpacing: -0.6,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 24,
    letterSpacing: 0.2,
  },

  // Rules Section
  rulesSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
    letterSpacing: 0.3,
  },
  rulesGrid: {
    gap: 12,
  },
  ruleCard: {
    padding: 20,
  },
  ruleContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  ruleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  ruleTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 4,
    letterSpacing: -0.2,
    flex: 1,
  },
  ruleDescription: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    letterSpacing: 0.2,
    flex: 2,
  },

  // Game Types Section
  gameTypesSection: {
    marginBottom: 32,
  },
  gameTypeCard: {
    marginBottom: 20,
    padding: 24,
  },
  gameTypeHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  gameTypeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  gameTypeHeaderText: {
    flex: 1,
  },
  gameTypeTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  gameTypeDescription: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
    letterSpacing: 0.2,
  },

  // Example Section
  exampleContainer: {
    marginBottom: 24,
  },
  exampleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 12,
  },
  exampleLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  exampleText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.1,
    lineHeight: 24,
  },

  // Tips Section
  tipsContainer: {
    gap: 12,
  },
  tipsTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 12,
  },
  tipText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 20,
    letterSpacing: 0.2,
  },

  // Scoring Section
  scoringCard: {
    marginBottom: 24,
    padding: 24,
  },
  scoringHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  scoringIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  scoringTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
  },
  scoringText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    letterSpacing: 0.2,
    marginBottom: 20,
  },
  scoringFeatures: {
    gap: 12,
  },
  scoringFeature: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoringFeatureText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginLeft: 8,
    letterSpacing: 0.2,
  },

  // Action Container
  actionContainer: {
    paddingBottom: 40,
    gap: 12,
  },
  startButton: {
    width: "100%",
  },
  statsButton: {
    width: "100%",
  },
});
