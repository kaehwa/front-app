import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useLikesStore } from "../stores/useLikesStore";
import type { Florist } from "../types/florist";

export default function FloristCard({ florist, onPress }: { florist: Florist; onPress?: () => void }) {
  const toggle = useLikesStore((s) => s.toggleLike);
  const liked = useLikesStore((s) => s.isLiked(florist.id));

  return (
    <Pressable onPress={onPress} style={styles.card}>
      {florist.image ? (
        typeof florist.image === "string" ? (
          <Image source={{ uri: florist.image }} style={styles.thumbnail} />
        ) : (
          <Image source={florist.image as any} style={styles.thumbnail} />
        )
      ) : (
        <View style={[styles.thumbnail, styles.thumbPlaceholder]} />
      )}

      <Text numberOfLines={1} style={styles.name}>{florist.name}</Text>

      <Pressable
        onPress={() => toggle(florist.id)}
        hitSlop={12}
        style={styles.heart}
      >
        <Ionicons name={liked ? "heart" : "heart-outline"} size={18} color={liked ? "#FF5A5F" : "#FF5A5F"} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "30%",                // 3열(간격으로 약간 줄임)
    aspectRatio: 0.78,           // 이미지+텍스트 비율
    marginHorizontal: "1.66%",   // 30% * 3 + 1.66%*6 ≈ 100%
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#fff",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
    overflow: "hidden",
  },
  thumbnail: { width: "100%", height: "70%" },
  thumbPlaceholder: { backgroundColor: "#f2f2f2" },
  name: { paddingHorizontal: 10, paddingTop: 8, fontSize: 14, fontWeight: "600" },
  heart: { position: "absolute", right: 8, bottom: 8 },
});
