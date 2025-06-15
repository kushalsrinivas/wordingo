import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useState } from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { GlassCard } from "./GlassCard";

const { width } = Dimensions.get("window");

interface CustomKeyboardProps {
  onKeyPress: (key: string) => void;
  onDelete: () => void;
}

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
];

export function CustomKeyboard({ onKeyPress, onDelete }: CustomKeyboardProps) {
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleKeyPress = (key: string) => {
    setPressedKey(key);
    onKeyPress(key);

    // Reset pressed state after animation
    setTimeout(() => setPressedKey(null), 150);
  };

  const handleDelete = () => {
    setPressedKey("DELETE");
    onDelete();

    // Reset pressed state after animation
    setTimeout(() => setPressedKey(null), 150);
  };

  const renderKey = (
    key: string,
    index: number,
    isLastRow: boolean = false
  ) => {
    const isPressed = pressedKey === key;
    const keyWidth =
      (width - 48 - (KEYBOARD_ROWS[0].length - 1) * 6) /
      KEYBOARD_ROWS[0].length;

    const keyStyle = {
      ...styles.key,
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.05)"
          : "rgba(0, 0, 0, 0.03)",
      borderColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(0, 0, 0, 0.08)",
    };

    const pressedStyle = {
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.15)"
          : "rgba(0, 0, 0, 0.08)",
      transform: [{ scale: 0.95 }],
    };

    return (
      <TouchableOpacity
        key={`${key}-${index}`}
        onPress={() => handleKeyPress(key)}
        activeOpacity={0.7}
        style={[styles.keyContainer, { width: keyWidth }]}
      >
        <GlassCard
          style={StyleSheet.flatten([keyStyle, isPressed && pressedStyle])}
        >
          <Text style={[styles.keyText, { color: colors.text }]}>{key}</Text>
        </GlassCard>
      </TouchableOpacity>
    );
  };

  const renderDeleteKey = () => {
    const isPressed = pressedKey === "DELETE";
    const deleteKeyWidth = (width - 48 - 6 * 6) / 7; // Slightly wider than regular keys

    const deleteKeyStyle = {
      ...styles.key,
      ...styles.deleteKey,
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.08)"
          : "rgba(0, 0, 0, 0.05)",
      borderColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.15)"
          : "rgba(0, 0, 0, 0.12)",
    };

    const pressedStyle = {
      backgroundColor:
        colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.2)"
          : "rgba(0, 0, 0, 0.1)",
      transform: [{ scale: 0.95 }],
    };

    return (
      <TouchableOpacity
        onPress={handleDelete}
        activeOpacity={0.7}
        style={[styles.keyContainer, { width: deleteKeyWidth * 1.5 }]}
      >
        <View
          style={StyleSheet.flatten([
            deleteKeyStyle,
            isPressed && pressedStyle,
          ])}
        >
          <Text style={[styles.deleteKeyText, { color: colors.text }]}>⌫</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.keyboard, { backgroundColor: colors.background }]}>
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {/* Add spacing for middle row */}
          {rowIndex === 1 && <View style={{ width: (width - 48) * 0.05 }} />}

          {row.map((key, keyIndex) => renderKey(key, keyIndex, rowIndex === 2))}

          {/* Add delete key to the last row */}
          {rowIndex === 2 && renderDeleteKey()}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 10, // Extra padding for safe area
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
    gap: 6,
  },
  keyContainer: {
    height: 44, // iOS standard touch target
  },
  key: {
    flex: 1,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  keyText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    fontWeight: "500",
  },
  deleteKey: {
    // Additional styling for delete key will be applied dynamically
  },
  deleteKeyText: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    fontWeight: "500",
  },
});
