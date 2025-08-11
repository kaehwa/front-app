import { View, TextInput, Text } from "react-native";
export function Field({ label, ...props }: any) {
  return (
    <View className="gap-2">
      {label && <Text className="text-sm text-gray-600">{label}</Text>}
      <TextInput
        className="bg-muted rounded-xl px-4 py-3 text-base"
        placeholderTextColor="#9AA0A6"
        {...props}
      />
    </View>
  );
}
