
import { create } from 'zustand';

type View = 'list' | 'detail' | 'checkout' | 'success' | 'profile' | 'tracking' | 'admin' | 'seller';

interface RouterState {
  view: View;
  productId: number | null;
  orderId: string | null;
  setView: (view: View, id?: number | string | null) => void;
}

export const useRouterStore = create<RouterState>((set) => ({
  view: 'list',
  productId: null,
  orderId: null,
  setView: (view, id = null) => {
    const newState: Partial<RouterState> = { view, productId: null, orderId: null };
    if (view === 'detail' && typeof id === 'number') {
        newState.productId = id;
    }
    if (view === 'tracking' && typeof id === 'string') {
        newState.orderId = id;
    }
    set(newState);
    window.scrollTo(0, 0);
  },
}));
