import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type UIState = {
  sidebarOpen: boolean;
  searchQuery: string;
};

const initialState: UIState = {
  sidebarOpen: false,
  searchQuery: ""
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    }
  }
});

export const { setSidebarOpen, setSearchQuery } = uiSlice.actions;
export default uiSlice.reducer;

