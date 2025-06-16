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
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function HomeScreen() {
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    loadUserStats();

    // Animate entrance with subtle fade and slide
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>WORDEL</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Challenge Your Mind
            </Text>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <View style={styles.statsGrid}>
              <GlassCard style={styles.statCard}>
                <View style={styles.statContent}>
                  <Text style={[styles.statNumber, { color: colors.text }]}>
                    {userStats?.daily_streak || 0}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Daily Streak
                  </Text>
                  <View
                    style={[styles.statIcon, { backgroundColor: colors.text }]}
                  />
                </View>
              </GlassCard>

              <GlassCard style={styles.statCard}>
                <View style={styles.statContent}>
                  <Text style={[styles.statNumber, { color: colors.text }]}>
                    {userStats?.longest_streak || 0}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Best Score
                  </Text>
                  <View
                    style={[
                      styles.statIcon,
                      styles.statIconSquare,
                      { backgroundColor: colors.text },
                    ]}
                  />
                </View>
              </GlassCard>
            </View>
          </View>

          {/* Main Action */}
          <View style={styles.mainAction}>
            <MinimalButton
              title="Start Game"
              onPress={startGame}
              variant="accent"
              style={styles.primaryButton}
            />
          </View>

          {/* Secondary Actions */}
          <View style={styles.secondaryActions}>
            <MinimalButton
              title="View Stats"
              onPress={viewStats}
              variant="primary"
              style={styles.secondaryButton}
            />
            <MinimalButton
              title="How to Play"
              onPress={howToPlay}
              variant="primary"
              style={styles.secondaryButton}
            />
          </View>

          {/* Debug Menu (only visible in development) */}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textTertiary }]}>
              Total Games: {userStats?.total_games || 0}
            </Text>
            {userStats?.last_played && (
              <Text style={[styles.footerText, { color: colors.textTertiary }]}>
                Last Played:{" "}
                {new Date(userStats.last_played).toLocaleDateString()}
              </Text>
            )}
          </View>
        </ScrollView>
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
    paddingTop: 60,
    paddingBottom: 40,
  },
  scrollContainer: {
    overflow: "scroll",
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 36,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter_300Light",
    letterSpacing: 0.3,
  },
  statsSection: {
    marginBottom: 60,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
  },
  statCard: {
    flex: 1,
    minHeight: 120,
  },
  statContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  statNumber: {
    fontSize: 28,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  statIcon: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statIconSquare: {
    borderRadius: 1,
  },
  mainAction: {
    alignItems: "center",
    marginBottom: 32,
  },
  primaryButton: {
    width: "100%",
  },
  secondaryActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 60,
    paddingHorizontal: 4,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 52,
  },
  footer: {
    alignItems: "center",
    marginTop: "auto",
  },
  footerText: {
    fontSize: 12,
    fontFamily: "Inter_300Light",
    letterSpacing: 0.3,
    marginVertical: 2,
  },
  debugSection: {
    marginBottom: 40,
    overflow: "scroll",
    gap: 12,
  },
  debugTitle: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
  },
  debugButton: {
    width: "100%",
  },
});
