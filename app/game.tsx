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

  const renderGameContent = () => {
    if (!currentGame) return null;

    const { game, question } = currentGame;

    switch (game.type) {
      case "anagram":
        return (
          <View style={styles.gameContent}>
            <Text style={styles.gameTitle}>🔤 Anagram Solver</Text>
            <Text style={styles.instruction}>
              Rearrange the letters to form a word
            </Text>
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{question.question}</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="Enter your answer"
              placeholderTextColor="rgba(255,255,255,0.6)"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        );

      case "association":
        return (
          <View style={styles.gameContent}>
            <Text style={styles.gameTitle}>🔗 Word Association</Text>
            <Text style={styles.instruction}>
              Find the opposite or related word
            </Text>
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{question.question}</Text>
            </View>
            {renderMultipleChoice()}
          </View>
        );

      case "fill_blanks":
        return (
          <View style={styles.gameContent}>
            <Text style={styles.gameTitle}>📝 Fill in the Blanks</Text>
            <Text style={styles.instruction}>Complete the sentence</Text>
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{question.question}</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="Enter the missing word"
              placeholderTextColor="rgba(255,255,255,0.6)"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        );

      case "odd_one_out":
        return (
          <View style={styles.gameContent}>
            <Text style={styles.gameTitle}>🎯 Odd One Out</Text>
            <Text style={styles.instruction}>
              Find the word that doesn't belong
            </Text>
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>Which one doesn't belong?</Text>
            </View>
            {renderMultipleChoice()}
          </View>
        );

      case "synonym":
        return (
          <View style={styles.gameContent}>
            <Text style={styles.gameTitle}>📚 Synonym Match</Text>
            <Text style={styles.instruction}>
              Find the word with similar meaning
            </Text>
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{question.question}</Text>
            </View>
            {renderMultipleChoice()}
          </View>
        );

      case "spelling":
        return (
          <View style={styles.gameContent}>
            <Text style={styles.gameTitle}>🐝 Spelling Bee</Text>
            <Text style={styles.instruction}>Spell the word correctly</Text>
            <View style={styles.questionContainer}>
              <Text style={styles.questionText}>{question.question}</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="Spell the word"
              placeholderTextColor="rgba(255,255,255,0.6)"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
        );

      default:
        return null;
    }
  };

  const renderMultipleChoice = () => {
    if (!currentGame?.question.options) return null;

    const options = JSON.parse(currentGame.question.options);

    return (
      <View style={styles.optionsContainer}>
        {options.map((option: string, index: number) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedOption === option && styles.selectedOption,
            ]}
            onPress={() => setSelectedOption(option)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                selectedOption === option && styles.selectedOptionText,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading next challenge...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#4facfe", "#00f2fe"]} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.roundText}>Round {session?.currentRound}</Text>
            <Text style={styles.streakText}>
              Streak: {session?.currentStreak}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.timerText}>{formatTime(timer)}</Text>
          </View>
        </View>

        {/* Game Content */}
        <Animated.View style={[styles.gameContainer, { opacity: fadeAnim }]}>
          {renderGameContent()}
        </Animated.View>

        {/* Submit Button */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled,
            ]}
            onPress={submitAnswer}
            activeOpacity={isSubmitting ? 1 : 0.8}
            disabled={isSubmitting}
          >
            <LinearGradient
              colors={isSubmitting ? ["#999", "#777"] : ["#ff6b6b", "#ee5a24"]}
              style={styles.submitGradient}
            >
              <Text style={styles.submitText}>
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerLeft: {
    alignItems: "flex-start",
  },
  headerRight: {
    alignItems: "flex-end",
  },
  roundText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  streakText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  timerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
  },
  gameContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  gameContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gameTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    textAlign: "center",
  },
  instruction: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginBottom: 30,
  },
  questionContainer: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 30,
    marginBottom: 30,
    minHeight: 100,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  questionText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  textInput: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 15,
    padding: 20,
    fontSize: 18,
    color: "white",
    width: "100%",
    textAlign: "center",
  },
  optionsContainer: {
    width: "100%",
  },
  optionButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 15,
    padding: 20,
    marginVertical: 8,
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  optionText: {
    fontSize: 18,
    color: "white",
    fontWeight: "600",
  },
  selectedOptionText: {
    fontWeight: "bold",
  },
  submitContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  submitButton: {
    height: 60,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitGradient: {
    flex: 1,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  submitText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
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
