import { gameEngine } from "@/services/gameEngine";
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
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    loadSessionSummary();

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

  const getScoreColor = (correct: number, total: number) => {
    const percentage = total > 0 ? (correct / total) * 100 : 0;
    if (percentage >= 80) return "#4CAF50";
    if (percentage >= 60) return "#FF9800";
    return "#F44336";
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 10) return "🏆";
    if (score >= 5) return "🥉";
    if (score >= 3) return "👏";
    if (score >= 1) return "👍";
    return "💪";
  };

  if (!summary) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading results...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

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
            <Text style={styles.title}>🎯 Game Over!</Text>
            <Text style={styles.subtitle}>Here's how you did</Text>
          </View>

          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Main Score Card */}
            <View style={styles.scoreCard}>
              <Text style={styles.scoreEmoji}>
                {getScoreEmoji(summary.correctAnswers)}
              </Text>
              <Text style={styles.scoreNumber}>{summary.correctAnswers}</Text>
              <Text style={styles.scoreLabel}>Correct Answers</Text>
              <Text style={styles.totalGames}>
                out of {summary.totalGames} games
              </Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{summary.totalGames}</Text>
                <Text style={styles.statLabel}>Total Games</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {formatTime(summary.averageTime)}
                </Text>
                <Text style={styles.statLabel}>Avg Time</Text>
              </View>

              <View style={styles.statItem}>
                <Text
                  style={[
                    styles.statNumber,
                    {
                      color: getScoreColor(
                        summary.correctAnswers,
                        summary.totalGames
                      ),
                    },
                  ]}
                >
                  {summary.totalGames > 0
                    ? Math.round(
                        (summary.correctAnswers / summary.totalGames) * 100
                      )
                    : 0}
                  %
                </Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
            </View>

            {/* Game Breakdown */}
            {summary.gameBreakdown.length > 0 && (
              <View style={styles.breakdownContainer}>
                <Text style={styles.breakdownTitle}>📊 Game Breakdown</Text>
                {summary.gameBreakdown.map((game, index) => (
                  <View key={index} style={styles.gameBreakdownItem}>
                    <View style={styles.gameInfo}>
                      <Text style={styles.gameName}>{game.gameName}</Text>
                      <Text style={styles.gameStats}>
                        {game.correct}/{game.played} correct •{" "}
                        {formatTime(game.averageTime)} avg
                      </Text>
                    </View>
                    <View style={styles.gameScore}>
                      <Text
                        style={[
                          styles.gamePercentage,
                          { color: getScoreColor(game.correct, game.played) },
                        ]}
                      >
                        {game.played > 0
                          ? Math.round((game.correct / game.played) * 100)
                          : 0}
                        %
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Motivational Message */}
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>
                {summary.correctAnswers >= 10
                  ? "🌟 Outstanding performance! You're a word master!"
                  : summary.correctAnswers >= 5
                  ? "🎉 Great job! Keep practicing to improve even more!"
                  : summary.correctAnswers >= 1
                  ? "👍 Good effort! Every game makes you stronger!"
                  : "💪 Don't give up! Practice makes perfect!"}
              </Text>
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={playAgain}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#ff6b6b", "#ee5a24"]}
                style={styles.buttonGradient}
              >
                <Text style={styles.primaryButtonText}>🔄 Play Again</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={goHome}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>🏠 Go Home</Text>
            </TouchableOpacity>
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
  },
  header: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
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
  scrollContainer: {
    flex: 1,
  },
  scoreCard: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 25,
    padding: 30,
    alignItems: "center",
    marginBottom: 20,
    backdropFilter: "blur(10px)",
  },
  scoreEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  scoreLabel: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    fontWeight: "600",
  },
  totalGames: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 5,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statItem: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    flex: 0.3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
  },
  breakdownContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  breakdownTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
    textAlign: "center",
  },
  gameBreakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginBottom: 2,
  },
  gameStats: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
  },
  gameScore: {
    alignItems: "flex-end",
  },
  gamePercentage: {
    fontSize: 18,
    fontWeight: "bold",
  },
  messageContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  messageText: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
    lineHeight: 24,
  },
  actionsContainer: {
    paddingBottom: 40,
  },
  primaryButton: {
    height: 60,
    borderRadius: 30,
    marginBottom: 15,
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
  secondaryButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingVertical: 18,
    borderRadius: 25,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 18,
    color: "white",
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
