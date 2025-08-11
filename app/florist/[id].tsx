import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
export default function FloristDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <View style={{flex:1,alignItems:"center",justifyContent:"center"}}><Text>플로리스트 상세: {id}</Text></View>;
}