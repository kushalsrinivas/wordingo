import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import { Alert, Animated, StyleSheet, Text, View } from "react-native";
import { CustomKeyboard } from "./CustomKeyboard";
import { MinimalButton } from "./MinimalButton";

interface WordleGameProps {
  secretWord: string;
  onFinish: (
    finalGuess: string,
    isCorrect: boolean,
    guessesUsed: number
  ) => void;
  maxGuesses?: number;
  jumbleClue?: string;
}

export const WordleGame: React.FC<WordleGameProps> = ({
  secretWord,
  onFinish,
  maxGuesses = 6,
  jumbleClue,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Evaluate a guess against the secret word and return status per letter
  const evaluateGuess = (
    guess: string
  ): ("correct" | "present" | "absent")[] => {
    const result: ("correct" | "present" | "absent")[] =
      Array(5).fill("absent");
    const target = secretWord.toUpperCase();

    for (let i = 0; i < 5; i++) {
      const g = guess[i].toUpperCase();
      if (g === target[i]) {
        result[i] = "correct";
      } else if (target.includes(g)) {
        result[i] = "present";
      }
    }
    return result;
  };

  const handleSubmit = () => {
    if (currentInput.length !== 5) {
      Alert.alert("Your guess must be 5 letters long");
      return;
    }

    const newGuesses = [...guesses, currentInput.toUpperCase()];
    setGuesses(newGuesses);

    const isGuessCorrect =
      currentInput.toLowerCase() === secretWord.toLowerCase();
    setIsCorrect(isGuessCorrect);

    if (isGuessCorrect) {
      setFeedbackMessage("🎉 Correct!");
    } else if (newGuesses.length === maxGuesses) {
      setFeedbackMessage(`💔 The word was: ${secretWord.toUpperCase()}`);
    }

    // Animate feedback
    if (isGuessCorrect || newGuesses.length === maxGuesses) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Notify parent after slight delay so last row renders first
      setTimeout(
        () => onFinish(currentInput, isGuessCorrect,  newGuesses.length),
        1500
      );
    }

    setCurrentInput("");
  };

  const handleKeyPress = (key: string) => {
    if (currentInput.length < 5) {
      setCurrentInput((prev) => prev + key.toUpperCase());
    }
  };

  const handleDelete = () => {
    setCurrentInput((prev) => prev.slice(0, -1));
  };

  const renderCell = (
    row: number,
    col: number,
    guess?: string,
    status?: "correct" | "present" | "absent" | "typing"
  ) => {
    let backgroundColor = "transparent";
    let borderColor = colors.textSecondary + "66";
    if (status === "correct") backgroundColor = "#22c55e";
    else if (status === "present") backgroundColor = "#facc15";
    else if (status === "absent")
      backgroundColor = colorScheme === "dark" ? "#374151" : "#d1d5db";

    return (
      <View
        key={`${row}-${col}`}
        style={[styles.cell, { backgroundColor, borderColor }]}
      >
        <Text style={[styles.cellText, { color: colors.text }]}> {guess} </Text>
      </View>
    );
  };

  const rows = Array.from({ length: maxGuesses }).map((_, rowIdx) => {
    // Determine what to render for each row
    if (rowIdx < guesses.length) {
      // Past guess, show colors
      const guess = guesses[rowIdx];
      const statuses = evaluateGuess(guess);
      return (
        <View key={rowIdx} style={styles.row}>
          {Array.from({ length: 5 }).map((_, colIdx) =>
            renderCell(rowIdx, colIdx, guess[colIdx], statuses[colIdx])
          )}
        </View>
      );
    }

    if (rowIdx === guesses.length) {
      // Current typing row
      const paddedInput = currentInput.padEnd(5, " ");
      return (
        <View key={rowIdx} style={styles.row}>
          {Array.from({ length: 5 }).map((_, colIdx) =>
            renderCell(rowIdx, colIdx, paddedInput[colIdx], "typing")
          )}
        </View>
      );
    }

    // Empty future rows
    return (
      <View key={rowIdx} style={styles.row}>
        {Array.from({ length: 5 }).map((_, colIdx) =>
          renderCell(rowIdx, colIdx, "", "typing")
        )}
      </View>
    );
  });

  return (
    <View style={styles.container}>
      {/* Jumble Clue */}
      {jumbleClue && (
        <Text style={[styles.jumbleText, { color: colors.textSecondary }]}>
          {jumbleClue}
        </Text>
      )}
      <View style={styles.grid}>{rows}</View>

      {/* Keyboard */}
      <CustomKeyboard onKeyPress={handleKeyPress} onDelete={handleDelete} />

      {/* Combined Submit/Feedback Component */}
      <View style={styles.actionContainer}>
        {feedbackMessage ? (
          <Animated.View
            style={[styles.feedbackContainer, { opacity: fadeAnim }]}
          >
            <LinearGradient
              colors={
                isCorrect
                  ? ["rgba(34, 197, 94, 0.25)", "rgba(34, 197, 94, 0.15)"]
                  : ["rgba(239, 68, 68, 0.25)", "rgba(239, 68, 68, 0.15)"]
              }
              style={styles.feedbackGradient}
            >
              <Text
                style={[
                  styles.feedbackText,
                  { color: isCorrect ? "#22c55e" : "#ef4444" },
                ]}
              >
                {feedbackMessage}
              </Text>
            </LinearGradient>
          </Animated.View>
        ) : (
          <LinearGradient
            colors={
              currentInput.length === 5
                ? [colors.highlight, colors.highlight + "CC"]
                : ["rgba(128, 128, 128, 0.3)", "rgba(128, 128, 128, 0.2)"]
            }
            style={styles.submitGradient}
          >
            <MinimalButton
              title="Submit Guess"
              onPress={handleSubmit}
              variant="primary"
              disabled={currentInput.length !== 5}
              style={styles.submitButton}
            />
          </LinearGradient>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
  },
  grid: {
    gap: 8,
    marginVertical: 16,
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  cell: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  cellText: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  actionContainer: {
    width: "100%",

    alignItems: "center",
  },
  submitButton: {
    width: "100%",
  },
  submitGradient: {
    width: "90%",
    borderRadius: 20,
    overflow: "hidden",
  },
  feedbackContainer: {
    width: "90%",
  },
  feedbackGradient: {
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
  },
  feedbackText: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  jumbleText: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.4,
    marginVertical: 4,
  },
});
