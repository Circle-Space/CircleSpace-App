import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {ProgressBar} from 'react-native-paper';

const CustomProgressBar = ({progress}: any) => {
  const roundedProgress = Math.round(progress);
  return (
    <View style={styles.container}>
      <ProgressBar
        progress={progress / 100}
        color="#1E1E1E" // Filled color (blue)
        style={styles.progressBar}
        unfilledColor="#F5F5F5" // Unfilled color (grey)
      />
      <Text style={styles.percentage}>{roundedProgress}%</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  progressBar: {
    borderRadius: 22,
    height: 6, // Adjust height as needed
  },
  percentage: {
    position: 'absolute',
    right: 0,
    bottom: -20,
    fontSize: 12,
    fontFamily: 'Gilroy-Regular',
    color: '#000',
  },
});

export default CustomProgressBar;
