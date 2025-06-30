import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const CustomSingleSelectDropDown = ({
  label,
  placeholder,
  data,
  selectedValue,
  setSelectedValue,
  readOnly,
  onFocus,
  required = false, // Flag to indicate if field is required
  error, // Error message to display
}: any) => {
  const [search, setSearch] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleSelectItem = (item: any) => {
    if (selectedValue?.value === item.value) {
      setSelectedValue(null);
    } else {
      setSelectedValue(item);
    }
    setDropdownVisible(false);
  };

  const filteredData = data.filter((item: any) =>
    item?.value?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.dropdownToggle,
          required && error && styles.errorInputContainer,
        ]}
        onPress={() => {
          !readOnly && setDropdownVisible(!dropdownVisible);
          onFocus && onFocus();
        }}
        disabled={readOnly}
      >
        <Text style={styles.dropdownPlaceholder}>
          {selectedValue ? selectedValue.value : placeholder}
        </Text>
        <Icon name="chevron-down" size={24} color="black" />
      </TouchableOpacity>
      {dropdownVisible && (
        <View style={styles.dropdown}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={`Search`}
              placeholderTextColor={"#81919E"}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <FlatList
            data={filteredData}
            keyExtractor={(item: any) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.dropdownItem,
                  selectedValue?.value === item.value && styles.selectedItem,
                ]}
                onPress={() => handleSelectItem(item)}
              >
                <Text
                  style={[
                    selectedValue?.value === item.value
                      ? styles.selectedText
                      : null,
                    styles.itemText,
                  ]}
                >
                  {item.value}
                </Text>
                {selectedValue?.value === item.value && (
                  <Icon name="check" size={24} color="green" />
                )}
              </TouchableOpacity>
            )}
            nestedScrollEnabled={true} // Enable nested scrolling if used within a parent ScrollView
            style={styles.scrollContainer} // Added max height for dropdown
          />
        </View>
      )}
      {required && error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    color: "#81919E",
    marginBottom: 8,
  },
  dropdownToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderColor: "#ccc",
    borderRadius: 12,
    backgroundColor: "#F3F3F3",
  },
  errorInputContainer: {
    borderColor: "red",
    borderWidth: 1,
  },
  dropdownPlaceholder: {
    fontSize: 12,
    color: "#888",
    fontFamily: "Gilroy-Regular",
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#F3F3F3",
    borderRadius: 4,
    backgroundColor: "#F3F3F3",
    zIndex: 1000,
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#F3F3F3",
  },
  searchInput: {
    color: "#81919E",
    fontSize: 12,
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 4,
    fontFamily: "Gilroy-Regular",
  },
  scrollContainer: {
    maxHeight: 200, // Ensure dropdown doesn't expand too much
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#F3F3F3",
  },
  selectedItem: {
    backgroundColor: "#E0E0E0",
  },
  selectedText: {
    color: "#81919E",
  },
  itemText: {
    fontSize: 12,
    fontFamily: "Gilroy-Regular",
    color: "#81919E",
  },
  errorText: {
    color: "#ED4956",
    fontSize: 12,
    fontFamily: "Gilroy-Regular",
    marginTop: 5,
  },
});

export default CustomSingleSelectDropDown;
