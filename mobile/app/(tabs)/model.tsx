// app/(tabs)/model.tsx

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { Upload, Send, FileText, X } from "lucide-react-native";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const ChatInterface = () => {
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const BACKEND_URL = "http://192.168.1.6:8000"; // No trailing slash!

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chat, loading]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets?.[0]) {
        setFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to pick PDF file");
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name || "research_paper.pdf",
      type: file.mimeType || "application/pdf",
    } as any);

    try {
      setUploading(true);
      const res = await fetch(`${BACKEND_URL}/upload`, { method: "POST", body: formData });

      if (!res.ok) {
        const errText = await res.text();
        Alert.alert("Upload Failed", errText || "Server error");
        return;
      }

      const data = await res.json();
      setDocumentId(data.documentId);
      setChat([]);
      setFile(null);
      Alert.alert("Success 🎉", "Paper indexed! Ready for questions.");
    } catch (e) {
      Alert.alert("Network Error", "Check connection and server.");
    } finally {
      setUploading(false);
    }
  };

  const handleAsk = async () => {
    if (!question.trim() || !documentId) return;

    const userMessage: ChatMessage = { role: "user", content: question.trim() };
    setChat(prev => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, question: userMessage.content }),
      });

      if (!res.ok) throw new Error();
      const data = await res.json();
      setChat(prev => [...prev, { role: "assistant", content: data.result }]);
    } catch {
      setChat(prev => [...prev, { role: "assistant", content: "⚠️ Failed to get answer." }]);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const exampleQuestions = [
    "What is the main contribution?",
    "Summarize the abstract",
    "What methods were used?",
    "Explain the results",
    "What are the limitations?",
  ];

  if (!documentId) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-gray-50">
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
          <View className="flex-1 justify-center">
            <View className="bg-white rounded-3xl shadow-2xl p-8">
              <Text className="text-3xl font-bold text-center text-gray-800 mb-3">Research Paper Assistant</Text>
              <Text className="text-center text-gray-600 mb-8">Upload a PDF to begin</Text>

              <TouchableOpacity
                onPress={pickDocument}
                activeOpacity={0.8}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-10 items-center bg-gray-50 mb-8"
              >
                <Upload size={48} color="#6b7280" />
                {file ? (
                  <View className="mt-5 items-center w-full">
                    <View className="bg-gray-100 px-4 py-3 rounded-xl flex-row items-center w-full">
                      <FileText size={28} color="#dc2626" />
                      <View className="ml-3 flex-1">
                        <Text className="font-medium text-gray-900" numberOfLines={1}>{file.name}</Text>
                        <Text className="text-sm text-gray-500">{formatFileSize(file.size)}</Text>
                      </View>
                      <TouchableOpacity onPress={() => setFile(null)}>
                        <X size={20} color="#6b7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text className="mt-5 text-lg font-medium text-gray-700">Tap to select PDF</Text>
                )}
              </TouchableOpacity>

              <LinearGradient colors={["#6366f1", "#a855f7"]} className="rounded-2xl overflow-hidden">
                <TouchableOpacity
                  onPress={handleUpload}
                  disabled={!file || uploading}
                  activeOpacity={0.9}
                  className="py-4 items-center"
                  style={{ opacity: !file || uploading ? 0.5 : 1 }}
                >
                  <Text className="text-white font-bold text-lg">
                    {uploading ? "Indexing..." : "Upload & Index"}
                  </Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 bg-gray-50">
      <View className="flex-1">
        <LinearGradient colors={["#10b981", "#059669"]} className="py-4 px-6">
          <Text className="text-white text-lg font-semibold text-center">Paper ready! Ask away</Text>
        </LinearGradient>

        <ScrollView ref={scrollViewRef} className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {chat.length === 0 ? (
            <View className="items-center mt-16">
              <View className="w-28 h-28 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full items-center justify-center shadow-xl mb-8">
                <Text className="text-white text-5xl font-bold">R</Text>
              </View>
              <Text className="text-2xl font-bold text-gray-800 text-center mb-4">Ask anything</Text>
              <View className="flex-row flex-wrap justify-center gap-3 mt-6">
                {exampleQuestions.map(q => (
                  <TouchableOpacity
                    key={q}
                    onPress={() => setQuestion(q)}
                    className="bg-white px-5 py-3 rounded-full shadow"
                  >
                    <Text className="text-gray-700 text-sm">{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <>
              {chat.map((msg, idx) => (
                <View key={idx} className={`my-4 max-w-[80%] ${msg.role === "user" ? "self-end" : "self-start"}`}>
                  {msg.role === "user" ? (
                    <LinearGradient colors={["#6366f1", "#a855f7"]} className="px-5 py-4 rounded-3xl rounded-br-none shadow-lg">
                      <Text className="text-white text-base">{msg.content}</Text>
                    </LinearGradient>
                  ) : (
                    <View className="bg-white px-5 py-4 rounded-3xl rounded-bl-none shadow-lg border border-gray-100">
                      <Text className="text-gray-800 text-base">{msg.content}</Text>
                    </View>
                  )}
                </View>
              ))}

              {loading && (
                <View className="flex-row items-center my-6 self-start">
                  <View className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full items-center justify-center mr-3">
                    <Text className="text-white font-bold text-lg">R</Text>
                  </View>
                  <View className="flex-row gap-2 items-end">
                    <View className="w-2 h-2 bg-indigo-500 rounded-full" />
                    <View className="w-2 h-2 bg-indigo-500 rounded-full opacity-70" />
                    <View className="w-2 h-2 bg-indigo-500 rounded-full opacity-40" />
                    <Text className="ml-2 text-gray-600">Thinking...</Text>
                  </View>
                </View>
              )}
            </>
          )}
          <View className="h-20" /> {/* Bottom padding */}
        </ScrollView>

        <View className="bg-white border-t border-gray-200 px-4 py-3">
          <View className="flex-row items-center gap-3">
            <TextInput
              placeholder="Ask a question..."
              value={question}
              onChangeText={setQuestion}
              onSubmitEditing={handleAsk}
              editable={!loading}
              className="flex-1 bg-gray-100 rounded-full px-5 py-4 text-base"
              placeholderTextColor="#9ca3af"
            />
            <LinearGradient colors={["#6366f1", "#a855f7"]} className="p-3 rounded-full shadow-lg">
              <TouchableOpacity
                onPress={handleAsk}
                disabled={loading || !question.trim()}
                activeOpacity={0.8}
                style={{ opacity: loading || !question.trim() ? 0.5 : 1 }}
              >
                <Send size={24} color="white" />
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatInterface;