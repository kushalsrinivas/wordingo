import { databaseService, UserStats } from "@/services/database";
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

export default function StatsScreen() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    loadUserStats();

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

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return "🔥";
    if (streak >= 14) return "⚡";
    if (streak >= 7) return "🌟";
    if (streak >= 3) return "✨";
    return "💫";
  };

  const getPerformanceLevel = (totalGames: number, longestStreak: number) => {
    if (longestStreak >= 20 && totalGames >= 100)
      return { level: "Master", emoji: "🏆", color: "#FFD700" };
    if (longestStreak >= 15 && totalGames >= 75)
      return { level: "Expert", emoji: "🥇", color: "#FF6B35" };
    if (longestStreak >= 10 && totalGames >= 50)
      return { level: "Advanced", emoji: "🥈", color: "#4ECDC4" };
    if (longestStreak >= 5 && totalGames >= 25)
      return { level: "Intermediate", emoji: "🥉", color: "#45B7D1" };
    if (totalGames >= 10)
      return { level: "Beginner", emoji: "🌱", color: "#96CEB4" };
    return { level: "Newcomer", emoji: "🐣", color: "#FFEAA7" };
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

  if (!userStats) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading stats...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const performance = getPerformanceLevel(
    userStats.total_games,
    userStats.longest_streak
  );

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
            <Text style={styles.title}>📊 Your Stats</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Performance Level Card */}
            <View style={styles.levelCard}>
              <Text style={styles.levelEmoji}>{performance.emoji}</Text>
              <Text style={[styles.levelText, { color: performance.color }]}>
                {performance.level}
              </Text>
              <Text style={styles.levelDescription}>
                {performance.level === "Master"
                  ? "You are a true word master!"
                  : performance.level === "Expert"
                  ? "Exceptional word skills!"
                  : performance.level === "Advanced"
                  ? "Great progress, keep it up!"
                  : performance.level === "Intermediate"
                  ? "You're getting better!"
                  : performance.level === "Beginner"
                  ? "Nice start, keep playing!"
                  : "Welcome to Wordingo!"}
              </Text>
            </View>

            {/* Main Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>🎯</Text>
                <Text style={styles.statNumber}>{userStats.total_games}</Text>
                <Text style={styles.statLabel}>Total Games</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statEmoji}>🏆</Text>
                <Text style={styles.statNumber}>
                  {userStats.longest_streak}
                </Text>
                <Text style={styles.statLabel}>Best Streak</Text>
              </View>
            </View>

            {/* Daily Streak Section */}
            <View style={styles.streakSection}>
              <View style={styles.streakHeader}>
                <Text style={styles.streakTitle}>Daily Streak</Text>
                <Text style={styles.streakEmoji}>
                  {getStreakEmoji(userStats.daily_streak)}
                </Text>
              </View>

              <View style={styles.streakDisplay}>
                <Text style={styles.streakNumber}>
                  {userStats.daily_streak}
                </Text>
                <Text style={styles.streakDays}>days</Text>
              </View>

              <Text style={styles.streakMessage}>
                {userStats.daily_streak === 0
                  ? "Start your streak today!"
                  : userStats.daily_streak === 1
                  ? "Great start! Keep it going!"
                  : userStats.daily_streak < 7
                  ? "Building momentum!"
                  : userStats.daily_streak < 30
                  ? "You're on fire!"
                  : "Incredible dedication!"}
              </Text>
            </View>

            {/* Activity Summary */}
            <View style={styles.activitySection}>
              <Text style={styles.sectionTitle}>📅 Activity</Text>

              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Text style={styles.activityEmoji}>🕒</Text>
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityLabel}>Last Played</Text>
                  <Text style={styles.activityValue}>
                    {formatLastPlayed(userStats.last_played)}
                  </Text>
                </View>
              </View>

              <View style={styles.activityItem}>
                <View style={styles.activityIcon}>
                  <Text style={styles.activityEmoji}>📈</Text>
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityLabel}>Average per Session</Text>
                  <Text style={styles.activityValue}>
                    {userStats.total_games > 0
                      ? Math.round(
                          userStats.total_games /
                            Math.max(1, userStats.longest_streak)
                        )
                      : 0}{" "}
                    games
                  </Text>
                </View>
              </View>
            </View>

            {/* Achievements Section */}
            <View style={styles.achievementsSection}>
              <Text style={styles.sectionTitle}>🏅 Achievements</Text>

              <View style={styles.achievementsList}>
                <View
                  style={[
                    styles.achievementItem,
                    userStats.total_games >= 10 && styles.achievementUnlocked,
                  ]}
                >
                  <Text style={styles.achievementEmoji}>🎮</Text>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementName}>First Steps</Text>
                    <Text style={styles.achievementDesc}>Play 10 games</Text>
                  </View>
                  <Text style={styles.achievementStatus}>
                    {userStats.total_games >= 10
                      ? "✅"
                      : `${userStats.total_games}/10`}
                  </Text>
                </View>

                <View
                  style={[
                    styles.achievementItem,
                    userStats.longest_streak >= 5 && styles.achievementUnlocked,
                  ]}
                >
                  <Text style={styles.achievementEmoji}>🔥</Text>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementName}>Hot Streak</Text>
                    <Text style={styles.achievementDesc}>Reach 5 streak</Text>
                  </View>
                  <Text style={styles.achievementStatus}>
                    {userStats.longest_streak >= 5
                      ? "✅"
                      : `${userStats.longest_streak}/5`}
                  </Text>
                </View>

                <View
                  style={[
                    styles.achievementItem,
                    userStats.daily_streak >= 7 && styles.achievementUnlocked,
                  ]}
                >
                  <Text style={styles.achievementEmoji}>📅</Text>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementName}>Week Warrior</Text>
                    <Text style={styles.achievementDesc}>7 day streak</Text>
                  </View>
                  <Text style={styles.achievementStatus}>
                    {userStats.daily_streak >= 7
                      ? "✅"
                      : `${userStats.daily_streak}/7`}
                  </Text>
                </View>

                <View
                  style={[
                    styles.achievementItem,
                    userStats.longest_streak >= 15 &&
                      styles.achievementUnlocked,
                  ]}
                >
                  <Text style={styles.achievementEmoji}>🏆</Text>
                  <View style={styles.achievementInfo}>
                    <Text style={styles.achievementName}>Champion</Text>
                    <Text style={styles.achievementDesc}>Reach 15 streak</Text>
                  </View>
                  <Text style={styles.achievementStatus}>
                    {userStats.longest_streak >= 15
                      ? "✅"
                      : `${userStats.longest_streak}/15`}
                  </Text>
                </View>
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
  levelCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 25,
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
    backdropFilter: "blur(10px)",
  },
  levelEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  levelText: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  levelDescription: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    flex: 0.48,
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  streakSection: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    alignItems: "center",
  },
  streakHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  streakTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginRight: 10,
  },
  streakEmoji: {
    fontSize: 24,
  },
  streakDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
  },
  streakDays: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    marginLeft: 5,
  },
  streakMessage: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  activitySection: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  activityEmoji: {
    fontSize: 20,
  },
  activityInfo: {
    flex: 1,
  },
  activityLabel: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  activityValue: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  achievementsSection: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 40,
  },
  achievementsList: {
    gap: 12,
  },
  achievementItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  achievementUnlocked: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
  },
  achievementEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  achievementDesc: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 2,
  },
  achievementStatus: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 20,
    color: "white",
    fontWeight: "600",
  },
});
