import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput } from "react-native";
import { Color, FontFamilies, FontSizes, LineHeights } from "../../../../styles/constants";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Option {
  value: string;
  label: string;
}

interface CustomSingleSelectProps {
  label: string;
  placeholder: string;
  data: Option[];
  selectedValue: Option | null;
  setSelectedValue: (item: Option | null) => void;
  onFocus?: () => void;
  error?: string;
}

const CustomSingleSelect: React.FC<CustomSingleSelectProps> = ({
  label,
  placeholder,
  data,
  selectedValue,
  setSelectedValue,
  onFocus,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSelect = (item: Option) => {
    setSelectedValue(item);
    setIsOpen(false);
    setSearchQuery("");
    if (onFocus) onFocus();
  };

  const filteredData = data.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      {/* Dropdown Trigger */}
      <TouchableOpacity
        style={styles.optionsContainer}
        onPress={() => setIsOpen(!isOpen)}
      >
        <View style={styles.selectedOption}>
          <Text style={styles.optionText}>
            {selectedValue ? selectedValue.label : placeholder}
          </Text>
          <Icon 
            name={isOpen ? "chevron-up" : "chevron-down"} 
            size={24} 
            color={Color.black} 
          />
        </View>
      </TouchableOpacity>

      {/* Dropdown Content */}
      {isOpen && (
        <View style={styles.optionsContainer}>
          {/* Search Bar */}
          <View style={[styles.option, styles.searchContainer]}>
            <Icon name="magnify" size={20} color={Color.black} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Color.primarygrey}
            />
          </View>
          
          {/* Options List */}
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.value.toString()}
            renderItem={({ item, index }) => {
              const isLastItem = index === filteredData.length - 1;
              return (
                <TouchableOpacity
                  style={[
                    styles.option,
                    styles.unselectedOption,
                    isLastItem && styles.lastOption,
                  ]}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              );
            }}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
            style={styles.scrollContainer}
          />
        </View>
      )}

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: FontSizes.medium,
    color: Color.black,
    marginBottom: 8,
    fontWeight: '800',
    fontFamily: FontFamilies.semibold,
    lineHeight:LineHeights.small,
  },
  optionsContainer: {
    marginTop: 4,
    backgroundColor: "#F3F3F3",
    borderRadius: 12,
    borderColor: "#E0E0E0",
    overflow: "hidden",
  },
  scrollContainer: {
    maxHeight: 130, // Height for 2 items (2 * 50px)
  },
  option: {
    paddingVertical: 14,
    borderRadius: 12,
    margin: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E6E6",
    height: 50, // Fixed height for each option
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchContainer: {
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSizes.medium,
    color: Color.black,
    fontFamily: FontFamilies.medium,
    paddingVertical: 0,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  selectedOption: {
    paddingVertical: 14,
    borderRadius: 12,
    margin: 10,
    paddingHorizontal: 12,
    height: 50, // Fixed height for each option
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  unselectedOption: {
    backgroundColor: "#F3F3F3",
  },
  optionText: {
    fontSize: FontSizes.medium,
    color: Color.black,
    fontFamily: FontFamilies.medium,
    flex: 1,
  },
  errorText: {
    color: Color.black,
    fontSize: 12,
    marginTop: 4,
  },
});

export default CustomSingleSelect;
