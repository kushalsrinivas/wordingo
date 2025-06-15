import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { CurrentGame, gameEngine, GameSession } from "@/services/gameEngine";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WordleGame } from "../components/ui/WordleGame";

const { width, height } = Dimensions.get("window");

export default function GameScreen() {
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentGame, setCurrentGame] = useState<CurrentGame | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [answerResult, setAnswerResult] = useState<{
    isCorrect: boolean;
    correctAnswer: string;
  } | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [slideAnim] = useState(new Animated.Value(0));
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (session?.isActive) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [session?.isActive]);

  useEffect(() => {
    // Pulse animation for timer
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const initializeGame = async () => {
    try {
      console.log("Initializing game...");

      // Ensure database is ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      const newSession = await gameEngine.startNewSession();
      console.log("New session created:", newSession);

      setSession(newSession);
      await loadNextGame();
    } catch (error) {
      console.error("Failed to initialize game:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      Alert.alert("Error", `Failed to start game: ${errorMessage}`);
      router.back();
    }
  };

  const loadNextGame = async () => {
    try {
      console.log("Loading next game...");
      setIsLoading(true);

      const currentSession = gameEngine.getCurrentSession();
      if (!currentSession || !currentSession.isActive) {
        console.log("No active session, going to result screen");
        router.replace("/result");
        return;
      }

      const nextGame = await gameEngine.getNextGame();
      console.log("Next game loaded:", nextGame);

      if (!nextGame) {
        // No more games, end session
        console.log("No more games available, ending session");
        router.replace("/result");
        return;
      }

      setCurrentGame(nextGame);

      // Animate in new game with slide effect
      slideAnim.setValue(-width);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load next game:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      Alert.alert("Error", `Failed to load game: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  const handleWordleFinish = async (
    finalGuess: string,
    isCorrect: boolean,
    guessesUsed: number
  ) => {
    if (!currentGame) return;
    if (isSubmitting || answerResult) return;

    try {
      setIsSubmitting(true);

      // Submit the final guess to the game engine so session stats stay consistent
      const result = await gameEngine.submitAnswer(finalGuess);

      setAnswerResult({
        isCorrect: result.isCorrect,
        correctAnswer: result.correctAnswer,
      });

      // Small delay to let the user see feedback inside grid first
      setTimeout(() => {
        if (result.isCorrect) {
          loadNextGame();
        } else {
          router.replace("/result");
        }
      }, 1500);
    } catch (error) {
      console.error("Failed to submit Wordle result", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getGameTypeTitle = (type: string) => {
    switch (type) {
      case "anagram":
        return "Anagram Solver";
      case "association":
        return "Word Association";
      case "wordle":
        return "Wordle";
      case "spelling":
        return "Spelling Challenge";
      default:
        return "Word Game";
    }
  };

  const getGameInstruction = (type: string) => {
    switch (type) {
      case "anagram":
        return "Rearrange the letters to form a word";
      case "association":
        return "Find the opposite or related word";
      case "wordle":
        return "Guess the 5-letter word";
      case "spelling":
        return "Spell the word correctly";
      default:
        return "Answer the question";
    }
  };

  const getGameEmoji = (type: string) => {
    switch (type) {
      case "anagram":
        return "🔤";
      case "association":
        return "🔗";
      case "wordle":
        return "🟩";
      case "spelling":
        return "✏️";
      default:
        return "🎯";
    }
  };

  const renderGameContent = () => {
    if (!currentGame) return null;

    return (
      <Animated.View
        style={[
          styles.gameContent,
          { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
        ]}
      >
        {/* Difficulty Badge & Optional Jumble Clue */}
        <View style={styles.gameHeader}>
          <Text style={[styles.gameTitle, { color: colors.text }]}>
            {" "}
            Round {session?.currentRound} –{" "}
            {currentGame.difficulty.toUpperCase()}{" "}
          </Text>
          {currentGame.jumbleClue && (
            <Text style={[styles.instruction, { color: colors.textSecondary }]}>
              {" "}
              {currentGame.jumbleClue}{" "}
            </Text>
          )}
        </View>

        <WordleGame
          key={currentGame.secretWord}
          secretWord={currentGame.secretWord}
          maxGuesses={currentGame.maxGuesses}
          jumbleClue={undefined}
          onFinish={handleWordleFinish}
        />
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <LinearGradient
          colors={[
            colors.background,
            colorScheme === "dark"
              ? "rgba(255, 255, 255, 0.02)"
              : "rgba(0, 0, 0, 0.01)",
          ]}
          style={styles.loadingContainer}
        >
          <View style={styles.loadingContent}>
            <Text style={styles.loadingEmoji}>🎯</Text>
            <Text style={[styles.loadingText, { color: colors.text }]}>
              Loading next challenge...
            </Text>
            <View style={styles.loadingDots}>
              <View
                style={[styles.dot, { backgroundColor: colors.highlight }]}
              />
              <View
                style={[styles.dot, { backgroundColor: colors.highlight }]}
              />
              <View
                style={[styles.dot, { backgroundColor: colors.highlight }]}
              />
            </View>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <LinearGradient
        colors={[
          colors.background,
          colorScheme === "dark"
            ? "rgba(255, 255, 255, 0.01)"
            : "rgba(0, 0, 0, 0.005)",
        ]}
        style={styles.backgroundGradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.roundContainer}>
              <Text style={[styles.roundText, { color: colors.text }]}>
                Round {session?.currentRound}
              </Text>
              <View
                style={[
                  styles.roundBadge,
                  { backgroundColor: colors.highlight + "20" },
                ]}
              >
                <Text
                  style={[styles.roundBadgeText, { color: colors.highlight }]}
                >
                  {session?.currentRound}
                </Text>
              </View>
            </View>
            {session && (
              <Text
                style={[styles.progressText, { color: colors.textSecondary }]}
              >
                Score: {session.score}
              </Text>
            )}
            <View style={styles.streakContainer}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text
                style={[styles.streakText, { color: colors.textSecondary }]}
              >
                Streak: {session?.currentStreak}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Animated.View
              style={[
                styles.timerContainer,
                { transform: [{ scale: pulseAnim }] },
              ]}
            >
              <LinearGradient
                colors={[colors.highlight + "20", colors.highlight + "10"]}
                style={styles.timerGradient}
              >
                <Text style={[styles.timerText, { color: colors.text }]}>
                  {formatTime(timer)}
                </Text>
              </LinearGradient>
            </Animated.View>
          </View>
        </View>

        {/* Game Content */}
        <View style={styles.gameContainer}>{renderGameContent()}</View>

        {/* Feedback Banner */}
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
    marginTop: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255, 255, 255, 0.1)",
  },
  headerLeft: {
    alignItems: "flex-start",
    flex: 1,
  },
  headerRight: {
    alignItems: "flex-end",
  },
  roundContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  roundText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
    marginRight: 12,
  },
  roundBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roundBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  streakContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  streakEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  streakText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.2,
  },
  progressText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
    marginTop: 2,
  },
  timerContainer: {
    borderRadius: 16,
    overflow: "hidden",
  },
  timerGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  timerText: {
    fontSize: 28,
    fontFamily: "Inter_800ExtraBold",
    letterSpacing: -0.8,
  },
  gameContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  gameContent: {
    flex: 1,
    justifyContent: "flex-start",
    paddingVertical: 20,
  },
  gameHeader: {
    alignItems: "center",
    marginBottom: 40,
  },
  gameTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  gameEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  gameTitle: {
    fontSize: 32,
    fontFamily: "Inter_800ExtraBold",
    textAlign: "center",
    letterSpacing: -0.8,
  },
  instruction: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.3,
    lineHeight: 24,
    opacity: 0.8,
  },
  questionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  questionText: {
    fontSize: 24,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    padding: 32,
    letterSpacing: -0.4,
    lineHeight: 36,
  },
  answerContainer: {
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
  },
  textInputContainer: {
    width: "100%",
  },
  answerGradient: {
    borderRadius: 20,
    padding: 2,
  },
  answerDisplay: {
    width: "100%",
    minHeight: 80,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
  },
  answerText: {
    fontSize: 20,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    letterSpacing: 0.3,
    lineHeight: 28,
  },
  placeholderText: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.3,
    lineHeight: 26,
    opacity: 0.6,
  },
  optionsContainer: {
    marginTop: 20,
    width: "100%",
    gap: 16,
  },
  optionContainer: {
    width: "100%",
  },
  optionCard: {
    minHeight: 72,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  optionText: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    letterSpacing: 0.3,
    lineHeight: 26,
  },
  submitContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  submitGradient: {
    borderRadius: 20,
    overflow: "hidden",
  },
  submitButton: {
    width: "100%",
    minHeight: 64,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 20,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
    marginBottom: 20,
  },
  loadingDots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  feedbackContainer: {
    width: "100%",
  },
  feedbackGradient: {
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
  },
  feedbackText: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: 0.4,
    marginBottom: 8,
  },
  correctAnswerText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    letterSpacing: 0.2,
    opacity: 0.8,
  },
});
