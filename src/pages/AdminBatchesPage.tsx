import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Plus, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { getReadDb } from '../lib/firebase/loadBalancer';
import { dualWrite, dualDelete } from '../lib/firebase/dualWrite';

export default function AdminBatchesPage() {
  const [batches, setBatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    courseName: '',
    startDate: '',
    timings: '',
    status: 'Open',
    order: 0
  });

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    setIsLoading(true);
    try {
      const db = getReadDb();
      const q = query(
        collection(db, 'artifacts/tech-institute/public/data/batches'),
        orderBy('order', 'asc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBatches(data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!window.confirm("Are you sure you want to delete this batch?")) return;
      await dualDelete(['artifacts', 'tech-institute', 'public', 'data', 'batches', id]);
      setBatches(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error deleting batch:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newId = `batch-${Date.now()}`;
      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'batches', newId], formData);
      setBatches(prev => [...prev, { id: newId, ...formData }]);
      setIsModalOpen(false);
      setFormData({ courseName: '', startDate: '', timings: '', status: 'Open', order: batches.length });
    } catch (error) {
      console.error('Error adding batch:', error);
      alert('Failed to add batch');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Upcoming Batches</h1>
          <p className="mt-1 text-sm text-gray-500">Manage course batches and schedules.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Batch
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#f8fafc] border-b border-[var(--color-border)]">
              <tr>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Course Name</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Start Date</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Timings</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {batches.map(batch => (
                <tr key={batch.id} className="hover:bg-[#f1f5f9]">
                  <td className="py-4 px-6 font-medium">{batch.courseName}</td>
                  <td className="py-4 px-6">{batch.startDate}</td>
                  <td className="py-4 px-6">{batch.timings}</td>
                  <td className="py-4 px-6">
                    <span className={`badge ${batch.status === 'Open' ? 'badge-green' : batch.status === 'Filling Fast' ? 'badge-yellow' : 'badge-blue'}`}>
                      {batch.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <button onClick={() => handleDelete(batch.id!)} className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {batches.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No batches found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Batch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Add New Batch</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                  <input required type="text" value={formData.courseName} onChange={e => setFormData({ ...formData, courseName: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. Mobile Repair" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input required type="text" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. 15th Nov 2024" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Timings</label>
                  <input required type="text" value={formData.timings} onChange={e => setFormData({ ...formData, timings: e.target.value })} className="w-full border rounded-lg px-3 py-2" placeholder="e.g. 09:30 AM - 01:00 PM" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="w-full border rounded-lg px-3 py-2">
                    <option value="Open">Open</option>
                    <option value="Filling Fast">Filling Fast</option>
                    <option value="Announced">Announced</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input type="number" value={formData.order} onChange={e => setFormData({ ...formData, order: Number(e.target.value) })} className="w-full border rounded-lg px-3 py-2" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg" disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Batch'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
