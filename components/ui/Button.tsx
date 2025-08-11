import { Pressable, Text, View } from "react-native";

export function Button({ title, onPress, variant="primary" }: {title:string; onPress:()=>void; variant?: "primary"|"ghost"}) {
  const base = "px-5 py-3 rounded-2xl";
  const styles = variant === "primary" ? "bg-primary" : "bg-transparent border border-gray-300";
  const text  = variant === "primary" ? "text-white" : "text-text";
  return (
    <Pressable onPress={onPress} className={`${base} ${styles}`}>
      <Text className={`${text} text-base font-semibold`}>{title}</Text>
    </Pressable>
  );
}
