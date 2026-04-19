import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

type FeatureSuggestion = {
  id: string;
  title: string;
  description: string;
  votes: number;
  createdAt: string;
  hasVoted?: boolean;
};

type FeatureSuggestionsContextType = {
  suggestions: FeatureSuggestion[];
  isLoading: boolean;
  isAdminMode: boolean;
  addSuggestion: (title: string, description?: string) => void;
  upvoteSuggestion: (suggestionId: string) => void;
  deleteSuggestion: (suggestionId: string) => void;
  adminDeleteSuggestion: (suggestionId: string) => void;
  unlockAdminMode: (pin: string) => boolean;
  lockAdminMode: () => void;
};

const STORAGE_KEY = "feature_suggestions";
const ADMIN_MODE_STORAGE_KEY = "feature_suggestions_admin_mode";

/**
 * Change this PIN to whatever you want.
 * Keep it private.
 */
const ADMIN_PIN = "7185";

const FeatureSuggestionsContext = createContext<
  FeatureSuggestionsContextType | undefined
>(undefined);

function sortSuggestions(items: FeatureSuggestion[]) {
  return [...items].sort((a, b) => {
    if (b.votes !== a.votes) {
      return b.votes - a.votes;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function createSuggestion(
  title: string,
  description: string
): FeatureSuggestion {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: title.trim(),
    description: description.trim(),
    votes: 0,
    createdAt: new Date().toISOString(),
    hasVoted: false,
  };
}

export function FeatureSuggestionsProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [suggestions, setSuggestions] = useState<FeatureSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveSuggestions(suggestions);
    }
  }, [suggestions, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      saveAdminMode(isAdminMode);
    }
  }, [isAdminMode, isLoading]);

  async function loadAllData() {
    try {
      const [storedSuggestions, storedAdminMode] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY),
        AsyncStorage.getItem(ADMIN_MODE_STORAGE_KEY),
      ]);

      if (!storedSuggestions) {
        setSuggestions([]);
      } else {
        const parsedValue = JSON.parse(storedSuggestions) as FeatureSuggestion[];

        const safeData = parsedValue.map((item) => ({
          ...item,
          hasVoted: item.hasVoted ?? false,
        }));

        setSuggestions(sortSuggestions(safeData));
      }

      setIsAdminMode(storedAdminMode === "true");
    } catch (error) {
      console.log("Failed to load feature suggestions data:", error);
      setSuggestions([]);
      setIsAdminMode(false);
    } finally {
      setIsLoading(false);
    }
  }

  async function saveSuggestions(items: FeatureSuggestion[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.log("Failed to save feature suggestions:", error);
    }
  }

  async function saveAdminMode(value: boolean) {
    try {
      await AsyncStorage.setItem(ADMIN_MODE_STORAGE_KEY, String(value));
    } catch (error) {
      console.log("Failed to save admin mode:", error);
    }
  }

  function addSuggestion(title: string, description = "") {
    const cleanTitle = title.trim();

    if (!cleanTitle) {
      return;
    }

    const newSuggestion = createSuggestion(cleanTitle, description);

    setSuggestions((current) => sortSuggestions([newSuggestion, ...current]));
  }

  function upvoteSuggestion(suggestionId: string) {
    setSuggestions((current) =>
      sortSuggestions(
        current.map((item) => {
          if (item.id === suggestionId) {
            if (item.hasVoted) {
              return item;
            }

            return {
              ...item,
              votes: item.votes + 1,
              hasVoted: true,
            };
          }

          return item;
        })
      )
    );
  }

  function deleteSuggestion(suggestionId: string) {
    setSuggestions((current) =>
      current.filter((item) => {
        if (item.id !== suggestionId) {
          return true;
        }

        if (item.votes > 0) {
          return true;
        }

        return false;
      })
    );
  }

  function adminDeleteSuggestion(suggestionId: string) {
    setSuggestions((current) =>
      current.filter((item) => item.id !== suggestionId)
    );
  }

  function unlockAdminMode(pin: string) {
    if (pin === ADMIN_PIN) {
      setIsAdminMode(true);
      return true;
    }

    return false;
  }

  function lockAdminMode() {
    setIsAdminMode(false);
  }

  const value = useMemo(
    () => ({
      suggestions,
      isLoading,
      isAdminMode,
      addSuggestion,
      upvoteSuggestion,
      deleteSuggestion,
      adminDeleteSuggestion,
      unlockAdminMode,
      lockAdminMode,
    }),
    [suggestions, isLoading, isAdminMode]
  );

  return (
    <FeatureSuggestionsContext.Provider value={value}>
      {children}
    </FeatureSuggestionsContext.Provider>
  );
}

export function useFeatureSuggestions() {
  const context = useContext(FeatureSuggestionsContext);

  if (!context) {
    throw new Error(
      "useFeatureSuggestions must be used within FeatureSuggestionsProvider"
    );
  }

  return context;
}