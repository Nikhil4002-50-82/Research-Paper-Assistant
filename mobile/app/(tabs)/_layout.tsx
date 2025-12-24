import { Tabs } from "expo-router";
import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel:false
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color }) => (
            <FontAwesome name="home" size={32} color="black" />
          ),
        }}
      />
      <Tabs.Screen
        name="model"
        options={{
          tabBarIcon: ({ color }) => (
            <AntDesign name="wechat" size={32} color="black" />
          ),
        }}
      />
    </Tabs>
  );
}
