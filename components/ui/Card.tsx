import { View } from "react-native";
export function Card({ children }: any) {
  return <View className="rounded-2xl bg-white shadow-sm p-4">{children}</View>;
}
