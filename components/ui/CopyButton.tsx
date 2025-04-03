import React, { useCallback, useState } from "react";

import { Pressable, StyleSheet } from "react-native";

import * as Clipboard from "expo-clipboard";

import { colors } from "@/constants/colors";
import { useColorScheme } from "@/hooks/useColorScheme";

import { IconSymbol } from "./IconSymbol";

interface CopyButtonProps {
  textToCopy: string;
  testID?: string;
}

export function CopyButton({
  textToCopy,
  testID = "copy-button",
}: CopyButtonProps) {
  const colorScheme = useColorScheme() ?? "light";
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    // Show checkmark icon
    setIsCopied(true);

    await Clipboard.setStringAsync(textToCopy);

    // Reset to copy icon after 1.5 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 1500);
  }, [textToCopy]);

  return (
    <Pressable
      onPress={handleCopy}
      style={({ pressed }) => [
        styles.copyButton,
        pressed && styles.copyButtonPressed,
      ]}
      testID={testID}
    >
      <IconSymbol
        name={isCopied ? "checkmark" : "doc.on.doc"}
        size={22}
        weight="medium"
        color={colorScheme === "light" ? colors.light.icon : colors.dark.icon}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  copyButton: {
    padding: 4,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  copyButtonPressed: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
});
