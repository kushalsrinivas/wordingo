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

const { width } = Dimensions.get("window");

export default function StatsScreen() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    loadUserStats();

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

  const loadUserStats = async () => {
    try {
      const stats = await databaseService.getUserStats();
      setUserStats(stats);
    } catch (error) {
      console.error("Failed to load user stats:", error);
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

  if (!userStats) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading stats...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const performanceLevel = getPerformanceLevel(
    userStats.total_games,
    userStats.longest_streak
  );

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
        >
          {/* Performance Level Card */}
          <GlassCard style={styles.levelCard}>
            <Text style={[styles.levelText, { color: colors.text }]}>
              {performanceLevel}
            </Text>
            <Text
              style={[styles.levelDescription, { color: colors.textSecondary }]}
            >
              {getPerformanceMessage(performanceLevel)}
            </Text>
          </GlassCard>

          {/* Main Stats Grid */}
          <View style={styles.statsGrid}>
            <GlassCard style={styles.statCard}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {userStats.total_games}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Games
              </Text>
            </GlassCard>

            <GlassCard style={styles.statCard}>
              <Text style={[styles.statNumber, { color: colors.text }]}>
                {userStats.longest_streak}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Best Streak
              </Text>
            </GlassCard>
          </View>

          {/* Daily Streak Section */}
          <GlassCard style={styles.streakCard}>
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
          </GlassCard>

          {/* Activity Summary */}
          <GlassCard style={styles.activityCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Activity
            </Text>
            <View style={styles.activityRow}>
              <Text
                style={[styles.activityLabel, { color: colors.textSecondary }]}
              >
                Last Played
              </Text>
              <Text style={[styles.activityValue, { color: colors.text }]}>
                {formatLastPlayed(userStats.last_played)}
              </Text>
            </View>
            <View style={styles.activityRow}>
              <Text
                style={[styles.activityLabel, { color: colors.textSecondary }]}
              >
                Games This Week
              </Text>
              <Text style={[styles.activityValue, { color: colors.text }]}>
                {userStats.games_this_week || 0}
              </Text>
            </View>
          </GlassCard>
        </ScrollView>

        {/* Back Button */}
        <View style={styles.actionContainer}>
          <MinimalButton
            title="Back to Home"
            onPress={goBack}
            variant="secondary"
            style={styles.backHomeButton}
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
  levelCard: {
    marginBottom: 24,
    padding: 24,
    alignItems: "center",
  },
  levelText: {
    fontSize: 24,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  levelDescription: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    minHeight: 100,
  },
  statNumber: {
    fontSize: 32,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  streakCard: {
    marginBottom: 24,
    padding: 24,
    alignItems: "center",
  },
  streakTitle: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  streakDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 12,
  },
  streakNumber: {
    fontSize: 40,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.8,
  },
  streakDays: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  streakMessage: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  activityCard: {
    marginBottom: 24,
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  activityRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  activityLabel: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
  },
  activityValue: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
  actionContainer: {
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
});
