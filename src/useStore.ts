import { useState, useEffect, useCallback } from 'react';
import { supabase } from './lib/supabase';
import { 
  Order, Product, MoneyEntry, MoneyExit, CashClosing, 
  OrderStatus
} from './types';

export function useStore() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [entries, setEntries] = useState<MoneyEntry[]>([]);
  const [exits, setExits] = useState<MoneyExit[]>([]);
  const [closings, setClosings] = useState<CashClosing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        { data: prodData }, 
        { data: ordData }, 
        { data: entryData }, 
        { data: exitData }, 
        { data: closeData }
      ] = await Promise.all([
        supabase.from('products').select('*').order('name'),
        supabase.from('orders').select('*, items:order_items(*)').order('created_at', { ascending: false }),
        supabase.from('cash_entries').select('*').order('created_at', { ascending: false }),
        supabase.from('cash_exits').select('*').order('created_at', { ascending: false }),
        supabase.from('cash_closings').select('*').order('closing_date', { ascending: false })
      ]);

      if (prodData) setProducts(prodData);
      if (ordData) setOrders(ordData);
      if (entryData) setEntries(entryData);
      if (exitData) setExits(exitData);
      if (closeData) setClosings(closeData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Orders
  const addOrder = async (orderData: any) => {
    const { items, ...orderInfo } = orderData;
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([orderInfo])
      .select()
      .single();

    if (orderError) throw orderError;

    if (items && items.length > 0) {
      const orderItems = items.map((item: any) => ({
        order_id: order.id,
        product_id: item.product_id || null,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
      if (itemsError) throw itemsError;
    }

    // Auto entry if completed
    if (order.status === OrderStatus.COMPLETED) {
      await addEntry({
        description: `Venda: ${order.customer_name}`,
        value: order.total,
        payment_type: order.payment_method,
        order_id: order.id
      });
    }

    await fetchData();
    return order;
  };

  const updateOrder = async (id: string, updates: Partial<Order>) => {
    const { error } = await supabase.from('orders').update(updates).eq('id', id);
    if (error) throw error;

    // Check if status changed to completed to trigger entry
    if (updates.status === OrderStatus.COMPLETED) {
      const { data: existingEntry } = await supabase.from('cash_entries').select('id').eq('order_id', id).single();
      if (!existingEntry) {
        const { data: order } = await supabase.from('orders').select('*').eq('id', id).single();
        if (order) {
          await addEntry({
            description: `Venda: ${order.customer_name}`,
            value: order.total,
            payment_type: order.payment_method,
            order_id: order.id
          });
        }
      }
    }

    await fetchData();
  };

  const deleteOrder = async (id: string) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  // Products
  const addProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('products').insert([product]);
    if (error) throw error;
    await fetchData();
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  // Entries
  const addEntry = async (entry: Omit<MoneyEntry, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('cash_entries').insert([entry]);
    if (error) throw error;
    await fetchData();
  };

  const updateEntry = async (id: string, updates: Partial<MoneyEntry>) => {
    const { error } = await supabase.from('cash_entries').update(updates).eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const deleteEntry = async (id: string) => {
    const { error } = await supabase.from('cash_entries').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  // Exits
  const addExit = async (exit: Omit<MoneyExit, 'id' | 'created_at'>) => {
    const { error } = await supabase.from('cash_exits').insert([exit]);
    if (error) throw error;
    await fetchData();
  };

  const updateExit = async (id: string, updates: Partial<MoneyExit>) => {
    const { error } = await supabase.from('cash_exits').update(updates).eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  const deleteExit = async (id: string) => {
    const { error } = await supabase.from('cash_exits').delete().eq('id', id);
    if (error) throw error;
    await fetchData();
  };

  // Cash Closing
  const closeCash = async (closingData: Omit<CashClosing, 'id' | 'closed_at'>) => {
    const { error } = await supabase
      .from('cash_closings')
      .upsert([closingData], { onConflict: 'closing_date' });
    
    if (error) throw error;
    await fetchData();
  };

  return {
    state: { orders, products, entries, exits, closings },
    loading,
    actions: {
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
      refresh: fetchData
    }
  };
}
