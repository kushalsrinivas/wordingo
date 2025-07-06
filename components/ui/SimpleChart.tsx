import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimpleChartProps {
  data: ChartDataPoint[];
  title: string;
  type: "bar" | "line" | "pie";
  style?: ViewStyle;
  maxValue?: number;
  showValues?: boolean;
}

export function SimpleChart({
  data,
  title,
  type,
  style,
  maxValue,
  showValues = true,
}: SimpleChartProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const chartMaxValue = maxValue || Math.max(...data.map((d) => d.value));
  const chartColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
  ];

  const renderBarChart = () => (
    <View style={styles.barChartContainer}>
      {data.map((item, index) => {
        const barHeight =
          chartMaxValue > 0 ? (item.value / chartMaxValue) * 100 : 0;
        const barColor = item.color || chartColors[index % chartColors.length];

        return (
          <View key={index} style={styles.barContainer}>
            <View style={styles.barWrapper}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${barHeight}%`,
                    backgroundColor: barColor,
                  },
                ]}
              />
            </View>
            {showValues && (
              <Text style={[styles.barValue, { color: colors.text }]}>
                {item.value}
              </Text>
            )}
            <Text style={[styles.barLabel, { color: colors.textSecondary }]}>
              {item.label}
            </Text>
          </View>
        );
      })}
    </View>
  );

  const renderLineChart = () => {
    const points = data.map((item, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y =
        chartMaxValue > 0 ? 100 - (item.value / chartMaxValue) * 100 : 100;
      return { x, y, value: item.value };
    });

    return (
      <View style={styles.lineChartContainer}>
        <View style={styles.lineChartArea}>
          {points.map((point, index) => (
            <View
              key={index}
              style={[
                styles.linePoint,
                {
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  backgroundColor: chartColors[0],
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.lineChartLabels}>
          {data.map((item, index) => (
            <Text
              key={index}
              style={[styles.lineLabel, { color: colors.textSecondary }]}
            >
              {item.label}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let startAngle = 0;

    return (
      <View style={styles.pieChartContainer}>
        <View style={styles.pieChart}>
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.value / total) * 100 : 0;
            const sliceColor =
              item.color || chartColors[index % chartColors.length];

            return (
              <View key={index} style={styles.pieSliceContainer}>
                <View
                  style={[
                    styles.pieSlice,
                    {
                      backgroundColor: sliceColor,
                      width: `${percentage}%`,
                    },
                  ]}
                />
              </View>
            );
          })}
        </View>
        <View style={styles.pieLegend}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View
                style={[
                  styles.legendColor,
                  {
                    backgroundColor:
                      item.color || chartColors[index % chartColors.length],
                  },
                ]}
              />
              <Text
                style={[styles.legendText, { color: colors.textSecondary }]}
              >
                {item.label}: {item.value}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {type === "bar" && renderBarChart()}
      {type === "line" && renderLineChart()}
      {type === "pie" && renderPieChart()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 16,
    textAlign: "center",
  },

  // Bar Chart Styles
  barChartContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
    height: 120,
    marginBottom: 16,
  },
  barContainer: {
    alignItems: "center",
    flex: 1,
    marginHorizontal: 2,
  },
  barWrapper: {
    height: 80,
    width: "100%",
    justifyContent: "flex-end",
    marginBottom: 4,
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 2,
  },
  barValue: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
    marginBottom: 2,
  },
  barLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 12,
  },

  // Line Chart Styles
  lineChartContainer: {
    height: 120,
  },
  lineChartArea: {
    height: 80,
    position: "relative",
    marginBottom: 16,
  },
  linePoint: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: -3,
    marginTop: -3,
  },
  lineChartLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  lineLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
  },

  // Pie Chart Styles
  pieChartContainer: {
    alignItems: "center",
  },
  pieChart: {
    flexDirection: "row",
    width: 200,
    height: 20,
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
  },
  pieSliceContainer: {
    height: "100%",
  },
  pieSlice: {
    height: "100%",
  },
  pieLegend: {
    alignItems: "flex-start",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
});
