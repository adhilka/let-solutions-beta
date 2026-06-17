import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Minus, Edit2, Trash2, Package, Cpu, CircuitBoard, X, Save, Loader2, LogOut, ShieldCheck, History, User, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import SEO from '../components/SEO';
import { fetchAllStocks, fetchStockHistory } from '../lib/api';
import { dualWrite, dualDelete } from '../lib/firebase/dualWrite';
import { StockItem, StockCategory, StockHistory } from '../types';
import { useAuth } from '../hooks/useAuth';

const ALLOWED_EMAILS = ['muhammedadhil856@gmail.com', 'serviziotirur@gmail.com'];

export default function StockManagementPage() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | StockCategory | 'history'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeductionModalOpen, setIsDeductionModalOpen] = useState(false);
  const [deductionItem, setDeductionItem] = useState<StockItem | null>(null);
  const [deductionName, setDeductionName] = useState('');
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Security Check: Seperate login/access check
  useEffect(() => {
    // 1. Domain-based security restriction
    if (window.location.hostname === 'letsolutions.in') {
      navigate('/', { replace: true });
      return;
    }

    // 2. Auth restriction
    if (!loading) {
      if (!user) {
        // Not logged in at all
        navigate('/admin/login');
      } else if (!ALLOWED_EMAILS.includes(user.email || '')) {
        // Logged in but wrong account
        alert('Access Denied: You do not have permission to access the Stock Vault.');
        logout();
        navigate('/admin/login');
      }
    }
  }, [user, loading, navigate, logout]);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    boardNumber: '',
    category: 'ic' as StockCategory
  });

  const { data: stocks, isLoading } = useQuery({
    queryKey: ['all-stocks'],
    queryFn: fetchAllStocks
  });

  const { data: history, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['stock-history'],
    queryFn: fetchStockHistory
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<StockItem> }) => {
      // Auto-delete if quantity hits 0
      if (data.quantity !== undefined && data.quantity <= 0) {
        await dualDelete(['artifacts', 'tech-institute', 'public', 'data', 'stocks', id]);
        return { deleted: true };
      }

      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'stocks', id], {
        ...data,
        lastUpdated: new Date().toISOString()
      });
      return { deleted: false };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-stocks'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (confirm('Permanently remove this component from inventory?')) {
        await dualDelete(['artifacts', 'tech-institute', 'public', 'data', 'stocks', id]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-stocks'] });
    }
  });

  const handleOpenModal = (item?: StockItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        quantity: item.quantity,
        boardNumber: item.boardNumber || '',
        category: item.category
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        quantity: 1,
        boardNumber: '',
        category: 'ic'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const id = editingItem?.id || `stock-${Date.now()}`;
      
      // If updating existing and quantity becomes 0
      if (formData.quantity <= 0) {
        await dualDelete(['artifacts', 'tech-institute', 'public', 'data', 'stocks', id]);
      } else {
        await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'stocks', id], {
          ...formData,
          lastUpdated: new Date().toISOString()
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['all-stocks'] });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving stock:', error);
      alert('Failed to save stock item');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuantityChange = async (item: StockItem, delta: number) => {
    if (delta < 0) {
      setDeductionItem(item);
      setDeductionName('');
      setIsDeductionModalOpen(true);
      return;
    }

    const newQuantity = Math.max(0, item.quantity + delta);
    if (newQuantity === item.quantity) return;
    
    try {
      await updateMutation.mutateAsync({ 
        id: item.id!, 
        data: { quantity: newQuantity } 
      });
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const handleConfirmDeduction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deductionItem || !deductionName.trim()) return;

    setIsSubmitting(true);
    try {
      const newQuantity = deductionItem.quantity - 1;
      const historyId = `history-${Date.now()}`;
      
      // Save History
      const historyData: StockHistory = {
        stockId: deductionItem.id!,
        stockName: deductionItem.name,
        personName: deductionName.trim(),
        change: -1,
        timestamp: new Date().toISOString()
      };

      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'stock_history', historyId], historyData);

      // Update Stock
      if (newQuantity <= 0) {
        await dualDelete(['artifacts', 'tech-institute', 'public', 'data', 'stocks', deductionItem.id!]);
      } else {
        await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'stocks', deductionItem.id!], {
          ...deductionItem,
          quantity: newQuantity,
          lastUpdated: new Date().toISOString()
        });
      }

      queryClient.invalidateQueries({ queryKey: ['all-stocks'] });
      queryClient.invalidateQueries({ queryKey: ['stock-history'] });
      setIsDeductionModalOpen(false);
      setDeductionItem(null);
    } catch (error) {
      console.error('Deduction failed:', error);
      alert('Failed to process deduction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStocks = stocks?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.boardNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  if (!user || !ALLOWED_EMAILS.includes(user.email || '')) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Validating Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 mb-8 shadow-sm">
        <div className="container-wide px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Package size={18} className="text-white" />
            </div>
            <span className="text-xl font-black text-blue-600 tracking-tighter">SERVIZIO</span>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">
            Electronics Inventory Control
          </div>
        </div>
      </header>

      <SEO 
        title="Inventory | LET Solutions" 
        noindex={true}
        nofollow={true}
      />
      
      <div className="container-wide px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Access Level: Authorized</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Stock Management</h1>
          </div>
          
          <div className="flex gap-3">
             <button 
                onClick={logout}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
                title="Logout"
             >
                <LogOut size={18} />
             </button>
             <button 
                onClick={() => handleOpenModal()}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 h-11 px-6 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-200"
              >
                <Plus size={18} /> <span>Add Component</span>
              </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white p-2 sm:p-3 rounded-2xl border border-slate-200 shadow-sm mb-10">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text"
                placeholder="Search components by name or board ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-500/30 outline-none transition-all text-sm"
              />
            </div>
            <div className="flex gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100">
              {(['all', 'ic', 'mosfet'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    activeCategory === cat 
                      ? 'bg-white text-blue-600 shadow-sm' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <div className="w-px bg-slate-200 mx-1 self-stretch" />
              <button
                onClick={() => setActiveCategory('history')}
                className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  activeCategory === 'history' 
                    ? 'bg-white text-amber-600 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <History size={12} />
                Logs
              </button>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {activeCategory === 'history' ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-900">Access History</h2>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recent Logs</span>
            </div>
            {isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p className="font-bold uppercase tracking-widest text-[9px]">Loading Records...</p>
              </div>
            ) : history && history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/30">
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Component</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Person</th>
                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {history.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Clock size={12} />
                            <span className="text-[11px]">{new Date(entry.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-slate-900">{entry.stockName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-blue-600">
                            <User size={12} />
                            <span className="text-[11px] font-bold uppercase">{entry.personName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex px-3 py-0.5 bg-rose-50 text-rose-600 rounded-full text-[10px] font-bold border border-rose-100">
                            -1 Unit
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-300">
                <p className="text-[11px] font-bold uppercase tracking-widest">No activity logs found</p>
              </div>
            )}
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-slate-300">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold uppercase tracking-widest text-[10px]">Retrieving Data...</p>
          </div>
        ) : filteredStocks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredStocks.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-2 rounded-lg ${item.category === 'ic' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {item.category === 'ic' ? <Cpu size={16} /> : <CircuitBoard size={16} />}
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">{item.name}</h3>
                  <div className="flex items-center gap-1.5 text-slate-400 mb-5">
                    <span className="text-[10px] font-bold uppercase tracking-tight">Board ID:</span>
                    <span className="text-[10px] font-medium uppercase font-mono">{item.boardNumber || 'N/A'}</span>
                  </div>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className={`text-2xl font-bold ${item.quantity <= 2 ? 'text-rose-500' : 'text-slate-900'}`}>
                        {item.quantity}
                      </span>
                      <span className="text-[9px] font-bold uppercase text-slate-400 tracking-wider">In Stock</span>
                    </div>
                    
                    <div className="flex gap-2">
                       <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-100">
                          <button 
                            onClick={() => handleQuantityChange(item, -1)}
                            className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                            title="Decrease Quantity"
                          >
                            <Minus size={16} />
                          </button>
                          <button 
                            onClick={() => handleQuantityChange(item, 1)}
                            className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            title="Increase Quantity"
                          >
                            <Plus size={16} />
                          </button>
                       </div>
                      <button 
                        onClick={() => handleOpenModal(item)}
                        className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
                        title="Edit Details"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-dashed border-slate-200 py-24 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
               <Package size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No items found</h3>
            <p className="text-slate-400 text-xs mb-8">Add your first stock item to get started</p>
            <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md shadow-blue-100 transition-all">
              Initialize Stock
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">{editingItem ? 'Edit Component' : 'Add New Item'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Item Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['ic', 'mosfet'] as const).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`py-3 rounded-xl text-[11px] font-bold uppercase border transition-all ${
                          formData.category === cat 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100' 
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Model / Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder:text-slate-300 focus:bg-white focus:border-blue-600 outline-none transition-all font-semibold"
                    placeholder="e.g. TPS51125A"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Quantity</label>
                    <input 
                      required
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Board ID (Opt)</label>
                    <input 
                      type="text"
                      value={formData.boardNumber}
                      onChange={(e) => setFormData({ ...formData, boardNumber: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 focus:bg-white focus:border-blue-600 outline-none transition-all font-semibold uppercase"
                      placeholder="e.g. NM-A271"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-3 h-14 rounded-xl font-bold uppercase tracking-widest text-xs shadow-lg shadow-blue-100 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    {editingItem ? 'Save Changes' : 'Confirm Registration'}
                  </button>
                  {editingItem && (
                    <button 
                      type="button"
                      onClick={() => deleteMutation.mutate(editingItem.id!)}
                      className="w-full mt-3 h-12 text-rose-500 hover:text-rose-600 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 size={14} /> Remove Item
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Deduction Modal */}
      <AnimatePresence>
        {isDeductionModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeductionModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-8"
            >
              <div className="text-center mb-8">
                <div className="w-14 h-14 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-100">
                  <Package className="text-rose-500" size={28} />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">Verify Deduction</h2>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Item: {deductionItem?.name}</p>
              </div>

              <form onSubmit={handleConfirmDeduction} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-1 text-center">Who is taking this item?</label>
                  <input 
                    autoFocus
                    required
                    type="text"
                    value={deductionName}
                    onChange={(e) => setDeductionName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-6 text-slate-900 text-center font-bold uppercase tracking-tight focus:bg-white focus:border-rose-500/50 outline-none transition-all"
                    placeholder="ENTER NAME"
                  />
                </div>

                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setIsDeductionModalOpen(false)}
                    className="flex-1 py-4 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isSubmitting || !deductionName.trim()}
                    className="flex-[2] py-4 bg-rose-600 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Minus size={16} />}
                    Deduct Unit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
