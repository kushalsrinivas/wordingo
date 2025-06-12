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
import { GlassCard } from "./GlassCard";

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
      style={[styles.secondaryButtonContainer, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <GlassCard style={styles.secondaryButton} borderRadius={24}>
        <Text
          style={[
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
      </GlassCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  primaryButtonText: {
    fontSize: 16,
    letterSpacing: 0.5,
  },
  secondaryButtonContainer: {
    minHeight: 48,
  },
  secondaryButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",

    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  secondaryButtonText: {
    fontSize: 14,
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.5,
  },
});
