import React, { useMemo, useRef, useState, useEffect } from "react";      
import {
  View, Text, StyleSheet, SafeAreaView, Pressable, Dimensions,
  Image, FlatList, ScrollView, Animated,
} from "react-native";
import { Link, useLocalSearchParams, router, Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";


export default function LowBars() {
    return(
        <View style={styles.tabBarShadow}>
            <View style={styles.tabBar}>
            <TabItem icon="home"  label="홈" href={"/main" as Href} active />
            <TabItem icon="heart" label="찜 리스트" href={"/likes" as Href} />
            <TabItem icon="chatbubble-ellipses" label="챗팅" href={"/chat" as Href} />
            <TabItem icon="person" label="마이페이지" href={"/me" as Href} />
            </View>
        </View>
    )
}

function TabItem({
  icon, label, href, active=false,
}: {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    href: Href; // 페이지 파일이 없으면 임시로 Href 캐스팅 사용
    active?: boolean;
}) {
    return (
    <Link href={href} asChild>
        <Pressable style={styles.tabItem}>
        <Ionicons name={icon} size={22} color={active ? "#043B0F" : "#666"} />
        <Text style={[styles.tabLabel, active && { color: "#043B0F", fontWeight: "600" }]}>{label}</Text>
        </Pressable>
    </Link>
    );
}

const styles = StyleSheet.create({
    tabBarShadow: {backgroundColor: "transparent", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: -2 }, elevation: 8 },
    tabBar: {height: 66, backgroundColor: "#fff", borderTopLeftRadius: 18, borderTopRightRadius: 18, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingBottom: 6 },
    tabItem: { alignItems: "center", justifyContent: "center", gap: 2 },
    tabLabel: { fontSize: 11, color: "#666" },
});