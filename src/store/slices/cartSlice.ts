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

const CART_STORAGE_KEY = "nk_cart_items";

const loadInitialCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }
};

const initialState: CartState = {
  items: loadInitialCart()
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
      saveCart(state.items);
    },
    removeItem(state, action: PayloadAction<{ id: string }>) {
      state.items = state.items.filter((i) => i.id !== action.payload.id);
      saveCart(state.items);
    },
    setQty(state, action: PayloadAction<{ id: string; qty: number }>) {
      const it = state.items.find((i) => i.id === action.payload.id);
      if (it) it.qty = action.payload.qty;
      saveCart(state.items);
    },
    clearCart(state) {
      state.items = [];
      saveCart([]);
    }
  }
});

export const { addItem, removeItem, setQty, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

