import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type RecentSearchState = string[];

//초기 상태 선언
const initialState: RecentSearchState = [];

const recentSearchSlice = createSlice({
  name: 'recentSearches',
  initialState,
  reducers: {},
});

export default recentSearchSlice.reducer;
