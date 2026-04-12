import React, { useMemo, useState } from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { Stack } from "expo-router";

import { CopyButton, SettingsSection, ThemedText, ThemedView } from "@/components/ui";
import { colors } from "@/constants/colors";
import {
  computeOffsetSweep,
  DebugAdvertisement,
  useBLEDebug,
} from "@/hooks/useBLEDebug";
import { useColorScheme } from "@/hooks/useColorScheme";

const WHC06_NAME_PATTERNS = ["IF_B7", "WH-C06", "WHC06"];

const looksLikeScale = (d: DebugAdvertisement) => {
  const n = `${d.name ?? ""} ${d.localName ?? ""}`.toUpperCase();
  return WHC06_NAME_PATTERNS.some((p) => n.includes(p.toUpperCase()));
};

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return d.toISOString().split("T")[1]?.replace("Z", "") ?? String(ts);
};

const buildReport = (
  devices: Record<string, DebugAdvertisement>,
  logs: { timestamp: number; level: string; message: string }[]
): string => {
  const lines: string[] = [];
  lines.push(`HangsFree BLE debug report`);
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(``);
  lines.push(`--- Devices (${Object.keys(devices).length}) ---`);
  for (const d of Object.values(devices).sort(
    (a, b) => b.lastSeen - a.lastSeen
  )) {
    lines.push(``);
    lines.push(`id:       ${d.id}`);
    lines.push(`name:     ${d.name ?? "(none)"}`);
    lines.push(`local:    ${d.localName ?? "(none)"}`);
    lines.push(`rssi:     ${d.rssi ?? "n/a"}`);
    lines.push(`seen:     ${d.seenCount} (last ${formatTime(d.lastSeen)})`);
    lines.push(`services: ${(d.serviceUUIDs ?? []).join(", ") || "(none)"}`);
    lines.push(`mfgHex:   ${d.manufacturerDataHex ?? "(none)"}`);
    if (d.manufacturerDataBytes && looksLikeScale(d)) {
      const sweep = computeOffsetSweep(d.manufacturerDataBytes);
      lines.push(
        `sweep:    ${
          sweep.length === 0
            ? "(no plausible weight values found)"
            : sweep
                .map(
                  (c) =>
                    `off=${c.offset} ${c.endianness} /${c.divisor} => ${c.value.toFixed(2)}kg`
                )
                .join(" | ")
        }`
      );
    }
  }
  lines.push(``);
  lines.push(`--- Logs (${logs.length}) ---`);
  for (const l of logs) {
    lines.push(`${formatTime(l.timestamp)} [${l.level}] ${l.message}`);
  }
  return lines.join("\n");
};

