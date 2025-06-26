import { StyleSheet, TextInput } from "react-native";

import { useWeightUnits } from "@/contexts/WeightUnitsContext";
import { useColorScheme } from "@/hooks/useColorScheme";

import { ThemedText, ThemedView } from "./ui";

type UserWeightInputProps = {
  value: string;
  onChangeText: (text: string) => void;
};

export const UserWeightInput = ({
  value,
  onChangeText,
}: UserWeightInputProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const isLight = colorScheme === "light";
  const { weightUnit } = useWeightUnits();

  return (
    <ThemedView style={styles.userWeightContainer}>
      <ThemedText>Your weight ({weightUnit}): </ThemedText>
      <TextInput
        style={{
          ...styles.input,
          borderColor: isLight ? "#000000" : "#FFFFFF",
          color: isLight ? "#000000" : "#FFFFFF",
        }}
        onChangeText={onChangeText}
        value={value}
        placeholder={`Weight in ${weightUnit}`}
        placeholderTextColor="#808080"
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
