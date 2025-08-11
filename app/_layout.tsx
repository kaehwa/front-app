// app/_layout.tsx
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const [loaded] = useFonts({
    "SKTSanstitle-ExtraBold": require("../assets/fonts/SKTSanstitle-ExtraBold.otf"),
    "SKTSanstext-SemiBold": require("../assets/fonts/SKTSanstext-SemiBold.otf"), // 없으면 이 줄 삭제
  });

  if (!loaded) return null; // 폰트 로딩 전엔 렌더 안 함

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#fff" },
        }}
      />
    </SafeAreaProvider>
  );
}
