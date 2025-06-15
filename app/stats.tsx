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
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    marginBottom: 20,
    letterSpacing: 0.2,
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
});
