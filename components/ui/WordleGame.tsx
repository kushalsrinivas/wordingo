import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { CustomKeyboard } from "./CustomKeyboard";
import { MinimalButton } from "./MinimalButton";

interface WordleGameProps {
  secretWord: string;
  onFinish: (finalGuess: string, isCorrect: boolean) => void;
}

export const WordleGame: React.FC<WordleGameProps> = ({
  secretWord,
  onFinish,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState<string>("");

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

    const isCorrect = currentInput.toLowerCase() === secretWord.toLowerCase();

    setCurrentInput("");

    if (isCorrect || newGuesses.length === 6) {
      // Notify parent after slight delay so last row renders first
      setTimeout(() => onFinish(currentInput, isCorrect), 300);
    }
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

  const rows = Array.from({ length: 6 }).map((_, rowIdx) => {
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
      <View style={styles.grid}>{rows}</View>

      {/* Keyboard & Submit */}
      <CustomKeyboard onKeyPress={handleKeyPress} onDelete={handleDelete} />
      <MinimalButton
        title="Submit Guess"
        onPress={handleSubmit}
        variant="primary"
        disabled={currentInput.length !== 5}
        style={styles.submitButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
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
  submitButton: {
    marginTop: 12,
    width: "90%",
  },
});
