import { GlassCard } from "@/components/ui/GlassCard";
import { MinimalButton } from "@/components/ui/MinimalButton";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { gameEngine } from "@/services/gameEngine";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

interface SessionSummary {
  totalGames: number;
  correctAnswers: number;
  incorrectAnswers: number;
  averageTime: number;
  gameBreakdown: Array<{
    gameName: string;
    played: number;
    correct: number;
    averageTime: number;
  }>;
}

export default function ResultScreen() {
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    loadSessionSummary();

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

  const loadSessionSummary = async () => {
    try {
      const session = gameEngine.getCurrentSession();
      if (session) {
        const sessionSummary = await gameEngine.getSessionSummary(
          session.sessionId
        );
        setSummary(sessionSummary);
      }
    } catch (error) {
      console.error("Failed to load session summary:", error);
    }
  };

  const goHome = () => {
    gameEngine.cleanupSession();
    router.replace("/");
  };

  const playAgain = () => {
    gameEngine.cleanupSession();
    router.replace("/game");
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    return `${seconds}s`;
  };

  const getPerformanceLevel = (correct: number, total: number) => {
    const percentage = total > 0 ? (correct / total) * 100 : 0;
    if (percentage >= 80) return "Excellent";
    if (percentage >= 60) return "Good";
    if (percentage >= 40) return "Fair";
    return "Keep Practicing";
  };

  const getMotivationalMessage = (score: number) => {
    if (score >= 10) return "Outstanding performance! You're a word master!";
    if (score >= 5) return "Great job! Keep practicing to improve even more!";
    if (score >= 1) return "Good effort! Every game makes you stronger!";
    return "Don't give up! Practice makes perfect!";
  };

  if (!summary) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading results...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={[styles.title, { color: colors.text }]}>
            Game Complete
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Here's how you performed
          </Text>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Score Card */}
          <GlassCard style={styles.scoreCard}>
            <View style={styles.scoreContent}>
              <Text style={[styles.scoreNumber, { color: colors.text }]}>
                {summary.correctAnswers}
              </Text>
              <Text
                style={[styles.scoreLabel, { color: colors.textSecondary }]}
              >
                Correct Answers
              </Text>
              <Text style={[styles.totalGames, { color: colors.textTertiary }]}>
                out of {summary.totalGames} games
              </Text>
              <View style={styles.performanceIndicator}>
                <Text style={[styles.performanceText, { color: colors.text }]}>
                  {getPerformanceLevel(
                    summary.correctAnswers,
                    summary.totalGames
                  )}
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <GlassCard style={styles.statCard}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {summary.totalGames}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Games
              </Text>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {formatTime(summary.averageTime)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Avg Time
              </Text>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {summary.totalGames > 0
                  ? Math.round(
                      (summary.correctAnswers / summary.totalGames) * 100
                    )
                  : 0}
                %
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Accuracy
              </Text>
            </GlassCard>
          </View>

          {/* Game Breakdown */}
          {summary.gameBreakdown.length > 0 && (
            <GlassCard style={styles.breakdownCard}>
              <Text style={[styles.breakdownTitle, { color: colors.text }]}>
                Game Breakdown
              </Text>
              {summary.gameBreakdown.map((game, index) => (
                <View
                  key={index}
                  style={[
                    styles.gameBreakdownItem,
                    index < summary.gameBreakdown.length - 1 && {
                      borderBottomColor: colors.border,
                      borderBottomWidth: 1,
                    },
                  ]}
                >
                  <View style={styles.gameInfo}>
                    <Text style={[styles.gameName, { color: colors.text }]}>
                      {game.gameName}
                    </Text>
                    <Text
                      style={[
                        styles.gameStats,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {game.correct}/{game.played} correct •{" "}
                      {formatTime(game.averageTime)} avg
                    </Text>
                  </View>
                  <View style={styles.gameScore}>
                    <Text
                      style={[styles.gamePercentage, { color: colors.text }]}
                    >
                      {game.played > 0
                        ? Math.round((game.correct / game.played) * 100)
                        : 0}
                      %
                    </Text>
                  </View>
                </View>
              ))}
            </GlassCard>
          )}

          {/* Motivational Message */}
          <GlassCard style={styles.messageCard}>
            <Text style={[styles.messageText, { color: colors.textSecondary }]}>
              {getMotivationalMessage(summary.correctAnswers)}
            </Text>
          </GlassCard>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <MinimalButton
            title="Play Again"
            onPress={playAgain}
            variant="primary"
            style={styles.primaryButton}
          />
          <MinimalButton
            title="Go Home"
            onPress={goHome}
            variant="secondary"
            style={styles.secondaryButton}
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
    paddingTop: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  scrollContainer: {
    flex: 1,
  },
  scoreCard: {
    marginBottom: 24,
    minHeight: 160,
  },
  scoreContent: {
    alignItems: "center",
    padding: 32,
  },
  scoreNumber: {
    fontSize: 48,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    letterSpacing: -1,
  },
  scoreLabel: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  totalGames: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  performanceIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  performanceText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minHeight: 100,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  breakdownCard: {
    marginBottom: 24,
    padding: 24,
  },
  breakdownTitle: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    marginBottom: 20,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  gameBreakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  gameStats: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
  gameScore: {
    alignItems: "flex-end",
  },
  gamePercentage: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  messageCard: {
    marginBottom: 24,
    padding: 24,
  },
  messageText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    letterSpacing: 0.3,
  },
  actionsContainer: {
    paddingBottom: 40,
    gap: 12,
  },
  primaryButton: {
    width: "100%",
  },
  secondaryButton: {
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
});
