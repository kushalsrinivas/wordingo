import { GlassCard } from "@/components/ui/GlassCard";
import { MinimalButton } from "@/components/ui/MinimalButton";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { databaseService, UserStats } from "@/services/database";
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
import { BarChart, PieChart } from "react-native-chart-kit";

const { width } = Dimensions.get("window");

interface StatsData {
  userStats: UserStats | null;
  overallAccuracy: any;
  difficultyPerformance: any[];
  recentSessions: any[];
  weeklyStats: any[];
  accuracyOverTime: any[];
  timeDistribution: any[];
  gameTypePerformance: any[];
}

export default function StatsScreen() {
  const [statsData, setStatsData] = useState<StatsData>({
    userStats: null,
    overallAccuracy: {
      accuracy_percentage: 0,
      total_games: 0,
      correct_games: 0,
    },
    difficultyPerformance: [],
    recentSessions: [],
    weeklyStats: [],
    accuracyOverTime: [],
    timeDistribution: [],
    gameTypePerformance: [],
  });
  const [loading, setLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    loadAllStats();

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

  const loadAllStats = async () => {
    try {
      setLoading(true);

      // Load all statistics in parallel
      const [
        userStats,
        overallAccuracy,
        difficultyPerformance,
        recentSessions,
        weeklyStats,
        accuracyOverTime,
        timeDistribution,
        gameTypePerformance,
      ] = await Promise.all([
        databaseService.getUserStats(),
        databaseService.getOverallAccuracy(),
        databaseService.getGamePerformanceByDifficulty(),
        databaseService.getRecentSessions(5),
        databaseService.getWeeklyStats(),
        databaseService.getAccuracyOverTime(),
        databaseService.getTimeDistribution(),
        databaseService.getGameTypePerformance(),
      ]);

      setStatsData({
        userStats,
        overallAccuracy,
        difficultyPerformance,
        recentSessions,
        weeklyStats,
        accuracyOverTime,
        timeDistribution,
        gameTypePerformance,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  const getPerformanceLevel = (totalGames: number, longestStreak: number) => {
    if (longestStreak >= 20 && totalGames >= 100) return "Master";
    if (longestStreak >= 15 && totalGames >= 75) return "Expert";
    if (longestStreak >= 10 && totalGames >= 50) return "Advanced";
    if (longestStreak >= 5 && totalGames >= 25) return "Intermediate";
    if (totalGames >= 10) return "Beginner";
    return "Newcomer";
  };

  const getPerformanceMessage = (level: string) => {
    switch (level) {
      case "Master":
        return "You are a true word master!";
      case "Expert":
        return "Exceptional word skills!";
      case "Advanced":
        return "Great progress, keep it up!";
      case "Intermediate":
        return "You're getting better!";
      case "Beginner":
        return "Nice start, keep playing!";
      default:
        return "Welcome to Wordingo!";
    }
  };

  const formatLastPlayed = (dateString: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Start your streak today!";
    if (streak === 1) return "Great start! Keep it going!";
    if (streak < 7) return "Building momentum!";
    if (streak < 30) return "You're on fire!";
    return "Incredible dedication!";
  };

  const formatTime = (ms: number) => {
    const seconds = Math.round(ms / 1000);
    return `${seconds}s`;
  };

  // Chart configuration
  const chartConfig = {
    backgroundColor: "transparent",
    backgroundGradientFrom: colorScheme === "dark" ? "#1e1e1e" : "#ffffff",
    backgroundGradientTo: colorScheme === "dark" ? "#2a2a2a" : "#f8f8f8",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(78, 205, 196, ${opacity})`,
    labelColor: (opacity = 1) =>
      colorScheme === "dark"
        ? `rgba(255, 255, 255, ${opacity})`
        : `rgba(0, 0, 0, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#4ECDC4",
    },
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading comprehensive stats...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const { userStats, overallAccuracy } = statsData;

  if (!userStats) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            No stats available yet. Play some games to see your progress!
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const performanceLevel = getPerformanceLevel(
    userStats.total_games,
    userStats.longest_streak
  );

  const accuracyPercentage = overallAccuracy.accuracy_percentage || 0;

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
          <Text style={[styles.title, { color: colors.text }]}>Your Stats</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Performance Level Card */}
          <GlassCard style={styles.levelCard}>
            <View style={styles.levelContent}>
              <Text style={[styles.levelText, { color: colors.text }]}>
                {performanceLevel}
              </Text>
              <Text
                style={[
                  styles.levelDescription,
                  { color: colors.textSecondary },
                ]}
              >
                {getPerformanceMessage(performanceLevel)}
              </Text>
            </View>
          </GlassCard>

          {/* Main Stats Grid */}
          <View style={styles.statsGrid}>
            <GlassCard style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {userStats.total_games}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Total Games
                </Text>
              </View>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={[styles.statNumber, { color: colors.text }]}>
                  {userStats.longest_streak}
                </Text>
                <Text
                  style={[styles.statLabel, { color: colors.textSecondary }]}
                >
                  Best Streak
                </Text>
              </View>
            </GlassCard>
          </View>

          {/* Overall Accuracy */}
          <GlassCard style={styles.accuracyCard}>
            <View style={styles.accuracyContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Overall Accuracy
              </Text>
              <Text style={[styles.accuracyPercentage, { color: colors.text }]}>
                {accuracyPercentage}%
              </Text>
              <Text
                style={[
                  styles.accuracyDetails,
                  { color: colors.textSecondary },
                ]}
              >
                {overallAccuracy.correct_games} correct out of{" "}
                {overallAccuracy.total_games} games
              </Text>
            </View>
          </GlassCard>

          {/* Difficulty Performance Chart */}
          {statsData.difficultyPerformance.length > 0 && (
            <GlassCard style={styles.chartCard}>
              <View style={styles.chartContainer}>
                <Text style={[styles.chartTitle, { color: colors.text }]}>
                  Accuracy by Difficulty
                </Text>
                <BarChart
                  data={{
                    labels: statsData.difficultyPerformance.map(
                      (item) => item.difficulty || "Unknown"
                    ),
                    datasets: [
                      {
                        data: statsData.difficultyPerformance.map(
                          (item) => item.accuracy_percentage || 0
                        ),
                      },
                    ],
                  }}
                  width={width - 80}
                  height={200}
                  yAxisLabel=""
                  yAxisSuffix="%"
                  chartConfig={chartConfig}
                  style={styles.chart}
                />
              </View>
            </GlassCard>
          )}

          {/* Time Distribution Chart */}
          {statsData.timeDistribution.length > 0 && (
            <GlassCard style={styles.chartCard}>
              <View style={styles.chartContainer}>
                <Text style={[styles.chartTitle, { color: colors.text }]}>
                  Response Time Distribution
                </Text>
                <PieChart
                  data={statsData.timeDistribution.map((item, index) => ({
                    name: item.time_range,
                    population: item.count,
                    color: `hsl(${(index * 60) % 360}, 70%, 60%)`,
                    legendFontColor: colors.textSecondary,
                    legendFontSize: 12,
                  }))}
                  width={width - 80}
                  height={200}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  style={styles.chart}
                />
              </View>
            </GlassCard>
          )}

          {/* Weekly Activity Chart */}
          {statsData.weeklyStats.length > 0 && (
            <GlassCard style={styles.chartCard}>
              <View style={styles.chartContainer}>
                <Text style={[styles.chartTitle, { color: colors.text }]}>
                  Games Played This Week
                </Text>
                <BarChart
                  data={{
                    labels: statsData.weeklyStats.map((item) =>
                      new Date(item.date).toLocaleDateString("en-US", {
                        weekday: "short",
                      })
                    ),
                    datasets: [
                      {
                        data: statsData.weeklyStats.map(
                          (item) => item.total_games || 0
                        ),
                      },
                    ],
                  }}
                  width={width - 80}
                  height={200}
                  yAxisLabel=""
                  yAxisSuffix=" games"
                  chartConfig={chartConfig}
                  style={styles.chart}
                />
              </View>
            </GlassCard>
          )}

          {/* Daily Streak Section */}
          <GlassCard style={styles.streakCard}>
            <View style={styles.streakContent}>
              <Text style={[styles.streakTitle, { color: colors.text }]}>
                Daily Streak
              </Text>
              <View style={styles.streakDisplay}>
                <Text style={[styles.streakNumber, { color: colors.text }]}>
                  {userStats.daily_streak}
                </Text>
                <Text
                  style={[styles.streakDays, { color: colors.textSecondary }]}
                >
                  days
                </Text>
              </View>
              <Text
                style={[styles.streakMessage, { color: colors.textSecondary }]}
              >
                {getStreakMessage(userStats.daily_streak)}
              </Text>
            </View>
          </GlassCard>

          {/* Recent Sessions */}
          {statsData.recentSessions.length > 0 && (
            <GlassCard style={styles.sessionsCard}>
              <View style={styles.sessionsContent}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Recent Sessions
                </Text>
                {statsData.recentSessions.map((session, index) => (
                  <View key={session.id} style={styles.sessionRow}>
                    <View style={styles.sessionInfo}>
                      <Text
                        style={[styles.sessionDate, { color: colors.text }]}
                      >
                        {new Date(session.start_time).toLocaleDateString()}
                      </Text>
                      <Text
                        style={[
                          styles.sessionDetails,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {session.games_played} games • {session.correct_answers}{" "}
                        correct
                      </Text>
                    </View>
                    <Text style={[styles.sessionScore, { color: colors.text }]}>
                      {session.score}
                    </Text>
                  </View>
                ))}
              </View>
            </GlassCard>
          )}

          {/* Activity Summary */}
          <GlassCard style={styles.activityCard}>
            <View style={styles.activityContent}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Activity
              </Text>
              <View style={styles.activityRow}>
                <Text
                  style={[
                    styles.activityLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Last Played
                </Text>
                <Text style={[styles.activityValue, { color: colors.text }]}>
                  {formatLastPlayed(userStats.last_played)}
                </Text>
              </View>
              <View style={styles.activityRow}>
                <Text
                  style={[
                    styles.activityLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Total Games
                </Text>
                <Text style={[styles.activityValue, { color: colors.text }]}>
                  {userStats.total_games}
                </Text>
              </View>
            </View>
          </GlassCard>
        </ScrollView>

        {/* Back Button */}
        <View style={styles.actionContainer}>
          <MinimalButton
            title="Back to Home"
            onPress={goBack}
            variant="accent"
            style={styles.backHomeButton}
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 25,

    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
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
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.5,
  },
  placeholder: {
    width: 60,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  levelCard: {
    marginBottom: 20,
  },
  levelContent: {
    padding: 28,
    alignItems: "center",
  },
  levelText: {
    fontSize: 28,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  levelDescription: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
  },
  statContent: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 120,
  },
  statNumber: {
    fontSize: 36,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    letterSpacing: -0.8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    opacity: 0.8,
  },
  streakCard: {
    marginBottom: 20,
  },
  streakContent: {
    padding: 28,
    alignItems: "center",
  },
  streakTitle: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    marginBottom: 20,
    letterSpacing: 0.2,
  },
  streakDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
  },
  streakNumber: {
    fontSize: 48,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -1.2,
  },
  streakDays: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    marginLeft: 8,
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  streakMessage: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  activityCard: {
    marginBottom: 20,
  },
  activityContent: {
    padding: 24,
  },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  activityLabel: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  activityValue: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
  actionContainer: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  backHomeButton: {
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    marginBottom: 20,
    letterSpacing: 0.2,
  },
  accuracyCard: {
    marginBottom: 20,
  },
  accuracyContent: {
    padding: 28,
    alignItems: "center",
  },
  accuracyDetails: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 10,
    letterSpacing: 0.2,
  },
  accuracyPercentage: {
    fontSize: 48,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    letterSpacing: -1.2,
  },
  chartCard: {
    marginBottom: 20,
  },
  chartContainer: {
    alignItems: "center",
  },
  chartTitle: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    marginBottom: 15,
    letterSpacing: 0.2,
  },
  chart: {
    borderRadius: 16,
  },
  performanceCard: {
    marginBottom: 20,
  },
  performanceContent: {
    padding: 28,
  },
  performanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  gameTypeName: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
  performanceStats: {
    alignItems: "flex-end",
  },
  accuracyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  timeText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  sessionsCard: {
    marginBottom: 20,
  },
  sessionsContent: {
    padding: 28,
  },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  sessionInfo: {
    flex: 1,
  },
  sessionDate: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  sessionDetails: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
  sessionScore: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.5,
  },
});
