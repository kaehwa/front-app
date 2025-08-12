// app/chat/[id].tsx
import React, { useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type Message = {
  id: string;
  text: string;
  createdAt: number; // ms
  userId: "me" | "other";
};

const PRODUCT = {
  thumb: { uri: "https://picsum.photos/seed/item/300/200" },
  title: "보드게임 니다벨리르",
  price: "16,000원",
  status: "거래완료",
};

const SEED_MSG: Message[] = [
  { id: "m1", text: "효자 2동 주민센터 근처 행복한 교회 건물 앞입니다", createdAt: Date.now() - 60 * 60 * 1000, userId: "other" },
  { id: "m2", text: "혹시 완산구청 앞은 어려우실까요??", createdAt: Date.now() - 58 * 60 * 1000, userId: "me" },
  { id: "m3", text: "어..넵 아이 재우면서 멀리는 못나갈 것 같아서요..", createdAt: Date.now() - 57 * 60 * 1000, userId: "other" },
  { id: "m4", text: "네! 알겠습니다! 거기 앞으로 갈게용", createdAt: Date.now() - 56 * 60 * 1000, userId: "me" },
  { id: "m5", text: "혹시 10:30은 괜찮으실까요? ㅎㅎ", createdAt: Date.now() - 55 * 60 * 1000, userId: "me" },
];

const BG = "#fff";
const CARD = "#1A1B1E";
const BUBBLE_ME = "#9FD49D";
const BUBBLE_OTHER = "#043B0F";
const TEXT_PRIMARY = "#F9FAFB";
const TEXT_MUTED = "#9CA3AF";

function timeHM(ms: number) {
  const d = new Date(ms);
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function ChatRoom() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState(SEED_MSG);
  const [text, setText] = useState("");
  const listRef = useRef<FlatList>(null);

  const header = useMemo(
    () => (
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={{ paddingRight: 6 }}>
          <Ionicons name="chevron-back" size={22} color={TEXT_PRIMARY} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>lolazepam</Text>
          <Text style={styles.headerSub}>보통 10분 이내 응답</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={20} color={TEXT_PRIMARY} />
      </View>
    ),
    []
  );

  const send = () => {
    if (!text.trim()) return;
    const msg: Message = {
      id: Math.random().toString(36).slice(2),
      text: text.trim(),
      createdAt: Date.now(),
      userId: "me",
    };
    setMessages((prev) => [msg, ...prev]);
    setText("");
    setTimeout(() => listRef.current?.scrollToOffset({ offset: 0, animated: true }), 10);
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.userId === "me";
    return (
      <View style={[styles.msgRow, isMe ? { justifyContent: "flex-end" } : { justifyContent: "flex-start" }]}>
        {!isMe && <Image source={{ uri: "https://picsum.photos/seed/user2/100/100" }} style={styles.msgAvatar} />}
        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleOther,
            isMe ? { borderBottomRightRadius: 6 } : { borderBottomLeftRadius: 6 },
          ]}
        >
          <Text style={[styles.msgText, isMe && { color: "#fff" }]}>{item.text}</Text>
          <Text style={[styles.time, isMe ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" }]}>
            {timeHM(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {header}

      {/* 상품 카드 (상단 고정) */}
      <View style={styles.productCard}>
        <Image source={PRODUCT.thumb} style={styles.productThumb} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.productStatus}>{PRODUCT.status}</Text>
          <Text style={styles.productTitle} numberOfLines={1}>{PRODUCT.title}</Text>
          <Text style={styles.productPrice}>{PRODUCT.price}</Text>
        </View>
        <Pressable style={styles.reviewBtn}>
          <Text style={styles.reviewBtnText}>보낸 후기 보기</Text>
        </Pressable>
      </View>

      {/* 메시지 리스트 (위에서 아래로 보이도록 inverted) */}
      <FlatList
        ref={listRef}
        data={[...messages].sort((a, b) => b.createdAt - a.createdAt)} // 최신이 위로
        keyExtractor={(m) => m.id}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8, paddingTop: 12 }}
        renderItem={renderItem}
        inverted
      />

      {/* 입력 바 */}
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.inputBar}>
          <Pressable hitSlop={8} style={styles.inputIcon}>
            <Ionicons name="image-outline" size={22} color={TEXT_MUTED} />
          </Pressable>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="메시지 보내기"
            placeholderTextColor={TEXT_MUTED}
            style={styles.textInput}
            multiline
          />
          <Pressable onPress={send} hitSlop={8} style={styles.sendBtn}>
            <Ionicons name="send" size={20} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  // 헤더
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#26272B",
  },
  headerTitle: { color: TEXT_PRIMARY, fontSize: 16, fontWeight: "700" },
  headerSub: { color: TEXT_MUTED, fontSize: 12 },

  // 상품 카드
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    padding: 10,
    backgroundColor: CARD,
    borderRadius: 12,
  },
  productThumb: { width: 64, height: 64, borderRadius: 8, backgroundColor: "#222" },
  productStatus: { color: "#FBBF24", fontSize: 12, marginBottom: 2 },
  productTitle: { color: TEXT_PRIMARY, fontSize: 14, fontWeight: "700" },
  productPrice: { color: TEXT_PRIMARY, fontSize: 13, marginTop: 2 },
  reviewBtn: {
    borderWidth: 1,
    borderColor: "#3B3C40",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  reviewBtnText: { color: TEXT_PRIMARY, fontSize: 12 },

  // 메시지
  msgRow: { flexDirection: "row", marginVertical: 6, alignItems: "flex-end" },
  msgAvatar: { width: 28, height: 28, borderRadius: 14, marginRight: 6 },
  bubble: {
    maxWidth: "80%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bubbleMe: { backgroundColor: BUBBLE_ME, alignSelf: "flex-end" },
  bubbleOther: { backgroundColor: BUBBLE_OTHER, alignSelf: "flex-start" },
  msgText: { color: TEXT_PRIMARY, fontSize: 15, lineHeight: 20 },
  time: { marginTop: 4, fontSize: 10, color: TEXT_PRIMARY, opacity: 0.7 },

  // 입력 바
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#26272B",
    backgroundColor: BG,
  },
  textInput: {
    flex: 1,
    maxHeight: 120,
    minHeight: 40,
    color: TEXT_PRIMARY,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#1C1D21",
  },
  inputIcon: { paddingHorizontal: 6, paddingVertical: 6, marginRight: 2 },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#9FD49D",
    width: 38, height: 38, borderRadius: 19,
    alignItems: "center", justifyContent: "center",
  },
});
