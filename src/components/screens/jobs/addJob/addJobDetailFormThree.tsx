/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider'; // Import MultiSlider
import {ScrollView} from 'react-native-gesture-handler';
import CustomProgressBar from '../utils/customProgressBar';
import { Color } from '../../../../styles/constants';

export default function AddJobDetailFormThree({navigation, route}: any) {
  const [salaryRange, setSalaryRange] = useState([0, 25]); // Initial salary range
  const [experienceRange, setExperienceRange] = useState([0, 10]); // Initial experience range
  const [minSalaryInput, setMinSalaryInput] = useState('0');
  const [maxSalaryInput, setMaxSalaryInput] = useState('25');
  const [minExperienceInput, setMinExperienceInput] = useState('0');
  const [maxExperienceInput, setMaxExperienceInput] = useState('10');
  const [formErrors, setFormErrors] = useState({salary: '', experience: ''}); // Error state
  const [sliderMax, setSliderMax] = useState(25); 
  const [expSliderMax, setExpSliderMax] = useState(10); 

  const {formData,isEdit,jobId} = route.params;
  const {comingFromPreview} = route.params;
  if(isEdit){
    navigation.setOptions({title: 'Edit Job Post'});
   }
  // useEffect(() => {
  //   const mapRangeValues = (range:any) => range?.map((value: string) => parseFloat(value)) || [];
  //   console.log("data coming 35 ::",formData);
    
  //   if (formData?.jobData) {
  //     // Handle both expRange and experienceRange
  //     const exp = mapRangeValues(formData?.jobData?.expRange || formData?.jobData?.experienceRange);
  //     const sal = mapRangeValues(formData?.jobData?.salaryRange);
  
  //     if (exp.length > 0 && sal.length > 0) {
  //       setExperienceRange(exp);
  //       setSalaryRange(sal);
  //       setMinSalaryInput(sal[0].toString());
  //       setMaxSalaryInput(sal[1].toString());
  //       setMinExperienceInput(exp[0].toString());
  //       setMaxExperienceInput(exp[1].toString());
  //     }
  //   } else if (formData?.experienceRange || formData?.expRange) {
  //     // Handle both expRange and experienceRange outside jobData
  //     const exp = mapRangeValues(formData?.expRange || formData?.experienceRange);
  //     const sal = mapRangeValues(formData?.salaryRange);
  
  //     if (exp.length > 0 && sal.length > 0) {
  //       setExperienceRange(exp);
  //       setSalaryRange(sal);
  //       setMinSalaryInput(sal[0].toString());
  //       setMaxSalaryInput(sal[1].toString());
  //       setMinExperienceInput(exp[0].toString());
  //       setMaxExperienceInput(exp[1].toString());
  //     }
  //   }
  // }, [formData]);
  
  useEffect(() => {
    const mapRangeValues = (range: any) =>
      range?.map((value: any) => parseFloat(value)) || [];
  
    console.log("data coming 35 ::", formData);
  
    // Check for experienceRange and salaryRange inside jobData
    const experienceRange = formData?.jobData?.expRange || formData?.experienceRange;
    const salaryRange = formData?.jobData?.salaryRange || formData?.salaryRange;
  
    // If both ranges are present
    if (experienceRange && salaryRange) {
      const exp = mapRangeValues(experienceRange);
      const sal = mapRangeValues(salaryRange);
  
      // Bind the values only if the length of ranges is valid
      if (exp.length > 0 && sal.length > 0) {
        setExperienceRange(exp);
        setSalaryRange(sal);
        setMinSalaryInput(sal[0].toString());
        setMaxSalaryInput(sal[1].toString());
        setMinExperienceInput(exp[0].toString());
        setMaxExperienceInput(exp[1].toString());
      }
    }
  }, [formData]);

  const roundToOneDecimal = (value: number) => parseFloat(value.toFixed(1));

  const handleSalaryRangeChange = (values: any) => {
    const [min, max] = values.map(roundToOneDecimal);
    setSalaryRange([min, max]);
    setMinSalaryInput(min.toString());
    setMaxSalaryInput(max.toString());
  };

  const handleMinSalaryChange = (value: string) => {
    // Allow only numbers with one decimal place
    const regex = /^\d+(\.\d{0,1})?$/;
      if (regex.test(value) || value === '') {
      setMinSalaryInput(value);
      const parsedValue = value === '' ? 0 : parseFloat(value);
  
      // Clear the salary error when typing in the min salary field
      setFormErrors({...formErrors, salary: ''});
  
      if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue < salaryRange[1]) {
        setSalaryRange([parsedValue, salaryRange[1]]);
      }
    }
  };
  
  const handleMaxSalaryChange = (value: string) => {
    const regex = /^\d+(\.\d{0,1})?$/;
    if (regex.test(value) || value === '') {
      setMaxSalaryInput(value);
  
      const parsedValue = value === '' ? 0 : parseFloat(value);
  
      // Clear the salary error when typing in the max salary field
      setFormErrors({...formErrors, salary: ''});
  
      if (!isNaN(parsedValue) && parsedValue > salaryRange[0] && parsedValue <= 100) {
        setSalaryRange([salaryRange[0], parsedValue]);
        if (parsedValue > sliderMax) {
          setSliderMax(Math.ceil(parsedValue));
        }
      }
    }
  };

  const handleExperienceRangeChange = (values: any) => {
    const [min, max] = values.map(roundToOneDecimal);
    setExperienceRange([min, max]);
    setMinExperienceInput(min.toString());
    setMaxExperienceInput(max.toString());
  };
  const handleMinExperienceChange = (value: string) => {
    const regex = /^\d+(\.\d{0,1})?$/;
    if (regex.test(value) || value === '') {
      setMinExperienceInput(value);
  
      const parsedValue = value === '' ? 0 : parseFloat(value);
  
      // Clear the experience error when typing in the min experience field
      setFormErrors({...formErrors, experience: ''});
  
      if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue < experienceRange[1]) {
        setExperienceRange([parsedValue, experienceRange[1]]);
      }
    }
  };
  const handleMaxExperienceChange = (value: string) => {
    const regex = /^\d+(\.\d{0,1})?$/;
    if (regex.test(value) || value === '') {
      setMaxExperienceInput(value);
  
      const parsedValue = value === '' ? 0 : parseFloat(value);
  
      // Clear the experience error when typing in the max experience field
      setFormErrors({...formErrors, experience: ''});
  
      if (!isNaN(parsedValue) && parsedValue > experienceRange[0] && parsedValue <= 10) {
        setExperienceRange([experienceRange[0], parsedValue]);
        if(parsedValue > expSliderMax){
          setExpSliderMax(parsedValue);
        }
      }
    }
  }
  const validateForm = () => {
    let isValid = true;
    let errors = {salary: '', experience: ''};

    // Validate salary range
    if (parseFloat(minSalaryInput) < 0 || minSalaryInput === '') {
      errors.salary = 'Minimum salary cannot be less than 0';
      isValid = false;
    }
    if (parseFloat(maxSalaryInput) <= parseFloat(minSalaryInput)) {
      errors.salary = 'Maximum salary must be greater than minimum salary';
      isValid = false;
    }

    // Validate experience range
    if (parseFloat(minExperienceInput) < 0 || minExperienceInput === '') {
      errors.experience = 'Minimum experience cannot be less than 0';
      isValid = false;
    }
    if (parseFloat(maxExperienceInput) <= parseFloat(minExperienceInput)) {
      errors.experience =
        'Maximum experience must be greater than minimum experience';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const thirdFormData = {
        ...formData,
        salaryRange: [parseFloat(minSalaryInput), parseFloat(maxSalaryInput)],
        experienceRange: [
          parseFloat(minExperienceInput),
          parseFloat(maxExperienceInput),
        ],
      };
      navigation.navigate('finalJobFormPreview' as never, {
        formData: thirdFormData,
        isEdit:isEdit,
        jobId:jobId
      });
    }
  };

  return (
<KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      style={styles.main}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}>
        <ScrollView  contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
      <View style={{paddingHorizontal: 15, marginTop: 20}}>
        <CustomProgressBar progress={70.0} />
      </View>
    
        <View style={styles.container}>
          <Text style={styles.pageTitle}>Compensation</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.label}>Salary Range</Text>
            <MultiSlider
              values={salaryRange}
              onValuesChange={handleSalaryRangeChange}
              min={0}
              max={sliderMax}
              step={1}
              allowOverlap={false}
              snapped
              sliderLength={Dimensions.get('window').width * 0.75}
              containerStyle={{alignSelf: 'center'}}
              selectedStyle={{
                backgroundColor: '#1E1E1E',
              }}
              unselectedStyle={{
                backgroundColor: '#EDEDED',
              }}
              trackStyle={{
                height: 5,
              }}
              markerStyle={{
                backgroundColor: '#FFFFFF',
                height: 20,
                borderColor: '#1E1E1E',
                borderWidth: 5,
                width: 20,
              }}
            />
            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                <Text style={styles.label}>Min Salary (in L)</Text>
                <TextInput
                  style={styles.input}
                  value={minSalaryInput}
                  onChangeText={handleMinSalaryChange}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.label}>Max Salary (in L)</Text>
                <TextInput
                  style={styles.input}
                  value={maxSalaryInput}
                  onChangeText={handleMaxSalaryChange}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <Text style={styles.sliderValue}>
              {minSalaryInput}L - {maxSalaryInput}L
            </Text>
            {formErrors.salary ? (
            <Text style={styles.errorText}>{formErrors.salary}</Text>
          ) : null}

          </View>
         
          <View style={styles.sliderContainer}>
            <Text style={styles.label}>Experience Range</Text>
            <MultiSlider
              values={experienceRange}
              onValuesChange={handleExperienceRangeChange}
              min={0}
              max={expSliderMax}
              step={1}
              allowOverlap={false}
              snapped
              sliderLength={Dimensions.get('window').width * 0.75}
              containerStyle={{alignSelf: 'center'}}
              selectedStyle={{
                backgroundColor: '#1E1E1E',
              }}
              unselectedStyle={{
                backgroundColor: '#EDEDED',
              }}
              trackStyle={{
                height: 5,
              }}
              markerStyle={{
                backgroundColor: '#FFFFFF',
                height: 20,
                borderColor: '#1E1E1E',
                borderWidth: 5,
                width: 20,
              }}
            />
            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                <Text style={styles.label}>Min Experience (years)</Text>
                <TextInput
                  style={styles.input}
                  value={minExperienceInput}
                  onChangeText={handleMinExperienceChange}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.label}>Max Experience (years)</Text>
                <TextInput
                  style={styles.input}
                  value={maxExperienceInput}
                  onChangeText={handleMaxExperienceChange}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
            <Text style={styles.sliderValue}>
              {minExperienceInput} years - {maxExperienceInput} years
            </Text>
            {formErrors.experience ? (
            <Text style={styles.errorText}>{formErrors.experience}</Text>
          ) : null}
          </View>
        </View>
      
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.bottomButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.bottomButton, styles.bottomApply]}
          onPress={handleSubmit}>
          <Text style={[styles.buttonText, styles.buttonActiveText]}>Next</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 75,
  },
  container: {
    padding: 20,
  },
  pageTitle: {
    color: 'rgba(30, 30, 30, 1)',
    fontWeight: '800',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  label: {
    fontWeight: '400',
    fontSize: 12,
    marginBottom: 10,
    color: '#81919E',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
    marginVertical: 5,
    marginHorizontal: 10,
  },
  inputRow: {
    flex: 1,
    marginBottom: 10,
  },
  input: {
    borderColor: '#81919E',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    width: '100%',
    color:Color.black,
  },
  errorText: {
    color: 'red',
    marginTop: -5,
    marginBottom: 10,
    fontWeight: '400',
    fontSize: 13,
  },
  sliderContainer: {
    marginBottom: 20,
    borderWidth: 0.2,
    borderColor: 'rgba(123, 123, 123, 1)',
    padding: 10,
    borderRadius: 12,
  },
  sliderValue: {
    borderColor: 'rgba(123, 123, 123, 1)',
    fontWeight: 'bold',
    fontFamily: 'Gilroy-SemiBold',
    color: 'black',
    borderWidth: 0.2,
    borderRadius: 12,
    padding: 10,
    textAlign: 'center',
    marginBottom: 10,
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    padding: 10,
    paddingHorizontal: 20,
    height: 106,
    borderTopRightRadius: 12,
    borderTopLeftRadius: 12,
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 1)',
    width: '100%',
    justifyContent: 'center',
    gap:20,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.04)',
        shadowOffset: {width: 0, height: -6},
        shadowOpacity: 3,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  bottomButton: {
    height: 52,
    // width: 171,
    width:'47%',
    backgroundColor: Color.white,
    borderWidth:1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  bottomApply: {
    backgroundColor: 'rgba(44, 44, 44, 1)',
  },
  buttonText: {
    fontWeight: '400',
    fontSize: 15,
    color: '#000000',
  },
  buttonActiveText: {
    color: '#FFFFFF',
  },
});
