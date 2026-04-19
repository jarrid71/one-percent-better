import React, { useMemo, useState } from "react";
import {
    Alert,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { useFeatureSuggestions } from "@/context/FeatureSuggestionsContext";
import { useAppTheme } from "@/context/ThemeContext";

type SortMode = "top" | "new" | "trending";

export default function SuggestionsSection() {
  const { colors } = useAppTheme();
  const {
    suggestions,
    addSuggestion,
    upvoteSuggestion,
    deleteSuggestion,
    adminDeleteSuggestion,
    unlockAdminMode,
    lockAdminMode,
    isAdminMode,
    isLoading,
  } = useFeatureSuggestions();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("top");
  const [searchText, setSearchText] = useState("");

  function handleAddSuggestion() {
    if (!title.trim()) {
      Alert.alert("Missing title", "Please enter a feature title.");
      return;
    }

    addSuggestion(title, description);
    setTitle("");
    setDescription("");
  }

  function handleUnlockAdminMode() {
    const success = unlockAdminMode(adminPin);

    if (!success) {
      Alert.alert("Wrong PIN", "That admin PIN is incorrect.");
      return;
    }

    setAdminPin("");
    setShowAdminModal(false);
  }

  function handleAdminDelete(id: string) {
    Alert.alert("Admin delete", "Remove this suggestion?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => adminDeleteSuggestion(id),
      },
    ]);
  }

  function handleUserDelete(id: string) {
    Alert.alert("Delete suggestion", "Remove this suggestion?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteSuggestion(id),
      },
    ]);
  }

  const visibleSuggestions = useMemo(() => {
    const query = searchText.trim().toLowerCase();

    let items = [...suggestions];

    if (query) {
      items = items.filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const descriptionMatch = item.description
          .toLowerCase()
          .includes(query);

        return titleMatch || descriptionMatch;
      });
    }

    if (sortMode === "top") {
      return items.sort((a, b) => {
        if (b.votes !== a.votes) {
          return b.votes - a.votes;
        }

        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    }

    if (sortMode === "new") {
      return items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    return items.sort((a, b) => {
      const aScore = a.votes * 1000000 + new Date(a.createdAt).getTime();
      const bScore = b.votes * 1000000 + new Date(b.createdAt).getTime();

      return bScore - aScore;
    });
  }, [suggestions, sortMode, searchText]);

  function renderSortButton(label: string, value: SortMode) {
    const isActive = sortMode === value;

    return (
      <TouchableOpacity
        onPress={() => setSortMode(value)}
        style={{
          flex: 1,
          backgroundColor: isActive ? colors.primary : colors.surface,
          borderRadius: 12,
          paddingVertical: 10,
          alignItems: "center",
          borderWidth: 1,
          borderColor: isActive ? colors.primary : colors.border,
        }}
      >
        <Text
          style={{
            color: isActive ? "#FFFFFF" : colors.textSecondary,
            fontWeight: "700",
            fontSize: 13,
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 24,
            padding: 18,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 28,
                  fontWeight: "800",
                  color: colors.text,
                }}
              >
                Suggestions
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  marginTop: 4,
                }}
              >
                Vote on what should be built next
              </Text>
            </View>

            {!isAdminMode ? (
              <TouchableOpacity
                onPress={() => setShowAdminModal(true)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  alignSelf: "flex-start",
                }}
              >
                <Text style={{ color: colors.textSecondary }}>Admin</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={lockAdminMode}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 12,
                  backgroundColor: colors.primaryLight,
                  alignSelf: "flex-start",
                }}
              >
                <Text style={{ color: colors.primary, fontWeight: "700" }}>
                  Admin ON
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: colors.text, fontWeight: "700", fontSize: 18 }}>
            Suggest a Feature
          </Text>

          <TextInput
            placeholder="Feature title"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 12,
              marginTop: 10,
              color: colors.text,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />

          <TextInput
            placeholder="Description (optional)"
            placeholderTextColor={colors.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            textAlignVertical="top"
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 12,
              marginTop: 10,
              color: colors.text,
              borderWidth: 1,
              borderColor: colors.border,
              minHeight: 80,
            }}
          />

          <TouchableOpacity
            onPress={handleAddSuggestion}
            style={{
              marginTop: 12,
              backgroundColor: colors.primary,
              padding: 14,
              borderRadius: 14,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>
              Submit Suggestion
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            backgroundColor: colors.card,
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: colors.border,
            marginBottom: 16,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
              gap: 12,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontWeight: "700",
                fontSize: 18,
              }}
            >
              Browse Suggestions
            </Text>

            <View
              style={{
                minWidth: 34,
                height: 34,
                borderRadius: 17,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 10,
                backgroundColor: colors.primaryLight,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                {visibleSuggestions.length}
              </Text>
            </View>
          </View>

          <TextInput
            placeholder="Search suggestions..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            style={{
              backgroundColor: colors.surface,
              borderRadius: 12,
              padding: 12,
              marginBottom: 12,
              color: colors.text,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              gap: 8,
              marginBottom: 4,
            }}
          >
            {renderSortButton("Top", "top")}
            {renderSortButton("New", "new")}
            {renderSortButton("Trending", "trending")}
          </View>
        </View>

        {isLoading ? (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 18,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.textSecondary }}>
              Loading suggestions...
            </Text>
          </View>
        ) : null}

        {!isLoading && visibleSuggestions.length === 0 ? (
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 18,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.textSecondary }}>
              {searchText.trim()
                ? "No suggestions match your search."
                : "No suggestions yet. Add the first one above."}
            </Text>
          </View>
        ) : null}

        {!isLoading &&
          visibleSuggestions.map((item) => {
            const hasVotes = item.votes > 0;
            const voted = item.hasVoted;

            return (
              <View
                key={item.id}
                style={{
                  backgroundColor: colors.card,
                  borderRadius: 18,
                  padding: 16,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontWeight: "700",
                      fontSize: 16,
                      flex: 1,
                    }}
                  >
                    {item.title}
                  </Text>

                  <View
                    style={{
                      backgroundColor: colors.primaryLight,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 999,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Text style={{ color: colors.primary, fontWeight: "700" }}>
                      {item.votes}
                    </Text>
                  </View>
                </View>

                {item.description ? (
                  <Text
                    style={{
                      color: colors.textSecondary,
                      marginTop: 8,
                      lineHeight: 20,
                    }}
                  >
                    {item.description}
                  </Text>
                ) : null}

                <View
                  style={{
                    flexDirection: "row",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  <TouchableOpacity
                    disabled={voted}
                    onPress={() => upvoteSuggestion(item.id)}
                    style={{
                      flex: 1,
                      backgroundColor: voted
                        ? colors.surface
                        : colors.primary,
                      borderRadius: 12,
                      padding: 12,
                      alignItems: "center",
                      borderWidth: voted ? 1 : 0,
                      borderColor: colors.border,
                    }}
                  >
                    <Text
                      style={{
                        color: voted ? colors.textSecondary : "#FFFFFF",
                        fontWeight: "700",
                      }}
                    >
                      {voted ? "Voted" : "Upvote"}
                    </Text>
                  </TouchableOpacity>

                  {!hasVotes && !isAdminMode ? (
                    <TouchableOpacity
                      onPress={() => handleUserDelete(item.id)}
                      style={{
                        flex: 1,
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        padding: 12,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Text
                        style={{ color: colors.danger, fontWeight: "700" }}
                      >
                        Delete
                      </Text>
                    </TouchableOpacity>
                  ) : null}

                  {isAdminMode ? (
                    <TouchableOpacity
                      onPress={() => handleAdminDelete(item.id)}
                      style={{
                        flex: 1,
                        backgroundColor: colors.surface,
                        borderRadius: 12,
                        padding: 12,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: colors.border,
                      }}
                    >
                      <Text
                        style={{ color: colors.danger, fontWeight: "700" }}
                      >
                        Admin Delete
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            );
          })}
      </ScrollView>

      <Modal visible={showAdminModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text
              style={{
                color: colors.text,
                fontWeight: "700",
                fontSize: 18,
              }}
            >
              Admin Login
            </Text>

            <TextInput
              placeholder="Enter PIN"
              placeholderTextColor={colors.textMuted}
              value={adminPin}
              onChangeText={setAdminPin}
              secureTextEntry
              keyboardType="number-pad"
              style={{
                backgroundColor: colors.surface,
                borderRadius: 12,
                padding: 12,
                marginTop: 10,
                color: colors.text,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginTop: 10,
              }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
                onPress={() => {
                  setAdminPin("");
                  setShowAdminModal(false);
                }}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: colors.textSecondary,
                    fontWeight: "600",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                }}
                onPress={handleUnlockAdminMode}
              >
                <Text
                  style={{
                    textAlign: "center",
                    color: "#FFFFFF",
                    fontWeight: "700",
                  }}
                >
                  Unlock
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}