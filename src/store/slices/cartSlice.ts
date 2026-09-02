import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  qty: number;
  type?: string;
  image?: string;
  talentName?: string;
};

type CartState = {
  items: CartItem[];
};

const initialState: CartState = {
  items: []
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<{ item: CartItem }>) {
      const existing = state.items.find((i) => i.id === action.payload.item.id);
      if (existing) {
        existing.qty += action.payload.item.qty;
      } else {
        state.items.push(action.payload.item);
      }
    },
    removeItem(state, action: PayloadAction<{ id: string }>) {
      state.items = state.items.filter((i) => i.id !== action.payload.id);
    },
    setQty(state, action: PayloadAction<{ id: string; qty: number }>) {
      const it = state.items.find((i) => i.id === action.payload.id);
      if (it) it.qty = action.payload.qty;
    },
    clearCart() {
      return initialState;
    }
  }
});

export const { addItem, removeItem, setQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

