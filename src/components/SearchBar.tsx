import { StyleSheet, TextInput, View } from "react-native";

interface SearchBarProps {
  value: string;
  onChange: (text: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <View style={styles.wrapper}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder="Пошук за назвою або адресою..."
        placeholderTextColor="#64748b"
        clearButtonMode="while-editing"
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 12,
    paddingBottom: 6,
  },
  input: {
    height: 38,
    backgroundColor: "#1e293b",
    borderRadius: 10,
    paddingHorizontal: 14,
    color: "#f8fafc",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#334155",
  },
});
