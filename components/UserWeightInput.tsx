import { StyleSheet, TextInput } from "react-native";

import { useColorScheme } from "@/hooks/useColorScheme";

import { ThemedText } from "./ui/ThemedText";
import { ThemedView } from "./ui/ThemedView";

export const UserWeightInput = ({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const isLight = colorScheme === "light";

  return (
    <ThemedView style={styles.userWeightContainer}>
      <ThemedText>Your weight: </ThemedText>
      <TextInput
        style={{
          ...styles.input,
          borderColor: isLight ? "#000000" : "#FFFFFF",
          color: isLight ? "#000000" : "#FFFFFF",
        }}
        onChangeText={onChangeText}
        value={value}
        placeholder="Weight"
        keyboardType="numeric"
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  userWeightContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
});
