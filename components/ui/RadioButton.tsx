import React, { memo, useRef, useEffect } from "react";

import { Animated, StyleSheet } from "react-native";

import { ThemedView } from "@/components/ui/ThemedView";
import { colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export const RadioButton = memo(({ selected }: { selected: boolean }) => {
  const animation = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? "light";

  useEffect(() => {
    Animated.timing(animation, {
      toValue: selected ? 1 : 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  return (
    <ThemedView
      style={[
        styles.radioButton,
        { borderColor: colors[theme].icon },
        selected && { borderColor: colors[theme].primary },
      ]}
    >
      <Animated.View
        style={[
          styles.innerCircle,
          {
            backgroundColor: colors[theme].primary,
            opacity: animation,
            transform: [
              {
                scale: animation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
              },
            ],
          },
        ]}
      />
    </ThemedView>
  );
});
RadioButton.displayName = "RadioButton";

const styles = StyleSheet.create({
  radioButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  innerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});
