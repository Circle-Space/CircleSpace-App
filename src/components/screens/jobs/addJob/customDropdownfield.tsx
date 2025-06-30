import React, {useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {Chip, Button} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, (txt: string) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

const MultiSelectDropdown = ({
  data,
  selectedValues,
  setSelectedValues,
  placeholder,
  onFocus,
}: any) => {
  const [search, setSearch] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  const handleSelectItem = (item: any) => {
    if (!selectedValues.includes(item.value)) {
      setSelectedValues([...selectedValues, item.value]);
    } else {
      setSelectedValues(
        selectedValues.filter((value: any) => value !== item.value),
      );
    }
  };

  const handleAddCustomItem = () => {
    if (
      search &&
      !data.some(
        (item: any) => item.label.toLowerCase() === search.toLowerCase(),
      )
    ) {
      const titleCasedSearch = toTitleCase(search);
      const newItem = {label: titleCasedSearch, value: titleCasedSearch};
      setSelectedValues([...selectedValues, newItem.value]);
      setSearch('');
      setDropdownVisible(false);
    }
  };

  const handleRemoveItem = (item: any) => {
    setSelectedValues(selectedValues.filter((value: any) => value !== item));
  };

  const filteredData = data.filter((item: any) =>
    item.label.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View>
      <TouchableOpacity
        style={styles.dropdownToggle}
        onPress={() => {setDropdownVisible(!dropdownVisible);onFocus();}}>
        <Text style={styles.dropdownPlaceholder}>{placeholder}</Text>
        <Icon name="chevron-down" size={24} color="black" />
      </TouchableOpacity>
      {dropdownVisible && (
        <View style={styles.dropdown}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              value={search}
              onChangeText={setSearch}
            />
            {filteredData.length === 0 && search.length > 0 && (
              <Button
                mode="contained"
                onPress={handleAddCustomItem}
                style={styles.addButton}>
                Add
              </Button>
            )}
          </View>
          <FlatList
            data={filteredData}
            keyExtractor={item => item.value.toString()}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleSelectItem(item)}>
                <Text>{item.label}</Text>
                {selectedValues.includes(item.value) ? (
                  <Icon name="check" size={24} color="green" />
                ) : null}
              </TouchableOpacity>
            )}
          />
        </View>
      )}
      <View style={selectedValues.length > 0 && styles.chipContainer}>
        {selectedValues.map((value: any) => (
          <Chip
            key={value}
            style={styles.chip}
            onClose={() => handleRemoveItem(value)}>
            {value}
          </Chip>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#888',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    maxHeight: 200,
    backgroundColor: '#fff',
    zIndex: 1000,
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
  },
  addButton: {
    marginLeft: 8,
  },
  chipContainer: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 5,
    borderRadius: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  chip: {
    margin: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default MultiSelectDropdown;
