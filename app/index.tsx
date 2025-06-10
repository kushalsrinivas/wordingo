import { databaseService, UserStats } from "@/services/database";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  useEffect(() => {
    loadUserStats();

    // Animate entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
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

  const startGame = () => {
    router.push("/game");
  };

  const viewStats = () => {
    router.push("/stats");
  };

  const howToPlay = () => {
    router.push("/how-to-play");
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.gradient}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🧩 Wordingo</Text>
            <Text style={styles.subtitle}>Challenge Your Mind</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {userStats?.daily_streak || 0}
              </Text>
              <Text style={styles.statLabel}>Daily Streak</Text>
              <Text style={styles.statEmoji}>🔥</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {userStats?.longest_streak || 0}
              </Text>
              <Text style={styles.statLabel}>Best Score</Text>
              <Text style={styles.statEmoji}>🏆</Text>
            </View>
          </View>

          {/* Main Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={startGame}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#ff6b6b", "#ee5a24"]}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>🚀 Start Gauntlet</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.secondaryActions}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={viewStats}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>📊 View Stats</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={howToPlay}
                activeOpacity={0.7}
              >
                <Text style={styles.secondaryButtonText}>❓ How to Play</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer Info */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Total Games: {userStats?.total_games || 0}
            </Text>
            {userStats?.last_played && (
              <Text style={styles.footerText}>
                Last Played:{" "}
                {new Date(userStats.last_played).toLocaleDateString()}
              </Text>
            )}
          </View>
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
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginTop: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 40,
  },
  statCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    flex: 0.45,
    backdropFilter: "blur(10px)",
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
  statEmoji: {
    fontSize: 24,
    marginTop: 8,
  },
  actionsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButton: {
    width: width * 0.8,
    height: 60,
    borderRadius: 30,
    marginBottom: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    flex: 1,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: width * 0.8,
  },
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    flex: 0.45,
    alignItems: "center",
    backdropFilter: "blur(10px)",
  },
  secondaryButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    marginBottom: 40,
  },
  footerText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginVertical: 2,
  },
});
