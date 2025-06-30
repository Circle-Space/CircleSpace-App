import React, {useState} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  ScrollView,
  Image
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {Chip} from 'react-native-paper';
import { FontFamilies, FontSizes, Color, FontWeights, LineHeights, LetterSpacings } from '../../../../styles/constants';

const toTitleCase = (str: string) => {
  return str.replace(/\w\S*/g, (txt: string) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

const CustomMultiselectDropDown = ({
  label,
  placeholder,
  data,
  selectedValues,
  setSelectedValues,
  readOnly,
  onFocus,
  dataType = 'string', // 'string' or 'object'
  required = false, // New prop to indicate if field is required
  error, // New prop to display error message
}: any) => {
  const [search, setSearch] = useState('');
  const [dropdownVisible, setDropdownVisible] = useState(false);

  // Determine display value based on the dataType
  const getItemDisplayValue = (item: any) => {
    if (dataType === 'object') {
      if (item?.City) return item?.City; // Check for 'City' key
      if (item?.key) return item?.key; // Check for 'label' key
    }
    return item; // For string data
  };

  // Handle item selection
  const handleSelectItem = (item: any) => {
    const value = getItemDisplayValue(item);
    if (
      !selectedValues.some(
        (selected: any) => getItemDisplayValue(selected) === value,
      )
    ) {
      setSelectedValues([...selectedValues, item]);
    } else {
      setSelectedValues(
        selectedValues.filter(
          (selected: any) => getItemDisplayValue(selected) !== value,
        ),
      );
    }
  };

  // Handle adding custom item
  const handleAddCustomItem = () => {
    const searchValue = toTitleCase(search);

    if (
      search &&
      !data.some(
        (item: any) =>
          getItemDisplayValue(item).toLowerCase() === searchValue.toLowerCase(),
      )
    ) {
      let newItem;
      if (dataType === 'object') {
        if (data[0]?.City) {
          newItem = {City: searchValue, State: ''};
        } else if (data[0]?.label && data[0]?.value) {
          newItem = {label: searchValue, value: searchValue, key: searchValue};
        }
      } else {
        newItem = searchValue;
      }

      setSelectedValues([...selectedValues, newItem]);
      setSearch('');
      setDropdownVisible(false);
    }
  };

  // Handle item removal
  const handleRemoveItem = (item: any) => {
    setSelectedValues(
      selectedValues.filter((selected: any) => selected !== item),
    );
  };

  // Filter data based on search query
  const filteredData = data.filter((item: any) =>
    getItemDisplayValue(item).toLowerCase().includes(search.toLowerCase()),
  );

  // Generate display string for selected values
  const getSelectedDisplayString = () => {
    return selectedValues
      .map((item: any) => getItemDisplayValue(item))
      .join(', ');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.dropdownToggle,
          required && error && styles.errorInputContainer, // Apply error style if required and error exists
          dropdownVisible && styles.dropDownActive, // Apply active style when dropdown is visible
        ]}
        onPress={() => {
          !readOnly && setDropdownVisible(!dropdownVisible);
          onFocus && onFocus();
        }}
        disabled={readOnly}>
        <Text style={styles.dropdownPlaceholder}>
          {/* {selectedValues.length > 0 ? getSelectedDisplayString() : placeholder} */}
          {placeholder}
        </Text>
        <Icon name="chevron-down" size={24} color="black"/>
      </TouchableOpacity>
      {dropdownVisible && (
        <View style={styles.dropdown}>
          <View style={styles.searchContainer}>
          <Image
            source={require('../../../../assets/icons/searchIcon.png')} // Ensure the correct path
            style={styles.searchIcon}
          />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search`}
              placeholderTextColor={Color.black}
              value={search}
              onChangeText={setSearch}
            />
            {filteredData.length === 0 && search.length > 0 && (
              <TouchableOpacity
                onPress={handleAddCustomItem}
                style={styles.addButton}>
                <Text style={styles.addText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
          {/* <FlatList
            data={filteredData}
            keyExtractor={(item: any) => getItemDisplayValue(item)}
            nestedScrollEnabled={true}  // Allows FlatList to scroll within ScrollView
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleSelectItem(item)}>
                <Text
                  style={[
                    styles.itemText,
                    selectedValues.some(
                      (selected: any) =>
                        getItemDisplayValue(selected) ===
                        getItemDisplayValue(item),
                    ) && styles.selectedItemText,
                  ]}>
                  {getItemDisplayValue(item)}
                </Text>
                {selectedValues.some(
                  (selected: any) =>
                    getItemDisplayValue(selected) === getItemDisplayValue(item),
                ) && <Icon name="check" size={24} color="green" />}
              </TouchableOpacity>
            )}
          /> */}
          <FlatList
            data={filteredData}
            keyExtractor={(item: any) => getItemDisplayValue(item)}
            nestedScrollEnabled={true}  // Allows FlatList to scroll within ScrollView
            renderItem={({ item }) => {
              const isSelected = selectedValues.some(
                (selected: any) =>
                  getItemDisplayValue(selected) === getItemDisplayValue(item)
              );

              return (
                <TouchableOpacity
                  style={[styles.dropdownItem, isSelected && styles.selectedDropdownItem]}
                  onPress={() => handleSelectItem(item)}
                >
                  <Text style={[styles.itemText]}>
                    {getItemDisplayValue(item)}
                  </Text>
                  {/* {isSelected && <Icon name="check" size={24} color="green" />} */}
                </TouchableOpacity>
              );
            }}
          />

        </View>
      )}
      {selectedValues.length > 0 && (
        <View style={styles.chipContainer}>
          {selectedValues.map((item: any, index: number) => (
            <Chip
              textStyle={{fontSize: FontSizes.small,color:Color.white}}
              key={index} // Using index as key if values are objects
              style={styles.chip}
              selectedColor='white'
              onClose={() => handleRemoveItem(item)}>
              
              {getItemDisplayValue(item)}
            </Chip>
          ))}
        </View>
      )}
      {/* Display error message if there is one */}
      {required && error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: FontSizes.small,
    color: '#81919E',
    fontFamily: FontFamilies.medium,
    letterSpacing:LetterSpacings.wide,
    lineHeight:LineHeights.small,
    fontWeight: '400',
    marginBottom: 8,
  },
  dropdownToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderRadius:12,
    backgroundColor: '#F3F3F3',
    width:'100%',
  },
  dropDownActive:{
    borderBottomLeftRadius:0,
    borderBottomRightRadius:0,
  },
  errorInputContainer: {
    borderColor: 'red',
    borderWidth: 1,
  },
  dropdownPlaceholder: {
    fontSize: FontSizes.medium,
    fontFamily: FontFamilies.semibold,
    letterSpacing:LetterSpacings.wide,
    lineHeight:LineHeights.large,
    color: '#81919E',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#F3F3F3',
    // borderRadius: 12,
    maxHeight: 250,
    backgroundColor: '#F3F3F3',
    zIndex: 1000,
    marginBottom: 15,
    borderBottomLeftRadius:12,
    borderBottomRightRadius:12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    // padding: 8,
    backgroundColor: '#F3F3F3',
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal:15,
  },
  searchIcon: {
    marginHorizontal: 8, // Space between icon and text input
    height:14,
    width:14,
  },
  searchInput: {
    color: Color.black,
    flex: 1,
    borderColor: Color.black,
    padding: 8,
    fontFamily: FontFamilies.semibold,
    fontSize: FontSizes.small,
  },
  addButton: {
    marginLeft: 8,
    padding: 10,
    backgroundColor: Color.white,
    borderWidth:1,
    borderRadius:12,
    marginRight:5,
  },
  addText: {
    color: '#1E1E1E',
    fontSize: 11,
    fontWeight: '400',
    fontFamily: 'Gilroy-SemiBold',
  },
  chipContainer: {
    borderColor: Color.black,
    padding: 5,
    borderRadius: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 0,
  },
  chip: {
    backgroundColor: '#1E1E1E',
    margin: 4,
    height:38,
    justifyContent:'center',
  },
  closeIcon: {
    backgroundColor: '#FFFFFF', // White background for the "X" button
    borderRadius: 50, // Makes it a circle
    padding: 2, // Add padding to make it more visible
    color: '#000000', // Black color for the "X" icon
  },
  // dropdownItem: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   padding: 10,
  //   borderBottomWidth: 1,
  //   borderBottomColor: '#ccc',
  //   backgroundColor: '#F3F3F3',
  // },
  // itemText: {
  //   fontSize: 12,
  //   color: '#333',
  //   fontFamily: 'Gilroy-Regular',
  // },
  // selectedItemText: {
  //   color: '#3C4858', // Color for selected items
  //   fontWeight: 'bold',
  //   fontFamily: 'Gilroy-ExtraBold',
  //   fontSize: 12,
  // },
  // errorText: {
  //   color: '#ED4956',
  //   fontSize: 12,
  //   fontFamily: 'Gilroy-Regular',
  //   marginTop: 5,
  // },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // padding: 10,
    // borderBottomWidth: 1,
    // borderBottomColor: '#ccc',
    backgroundColor: '#F3F3F3',  // Default background color
    paddingVertical: 14,
    borderRadius:12,
    margin:10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E7E6E6",
  },
  selectedDropdownItem: {
    borderRadius:12,
    backgroundColor:Color.white,
  },
  itemText: {
    // fontSize: FontSizes.medium,
    // color: Color.black,
    // fontFamily: 'Gilroy-Regular',
    color: Color.black, // Change text color for selected items
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.medium,
  },
  selectedItemText: {
    color: Color.black, // Change text color for selected items
    fontWeight: '400',
    fontFamily: FontFamilies.medium,
    fontSize: FontSizes.medium,
  },
  errorText: {
    color: '#ED4956',
    fontSize: FontSizes.small,
    fontFamily: FontFamilies.regular,
    marginTop: 5,
  },
});

export default CustomMultiselectDropDown;
