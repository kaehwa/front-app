// app/chat.tsx
import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
} from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type ChatPreview = {
  id: string;
  title: string;      // 상대/채팅방 이름
  avatar: { uri: string };
  lastMsg: string;
  updatedAt: number;  // ms
  unread: number;
  verified?: boolean;
};

const SEED: ChatPreview[] = [
  {
    id: "c1",
    title: "밍크",
    avatar: { uri: "https://picsum.photos/seed/user1/100/100" },
    lastMsg: "평일은 저녁 7시 이후부터 구매 가능하세요",
    updatedAt: Date.now() - 7 * 60 * 1000,
    unread: 0,
    verified: false,
  },
  {
    id: "c2",
    title: "lolazepam",
    avatar: { uri: "https://picsum.photos/seed/user2/100/100" },
    lastMsg: "네! 알겠습니다. 10시 이후 괜찮으실까요?",
    updatedAt: Date.now() - 10 * 60 * 1000,
    unread: 2,
    verified: false,
  },
  {
    id: "c3",
    title: "오로노이",
    avatar: { uri: "https://picsum.photos/seed/user3/100/100" },
    lastMsg: "내일 오전 중으로 보내드릴게요",
    updatedAt: Date.now() - 60 * 60 * 1000,
    unread: 0,
    verified: true,
  },
];

function timeAgo(ms: number) {
  const diff = Math.max(0, Date.now() - ms);
  const m = Math.floor(diff / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}

export default function ChatList() {
  const [chats] = useState(SEED);
  const header = useMemo(
    () => (
      <View style={styles.header}>
        <Text style={styles.headerTitle}>채팅</Text>
      </View>
    ),
    []
  );

  return (
    <SafeAreaView style={styles.safe}>
      {header}
      <FlatList
        data={chats}
        keyExtractor={(it) => it.id}
        contentContainerStyle={{ paddingBottom: 16 }}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <Link
            href={{ pathname: "/chat/[id]", params: { id: item.id } }}
            asChild
          >
            <Pressable style={styles.row}>
              <Image source={item.avatar} style={styles.avatar} />
              <View style={styles.rowContent}>
                <View style={styles.rowTop}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={styles.title} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {item.verified && (
                      <Ionicons
                        name="checkmark-circle"
                        size={14}
                        color="#4ADE80"
                        style={{ marginLeft: 6 }}
                      />
                    )}
                  </View>
                  <Text style={styles.time}>{timeAgo(item.updatedAt)}</Text>
                </View>
                <Text style={styles.lastMsg} numberOfLines={1}>
                  {item.lastMsg}
                </Text>
              </View>

              {item.unread > 0 && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadText}>
                    {item.unread > 99 ? "99+" : item.unread}
                  </Text>
                </View>
              )}
            </Pressable>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}

const BG = "#111214";
const CARD = "#1A1B1E";
const MUTED = "#9CA3AF";
const WHITE = "#F9FAFB";
const ORANGE = "#FF7A2E";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#26272B",
  },
  headerTitle: { color: WHITE, fontSize: 20, fontWeight: "700" },
  sep: { height: 1, backgroundColor: "#18191C" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: CARD },
  rowContent: { flex: 1, marginLeft: 12 },
  rowTop: { flexDirection: "row", justifyContent: "space-between" },
  title: { color: WHITE, fontSize: 16, fontWeight: "600", maxWidth: "70%" },
  time: { color: MUTED, fontSize: 12 },
  lastMsg: { color: MUTED, fontSize: 13, marginTop: 3 },
  unreadBadge: {
    backgroundColor: ORANGE,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadText: { color: WHITE, fontSize: 11, fontWeight: "700" },
});
