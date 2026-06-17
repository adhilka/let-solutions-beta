import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Minus, Edit2, Trash2, Package, Cpu, CircuitBoard, X, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import SEO from '../components/SEO';
import { fetchAllStocks } from '../lib/api';
import { dualWrite, dualDelete } from '../lib/firebase/dualWrite';
import { StockItem, StockCategory } from '../types';

export default function StockManagementPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | StockCategory>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<StockItem> }) => {
      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'stocks', id], {
        ...data,
        lastUpdated: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-stocks'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (confirm('Are you sure you want to delete this item?')) {
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
      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'stocks', id], {
        ...formData,
        lastUpdated: new Date().toISOString()
      });
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

  const filteredStocks = stocks?.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.boardNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pt-24 pb-12">
      <SEO 
        title="Stock Management | LET Solutions" 
        noindex={true}
        nofollow={true}
      />
      
      <div className="container-wide px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-[var(--color-primary-400)] mb-2">
              <Package size={18} />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Inventory System</span>
            </div>
            <h1 className="text-3xl font-display font-black text-white italic uppercase tracking-tight">Stock Management</h1>
          </div>
          
          <button 
            onClick={() => handleOpenModal()}
            className="btn-primary flex items-center justify-center gap-2 h-12 px-8 shadow-xl shadow-blue-900/20"
          >
            <Plus size={20} /> Register New Stock
          </button>
        </div>

        {/* Filters & Search */}
        <div className="bg-[var(--color-surface-alt)] p-6 rounded-3xl border border-[var(--color-border)] mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={20} />
              <input 
                type="text"
                placeholder="Search by component name or board number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-[var(--color-border)] rounded-2xl py-3 pl-12 pr-4 text-white focus:border-[var(--color-primary-500)] outline-none transition-all"
              />
            </div>
            <div className="flex gap-2">
              {(['all', 'ic', 'mosfet'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                    activeCategory === cat 
                      ? 'bg-[var(--color-primary-600)] text-white shadow-lg' 
                      : 'bg-black/20 text-[var(--color-text-tertiary)] border border-[var(--color-border)] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stock List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 text-[var(--color-text-tertiary)]">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p className="font-bold uppercase tracking-widest text-xs">Accessing Secure Vault...</p>
          </div>
        ) : filteredStocks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredStocks.map((item) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.id}
                  className="bg-[var(--color-surface-alt)] rounded-3xl p-6 border border-[var(--color-border)] group hover:border-[var(--color-primary-500)]/50 transition-all flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${item.category === 'ic' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {item.category === 'ic' ? <Cpu size={18} /> : <CircuitBoard size={18} />}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-tighter opacity-50">{item.category}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(item)} className="p-2 hover:bg-white/10 rounded-lg text-white">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => deleteMutation.mutate(item.id!)} className="p-2 hover:bg-rose-500/20 rounded-lg text-rose-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                  {item.boardNumber && (
                    <p className="text-[10px] font-mono text-[var(--color-text-tertiary)] mb-4 uppercase">Board: {item.boardNumber}</p>
                  )}

                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-[var(--color-text-tertiary)] uppercase mb-1">In Stock</p>
                      <span className={`text-2xl font-black ${item.quantity <= 2 ? 'text-rose-500' : 'text-white'}`}>
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleQuantityChange(item, -1)}
                        disabled={item.quantity === 0}
                        className="w-10 h-10 rounded-xl bg-black border border-[var(--color-border)] flex items-center justify-center text-white hover:bg-rose-500/10 hover:border-rose-500/30 transition-all disabled:opacity-30"
                      >
                        <Minus size={18} />
                      </button>
                      <button 
                        onClick={() => handleQuantityChange(item, 1)}
                        className="w-10 h-10 rounded-xl bg-black border border-[var(--color-border)] flex items-center justify-center text-white hover:bg-blue-500/10 hover:border-blue-500/30 transition-all"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-[var(--color-surface-alt)] rounded-3xl border border-dashed border-[var(--color-border)] py-20 text-center">
            <Package size={48} className="mx-auto mb-4 text-[var(--color-text-tertiary)] opacity-20" />
            <h3 className="text-lg font-bold text-white mb-1">No stocks found</h3>
            <p className="text-[var(--color-text-tertiary)] text-sm mb-6">Start by adding your first IC or Mosfet to the inventory.</p>
            <button onClick={() => handleOpenModal()} className="btn-secondary btn-sm">Add Item</button>
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
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[var(--color-surface-alt)] rounded-[2.5rem] border border-[var(--color-border)] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-[var(--color-border)] bg-black/20 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white italic uppercase">{editingItem ? 'Edit Item' : 'New Stock Item'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-[var(--color-text-tertiary)] hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-[var(--color-text-tertiary)] uppercase tracking-widest mb-2 px-1">Category</label>
                  <div className="flex gap-2">
                    {(['ic', 'mosfet'] as const).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFormData({ ...formData, category: cat })}
                        className={`flex-1 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all ${
                          formData.category === cat 
                            ? 'bg-[var(--color-primary-600)] border-[var(--color-primary-500)] text-white' 
                            : 'bg-black/20 border-[var(--color-border)] text-[var(--color-text-tertiary)] hover:text-white'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-[var(--color-text-tertiary)] uppercase tracking-widest mb-2 px-1">Component Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input w-full"
                    placeholder="e.g. TPS51125A, AO4407A"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-[var(--color-text-tertiary)] uppercase tracking-widest mb-2 px-1">Quantity</label>
                    <input 
                      required
                      type="number"
                      min="0"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                      className="input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-[var(--color-text-tertiary)] uppercase tracking-widest mb-2 px-1">Board Number (Opt)</label>
                    <input 
                      type="text"
                      value={formData.boardNumber}
                      onChange={(e) => setFormData({ ...formData, boardNumber: e.target.value })}
                      className="input w-full"
                      placeholder="e.g. NM-A271"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    disabled={isSubmitting}
                    className="btn-primary w-full flex items-center justify-center gap-2 h-14 rounded-2xl shadow-xl shadow-blue-900/30"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {editingItem ? 'Update Stock' : 'Register Stock'}
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
