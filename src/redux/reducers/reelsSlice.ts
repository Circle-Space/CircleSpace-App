import {createSlice, current} from '@reduxjs/toolkit';

const INITIAL_STATE = {
  audioEnable:true
};

export const reelsSlice = createSlice({
  name: 'reelsSlice',
  initialState: INITIAL_STATE,
  reducers: {
    setAudioEnable: (state, action) => {
      state.audioEnable = action.payload;
    },
  },
});

export const {
    setAudioEnable
} = reelsSlice.actions;

export default reelsSlice.reducer;
