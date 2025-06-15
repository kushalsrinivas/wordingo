import { GlassCard } from "@/components/ui/GlassCard";
import { MinimalButton } from "@/components/ui/MinimalButton";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { gameEngine } from "@/services/gameEngine";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
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
  gameBreakdown: {
    gameName: string;
    played: number;
    correct: number;
    averageTime: number;
  }[];
}

export default function ResultScreen() {
  const [summary, setSummary] = useState<SessionSummary | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Animated values for count-up numbers
  const animatedCorrect = useRef(new Animated.Value(0)).current;
  const animatedAccuracy = useRef(new Animated.Value(0)).current;
  const animatedAvgTime = useRef(new Animated.Value(0)).current;
  const animatedTotalGames = useRef(new Animated.Value(0)).current;

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

  // Trigger count-up when summary loads
  useEffect(() => {
    if (summary) {
      Animated.timing(animatedCorrect, {
        toValue: summary.correctAnswers,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();

      const accuracy =
        summary.totalGames > 0
          ? (summary.correctAnswers / summary.totalGames) * 100
          : 0;

      Animated.timing(animatedAccuracy, {
        toValue: accuracy,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();

      Animated.timing(animatedAvgTime, {
        toValue: summary.averageTime / 1000,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();

      Animated.timing(animatedTotalGames, {
        toValue: summary.totalGames,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }).start();
    }
  }, [summary]);

  // Helper to render animated integer values
  const AnimatedNumber = ({
    animatedValue,
    suffix = "",
    textStyle,
  }: {
    animatedValue: Animated.Value;
    suffix?: string;
    textStyle?: any;
  }) => {
    const [display, setDisplay] = useState("0");

    useEffect(() => {
      const id = animatedValue.addListener(({ value }) => {
        setDisplay(`${Math.round(value)}${suffix}`);
      });
      return () => {
        animatedValue.removeListener(id);
      };
    }, [animatedValue]);

    return <Text style={textStyle}>{display}</Text>;
  };

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

  const getMotivationalMessage = (accuracyPercent: number) => {
    if (accuracyPercent > 80)
      return { msg: "Excellent performance!", badge: "🥇" };
    if (accuracyPercent >= 50)
      return { msg: "Nice work! You're improving.", badge: "🎯" };
    return { msg: "Good try! Keep practicing.", badge: "💪" };
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

  const accuracyPercent =
    summary.totalGames > 0
      ? (summary.correctAnswers / summary.totalGames) * 100
      : 0;

  const { msg: feedbackText, badge } = getMotivationalMessage(accuracyPercent);

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
            Here&apos;s how you performed
          </Text>
        </View>

        {/* Feedback */}
        <View style={styles.feedbackContainer}>
          <Text style={[styles.feedbackText, { color: colors.textSecondary }]}>
            {" "}
            {badge} {feedbackText}
          </Text>
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Unified Stats Card */}
          <GlassCard style={styles.statsCardUnified}>
            <View style={styles.statsUnifiedContent}>
              {/* Hero number */}
              <View style={styles.heroContainer}>
                <AnimatedNumber
                  animatedValue={animatedCorrect}
                  textStyle={[styles.heroNumber, { color: colors.success }]}
                />
                <Text
                  style={[styles.heroLabel, { color: colors.textSecondary }]}
                >
                  Correct Answers
                </Text>
              </View>

              {/* Small metrics grid */}
              <View style={styles.metricsRow}>
                <View style={styles.metricItem}>
                  <AnimatedNumber
                    animatedValue={animatedTotalGames}
                    textStyle={[styles.metricNumber, { color: colors.text }]}
                  />
                  <Text
                    style={[
                      styles.metricLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Games
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <AnimatedNumber
                    animatedValue={animatedAvgTime}
                    suffix="s"
                    textStyle={[styles.metricNumber, { color: colors.text }]}
                  />
                  <Text
                    style={[
                      styles.metricLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Avg Time
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <AnimatedNumber
                    animatedValue={animatedAccuracy}
                    suffix="%"
                    textStyle={[
                      styles.metricNumber,
                      {
                        color:
                          accuracyPercent >= 70
                            ? colors.success
                            : accuracyPercent >= 50
                            ? colors.warning
                            : colors.error,
                      },
                    ]}
                  />
                  <Text
                    style={[
                      styles.metricLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Accuracy
                  </Text>
                </View>
              </View>
            </View>
          </GlassCard>

          {/* Game Breakdown */}
          {summary.gameBreakdown.length > 0 && (
            <GlassCard style={styles.breakdownCard}>
              <Text style={[styles.breakdownTitle, { color: colors.text }]}>
                Game Breakdown
              </Text>
              <View style={styles.breakdownContent}>
                {summary.gameBreakdown.map((game, index) => (
                  <View
                    key={index}
                    style={[
                      styles.gameBreakdownItem,
                      index < summary.gameBreakdown.length - 1 && {
                        borderBottomColor: colors.border,
                        borderBottomWidth: StyleSheet.hairlineWidth,
                      },
                    ]}
                  >
                    <View style={styles.gameInfo}>
                      <Text style={[styles.gameName, { color: colors.text }]}>
                        {game.gameName}
                      </Text>
                      <View style={styles.gameStatsContainer}>
                        <Text
                          style={[
                            styles.gameStats,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {game.correct}/{game.played} correct
                        </Text>
                        <Text style={styles.statsSeparator}>•</Text>
                        <Text
                          style={[
                            styles.gameStats,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {formatTime(game.averageTime)} avg
                        </Text>
                      </View>
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
                      {/* Progress Bar */}
                      <View style={styles.progressBarBase}>
                        <View
                          style={[
                            styles.progressBarFill,
                            {
                              width: `${
                                game.played > 0
                                  ? (game.correct / game.played) * 100
                                  : 0
                              }%`,
                              backgroundColor:
                                game.played > 0 &&
                                (game.correct / game.played) * 100 >= 70
                                  ? colors.success
                                  : game.played > 0 &&
                                    (game.correct / game.played) * 100 >= 50
                                  ? colors.warning
                                  : colors.error,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </GlassCard>
          )}

          {/* Motivational Message */}
          <GlassCard style={styles.messageCard}>
            <Text style={[styles.messageText, { color: colors.textSecondary }]}>
              {getMotivationalMessage(accuracyPercent).msg}
            </Text>
          </GlassCard>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <MinimalButton
            title="Play Again"
            onPress={playAgain}
            variant="accent"
            iconName="refresh"
            style={styles.primaryButton}
          />
          <MinimalButton
            title="Go Home"
            onPress={goHome}
            variant="secondary"
            iconName="home"
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
    marginBottom: 32,
    minHeight: 180,
  },
  scoreContent: {
    alignItems: "center",
    padding: 36,
  },
  scoreNumber: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
    letterSpacing: -1.5,
  },
  scoreLabel: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 6,
    letterSpacing: -0.1,
  },
  totalGames: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 20,
    letterSpacing: 0.2,
    opacity: 0.7,
  },
  performanceIndicator: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.08)",
  },
  performanceText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  statsGrid: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 32,
  },
  statCardContainer: {
    marginBottom: 12,
    marginTop: 0,
    width: "33%",
  },
  statCard: {
    minHeight: 130,
    width: "100%",
    textAlign: "center",
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  statNumber: {
    fontSize: 28,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    opacity: 0.8,
  },
  breakdownCard: {
    marginBottom: 24,
    padding: 0,
  },
  breakdownTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 0,
    textAlign: "center",
    letterSpacing: -0.2,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 20,
  },
  breakdownContent: {
    paddingHorizontal: 28,
    paddingBottom: 28,
  },
  gameBreakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 18,
    paddingHorizontal: 0,
  },
  gameInfo: {
    flex: 1,
    paddingRight: 16,
  },
  gameName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    letterSpacing: -0.1,
  },
  gameStatsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  gameStats: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  statsSeparator: {
    fontSize: 13,
    marginHorizontal: 8,
    opacity: 0.5,
  },
  gameScore: {
    alignItems: "flex-end",
    position: "relative",
  },
  gamePercentage: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  messageCard: {
    marginBottom: 24,
    padding: 28,
  },
  messageText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    lineHeight: 22,
    letterSpacing: 0.1,
    opacity: 0.9,
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
  feedbackContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  feedbackText: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  statsCardUnified: {
    marginBottom: 32,
    minHeight: 180,
  },
  statsUnifiedContent: {
    alignItems: "center",
    padding: 36,
  },
  heroContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  heroLabel: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    marginTop: 8,
    letterSpacing: -0.1,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  metricItem: {
    alignItems: "center",
  },
  metricLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    opacity: 0.8,
  },
  progressBarBase: {
    width: 120,
    height: 6,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  heroNumber: {
    fontSize: 56,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1.5,
  },
  metricNumber: {
    fontSize: 24,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
});
