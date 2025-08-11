import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function AnniversaryPage() {
  const { anniv } = useLocalSearchParams<{ anniv?: string }>();
  return (
    <View style={styles.box}>
      <Text style={styles.title}>기념일 설정</Text>
      <Text style={styles.sub}>현재: {anniv ?? "미설정"}</Text>
      {/* 여기서 DatePicker 붙이거나, 다음 단계에서 AsyncStorage로 저장하도록 확장 */}
    </View>
  );
}
const styles = StyleSheet.create({
  box: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700" },
  sub: { marginTop: 8, fontSize: 14, color: "#555" },
});
