import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { PlaceCard } from "@/components/PlaceCard";
import { Place } from "@/types/place";

interface PlaceListProps {
  places: Place[];
  loading: boolean;
  onRefresh: () => void;
  onPlacePress: (place: Place) => void;
}

export function PlaceList({ places, loading, onRefresh, onPlacePress }: PlaceListProps) {
  return (
    <FlatList
      data={places}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <PlaceCard place={item} onPress={onPlacePress} />}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor="#60a5fa" />
      }
      ListEmptyComponent={
        !loading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Нічого не знайдено</Text>
            <Text style={styles.emptyText}>
              Спробуйте інший фільтр або оновіть список.
            </Text>
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  empty: {
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptyText: {
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
});
