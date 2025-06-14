import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Ionicons } from "@expo/vector-icons";
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
  variant?: "primary" | "secondary" | "accent";
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  iconName?: React.ComponentProps<typeof Ionicons>["name"];
  iconPosition?: "left" | "right";
}

export function MinimalButton({
  title,
  onPress,
  variant = "primary",
  style,
  textStyle,
  disabled = false,
  iconName,
  iconPosition = "left",
}: MinimalButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const renderContent = (textColor: string) => (
    <>
      {iconName && iconPosition === "left" && (
        <Ionicons
          name={iconName}
          size={18}
          color={textColor}
          style={{ marginRight: 8 }}
        />
      )}
      <Text
        style={[
          styles.buttonText,
          variant === "secondary"
            ? styles.secondaryButtonText
            : styles.primaryButtonText,
          {
            color: textColor,
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
      {iconName && iconPosition === "right" && (
        <Ionicons
          name={iconName}
          size={18}
          color={textColor}
          style={{ marginLeft: 8 }}
        />
      )}
    </>
  );

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
        {renderContent(colors.background)}
      </TouchableOpacity>
    );
  }

  if (variant === "accent") {
    return (
      <TouchableOpacity
        style={[
          styles.button,
          styles.primaryButton,
          {
            backgroundColor: colors.highlight,
            borderColor: colors.highlight,
          },
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {renderContent(colors.background)}
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
      {renderContent(colors.text)}
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
    minHeight: 56,
    flexDirection: "row",
    justifyContent: "center",
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
