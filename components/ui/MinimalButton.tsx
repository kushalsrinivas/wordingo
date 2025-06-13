import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

interface MinimalButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function MinimalButton({
  title,
  onPress,
  variant = "primary",
  style,
  textStyle,
  disabled = false,
}: MinimalButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  if (variant === "primary") {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          styles.primaryButton,
          {
            backgroundColor: colors.text,
            borderColor: colors.text,
          },
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.buttonText,
            styles.primaryButtonText,
            {
              color: colors.background,
              fontFamily: "Inter_500Medium",
            },
            textStyle,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles.secondaryButton,
        {
          backgroundColor: colors.glassBackground,
          borderColor: colors.glassBorder,
        },
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.buttonText,
          styles.secondaryButtonText,
          {
            color: colors.text,
            fontFamily: "Inter_400Regular",
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  primaryButton: {
    // Primary button specific styles
  },
  secondaryButton: {
    // Secondary button with glass effect
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  primaryButtonText: {
    // Primary text specific styles
  },
  secondaryButtonText: {
    fontSize: 14,
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.5,
  },
});
