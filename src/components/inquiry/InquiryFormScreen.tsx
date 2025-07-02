import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, TextInput, ScrollView, Image, SafeAreaView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import BackButton from '../commons/customBackHandler';
import { Color } from '../../styles/constants';

const { width } = Dimensions.get('window');

// Dummy data for steps/questions
const inquirySteps = [
  {
    type: 'textinput',
    question: 'Please enter your project PIN code',
    placeholder: 'Enter PIN Code *',
    answer: '',
  },
  {
    type: 'radio',
    question: 'What is the purpose of this project?',
    options: [
      'Complete home theater remodel',
      'Partial home theater remodel',
      'New home theater (part of a home addition or new home construction)',
      'Accommodate disabilities or special needs',
    ],
    placeholder: '',
    answer: '',
  },
  {
    type: 'checkbox',
    question: 'Select the features you want',
    options: [
      'Dolby Atmos',
      '4K Projector',
      'Smart Lighting',
      'Acoustic Panels',
    ],
    placeholder: '',
    answer: [],
  },
  {
    type: 'textarea',
    question: 'Describe your ideal outcome for this project.',
    placeholder: 'Type your answer...',
    answer: '',
  },
  {
    type: 'textinput',
    question: 'What is your estimated budget?',
    placeholder: 'Enter your budget',
    answer: '',
  },
];

type InquiryFormScreenProps = {
  navigation: StackNavigationProp<any, any>;
};

const InquiryFormScreen = ({ navigation }: InquiryFormScreenProps) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<any[]>(inquirySteps.map(q => q.type === 'checkbox' ? [] : ''));

  const totalSteps = inquirySteps.length;
  const current = inquirySteps[step];

  const handleRadioSelect = (value: string) => {
    const updated = answers.map((a, idx) => idx === step ? value : a);
    setAnswers(updated);
  };

  const handleCheckboxToggle = (value: string) => {
    let updatedArr = Array.isArray(answers[step]) ? [...answers[step]] : [];
    if (updatedArr.includes(value)) {
      updatedArr = updatedArr.filter((v) => v !== value);
    } else {
      updatedArr.push(value);
    }
    const updated = answers.map((a, idx) => idx === step ? updatedArr : a);
    setAnswers(updated);
  };

  const handleTextChange = (value: string) => {
    const updated = answers.map((a, idx) => idx === step ? value : a);
    setAnswers(updated);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{top:10,marginBottom:15}}>
        <BackButton/>
      </View>
      {/* Progress Bar */}
      <View style={styles.progressRow}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBar, { width: `${((step + 1) / totalSteps) * 100}%` }]} />
        </View>
        <View style={styles.progressStepContainer}>
          <Text style={styles.progressText}>{`${step + 1}/${totalSteps}`}</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.questionBlock}>
          <Text style={styles.questionText}>{current.question}</Text>
          {current.type === 'radio' && current.options && (
            <View style={{ marginTop: 18 }}>
              {current.options.map((opt: string, oIdx: number) => (
                <TouchableOpacity
                  key={oIdx}
                  style={styles.radioRow}
                  onPress={() => handleRadioSelect(opt)}
                >
                  <View style={[styles.radioOuter, answers[step] === opt && styles.radioOuterSelected]}>
                    {answers[step] === opt && <View style={styles.radioInner} />}
                  </View>
                  <Text style={styles.radioLabel}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {current.type === 'checkbox' && current.options && (
            <View style={{ marginTop: 18 }}>
              {current.options.map((opt: string, oIdx: number) => (
                <TouchableOpacity
                  key={oIdx}
                  style={styles.radioRow}
                  onPress={() => handleCheckboxToggle(opt)}
                >
                  <View style={[styles.checkboxOuter, Array.isArray(answers[step]) && answers[step].includes(opt) && styles.checkboxOuterSelected]}>
                    {Array.isArray(answers[step]) && answers[step].includes(opt) && <View style={styles.checkboxInner} />}
                  </View>
                  <Text style={styles.radioLabel}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {current.type === 'textarea' && (
            <TextInput
              style={styles.textarea}
              multiline
              placeholder={current.placeholder || current.question}
              value={answers[step]}
              onChangeText={handleTextChange}
              placeholderTextColor="#656565"
              textAlignVertical="top"
            />
          )}
          {current.type === 'textinput' && (
            <TextInput
              style={styles.textinput}
              placeholder={current.placeholder || current.question}
              value={answers[step]}
              onChangeText={handleTextChange}
              placeholderTextColor="#656565"
            />
          )}
        </View>
      </ScrollView>
      {/* Navigation Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.navBtn, styles.prevBtn, step === 0 && { opacity: 0.5 }]}
          disabled={step === 0}
          onPress={() => setStep((s) => Math.max(0, s - 1))}
        >
          <Text style={styles.prevText}>← Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navBtn, styles.nextBtn]}
          onPress={() => {
            if (step < totalSteps - 1) setStep((s) => s + 1);
            else navigation.navigate('InquirySuccess');
          }}
        >
          <Text style={styles.nextText}>{step === totalSteps - 1 ? 'Done →' : 'Next →'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'ios' ? 0 : 50 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingLeft: 10,
    marginTop: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: '#FAFAFA',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 24,
    marginTop: 8,
    height: 24,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#EAEAEA',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#000',
    borderRadius: 4,
  },
  progressStepContainer: {
    borderRadius: 4,
    backgroundColor: Color.black,
    paddingHorizontal: 14,
    paddingVertical: 2,
    minWidth: 45,
    minHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    color: Color.white,
    fontFamily: 'Poppins',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
  questionBlock: { marginBottom: 32, marginHorizontal: 24 },
  questionText: {

    fontFamily: Platform.OS === 'android' ? 'Poppins-SemiBold' : 'Poppins',
    fontWeight: '600',
    fontSize: 15,
    // lineHeight: 15,
    letterSpacing: 0,
    color: '#111',
    marginBottom: 18,
  },
  radioRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  radioOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: '#888',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  radioOuterSelected: {
    borderColor: '#000',
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#000',
  },
  checkboxOuter: {
    width: 24,
    height: 24,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#656565',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    backgroundColor: '#fff',
  },
  checkboxOuterSelected: {
    borderColor: '#000',
    backgroundColor: '#0001',
    borderWidth: 2,
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: '#000',
  },
  radioLabel: {
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 12,
    letterSpacing: 0,
    color: '#000000',
  },
  textarea: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    padding: 15,
    backgroundColor: '#F8F8F8',
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
    color: '#000',
    borderWidth: 0,
  },
  textinput: {
    width: 320,
    height: 48,
    borderRadius: 14,
    padding: 15,
    backgroundColor: '#F8F8F8',
    fontFamily: 'Poppins',
    fontWeight: '400',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0,
    color: '#000',
    borderWidth: 0,
    marginTop: 0,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 18,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navBtn: {
    flex: 1,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prevBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    marginRight: 8,
  },
  nextBtn: {
    backgroundColor: '#000',
    marginLeft: 8,
  },
  prevText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 16,
  },
  nextText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default InquiryFormScreen; 