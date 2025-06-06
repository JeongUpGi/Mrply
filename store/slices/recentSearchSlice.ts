import {createSlice, PayloadAction} from '@reduxjs/toolkit';

type RecentSearchState = string[];

//초기 상태 선언
const initialState: RecentSearchState = [];

//최근 검색어 개수 15개로 제한
const MAX_RECENT_SEARCH_COUNT = 15;

const recentSearchSlice = createSlice({
  name: 'recentSearches',
  initialState,
  reducers: {
    //최근 검색어 저장
    addRecentSearch: (state, action: PayloadAction<string>) => {
      const newStr = action.payload;

      const updatedState = [newStr, ...state.filter(str => str !== newStr)];

      return updatedState.slice(0, MAX_RECENT_SEARCH_COUNT);
    },

    //최근 검색어 삭제
    deleteRecentSearch: (state, action: PayloadAction<string>) => {
      const existingStr = action.payload;

      // 중복처리 되어있기에 str로 중복제외처리
      return state.filter(str => str !== existingStr);
    },
  },
});

export const {addRecentSearch, deleteRecentSearch} = recentSearchSlice.actions;

export default recentSearchSlice.reducer;
