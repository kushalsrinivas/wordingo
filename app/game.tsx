import { GlassCard } from "@/components/ui/GlassCard";
import { MinimalButton } from "@/components/ui/MinimalButton";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { CurrentGame, gameEngine, GameSession } from "@/services/gameEngine";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function GameScreen() {
  const [session, setSession] = useState<GameSession | null>(null);
  const [currentGame, setCurrentGame] = useState<CurrentGame | null>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
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
      setUserAnswer("");
      setSelectedOption("");

      // Animate in new game
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load next game:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      Alert.alert("Error", `Failed to load game: ${errorMessage}`);
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentGame) {
      console.log("No current game available");
      return;
    }

    if (isSubmitting) {
      console.log("Already submitting, ignoring duplicate submission");
      return;
    }

    const answer =
      currentGame.game.type === "anagram" ||
      currentGame.game.type === "fill_blanks" ||
      currentGame.game.type === "spelling"
        ? userAnswer
        : selectedOption;

    if (!answer.trim()) {
      Alert.alert("Please provide an answer");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("Submitting answer:", answer);
      const result = await gameEngine.submitAnswer(answer);
      console.log("Answer result:", result);

      if (result.isCorrect) {
        // Correct answer - load next game
        console.log("Correct answer, loading next game");
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          loadNextGame();
        });
      } else {
        // Wrong answer - go to result screen
        console.log("Wrong answer, going to result screen");
        router.replace("/result");
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      Alert.alert("Error", `Failed to submit answer: ${errorMessage}`);
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
      case "fill_blanks":
        return "Fill the Blanks";
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
      case "fill_blanks":
        return "Complete the sentence";
      case "spelling":
        return "Spell the word correctly";
      default:
        return "Answer the question";
    }
  };

  const renderGameContent = () => {
    if (!currentGame) return null;

    const { game, question } = currentGame;

    return (
      <View style={styles.gameContent}>
        <View style={styles.gameHeader}>
          <Text style={[styles.gameTitle, { color: colors.text }]}>
            {getGameTypeTitle(game.type)}
          </Text>
          <Text style={[styles.instruction, { color: colors.textSecondary }]}>
            {getGameInstruction(game.type)}
          </Text>
        </View>

        <View style={styles.questionContainer}>
          <GlassCard style={styles.questionCard}>
            <Text style={[styles.questionText, { color: colors.text }]}>
              {question.question}
            </Text>
          </GlassCard>
        </View>

        <View style={styles.answerContainer}>
          {game.type === "anagram" ||
          game.type === "fill_blanks" ||
          game.type === "spelling" ? (
            <TextInput
              style={[
                styles.textInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.glassBackground,
                },
              ]}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="Enter your answer"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="none"
              autoCorrect={false}
            />
          ) : (
            renderMultipleChoice()
          )}
        </View>
      </View>
    );
  };

  const renderMultipleChoice = () => {
    if (!currentGame?.question.options) return null;

    const options = JSON.parse(currentGame.question.options);

    return (
      <View style={styles.optionsContainer}>
        {options.map((option: string, index: number) => {
          const isSelected = selectedOption === option;

          return (
            <TouchableOpacity
              key={index}
              style={styles.optionContainer}
              onPress={() => setSelectedOption(option)}
              activeOpacity={0.7}
            >
              <GlassCard
                style={StyleSheet.flatten([
                  styles.optionCard,
                  isSelected && { backgroundColor: colors.overlay },
                ])}
              >
                <Text
                  style={[
                    styles.optionText,
                    { color: colors.text },
                    ...(isSelected
                      ? [{ fontFamily: "Inter_500Medium" as const }]
                      : []),
                  ]}
                >
                  {option}
                </Text>
              </GlassCard>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading next challenge...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.roundText, { color: colors.text }]}>
            Round {session?.currentRound}
          </Text>
          <Text style={[styles.streakText, { color: colors.textSecondary }]}>
            Streak: {session?.currentStreak}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={[styles.timerText, { color: colors.text }]}>
            {formatTime(timer)}
          </Text>
        </View>
      </View>

      {/* Game Content */}
      <Animated.View style={[styles.gameContainer, { opacity: fadeAnim }]}>
        {renderGameContent()}
      </Animated.View>

      {/* Submit Button */}
      <View style={styles.submitContainer}>
        <MinimalButton
          title={isSubmitting ? "Submitting..." : "Submit Answer"}
          onPress={submitAnswer}
          variant="primary"
          disabled={isSubmitting}
          style={styles.submitButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  headerLeft: {
    alignItems: "flex-start",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  roundText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.2,
  },
  streakText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
    marginTop: 4,
  },
  timerText: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  gameContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  gameContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingVertical: 32,
  },
  gameHeader: {
    alignItems: "center",
    marginBottom: 32,
  },
  gameTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    marginBottom: 12,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  instruction: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.2,
    lineHeight: 22,
  },
  questionContainer: {
    flex: 1,
    justifyContent: "center",
    marginBottom: 32,
  },
  questionCard: {
    width: "100%",
    minHeight: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  questionText: {
    fontSize: 22,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    padding: 32,
    letterSpacing: -0.3,
    lineHeight: 32,
  },
  answerContainer: {
    width: "100%",
  },
  textInput: {
    borderWidth: 2,
    borderRadius: 20,
    padding: 24,
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    width: "100%",
    textAlign: "center",
    letterSpacing: 0.2,
    minHeight: 64,
  },
  optionsContainer: {
    width: "100%",
    gap: 16,
  },
  optionContainer: {
    width: "100%",
  },
  optionCard: {
    minHeight: 64,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  optionText: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.2,
    lineHeight: 24,
  },
  submitContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  submitButton: {
    width: "100%",
    minHeight: 64,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.2,
  },
});
