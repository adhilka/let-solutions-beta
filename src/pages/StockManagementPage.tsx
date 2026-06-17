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

const ALLOWED_EMAIL = 'muhammedadhil856@gmail.com';

export default function StockManagementPage() {
  const { user, logout } = useAuth();
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
    // Domain-based security restriction
    if (window.location.hostname === 'letsolutions.in') {
      navigate('/', { replace: true });
      return;
    }

    if (user && user.email !== ALLOWED_EMAIL) {
      alert('Access Denied: You do not have permission to access the Stock Vault.');
      logout();
      navigate('/login');
    }
  }, [user, navigate, logout]);

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

  if (!user || user.email !== ALLOWED_EMAIL) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={32} />
          <p className="text-white/50 font-bold uppercase tracking-widest text-[10px]">Validating Cryptographic Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-24 pb-12">
      <SEO 
        title="Stock Vault | LET Solutions" 
        noindex={true}
        nofollow={true}
      />
      
      <div className="container-wide px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-blue-400 mb-2">
              <ShieldCheck size={16} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Secure Inventory Vault</span>
            </div>
            <h1 className="text-4xl font-display font-black text-white italic uppercase tracking-tighter">Stock Management</h1>
          </div>
          
          <div className="flex gap-3">
             <button 
                onClick={logout}
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 transition-all"
             >
                <LogOut size={20} />
             </button>
             <button 
                onClick={() => handleOpenModal()}
                className="btn-primary flex items-center justify-center gap-2 h-12 px-6 shadow-xl shadow-blue-900/20"
              >
                <Plus size={20} /> <span className="hidden sm:inline">Register Stock</span>
              </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-black/40 backdrop-blur-md p-4 rounded-[2rem] border border-white/5 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
              <input 
                type="text"
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:border-blue-500/50 outline-none transition-all text-sm"
              />
            </div>
            <div className="flex gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
              {(['all', 'ic', 'mosfet'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                    activeCategory === cat 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                      : 'text-white/30 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button
                onClick={() => setActiveCategory('history')}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                  activeCategory === 'history' 
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' 
                    : 'text-white/30 hover:text-white'
                }`}
              >
                <History size={12} />
                History
              </button>
            </div>
          </div>
        </div>

        {/* Stock List - Compact Grid */}
        {activeCategory === 'history' ? (
          <div className="bg-black/40 rounded-[2rem] border border-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Access History</h2>
            </div>
            {isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center py-20 text-white/20">
                <Loader2 className="animate-spin mb-4" size={32} />
                <p className="font-bold uppercase tracking-widest text-[9px]">Retreiving Logs...</p>
              </div>
            ) : history && history.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/5">
                      <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Timestamp</th>
                      <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Component</th>
                      <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Authorized User</th>
                      <th className="px-6 py-4 text-[9px] font-black text-white/40 uppercase tracking-[0.2em]">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {history.map((entry) => (
                      <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-white/40">
                            <Clock size={12} />
                            <span className="text-[10px] font-mono">{new Date(entry.timestamp).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-white block">{entry.stockName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-blue-400">
                            <User size={12} />
                            <span className="text-[10px] font-black uppercase tracking-tight">{entry.personName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-rose-500/20">
                            Deduction (-1)
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-20 text-center text-white/20">
                <p className="text-[10px] font-black uppercase tracking-widest">No access logs recovered</p>
              </div>
            )}
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-white/20">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold uppercase tracking-widest text-[10px]">Syncing with Mainframe...</p>
          </div>
        ) : filteredStocks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {filteredStocks.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={item.id}
                  className="bg-black/40 rounded-2xl p-4 border border-white/5 group hover:border-blue-500/30 transition-all flex flex-col relative overflow-hidden"
                >
                  {/* Category Accent */}
                  <div className={`absolute top-0 right-0 w-16 h-16 -mr-8 -mt-8 rotate-45 opacity-10 ${item.category === 'ic' ? 'bg-blue-500' : 'bg-emerald-500'}`} />

                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1.5 rounded-lg ${item.category === 'ic' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                      {item.category === 'ic' ? <Cpu size={14} /> : <CircuitBoard size={14} />}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-0.5 truncate">{item.name}</h3>
                  <p className="text-[9px] font-mono text-white/30 truncate uppercase mb-4">
                    {item.boardNumber ? `BD: ${item.boardNumber}` : 'Standard'}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                      <span className={`text-lg font-black leading-none ${item.quantity <= 2 ? 'text-rose-500' : 'text-white'}`}>
                        {item.quantity}
                      </span>
                      <span className="text-[7px] font-black uppercase text-white/20 tracking-tighter">Units</span>
                    </div>
                    
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleQuantityChange(item, -1)}
                        className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"
                      >
                        <Minus size={14} />
                      </button>
                      <button 
                        onClick={() => handleQuantityChange(item, 1)}
                        className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/30 transition-all"
                      >
                        <Plus size={14} />
                      </button>
                      <button 
                        onClick={() => handleOpenModal(item)}
                        className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white transition-all ml-1"
                      >
                        <Edit2 size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white/5 rounded-3xl border border-dashed border-white/10 py-20 text-center">
            <Package size={48} className="mx-auto mb-4 text-white/10" />
            <h3 className="text-lg font-bold text-white mb-1 uppercase tracking-tight">Vault Empty</h3>
            <p className="text-white/30 text-[10px] mb-6 uppercase tracking-widest font-medium">Add components to initialize inventory</p>
            <button onClick={() => handleOpenModal()} className="btn-secondary btn-sm">First Entry</button>
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
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-white/5 bg-black/20 flex items-center justify-between">
                <h2 className="text-xl font-black text-white uppercase italic tracking-tight">{editingItem ? 'Edit Component' : 'New Component'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-white/20 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-3 px-1">Component Category</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['ic', 'mosfet'] as const).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          formData.category === cat 
                            ? 'bg-blue-600 border-blue-500 text-white' 
                            : 'bg-black/40 border-white/5 text-white/30 hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 px-1">Model / Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input w-full font-bold uppercase tracking-tight"
                    placeholder="e.g. TPS51125A"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 px-1">Count</label>
                    <input 
                      required
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                      className="input w-full font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2 px-1">Board ID (Opt)</label>
                    <input 
                      type="text"
                      value={formData.boardNumber}
                      onChange={(e) => setFormData({ ...formData, boardNumber: e.target.value })}
                      className="input w-full font-bold uppercase"
                      placeholder="NM-A271"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    disabled={isSubmitting}
                    className="btn-primary w-full flex items-center justify-center gap-3 h-14 rounded-2xl shadow-xl shadow-blue-900/30 font-black uppercase tracking-widest text-xs"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    {editingItem ? 'Update Vault' : 'Secure in Vault'}
                  </button>
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
              className="absolute inset-0 bg-black/95 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-sm bg-[#0a0a0b] rounded-[2.5rem] border border-rose-500/20 shadow-2xl overflow-hidden p-8"
            >
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
                  <Package className="text-rose-500" size={32} />
                </div>
                <h2 className="text-xl font-black text-white uppercase italic tracking-tight mb-2">Authorize Deduction</h2>
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Component: {deductionItem?.name}</p>
              </div>

              <form onSubmit={handleConfirmDeduction} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-rose-500/60 uppercase tracking-[0.2em] mb-3 px-1">Person Name (Required)</label>
                  <input 
                    autoFocus
                    required
                    type="text"
                    value={deductionName}
                    onChange={(e) => setDeductionName(e.target.value)}
                    className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-white text-center font-bold uppercase tracking-tight focus:border-rose-500/50 outline-none transition-all"
                    placeholder="ENTER AUTHORIZED NAME"
                  />
                </div>

                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsDeductionModalOpen(false)}
                    className="flex-1 py-4 bg-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={isSubmitting || !deductionName.trim()}
                    className="flex-[2] py-4 bg-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl shadow-rose-900/30 hover:bg-rose-500 transition-all disabled:opacity-30 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Minus size={16} />}
                    Confirm Deduction
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