export default function DebugScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const palette = colors[colorScheme];

  const {
    bleInitialized,
    isScanning,
    devices,
    logs,
    startScan,
    stopScan,
    clear,
  } = useBLEDebug();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  const deviceList = useMemo(() => {
    const all = Object.values(devices).sort(
      (a, b) => b.lastSeen - a.lastSeen
    );
    return showAll ? all : all.filter(looksLikeScale);
  }, [devices, showAll]);

  const selected = selectedId ? devices[selectedId] : null;
  const sweep =
    selected?.manufacturerDataBytes &&
    computeOffsetSweep(selected.manufacturerDataBytes);

  const report = useMemo(() => buildReport(devices, logs), [devices, logs]);

  return (
    <>
      <Stack.Screen options={{ title: "BLE Debug" }} />
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title">BLE Debug</ThemedText>
          <ThemedText style={styles.hint}>
            Scans all nearby BLE advertisements. Useful when a WH-C06 scale is
            visible in system Bluetooth but the app shows no weight — the
            firmware may use a different name or byte layout.
          </ThemedText>

          <View style={styles.controls}>
            <Pressable
              onPress={isScanning ? stopScan : startScan}
              disabled={!bleInitialized}
              style={({ pressed }) => [
                styles.btn,
                {
                  backgroundColor: isScanning
                    ? "#c0392b"
                    : palette.tint,
                  opacity: pressed || !bleInitialized ? 0.7 : 1,
                },
              ]}
            >
              <ThemedText style={styles.btnText}>
                {isScanning ? "Stop scan" : "Start scan"}
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={clear}
              style={({ pressed }) => [
                styles.btn,
                styles.btnSecondary,
                { opacity: pressed ? 0.7 : 1, borderColor: palette.icon },
              ]}
            >
              <ThemedText style={[styles.btnText, { color: palette.text }]}>
                Clear
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => setShowAll((v) => !v)}
              style={({ pressed }) => [
                styles.btn,
                styles.btnSecondary,
                { opacity: pressed ? 0.7 : 1, borderColor: palette.icon },
              ]}
            >
              <ThemedText style={[styles.btnText, { color: palette.text }]}>
                {showAll ? "Scales only" : "Show all"}
              </ThemedText>
            </Pressable>
          </View>

          {!bleInitialized && (
            <ThemedText style={styles.warn}>
              BLE not initialized. Check Bluetooth/permissions.
            </ThemedText>
          )}

          <SettingsSection
            title={`Devices (${deviceList.length}${
              showAll ? "" : " scale-like"
            })`}
          >
            {deviceList.length === 0 && (
              <ThemedText style={styles.hint}>
                {isScanning
                  ? "Scanning…"
                  : "Tap Start scan. If you don't see your WH-C06, tap Show all."}
              </ThemedText>
            )}
            {deviceList.map((d) => {
              const isSelected = d.id === selectedId;
              return (
                <Pressable
                  key={d.id}
                  onPress={() =>
                    setSelectedId(isSelected ? null : d.id)
                  }
                  style={[
                    styles.deviceRow,
                    {
                      borderColor: isSelected ? palette.tint : palette.icon,
                    },
                  ]}
                >
                  <ThemedText type="defaultSemiBold">
                    {d.name ?? d.localName ?? "(unnamed)"}
                  </ThemedText>
                  <ThemedText style={styles.mono}>
                    {d.id} · rssi {d.rssi ?? "?"} · seen {d.seenCount}
                  </ThemedText>
                  {d.manufacturerDataHex && (
                    <ThemedText
                      style={styles.mono}
                      numberOfLines={isSelected ? undefined : 1}
                    >
                      mfg: {d.manufacturerDataHex}
                    </ThemedText>
                  )}
                </Pressable>
              );
            })}
          </SettingsSection>

          {selected && sweep && (
            <SettingsSection title="Offset sweep (selected device)">
              <ThemedText style={styles.hint}>
                Every offset whose 2 bytes decode to a plausible weight
                (0–500 kg). Compare with what the scale actually shows to
                identify the correct offset/endianness/divisor.
              </ThemedText>
              {sweep.length === 0 ? (
                <ThemedText style={styles.mono}>
                  No plausible values. Stand on/load the scale and rescan.
                </ThemedText>
              ) : (
                sweep.map((c, i) => (
                  <ThemedText key={i} style={styles.mono}>
                    offset {c.offset.toString().padStart(2, " ")}{" "}
                    {c.endianness.padEnd(6, " ")} /{c.divisor} ={" "}
                    {c.value.toFixed(2)} kg
                  </ThemedText>
                ))
              )}
            </SettingsSection>
          )}

          <SettingsSection title={`Logs (${logs.length})`}>
            {logs.length === 0 ? (
              <ThemedText style={styles.hint}>No log entries.</ThemedText>
            ) : (
              logs
                .slice(-50)
                .reverse()
                .map((l, i) => (
                  <ThemedText
                    key={i}
                    style={[
                      styles.mono,
                      l.level === "error" && { color: "#c0392b" },
                    ]}
                  >
                    {formatTime(l.timestamp)} [{l.level}] {l.message}
                  </ThemedText>
                ))
            )}
          </SettingsSection>

          <View style={styles.copyRow}>
            <ThemedText type="defaultSemiBold">Copy full report</ThemedText>
            <CopyButton textToCopy={report} testID="debug-copy-report" />
          </View>
        </ScrollView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 48 },
  hint: { opacity: 0.7, fontSize: 13 },
  warn: { color: "#c0392b" },
  controls: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnSecondary: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  btnText: { color: "#fff", fontWeight: "600" },
  deviceRow: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginVertical: 4,
    gap: 2,
  },
  mono: { fontFamily: "SpaceMono", fontSize: 12 },
  copyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
});
