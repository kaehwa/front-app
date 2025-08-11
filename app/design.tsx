import { View, Text, ScrollView } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";

export default function Design() {
  return (
    <ScrollView className="flex-1 bg-white" contentContainerClassName="p-5 gap-6">
      <Text className="text-3xl font-bold text-text">Design System</Text>

      <Card>
        <Text className="text-lg font-semibold mb-3">Buttons</Text>
        <View className="flex-row gap-3">
          <Button title="Primary" onPress={() => {}} />
          <Button title="Ghost" onPress={() => {}} variant="ghost" />
        </View>
      </Card>

      <Card>
        <Text className="text-lg font-semibold mb-3">Form</Text>
        <View className="gap-4">
          <Field label="Your name" placeholder="홍길동" />
          <Field label="Email" placeholder="you@example.com" keyboardType="email-address" />
        </View>
      </Card>

      <Card>
        <Text className="text-lg font-semibold mb-3">Typography</Text>
        <Text className="text-2xl font-bold">Title / 2xl</Text>
        <Text className="text-lg">Body / lg</Text>
        <Text className="text-sm text-gray-500">Caption / sm</Text>
      </Card>
    </ScrollView>
  );
}
