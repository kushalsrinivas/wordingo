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
    let interval: NodeJS.Timeout;
    if (session?.isActive) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
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
      Alert.alert("Error", `Failed to start game: ${error.message}`);
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
      Alert.alert("Error", `Failed to load game: ${error.message}`);
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
      Alert.alert("Error", `Failed to submit answer: ${error.message}`);
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
        <Text style={[styles.gameTitle, { color: colors.text }]}>
          {getGameTypeTitle(game.type)}
        </Text>
        <Text style={[styles.instruction, { color: colors.textSecondary }]}>
          {getGameInstruction(game.type)}
        </Text>

        <GlassCard style={styles.questionCard}>
          <Text style={[styles.questionText, { color: colors.text }]}>
            {question.question}
          </Text>
        </GlassCard>

        {game.type === "anagram" ||
        game.type === "fill_blanks" ||
        game.type === "spelling" ? (
          <TextInput
            style={[
              styles.textInput,
              {
                color: colors.text,
                borderColor: colors.border,
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
    );
  };

  const renderMultipleChoice = () => {
    if (!currentGame?.question.options) return null;

    const options = JSON.parse(currentGame.question.options);

    return (
      <View style={styles.optionsContainer}>
        {options.map((option: string, index: number) => (
          <TouchableOpacity
            key={index}
            style={styles.optionContainer}
            onPress={() => setSelectedOption(option)}
            activeOpacity={0.7}
          >
            <GlassCard
              style={[
                styles.optionCard,
                selectedOption === option && {
                  backgroundColor: colors.overlay,
                },
              ]}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: colors.text },
                  selectedOption === option && {
                    fontFamily: "Inter_500Medium",
                  },
                ]}
              >
                {option}
              </Text>
            </GlassCard>
          </TouchableOpacity>
        ))}
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
  },
  headerLeft: {
    alignItems: "flex-start",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  roundText: {
    fontSize: 16,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.3,
  },
  streakText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0.3,
    marginTop: 2,
  },
  timerText: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: -0.3,
  },
  gameContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  gameContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gameTitle: {
    fontSize: 24,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  instruction: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginBottom: 40,
    letterSpacing: 0.3,
  },
  questionCard: {
    width: "100%",
    minHeight: 120,
    marginBottom: 40,
  },
  questionText: {
    fontSize: 20,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
    padding: 24,
    letterSpacing: -0.2,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    width: "100%",
    textAlign: "center",
    backgroundColor: "transparent",
    letterSpacing: 0.3,
  },
  optionsContainer: {
    width: "100%",
    gap: 12,
  },
  optionContainer: {
    width: "100%",
  },
  optionCard: {
    minHeight: 56,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  optionText: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  submitContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  submitButton: {
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
