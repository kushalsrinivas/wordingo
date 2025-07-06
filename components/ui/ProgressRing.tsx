import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface ProgressRingProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
  children?: React.ReactNode;
  showPercentage?: boolean;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color,
  backgroundColor,
  style,
  children,
  showPercentage = false,
}: ProgressRingProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - progress * circumference;

  const progressColor = color || "#4ECDC4";
  const bgColor =
    backgroundColor ||
    (colorScheme === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.1)");

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Background Circle */}
      <View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: bgColor,
          },
        ]}
      />

      {/* Progress Circle */}
      <View
        style={[
          styles.progressCircle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: progressColor,
            borderTopColor: progressColor,
            borderRightColor: progress > 0.25 ? progressColor : "transparent",
            borderBottomColor: progress > 0.5 ? progressColor : "transparent",
            borderLeftColor: progress > 0.75 ? progressColor : "transparent",
            transform: [{ rotate: `${-90 + progress * 360}deg` }],
          },
        ]}
      />

      {/* Content */}
      <View style={styles.content}>
        {children ||
          (showPercentage && (
            <Text style={[styles.percentage, { color: colors.text }]}>
              {Math.round(progress * 100)}%
            </Text>
          ))}
      </View>
    </View>
  );
}

// Simpler implementation using border trick
export function SimpleProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color,
  backgroundColor,
  style,
  children,
  showPercentage = false,
}: ProgressRingProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const progressColor = color || "#4ECDC4";
  const bgColor =
    backgroundColor ||
    (colorScheme === "dark"
      ? "rgba(255, 255, 255, 0.1)"
      : "rgba(0, 0, 0, 0.1)");

  // Create segments for the progress ring
  const segments = 20; // Number of segments
  const segmentAngle = 360 / segments;
  const filledSegments = Math.floor(progress * segments);

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {/* Background Ring */}
      <View
        style={[
          styles.backgroundRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: bgColor,
          },
        ]}
      />

      {/* Progress Segments */}
      {Array.from({ length: segments }, (_, index) => {
        const isActive = index < filledSegments;
        const rotation = index * segmentAngle;

        return (
          <View
            key={index}
            style={[
              styles.segment,
              {
                width: strokeWidth,
                height: size / 2 - strokeWidth,
                backgroundColor: isActive ? progressColor : "transparent",
                transform: [
                  { rotate: `${rotation}deg` },
                  { translateY: -size / 4 + strokeWidth / 2 },
                ],
              },
            ]}
          />
        );
      })}

      {/* Content */}
      <View style={styles.content}>
        {children ||
          (showPercentage && (
            <Text style={[styles.percentage, { color: colors.text }]}>
              {Math.round(progress * 100)}%
            </Text>
          ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  circle: {
    position: "absolute",
  },
  progressCircle: {
    position: "absolute",
    borderTopColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
  },
  backgroundRing: {
    position: "absolute",
  },
  segment: {
    position: "absolute",
    borderRadius: 2,
    transformOrigin: "center bottom",
  },
  content: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  percentage: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
  },
});
