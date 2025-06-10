import { LinearGradient } from "expo-linear-gradient";
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
  emoji: string;
  description: string;
  example: string;
  tips: string[];
}

const gameTypes: GameType[] = [
  {
    title: "Anagram Solver",
    emoji: "🔤",
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
    emoji: "🔗",
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
    emoji: "📝",
    description: "Complete the sentence by filling in the missing word.",
    example: "The cat sat on the ___ → mat",
    tips: [
      "Read the sentence carefully",
      "Think about what makes sense",
      "Consider grammar and context",
    ],
  },
  {
    title: "Odd One Out",
    emoji: "🎯",
    description: "Identify which word doesn't belong with the others.",
    example: "Apple, Orange, Car, Banana → Car",
    tips: [
      "Look for categories or themes",
      "Find what most words have in common",
      "The odd one will be different",
    ],
  },
  {
    title: "Synonym Match",
    emoji: "📚",
    description: "Find the word that has the same or similar meaning.",
    example: "Happy → Joyful",
    tips: [
      "Think of words with similar meanings",
      "Consider different ways to express the same idea",
      "Eliminate antonyms first",
    ],
  },
  {
    title: "Spelling Bee",
    emoji: "🐝",
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

  useEffect(() => {
    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
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
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.gradient}>
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
              <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>❓ How to Play</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Game Overview */}
            <View style={styles.overviewSection}>
              <Text style={styles.sectionTitle}>🎮 Game Overview</Text>
              <View style={styles.overviewCard}>
                <Text style={styles.overviewText}>
                  Wordingo is a challenging word game where you face different
                  types of word puzzles in random order. You must answer
                  correctly to continue - one wrong answer ends your streak!
                </Text>

                <View style={styles.rulesList}>
                  <View style={styles.ruleItem}>
                    <Text style={styles.ruleEmoji}>🎯</Text>
                    <Text style={styles.ruleText}>
                      Answer all questions correctly to build your streak
                    </Text>
                  </View>

                  <View style={styles.ruleItem}>
                    <Text style={styles.ruleEmoji}>🔄</Text>
                    <Text style={styles.ruleText}>
                      Games are presented in random order
                    </Text>
                  </View>

                  <View style={styles.ruleItem}>
                    <Text style={styles.ruleEmoji}>📈</Text>
                    <Text style={styles.ruleText}>
                      Difficulty increases with each round
                    </Text>
                  </View>

                  <View style={styles.ruleItem}>
                    <Text style={styles.ruleEmoji}>❌</Text>
                    <Text style={styles.ruleText}>
                      One wrong answer resets your streak to 0
                    </Text>
                  </View>

                  <View style={styles.ruleItem}>
                    <Text style={styles.ruleEmoji}>🔥</Text>
                    <Text style={styles.ruleText}>
                      Play daily to maintain your streak
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Game Types */}
            <View style={styles.gameTypesSection}>
              <Text style={styles.sectionTitle}>🎲 Game Types</Text>

              {gameTypes.map((gameType, index) => (
                <View key={index} style={styles.gameTypeCard}>
                  <View style={styles.gameTypeHeader}>
                    <Text style={styles.gameTypeEmoji}>{gameType.emoji}</Text>
                    <Text style={styles.gameTypeTitle}>{gameType.title}</Text>
                  </View>

                  <Text style={styles.gameTypeDescription}>
                    {gameType.description}
                  </Text>

                  <View style={styles.exampleContainer}>
                    <Text style={styles.exampleLabel}>Example:</Text>
                    <Text style={styles.exampleText}>{gameType.example}</Text>
                  </View>

                  <View style={styles.tipsContainer}>
                    <Text style={styles.tipsLabel}>💡 Tips:</Text>
                    {gameType.tips.map((tip, tipIndex) => (
                      <Text key={tipIndex} style={styles.tipText}>
                        • {tip}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            {/* Scoring System */}
            <View style={styles.scoringSection}>
              <Text style={styles.sectionTitle}>🏆 Scoring & Progression</Text>
              <View style={styles.scoringCard}>
                <View style={styles.scoringItem}>
                  <Text style={styles.scoringEmoji}>⭐</Text>
                  <View style={styles.scoringInfo}>
                    <Text style={styles.scoringTitle}>Streak Score</Text>
                    <Text style={styles.scoringDesc}>
                      Your score equals your current streak
                    </Text>
                  </View>
                </View>

                <View style={styles.scoringItem}>
                  <Text style={styles.scoringEmoji}>🔄</Text>
                  <View style={styles.scoringInfo}>
                    <Text style={styles.scoringTitle}>Rounds</Text>
                    <Text style={styles.scoringDesc}>
                      Complete all 6 game types to finish a round
                    </Text>
                  </View>
                </View>

                <View style={styles.scoringItem}>
                  <Text style={styles.scoringEmoji}>📊</Text>
                  <View style={styles.scoringInfo}>
                    <Text style={styles.scoringTitle}>Difficulty</Text>
                    <Text style={styles.scoringDesc}>
                      Questions get harder with each new round
                    </Text>
                  </View>
                </View>

                <View style={styles.scoringItem}>
                  <Text style={styles.scoringEmoji}>🎯</Text>
                  <View style={styles.scoringInfo}>
                    <Text style={styles.scoringTitle}>Best Streak</Text>
                    <Text style={styles.scoringDesc}>
                      Your highest score is saved as your record
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Tips Section */}
            <View style={styles.tipsSection}>
              <Text style={styles.sectionTitle}>💡 General Tips</Text>
              <View style={styles.generalTipsCard}>
                <Text style={styles.generalTip}>
                  🧠 <Text style={styles.tipBold}>Stay Calm:</Text> Take your
                  time to think through each answer
                </Text>
                <Text style={styles.generalTip}>
                  🎯 <Text style={styles.tipBold}>Read Carefully:</Text> Make
                  sure you understand what&apos;s being asked
                </Text>
                <Text style={styles.generalTip}>
                  🔄 <Text style={styles.tipBold}>Practice Daily:</Text> Regular
                  play improves your word skills
                </Text>
                <Text style={styles.generalTip}>
                  📚 <Text style={styles.tipBold}>Learn from Mistakes:</Text>{" "}
                  Wrong answers are learning opportunities
                </Text>
                <Text style={styles.generalTip}>
                  🎮 <Text style={styles.tipBold}>Have Fun:</Text> Enjoy the
                  challenge and celebrate your progress!
                </Text>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  placeholder: {
    width: 60,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  overviewSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
  },
  overviewCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
  },
  overviewText: {
    fontSize: 16,
    color: "white",
    lineHeight: 24,
    marginBottom: 20,
  },
  rulesList: {
    gap: 12,
  },
  ruleItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  ruleEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  ruleText: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    flex: 1,
  },
  gameTypesSection: {
    marginBottom: 25,
  },
  gameTypeCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  gameTypeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  gameTypeEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  gameTypeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  gameTypeDescription: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
    lineHeight: 22,
  },
  exampleContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
  },
  exampleText: {
    fontSize: 15,
    color: "white",
    fontWeight: "500",
  },
  tipsContainer: {
    marginTop: 8,
  },
  tipsLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 4,
    paddingLeft: 8,
  },
  scoringSection: {
    marginBottom: 25,
  },
  scoringCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  scoringItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  scoringEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  scoringInfo: {
    flex: 1,
  },
  scoringTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
    marginBottom: 2,
  },
  scoringDesc: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
  },
  tipsSection: {
    marginBottom: 40,
  },
  generalTipsCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  generalTip: {
    fontSize: 15,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 22,
  },
  tipBold: {
    fontWeight: "bold",
    color: "white",
  },
});
