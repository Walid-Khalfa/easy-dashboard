import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CrudState {
  list: any[];
  current: any | null;
  isLoading: boolean;
  pagination: {
    page: number;
    pages: number;
    count: number;
  };
}

const initialState: CrudState = {
  list: [],
  current: null,
  isLoading: false,
  pagination: {
    page: 1,
    pages: 1,
    count: 0,
  },
};

export const crudSlice = createSlice({
  name: 'crud',
  initialState,
  reducers: {
    requestStart: (state) => {
      state.isLoading = true;
    },
    requestFailure: (state) => {
      state.isLoading = false;
    },
    listSuccess: (state, action: PayloadAction<{ result: any[], pagination: any }>) => {
      state.isLoading = false;
      state.list = action.payload.result;
      state.pagination = action.payload.pagination;
    },
    currentSuccess: (state, action: PayloadAction<any>) => {
      state.isLoading = false;
      state.current = action.payload;
    },
    resetState: (state) => {
      state.isLoading = false;
      state.list = [];
      state.current = null;
    },
  },
});

export const { requestStart, requestFailure, listSuccess, currentSuccess, resetState } = crudSlice.actions;
export default crudSlice.reducer;
