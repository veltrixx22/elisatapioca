/**
 * Elisa Tapiocas - Internal Management System
 */

import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Settings, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Phone, 
  MapPin, 
  Save, 
  Download, 
  Upload, 
  ArrowRightLeft,
  ChevronRight,
  Filter,
  DollarSign,
  ArrowRight,
  X,
  Printer
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart as RePieChart, Pie
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from './useStore';
import { 
  OrderStatus, 
  PaymentMethod, 
  DeliveryType, 
  ProductCategory, 
  ExitCategory,
  Order,
  Product,
  MoneyEntry,
  MoneyExit
} from './types';

// --- Utils ---
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case OrderStatus.PREPARING: return 'bg-blue-100 text-blue-700 border-blue-200';
    case OrderStatus.COMPLETED: return 'bg-green-100 text-green-700 border-green-200';
    case OrderStatus.CANCELLED: return 'bg-red-100 text-red-700 border-red-200';
    default: return 'bg-stone-100 text-stone-700';
  }
};

// --- Components ---

const ViewTitle = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
    <h2 className="text-4xl font-black tracking-tight uppercase">{title}</h2>
    <div className="flex gap-2">{children}</div>
  </div>
);

const Card = ({ children, className = "", ...props }: React.ComponentPropsWithoutRef<'div'>) => (
  <div {...props} className={`bg-white rounded-[32px] shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ label, value, colorClass }: { label: string, value: string | number, colorClass: string }) => (
  <div className={`bg-white rounded-[32px] p-6 shadow-sm border-b-4 ${colorClass}`}>
    <p className="text-xs font-bold uppercase opacity-50 mb-2">{label}</p>
    <p className="text-3xl md:text-5xl font-black tracking-tighter leading-none">{value}</p>
  </div>
);

// --- Sub-Views ---

const DashboardView = ({ state, actions, setActiveView }: { state: any, actions: any, setActiveView: any }) => {
  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayOrders = state.orders.filter((o: Order) => o.createdAt.startsWith(today) && !o.isClosed);
    const todayEntries = state.entries.filter((e: MoneyEntry) => e.date.startsWith(today) && !e.isClosed);
    const todayExits = state.exits.filter((e: MoneyExit) => e.date.startsWith(today) && !e.isClosed);
    
    const revenueToday = todayEntries.reduce((sum: number, e: MoneyEntry) => sum + e.value, 0);
    const costToday = todayExits.reduce((sum: number, e: MoneyExit) => sum + e.value, 0);
    
    // Product Stats
    const productSales: Record<string, number> = {};
    state.orders.filter((o: Order) => o.status === OrderStatus.COMPLETED).forEach((o: Order) => {
      o.items.forEach(item => {
        productSales[item.name] = (productSales[item.name] || 0) + item.quantity;
      });
    });
    const bestSelling = Object.entries(productSales).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Nenhum';

    return {
      todayCount: todayOrders.length,
      revenueToday,
      costToday,
      profitToday: revenueToday - costToday,
      pendingToday: todayOrders.filter((o: Order) => o.status === OrderStatus.PENDING).length,
      completedToday: todayOrders.filter((o: Order) => o.status === OrderStatus.COMPLETED).length,
      cancelledToday: todayOrders.filter((o: Order) => o.status === OrderStatus.CANCELLED).length,
      totalSold: state.entries.reduce((sum: number, e: MoneyEntry) => sum + e.value, 0),
      totalOrders: state.orders.length,
      bestSelling
    };
  }, [state]);

    return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <ViewTitle title="Dashboard">
          <span className="text-accent ml-2 text-4xl font-black uppercase">Hoje</span>
        </ViewTitle>
        <div className="flex gap-3">
          <button 
            onClick={() => actions.setActiveView('orders')}
            className="bg-accent text-white px-6 py-3 rounded-full text-sm font-bold shadow-lg shadow-orange-200"
          >
            + Novo Pedido
          </button>
          <button 
            onClick={() => setActiveView('closing')}
            className="bg-secondary text-primary px-6 py-3 rounded-full text-sm font-bold shadow-sm"
          >
             Fechar Caixa
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Pedidos" value={stats.todayCount} colorClass="border-accent" />
        <StatCard label="Total Vendas" value={formatCurrency(stats.revenueToday)} colorClass="border-secondary" />
        <StatCard label="Lucro Est." value={formatCurrency(stats.profitToday)} colorClass="text-white bg-primary rounded-[32px]" />
        <StatCard label="Pendentes" value={stats.pendingToday} colorClass="border-emerald-500" />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <section className="flex-1 bg-white rounded-[40px] shadow-sm p-8 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Pedidos Recentes</h3>
            <span onClick={() => {}} className="text-xs text-accent font-bold uppercase cursor-pointer">Ver todos</span>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
            {state.orders.filter((o: Order) => !o.isClosed).slice(0, 5).map((order: Order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-warm-bg rounded-2xl border border-stone-100">
                <div className="flex-1">
                  <p className="font-bold">{order.customerName}</p>
                  <p className="text-xs opacity-60 truncate w-48 sm:w-auto">
                    {order.items.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                  </p>
                </div>
                <div className="text-right mr-4 sm:mr-6">
                  <p className="text-sm font-bold">{formatCurrency(order.total)}</p>
                  <p className={`text-[10px] uppercase font-bold ${
                    order.status === OrderStatus.COMPLETED ? 'text-emerald-500' : 
                    order.status === OrderStatus.CANCELLED ? 'text-red-500' : 'text-orange-500'
                  }`}>{order.status}</p>
                </div>
              </div>
            ))}
            {state.orders.length === 0 && <p className="text-center py-8 text-stone-400">Nenhum pedido recente.</p>}
          </div>
        </section>

        <section className="w-full lg:w-80 bg-white rounded-[40px] shadow-sm p-8 flex flex-col">
          <h3 className="text-xl font-bold mb-6">Mais Vendidas</h3>
          <div className="space-y-6">
            {Object.entries(
              state.orders
                .filter((o: Order) => o.status === OrderStatus.COMPLETED && !o.isClosed)
                .reduce((acc: any, o: Order) => {
                  o.items.forEach(i => acc[i.name] = (acc[i.name] || 0) + i.quantity);
                  return acc;
                }, {})
            )
              .sort((a: any, b: any) => b[1] - a[1])
              .slice(0, 5)
              .map(([name, qty]: any, idx, arr) => {
                const total = arr.reduce((sum: number, [_, q]: any) => sum + q, 0);
                const percent = Math.round((qty / total) * 100) || 0;
                const colors = ['bg-accent', 'bg-secondary', 'bg-primary'];
                return (
                  <div key={name} className="relative">
                    <div className="flex justify-between mb-1 text-xs font-bold uppercase tracking-tighter">
                      <span className="truncate w-3/4">{name}</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="h-2 bg-warm-bg rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors[idx % 3]} transition-all duration-500`} 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            {state.orders.filter((o: Order) => o.status === OrderStatus.COMPLETED).length === 0 && (
              <p className="text-xs text-stone-400 text-center py-4">Aguardando vendas concluídas...</p>
            )}
          </div>
          
          <div className="mt-auto pt-8">
            <div className="bg-warm-bg p-4 rounded-2xl">
              <p className="text-[10px] uppercase font-bold opacity-40 mb-2">Backups</p>
              <button 
                onClick={() => actions.exportData()}
                className="w-full text-xs font-bold py-2 border border-stone-200 rounded-lg hover:bg-white transition-all uppercase"
              >
                Exportar JSON
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const OrdersView = ({ state, actions }: { state: any, actions: any }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Process items (for simplicity, we assume one item selected from list for now or multiple via a list)
    // Actually let's make it a bit dynamic
    const items: any[] = [];
    state.products.forEach((p: Product) => {
      const qty = parseInt(formData.get(`qty_${p.id}`) as string || '0');
      if (qty > 0) {
        items.push({
          productId: p.id,
          name: p.name,
          quantity: qty,
          price: p.price
        });
      }
    });

    if (items.length === 0) {
      alert('Selecione pelo menos um item');
      return;
    }

    const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    
    const orderData = {
      customerName: formData.get('customerName') as string,
      phone: formData.get('phone') as string,
      deliveryType: formData.get('deliveryType') as DeliveryType,
      address: formData.get('address') as string,
      items,
      total,
      paymentMethod: formData.get('paymentMethod') as PaymentMethod,
      status: formData.get('status') as OrderStatus,
      observations: formData.get('observations') as string,
    };

    if (editingOrder) {
      actions.updateOrder(editingOrder.id, orderData);
    } else {
      actions.addOrder(orderData);
    }

    setShowModal(false);
    setEditingOrder(null);
  };

  return (
    <div className="space-y-6 pb-20">
      <ViewTitle title="Gestão de Pedidos">
        <button 
          onClick={() => setShowModal(true)}
          className="bg-accent text-white px-6 py-3 rounded-full flex items-center gap-2 hover:opacity-90 font-bold shadow-lg shadow-orange-200"
        >
          <Plus size={20} /> Novo Pedido
        </button>
      </ViewTitle>

      <div className="space-y-4">
        {state.orders.length === 0 ? (
          <Card className="text-center py-10 text-stone-400">
            Nenhum pedido cadastrado ainda.
          </Card>
        ) : (
          state.orders.map((order: Order) => (
            <Card key={order.id} className="relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-1 h-full ${
                order.status === OrderStatus.COMPLETED ? 'bg-green-500' : 
                order.status === OrderStatus.CANCELLED ? 'bg-red-500' : 'bg-orange-500'
              }`} />
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-bold text-lg text-stone-800">{order.customerName}</h4>
                  <p className="flex items-center gap-1 text-xs text-stone-500">
                    <Clock size={12} /> {formatDate(order.createdAt)}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-[10px] font-bold border uppercase ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-1 mb-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-stone-600">{item.quantity}x {item.name}</span>
                    <span className="text-stone-400">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-stone-50 pt-3">
                <span className="font-bold text-primary">{formatCurrency(order.total)}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => { setEditingOrder(order); setShowModal(true); }}
                    className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => actions.deleteOrder(order.id)}
                    className="p-2 text-red-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {order.status !== OrderStatus.COMPLETED && order.status !== OrderStatus.CANCELLED && (
                  <>
                    <button 
                      onClick={() => actions.updateOrder(order.id, { status: OrderStatus.COMPLETED })}
                      className="bg-green-50 text-green-600 px-3 py-1 rounded-lg text-xs font-bold border border-green-200 hover:bg-green-100"
                    >
                      Concluir
                    </button>
                    <button 
                      onClick={() => actions.updateOrder(order.id, { status: OrderStatus.CANCELLED })}
                      className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-bold border border-red-200 hover:bg-red-100"
                    >
                      Cancelar
                    </button>
                  </>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }}
            className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl p-6 overflow-y-auto max-h-[90vh]"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-stone-800">{editingOrder ? 'Editar Pedido' : 'Novo Pedido'}</h3>
              <button onClick={() => { setShowModal(false); setEditingOrder(null); }} className="text-stone-400"><XCircle /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Nome do Cliente *</label>
                  <input required name="customerName" defaultValue={editingOrder?.customerName} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 focus:ring-2 focus:ring-accent outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Telefone</label>
                  <input name="phone" defaultValue={editingOrder?.phone} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 focus:ring-2 focus:ring-accent outline-none" placeholder="(00) 00000-0000" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Tipo de Entrega</label>
                  <select name="deliveryType" defaultValue={editingOrder?.deliveryType || DeliveryType.PICKUP} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 outline-none">
                    <option value={DeliveryType.PICKUP}>Retirada</option>
                    <option value={DeliveryType.DELIVERY}>Entrega</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Status</label>
                  <select name="status" defaultValue={editingOrder?.status || OrderStatus.PENDING} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 outline-none">
                    <option value={OrderStatus.PENDING}>Pendente</option>
                    <option value={OrderStatus.PREPARING}>Em Preparo</option>
                    <option value={OrderStatus.COMPLETED}>Concluído</option>
                    <option value={OrderStatus.CANCELLED}>Cancelado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Endereço (se entrega)</label>
                <input name="address" defaultValue={editingOrder?.address} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 outline-none" />
              </div>

              <div className="border-t border-stone-100 pt-4">
                <label className="block text-xs font-bold text-stone-500 uppercase mb-3 text-center">Itens do Pedido</label>
                <div className="space-y-3 max-h-48 overflow-y-auto px-2">
                  {state.products.map((p: Product) => {
                    const item = editingOrder?.items.find(i => i.productId === p.id);
                    return (
                      <div key={p.id} className="flex items-center justify-between gap-4 p-2 bg-stone-50 rounded-xl border border-stone-100">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-stone-700 leading-tight">{p.name}</p>
                          <p className="text-xs text-stone-400">{formatCurrency(p.price)}</p>
                        </div>
                        <input 
                          type="number" 
                          name={`qty_${p.id}`} 
                          min="0" 
                          defaultValue={item?.quantity || 0}
                          className="w-16 bg-white border border-stone-200 rounded-lg px-2 py-1 text-center font-bold outline-none focus:border-accent"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-stone-100 pt-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Forma de Pagamento</label>
                  <select name="paymentMethod" defaultValue={editingOrder?.paymentMethod || PaymentMethod.PIX} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 outline-none">
                    <option value={PaymentMethod.PIX}>Pix</option>
                    <option value={PaymentMethod.CASH}>Dinheiro</option>
                    <option value={PaymentMethod.CARD}>Cartão</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Observações</label>
                  <textarea name="observations" defaultValue={editingOrder?.observations} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 outline-none h-10" />
                </div>
              </div>

              <button type="submit" className="w-full bg-accent text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 mt-4 hover:opacity-90">
                <Save size={20} /> {editingOrder ? 'Salvar Edições' : 'Cadastrar Pedido'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const ProductsView = ({ state, actions }: { state: any, actions: any }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<Product | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      category: formData.get('category') as ProductCategory,
      price: parseFloat(formData.get('price') as string),
    };

    if (editingItem) {
      actions.updateProduct(editingItem.id, data);
    } else {
      actions.addProduct(data);
    }
    setShowModal(false);
    setEditingItem(null);
  };

  const productSales = useMemo(() => {
    const sales: Record<string, { qty: number, total: number }> = {};
    state.orders.filter((o: Order) => o.status === OrderStatus.COMPLETED).forEach((o: Order) => {
      o.items.forEach(item => {
        if (!sales[item.productId]) sales[item.productId] = { qty: 0, total: 0 };
        sales[item.productId].qty += item.quantity;
        sales[item.productId].total += item.price * item.quantity;
      });
    });
    return sales;
  }, [state]);

  return (
    <div className="space-y-6 pb-20">
      <ViewTitle title="Controle de Tapiocas">
        <button 
          onClick={() => setShowModal(true)}
          className="bg-accent text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 font-bold"
        >
          <Plus size={20} /> Novo Produto
        </button>
      </ViewTitle>

      <div className="grid grid-cols-1 gap-4">
        {state.products.map((p: Product) => (
          <Card key={p.id} className="flex justify-between items-center group">
            <div className="flex-1">
              <h4 className="font-bold text-stone-800">{p.name}</h4>
              <p className="text-xs text-stone-400 uppercase tracking-tighter">{p.category}</p>
              <div className="mt-2 flex gap-4">
                <span className="text-xs font-bold text-accent">Vendido: {productSales[p.id]?.qty || 0} un.</span>
                <span className="text-xs font-bold text-green-600">Total: {formatCurrency(productSales[p.id]?.total || 0)}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-primary mb-2">{formatCurrency(p.price)}</p>
              <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingItem(p); setShowModal(true); }} className="p-1 text-stone-400 hover:text-stone-600"><Edit2 size={16}/></button>
                <button onClick={() => actions.deleteProduct(p.id)} className="p-1 text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-sm rounded-[2rem] p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-stone-800">{editingItem ? 'Editar Tapioca' : 'Nova Tapioca'}</h3>
              <button onClick={() => { setShowModal(false); setEditingItem(null); }} className="text-stone-400"><XCircle /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Nome da Tapioca</label>
                <input required name="name" defaultValue={editingItem?.name} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Categoria</label>
                <select name="category" defaultValue={editingItem?.category || ProductCategory.SAVORY} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 outline-none">
                  <option value={ProductCategory.SAVORY}>Salgada</option>
                  <option value={ProductCategory.CONDENSED_MILK}>Com leite condensado</option>
                  <option value={ProductCategory.SWEET_FILLED}>Doce recheada</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Preço</label>
                <input required type="number" step="0.01" name="price" defaultValue={editingItem?.price} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 outline-none" />
              </div>

              <button type="submit" className="w-full bg-primary text-white py-3 rounded-2xl font-bold flex items-center justify-center gap-2 mt-4 hover:opacity-90">
                <CheckCircle2 size={20} /> Salvar
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const FinancesView = ({ state, actions }: { state: any, actions: any }) => {
  const [activeTab, setActiveTab] = useState<'entries' | 'exits'>('entries');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: any = {
      description: formData.get('description') as string,
      value: parseFloat(formData.get('value') as string),
      date: formData.get('date') as string || new Date().toISOString().split('T')[0],
    };

    if (activeTab === 'entries') {
      data.paymentType = formData.get('paymentType') as PaymentMethod;
      if (editingItem) actions.updateEntry(editingItem.id, data);
      else actions.addEntry(data);
    } else {
      data.category = formData.get('category') as ExitCategory;
      if (editingItem) actions.updateExit(editingItem.id, data);
      else actions.addExit(data);
    }

    setShowModal(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6 pb-20">
      <ViewTitle title="Financeiro">
        <button 
          onClick={() => setShowModal(true)}
          className={`px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 font-bold text-white ${
            activeTab === 'entries' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          <Plus size={20} /> {activeTab === 'entries' ? 'Nova Entrada' : 'Nova Saída'}
        </button>
      </ViewTitle>

      <div className="flex bg-stone-100 p-1 rounded-2xl">
        <button 
          onClick={() => setActiveTab('entries')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'entries' ? 'bg-white text-green-600 shadow-sm' : 'text-stone-500'
          }`}
        >
          <TrendingUp size={18} /> Entradas
        </button>
        <button 
          onClick={() => setActiveTab('exits')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-bold transition-all ${
            activeTab === 'exits' ? 'bg-white text-red-600 shadow-sm' : 'text-stone-500'
          }`}
        >
          <TrendingDown size={18} /> Saídas
        </button>
      </div>

      <div className="space-y-3">
        {(activeTab === 'entries' ? state.entries : state.exits).map((item: any) => (
          <Card key={item.id} className="flex justify-between items-center group">
            <div>
              <h4 className="font-bold text-stone-800">{item.description}</h4>
              <div className="flex gap-3 text-[10px] uppercase font-bold tracking-wider mt-1">
                <span className="text-stone-400">{item.date}</span>
                <span className={activeTab === 'entries' ? 'text-green-500' : 'text-red-500'}>
                  {activeTab === 'entries' ? item.paymentType : item.category}
                </span>
              </div>
            </div>
            <div className="text-right flex items-center gap-3">
              <span className={`font-bold ${activeTab === 'entries' ? 'text-green-600' : 'text-red-600'}`}>
                {activeTab === 'entries' ? '+' : '-'}{formatCurrency(item.value)}
              </span>
              <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingItem(item); setShowModal(true); }} className="p-1 text-stone-300 hover:text-stone-600"><Edit2 size={16}/></button>
                <button 
                  onClick={() => activeTab === 'entries' ? actions.deleteEntry(item.id) : actions.deleteExit(item.id)} 
                  className="p-1 text-red-200 hover:text-red-500"
                >
                  <Trash2 size={16}/>
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-sm rounded-[2rem] p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-stone-800">
                {editingItem ? 'Editar' : 'Nova'} {activeTab === 'entries' ? 'Entrada' : 'Saída'}
              </h3>
              <button onClick={() => { setShowModal(false); setEditingItem(null); }} className="text-stone-400"><XCircle /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Descrição</label>
                <input required name="description" defaultValue={editingItem?.description} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Valor</label>
                  <input required type="number" step="0.01" name="value" defaultValue={editingItem?.value} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Data</label>
                  <input type="date" name="date" defaultValue={editingItem?.date || new Date().toISOString().split('T')[0]} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 outline-none" />
                </div>
              </div>
              
              {activeTab === 'entries' ? (
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Forma de Pagamento</label>
                  <select name="paymentType" defaultValue={editingItem?.paymentType || PaymentMethod.PIX} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 outline-none">
                    <option value={PaymentMethod.PIX}>Pix</option>
                    <option value={PaymentMethod.CASH}>Dinheiro</option>
                    <option value={PaymentMethod.CARD}>Cartão</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-stone-500 uppercase mb-1">Categoria</label>
                  <select name="category" defaultValue={editingItem?.category || ExitCategory.INGREDIENTS} className="w-full bg-stone-50 border border-stone-100 rounded-xl px-4 py-2 outline-none">
                    <option value={ExitCategory.INGREDIENTS}>Ingredientes</option>
                    <option value={ExitCategory.PACKAGING}>Embalagens</option>
                    <option value={ExitCategory.DELIVERY}>Entrega</option>
                    <option value={ExitCategory.GAS}>Gás</option>
                    <option value={ExitCategory.OTHERS}>Outros</option>
                  </select>
                </div>
              )}

              <button type="submit" className={`w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 mt-4 hover:opacity-90 text-white ${activeTab === 'entries' ? 'bg-green-600' : 'bg-red-600'}`}>
                <Save size={20} /> Salvar
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const CashClosingView = ({ state, actions }: { state: any, actions: any }) => {
  const [activeStep, setActiveStep] = useState<'preview' | 'history'>('preview');
  const [selectedClosing, setSelectedClosing] = useState<any>(null);

  const todayData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = state.entries.filter((e: any) => e.date.startsWith(today) && !e.isClosed);
    const todayExits = state.exits.filter((e: any) => e.date.startsWith(today) && !e.isClosed);
    const todayOrders = state.orders.filter((o: any) => o.createdAt.startsWith(today) && !o.isClosed);
    
    const totalEntries = todayEntries.reduce((sum: number, e: any) => sum + e.value, 0);
    const totalExits = todayExits.reduce((sum: number, e: any) => sum + e.value, 0);
    
    return {
      date: today,
      totalEntries,
      totalExits,
      profit: totalEntries - totalExits,
      orderCount: todayOrders.length,
      completedOrders: todayOrders.filter((o: any) => o.status === OrderStatus.COMPLETED).length,
      cancelledOrders: todayOrders.filter((o: any) => o.status === OrderStatus.CANCELLED).length,
      entries: todayEntries,
      exits: todayExits,
      orders: todayOrders
    };
  }, [state]);

  const hasClosedToday = useMemo(() => {
    return state.closings.some((c: any) => c.date === todayData.date);
  }, [state.closings, todayData.date]);

  const handleClose = () => {
    if (hasClosedToday) {
      if (!confirm('O caixa de hoje já foi fechado. Deseja refazer o fechamento com os dados atuais?')) return;
    } else {
      if (!confirm('Tem certeza que deseja fechar o caixa de hoje? Depois você poderá consultar esse fechamento no histórico.')) return;
    }

    actions.closeCash(todayData, true);
    alert('Caixa fechado com sucesso!');
    setActiveStep('history');
  };

  const handlePrint = (closing: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>Prestação de Caixa - ${closing.date}</title>
          <style>
            body { font-family: sans-serif; padding: 40px; color: #4A3728; }
            h1 { font-family: serif; font-style: italic; font-size: 32px; margin-bottom: 0px; }
            .subtitle { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; opacity: 0.7; margin-bottom: 30px; }
            .header-info { margin-bottom: 30px; border-bottom: 2px solid #FDFBF7; padding-bottom: 20px; }
            .summary { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .stat-box { background: #FDFBF7; padding: 15px; border-radius: 10px; }
            .stat-label { font-size: 10px; font-weight: bold; color: #888; margin-bottom: 5px; text-transform: uppercase; }
            .stat-value { font-size: 18px; font-weight: bold; }
            .stat-profit { color: ${closing.profit >= 0 ? '#10b981' : '#ef4444'}; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; font-size: 10px; border-bottom: 1px solid #eee; padding: 10px 5px; color: #888; text-transform: uppercase; }
            td { padding: 10px 5px; border-bottom: 1px solid #f9f9f9; font-size: 12px; }
            .section-title { font-weight: bold; margin-top: 30px; border-bottom: 1px solid #F27D26; display: inline-block; padding-bottom: 3px; margin-bottom: 10px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>Elisa</h1>
          <div class="subtitle">Tapiocas</div>
          
          <div class="header-info">
            <h2 style="margin: 0; font-size: 20px;">PRESTAÇÃO DO CAIXA</h2>
            <p style="margin: 5px 0 0 0; opacity: 0.6;">Data: ${closing.date} | Fechado em: ${new Date(closing.createdAt).toLocaleTimeString()}</p>
          </div>

          <div class="summary">
            <div class="stat-box">
              <div class="stat-label">Total de Pedidos</div>
              <div class="stat-value">${closing.orderCount} (${closing.completedOrders} concluídos)</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Total de Entradas</div>
              <div class="stat-value">R$ ${closing.totalEntries.toFixed(2)}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Total de Saídas</div>
              <div class="stat-value">R$ ${closing.totalExits.toFixed(2)}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Lucro Estimado</div>
              <div class="stat-value stat-profit">R$ ${closing.profit.toFixed(2)}</div>
            </div>
          </div>

          <div class="section-title">DETALHES DE ENTRADAS</div>
          <table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Forma Pgto</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              ${closing.entries.map((e: any) => `
                <tr>
                  <td>${e.description}</td>
                  <td>${e.paymentType}</td>
                  <td>R$ ${e.value.toFixed(2)}</td>
                </tr>
              `).join('')}
              ${closing.entries.length === 0 ? '<tr><td colspan="3" style="text-align:center">Nenhuma entrada</td></tr>' : ''}
            </tbody>
          </table>

          <div class="section-title">DETALHES DE SAÍDAS</div>
          <table>
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              ${closing.exits.map((e: any) => `
                <tr>
                  <td>${e.description}</td>
                  <td>${e.category}</td>
                  <td>R$ ${e.value.toFixed(2)}</td>
                </tr>
              `).join('')}
              ${closing.exits.length === 0 ? '<tr><td colspan="3" style="text-align:center">Nenhuma saída</td></tr>' : ''}
            </tbody>
          </table>

          <div style="margin-top: 50px; text-align: center; font-size: 10px; opacity: 0.5;">
            Documento gerado pelo Sistema Interno Elisa Tapiocas em ${new Date().toLocaleString()}
          </div>

          <script>window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(content);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6 pb-20">
      <ViewTitle title="Caixa do Dia" />

      <div className="flex bg-stone-100 p-1 rounded-2xl mb-6">
        <button 
          onClick={() => setActiveStep('preview')}
          className={`flex-1 py-2 rounded-xl font-bold transition-all ${activeStep === 'preview' ? 'bg-white text-primary shadow-sm' : 'text-stone-500'}`}
        >
          Resumo Hoje
        </button>
        <button 
          onClick={() => setActiveStep('history')}
          className={`flex-1 py-2 rounded-xl font-bold transition-all ${activeStep === 'history' ? 'bg-white text-primary shadow-sm' : 'text-stone-500'}`}
        >
          Histórico
        </button>
      </div>

      {activeStep === 'preview' ? (
        <Card className="p-8 bg-white border-none shadow-xl border-t-8 border-accent rounded-[40px]">
          <div className="text-center mb-8">
             <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-1">Status de Hoje</p>
             <h3 className="text-xl font-black">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</h3>
             {hasClosedToday && (
               <div className="mt-2 inline-block bg-orange-100 text-orange-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">
                 Caixa fechado hoje
               </div>
             )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-warm-bg p-6 rounded-3xl text-center">
              <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Pedidos Concluídos</p>
              <p className="text-3xl font-black">{todayData.completedOrders}</p>
            </div>
            <div className="bg-warm-bg p-6 rounded-3xl text-center">
              <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Total Vendido</p>
              <p className="text-3xl font-black text-accent">{formatCurrency(todayData.totalEntries)}</p>
            </div>
            <div className="bg-warm-bg p-6 rounded-3xl text-center border-2 border-dashed border-stone-200">
              <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Lucro Est. Hoje</p>
              <p className={`text-3xl font-black ${todayData.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(todayData.profit)}
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl">
              <span className="text-sm font-bold text-stone-500 uppercase tracking-tighter">Entradas Gerais</span>
              <span className="text-lg font-black text-green-600">{formatCurrency(todayData.totalEntries)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl">
              <span className="text-sm font-bold text-stone-500 uppercase tracking-tighter">Saídas Gerais</span>
              <span className="text-lg font-black text-red-600">{formatCurrency(todayData.totalExits)}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-stone-50 rounded-2xl">
              <span className="text-sm font-bold text-stone-500 uppercase tracking-tighter">Pedidos Pendentes</span>
              <span className="text-lg font-black text-secondary">{todayData.orderCount - todayData.completedOrders - todayData.cancelledOrders}</span>
            </div>
          </div>

          <button 
            onClick={handleClose}
            className="w-full bg-accent text-white py-5 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-orange-200 hover:scale-[1.02] transition-all active:scale-95"
          >
            <CheckCircle2 size={24} /> {hasClosedToday ? 'REFAZER FECHAMENTO' : 'FECHAR CAIXA DO DIA'}
          </button>
        </Card>
      ) : (
        <div className="space-y-4">
          {state.closings.map((closing: any) => (
            <Card key={closing.id} className="flex justify-between items-center group p-6 rounded-[32px] hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedClosing(closing)}>
              <div>
                <p className="font-black text-lg text-primary">{new Date(closing.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                <div className="flex items-center gap-2 mt-1">
                   <Clock size={12} className="text-stone-400" />
                   <p className="text-[10px] text-stone-500 font-bold uppercase">{new Date(closing.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-6">
                <div>
                  <p className={`font-black text-xl ${closing.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(closing.profit)}
                  </p>
                  <p className="text-[10px] font-bold text-stone-400 uppercase">Lucro Final</p>
                </div>
                <div className="bg-stone-50 p-2 rounded-full text-stone-300 group-hover:text-accent transition-colors">
                  <ArrowRight size={20} />
                </div>
              </div>
            </Card>
          ))}
          {state.closings.length === 0 && (
             <Card className="text-center py-20 text-stone-400 rounded-[40px] bg-stone-50 border-2 border-dashed border-stone-200">
               Nenhum fechamento registrado.
             </Card>
          )}
        </div>
      )}

      {/* Details/Report Modal */}
      {selectedClosing && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[40px] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="p-8 border-b border-stone-100 flex justify-between items-center bg-primary text-white">
              <div>
                <h3 className="text-2xl font-black">Prestação do Caixa</h3>
                <p className="text-xs font-bold opacity-60 uppercase">{new Date(selectedClosing.date + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
              </div>
              <button 
                onClick={() => setSelectedClosing(null)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Summary Stats in Modal */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-warm-bg p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Pedidos</p>
                  <p className="text-xl font-black">{selectedClosing.orderCount}</p>
                </div>
                <div className="bg-warm-bg p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Entradas</p>
                  <p className="text-xl font-black text-green-600">{formatCurrency(selectedClosing.totalEntries)}</p>
                </div>
                <div className="bg-warm-bg p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Saídas</p>
                  <p className="text-xl font-black text-red-600">{formatCurrency(selectedClosing.totalExits)}</p>
                </div>
                <div className="bg-warm-bg p-4 rounded-2xl text-center">
                  <p className="text-[10px] font-bold text-stone-400 uppercase mb-1">Lucro</p>
                  <p className={`text-xl font-black ${selectedClosing.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(selectedClosing.profit)}</p>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-6">
                <div>
                  <h4 className="font-black text-stone-800 uppercase tracking-tighter mb-4 border-b pb-2 flex items-center gap-2">
                    <TrendingUp size={16} className="text-green-500" /> Detalhes de Entradas
                  </h4>
                  <div className="space-y-2">
                    {selectedClosing.entries.map((e: any) => (
                      <div key={e.id} className="flex justify-between items-center text-sm p-3 bg-stone-50 rounded-xl">
                        <div>
                          <p className="font-bold">{e.description}</p>
                          <p className="text-[10px] opacity-50 uppercase font-bold">{e.paymentType}</p>
                        </div>
                        <p className="font-black text-green-600">{formatCurrency(e.value)}</p>
                      </div>
                    ))}
                    {selectedClosing.entries.length === 0 && <p className="text-center py-4 text-stone-400 text-xs italic">Nenhuma entrada registrada.</p>}
                  </div>
                </div>

                <div>
                  <h4 className="font-black text-stone-800 uppercase tracking-tighter mb-4 border-b pb-2 flex items-center gap-2">
                    <TrendingDown size={16} className="text-red-500" /> Detalhes de Saídas
                  </h4>
                  <div className="space-y-2">
                    {selectedClosing.exits.map((e: any) => (
                      <div key={e.id} className="flex justify-between items-center text-sm p-3 bg-stone-50 rounded-xl">
                        <div>
                          <p className="font-bold">{e.description}</p>
                          <p className="text-[10px] opacity-50 uppercase font-bold">{e.category}</p>
                        </div>
                        <p className="font-black text-red-600">{formatCurrency(e.value)}</p>
                      </div>
                    ))}
                    {selectedClosing.exits.length === 0 && <p className="text-center py-4 text-stone-400 text-xs italic">Nenhuma saída registrada.</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-stone-100 bg-stone-50 flex gap-4">
              <button 
                onClick={() => handlePrint(selectedClosing)}
                className="flex-1 bg-primary text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors uppercase tracking-tight"
              >
                <Printer size={20} /> Imprimir Prestação
              </button>
              <button 
                onClick={() => setSelectedClosing(null)}
                className="px-8 bg-white border border-stone-200 text-stone-400 py-4 rounded-2xl font-bold hover:bg-stone-100 transition-colors uppercase tracking-tight"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const ReportsView = ({ state }: { state: any }) => {
  const [period, setPeriod] = useState<number>(7); // 0 = all

  const data = useMemo(() => {
    // Generate last X days
    const range = period === 0 ? 30 : period;
    const days = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayEntries = state.entries.filter((e: any) => e.date.startsWith(dateStr));
      const dayExits = state.exits.filter((e: any) => e.date.startsWith(dateStr));
      
      days.push({
        name: dateStr.split('-').slice(1).reverse().join('/'),
        receita: dayEntries.reduce((sum: number, e: any) => sum + e.value, 0),
        despesa: dayExits.reduce((sum: number, e: any) => sum + e.value, 0),
      });
    }
    return days;
  }, [state, period]);

  const productData = useMemo(() => {
    const sales: Record<string, number> = {};
    state.orders.filter((o: Order) => o.status === OrderStatus.COMPLETED).forEach((o: Order) => {
      o.items.forEach(item => {
        sales[item.name] = (sales[item.name] || 0) + item.quantity;
      });
    });
    return Object.entries(sales).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 5);
  }, [state]);

  const COLORS = ['#8B4513', '#F4A460', '#FF8C00', '#FFD700', '#CD853F'];

  return (
    <div className="space-y-6 pb-20">
      <ViewTitle title="Relatórios" />

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[7, 30, 0].map((p) => (
          <button 
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 rounded-xl whitespace-nowrap font-bold text-sm transition-all ${
              period === p ? 'bg-primary text-white' : 'bg-stone-100 text-stone-500'
            }`}
          >
            {p === 0 ? 'Todo Periodo' : `Últimos ${p} dias`}
          </button>
        ))}
      </div>

      <Card className="h-80">
        <h3 className="font-bold text-stone-700 mb-4">Fluxo de Caixa (Entradas vs Saídas)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" vertical={false} />
            <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
            <YAxis fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
              formatter={(v: number) => formatCurrency(v)}
            />
            <Bar dataKey="receita" fill="#10B981" radius={[4, 4, 0, 0]} barSize={12} />
            <Bar dataKey="despesa" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="h-80 flex flex-col">
          <h3 className="font-bold text-stone-700 mb-4 text-center">Top 5 Tapiocas Vendidas</h3>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[10px] mt-2">
            {productData.map((d, i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                <span className="truncate">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-bold text-stone-700 mb-4">Resumo Geral</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-stone-50">
              <span className="text-sm text-stone-500">Total Recebido:</span>
              <span className="font-bold text-green-600">{formatCurrency(state.entries.reduce((s: any, e: any) => s+e.value, 0))}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-stone-50">
              <span className="text-sm text-stone-500">Total Despesa:</span>
              <span className="font-bold text-red-600">{formatCurrency(state.exits.reduce((s: any, e: any) => s+e.value, 0))}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-stone-500">Lucro Acumulado:</span>
              <span className="font-black text-stone-800 text-lg">
                {formatCurrency(state.entries.reduce((s: any, e: any) => s+e.value, 0) - state.exits.reduce((s: any, e: any) => s+e.value, 0))}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const BackupView = ({ actions }: { actions: any }) => {
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        actions.importData(json);
        alert('Dados importados com sucesso!');
      } catch (err) {
        alert('Erro ao importar arquivo. Verifique se o formato está correto.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-20">
      <ViewTitle title="Configurações e Backup" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 flex flex-col items-center text-center">
          <div className="bg-blue-100 text-blue-600 p-4 rounded-full mb-4"><Download size={32} /></div>
          <h4 className="font-bold text-stone-800 mb-2">Exportar Dados</h4>
          <p className="text-xs text-stone-400 mb-6">Baixe uma cópia de segurança de todos os seus pedidos, produtos e financeiro em formato JSON.</p>
          <button onClick={actions.exportData} className="w-full bg-blue-600 text-white font-bold py-3 rounded-2xl hover:opacity-90">Exportar Agora</button>
        </Card>

        <Card className="p-6 flex flex-col items-center text-center">
          <div className="bg-purple-100 text-purple-600 p-4 rounded-full mb-4"><Upload size={32} /></div>
          <h4 className="font-bold text-stone-800 mb-2">Importar Dados</h4>
          <p className="text-xs text-stone-400 mb-6">Restaure seus dados de um arquivo de backup previamente exportado. Esta ação substituirá os atuais.</p>
          <label className="w-full bg-purple-600 text-white font-bold py-3 rounded-2xl hover:opacity-90 cursor-pointer block text-center">
            Selecionar Arquivo
            <input type="file" className="hidden" accept=".json" onChange={handleImport} />
          </label>
        </Card>

        <Card className="p-6 flex flex-col items-center text-center border-red-100 bg-red-50 sm:col-span-2">
          <div className="bg-red-100 text-red-600 p-4 rounded-full mb-4"><Trash2 size={32} /></div>
          <h4 className="font-bold text-red-800 mb-2">Zona de Perigo</h4>
          <p className="text-xs text-red-400 mb-6 font-medium">Esta ação irá apagar definitivamente todos os registros salvos no seu navegador.</p>
          <button onClick={actions.clearData} className="bg-red-600 text-white font-bold px-8 py-3 rounded-2xl hover:bg-red-700 transition-colors">Limpar Todo o Sistema</button>
        </Card>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const { state, isLoaded, ...actions } = useStore();
  const [activeView, setActiveView] = useState<'dashboard' | 'orders' | 'products' | 'finances' | 'closing' | 'reports' | 'settings'>('dashboard');

  if (!isLoaded) return <div className="h-screen w-screen flex items-center justify-center bg-warm-bg text-stone-300">Carregando...</div>;

  const NavItem = ({ id, label, icon: Icon }: { id: any, label: string, icon: any }) => {
    const active = activeView === id;
    return (
      <button 
        onClick={() => setActiveView(id)}
        className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-accent scale-110' : 'text-white/50 hover:text-white'}`}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${active ? 'bg-accent' : 'bg-white/10'}`}>
          <Icon size={20} strokeWidth={active ? 2.5 : 2} className={active ? 'text-white' : 'text-white/50'} />
        </div>
        <span className="text-[10px] font-bold uppercase">{label}</span>
      </button>
    );
  };

  const SidebarItem = ({ id, label, icon: Icon }: { id: any, label: string, icon: any }) => {
    const active = activeView === id;
    return (
      <button 
        onClick={() => setActiveView(id)}
        className={`flex items-center gap-3 w-full px-4 py-4 rounded-xl transition-all text-sm uppercase tracking-wider font-semibold ${
          active ? 'bg-accent text-white shadow-lg shadow-orange-900/20' : 'text-white/60 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Icon size={18} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-warm-bg flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-primary text-white h-screen sticky top-0 flex-col p-4 shadow-2xl">
        <div className="p-8 mb-8 text-center">
          <h1 className="text-4xl font-serif italic mb-1 leading-none">Elisa</h1>
          <p className="text-[10px] tracking-[0.3em] uppercase opacity-70 font-bold">Tapiocas</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <SidebarItem id="dashboard" label="Painel Geral" icon={LayoutDashboard} />
          <SidebarItem id="orders" label="Pedidos" icon={ShoppingBag} />
          <SidebarItem id="products" label="Cardápio" icon={ArrowRightLeft} />
          <SidebarItem id="finances" label="Financeiro" icon={DollarSign} />
          <SidebarItem id="closing" label="Fechamento" icon={CheckCircle2} />
          <SidebarItem id="reports" label="Relatórios" icon={PieChart} />
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-4 text-center mb-4">
            <p className="text-[10px] uppercase opacity-60 mb-1 font-bold">Saldo Total</p>
            <p className="text-lg font-black tracking-tighter">
              {formatCurrency(state.entries.reduce((s: any, e: any) => s+e.value, 0) - state.exits.reduce((s: any, e: any) => s+e.value, 0))}
            </p>
          </div>
          <SidebarItem id="settings" label="Configurações" icon={Settings} />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 lg:p-12 overflow-x-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden mb-8 bg-white p-8 rounded-[2.5rem] shadow-sm border border-stone-100">
          <div className="flex flex-col items-center">
             <h1 className="brand-title">Elisa <span>Tapiocas</span></h1>
             <p className="brand-subtitle">Tapiocas fresquinhas feitas com carinho</p>
             
             <div className="flex flex-wrap justify-center gap-2 w-full border-t border-stone-50 mt-6 pt-6">
                <span className="text-[10px] uppercase font-bold text-green-600 bg-green-50 px-4 py-2 rounded-full border border-green-100 flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Aberto agora
                </span>
                <span className="text-[10px] uppercase font-bold text-stone-500 bg-stone-50 px-4 py-2 rounded-full border border-stone-100">Entrega e retirada</span>
             </div>
          </div>
          
          <div className="flex justify-center items-center mt-8 pt-2">
             <button onClick={() => setActiveView('orders')} className="w-full bg-accent text-white px-8 py-4 rounded-full font-black text-lg shadow-xl shadow-orange-100 flex items-center justify-center gap-2 active:scale-95 transition-transform uppercase tracking-tighter">
                Ver Cardápio
             </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeView === 'dashboard' && <DashboardView state={state} actions={actions} setActiveView={setActiveView} />}
            {activeView === 'orders' && <OrdersView state={state} actions={actions} />}
            {activeView === 'products' && <ProductsView state={state} actions={actions} />}
            {activeView === 'finances' && <FinancesView state={state} actions={actions} />}
            {activeView === 'closing' && <CashClosingView state={state} actions={actions} />}
            {activeView === 'reports' && <ReportsView state={state} />}
            {activeView === 'settings' && <BackupView actions={actions} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Nav */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 flex bg-primary p-2 rounded-full shadow-2xl space-x-2 z-40">
        <NavItem id="dashboard" label="Home" icon={LayoutDashboard} />
        <NavItem id="orders" label="Pedidos" icon={ShoppingBag} />
        <NavItem id="finances" label="Saldo" icon={DollarSign} />
        <NavItem id="reports" label="Relatórios" icon={PieChart} />
        <NavItem id="closing" label="Fechar" icon={CheckCircle2} />
      </nav>
    </div>
  );
}
