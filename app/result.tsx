// app/result.tsx   → 경로: "/result"
import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function Result() {
  const { ids } = useLocalSearchParams<{ ids?: string }>();
  return (
    <View className="flex-1 items-center justify-center bg-white px-6">
      <Text className="text-2xl font-bold">취향 결과</Text>
      <Text className="mt-2 text-gray-600">선택: {ids ?? "없음"}</Text>
    </View>
  );
}
