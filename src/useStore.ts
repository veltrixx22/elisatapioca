import { useState, useEffect } from 'react';
import { 
  Order, Product, MoneyEntry, MoneyExit, CashClosing, 
  OrderStatus, PaymentMethod, DeliveryType, ProductCategory, OrderItem 
} from './types';

const STORAGE_KEY = 'elisa_tapiocas_data';

interface AppState {
  orders: Order[];
  products: Product[];
  entries: MoneyEntry[];
  exits: MoneyExit[];
  closings: CashClosing[];
}

const initialState: AppState = {
  orders: [],
  products: [
    { id: '1', name: 'Tapioca de Frango com Catupiry', category: ProductCategory.SAVORY, price: 15 },
    { id: '2', name: 'Tapioca de Carne Seca', category: ProductCategory.SAVORY, price: 18 },
    { id: '3', name: 'Tapioca de Coco com Leite Condensado', category: ProductCategory.CONDENSED_MILK, price: 12 },
    { id: '4', name: 'Tapioca de Brigadeiro', category: ProductCategory.SWEET_FILLED, price: 14 },
  ],
  entries: [],
  exits: [],
  closings: [],
};

export function useStore() {
  const [state, setState] = useState<AppState>(initialState);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading data', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, isLoaded]);

  // Orders
  const addOrder = (order: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...order,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      isClosed: false,
    };
    setState(prev => ({ ...prev, orders: [newOrder, ...prev.orders] }));
    
    // If order is completed, add to entries automatically? 
    // Usually, we add to entries when it's settled.
    if (newOrder.status === OrderStatus.COMPLETED) {
      addEntry({
        description: `Venda: ${newOrder.customerName}`,
        value: newOrder.total,
        paymentType: newOrder.paymentMethod,
        date: new Date().toISOString(),
        orderId: newOrder.id
      });
    }
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setState(prev => {
      const oldOrder = prev.orders.find(o => o.id === id);
      const newOrders = prev.orders.map(o => o.id === id ? { ...o, ...updates } : o);
      
      // Handle automatic entry creation if status changes to COMPLETED
      let newEntries = prev.entries;
      if (oldOrder && updates.status === OrderStatus.COMPLETED && oldOrder.status !== OrderStatus.COMPLETED) {
        const entryExists = prev.entries.some(e => e.orderId === id);
        if (!entryExists) {
          const entry: MoneyEntry = {
            id: crypto.randomUUID(),
            description: `Venda: ${oldOrder.customerName}`,
            value: oldOrder.total,
            paymentType: oldOrder.paymentMethod,
            date: new Date().toISOString(),
            orderId: id
          };
          newEntries = [entry, ...prev.entries];
        }
      }

      return { ...prev, orders: newOrders, entries: newEntries };
    });
  };

  const deleteOrder = (id: string) => {
    setState(prev => ({ ...prev, orders: prev.orders.filter(o => o.id !== id) }));
  };

  // Products
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = { ...product, id: crypto.randomUUID() };
    setState(prev => ({ ...prev, products: [...prev.products, newProduct] }));
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setState(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const deleteProduct = (id: string) => {
    setState(prev => ({ ...prev, products: prev.products.filter(p => p.id !== id) }));
  };

  // Entries
  const addEntry = (entry: Omit<MoneyEntry, 'id'>) => {
    const newEntry: MoneyEntry = { ...entry, id: crypto.randomUUID(), isClosed: false };
    setState(prev => ({ ...prev, entries: [newEntry, ...prev.entries] }));
  };

  const updateEntry = (id: string, updates: Partial<MoneyEntry>) => {
    setState(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  };

  const deleteEntry = (id: string) => {
    setState(prev => ({ ...prev, entries: prev.entries.filter(e => e.id !== id) }));
  };

  // Exits
  const addExit = (exit: Omit<MoneyExit, 'id'>) => {
    const newExit: MoneyExit = { ...exit, id: crypto.randomUUID(), isClosed: false };
    setState(prev => ({ ...prev, exits: [newExit, ...prev.exits] }));
  };

  const updateExit = (id: string, updates: Partial<MoneyExit>) => {
    setState(prev => ({
      ...prev,
      exits: prev.exits.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  };

  const deleteExit = (id: string) => {
    setState(prev => ({ ...prev, exits: prev.exits.filter(e => e.id !== id) }));
  };

  // Cash Closing
  const closeCash = (closing: Omit<CashClosing, 'id' | 'createdAt'>, shouldMarkClosed: boolean = true) => {
    const today = new Date().toISOString().split('T')[0];
    const newClosing: CashClosing = {
      ...closing,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    
    setState(prev => {
      // Remove any previous closing for today if we are refacing
      const otherClosings = prev.closings.filter(c => c.date !== closing.date);
      let newState = { ...prev, closings: [newClosing, ...otherClosings] };
      
      if (shouldMarkClosed) {
        newState.orders = prev.orders.map(o => o.createdAt.startsWith(today) ? { ...o, isClosed: true } : o);
        newState.entries = prev.entries.map(e => e.date.startsWith(today) ? { ...e, isClosed: true } : e);
        newState.exits = prev.exits.map(e => e.date.startsWith(today) ? { ...e, isClosed: true } : e);
      }
      
      return newState;
    });
  };

  const clearData = () => {
    if (confirm('Tem certeza que deseja apagar TODOS os dados? Esta ação não pode ser desfeita.')) {
      setState(initialState);
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `elisa_tapiocas_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importData = (data: AppState) => {
    setState(data);
  };

  return {
    state,
    isLoaded,
    addOrder,
    updateOrder,
    deleteOrder,
    addProduct,
    updateProduct,
    deleteProduct,
    addEntry,
    updateEntry,
    deleteEntry,
    addExit,
    updateExit,
    deleteExit,
    closeCash,
    clearData,
    exportData,
    importData
  };
}
