import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { Plus, Search, CheckCircle, XCircle, Trash2, Edit2, PlayCircle, Star, Filter } from 'lucide-react';
import { getReadDb } from '../lib/firebase/loadBalancer';
import { dualWrite, dualDelete } from '../lib/firebase/dualWrite';
import { Testimonial } from '../types';
import { useQueryClient } from '@tanstack/react-query';

export default function AdminTestimonialsPage() {
  const queryClient = useQueryClient();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    course: '',
    batch: '',
    rating: 5,
    content: '',
    videoUrl: '',
    imageUrl: ''
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    try {
      const db = getReadDb();
      const q = query(
        collection(db, 'artifacts/tech-institute/public/data/testimonials'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial));
      setTestimonials(data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      if (!window.confirm(`Are you sure you want to ${currentStatus ? 'unapprove' : 'approve'} this feedback?`)) return;
      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'testimonials', id], { approved: !currentStatus });
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, approved: !currentStatus } : t));
      queryClient.invalidateQueries({ queryKey: ['featured-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['all-testimonials'] });
    } catch (error) {
      console.error('Error updating approval:', error);
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'testimonials', id], { isFeatured: !currentStatus });
      setTestimonials(prev => prev.map(t => t.id === id ? { ...t, isFeatured: !currentStatus } : t));
      queryClient.invalidateQueries({ queryKey: ['featured-testimonials'] });
    } catch (error) {
      console.error('Error updating featured status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!window.confirm("Are you sure you want to delete this feedback?")) return;
      await dualDelete(['artifacts', 'tech-institute', 'public', 'data', 'testimonials', id]);
      setTestimonials(prev => prev.filter(t => t.id !== id));
      queryClient.invalidateQueries({ queryKey: ['featured-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['all-testimonials'] });
    } catch (error) {
      console.error("Error deleting testimonial:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const newId = `testimonial-${Date.now()}`;
      const testimonialData = {
        name: formData.name,
        course: formData.course,
        batch: formData.batch,
        rating: formData.rating,
        content: formData.content,
        videoUrl: formData.videoUrl,
        imageUrl: formData.imageUrl,
        approved: true,
        isFeatured: false,
        createdAt: new Date().toISOString()
      };
      await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'testimonials', newId], testimonialData);
      
      setTestimonials(prev => [{ id: newId, ...testimonialData } as Testimonial, ...prev]);
      queryClient.invalidateQueries({ queryKey: ['featured-testimonials'] });
      queryClient.invalidateQueries({ queryKey: ['all-testimonials'] });
      setIsModalOpen(false);
      setFormData({ name: '', course: '', batch: '', rating: 5, content: '', videoUrl: '', imageUrl: '' });
    } catch (error) {
      console.error('Error adding testimonial:', error);
      alert('Failed to add feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'approved') return matchesSearch && t.approved;
    if (filter === 'pending') return matchesSearch && !t.approved;
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Feedbacks</h1>
          <p className="mt-1 text-sm text-gray-500">Manage student reviews and video testimonials</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Feedback
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student, course, or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="all">All Feedback</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTestimonials.map(t => (
            <div key={t.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition overflow-hidden flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    {t.imageUrl ? (
                      <img src={t.imageUrl} alt={t.name} className="w-10 h-10 rounded-full object-cover mr-3" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                        {t.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900">{t.name}</h3>
                      <p className="text-xs text-blue-600 font-medium">{t.course} {t.batch && `(${t.batch})`}</p>
                    </div>
                  </div>
                  {t.videoUrl && (
                    <span className="text-red-500" title="Video Testimonial">
                      <PlayCircle className="w-6 h-6" />
                    </span>
                  )}
                </div>

                <div className="flex mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                  ))}
                </div>

                <p className="text-gray-600 text-sm italic line-clamp-4">"{t.content}"</p>
              </div>

              <div className="bg-gray-50 p-3 pt-3 flex items-center justify-between border-t mt-auto">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => toggleApproval(t.id!, t.approved)}
                    title={t.approved ? "Approved - Click to Unapprove" : "Pending - Click to Approve"}
                    className={`p-1.5 rounded-md ${t.approved ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-amber-500 bg-amber-50 hover:bg-amber-100'}`}
                  >
                    {t.approved ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => toggleFeatured(t.id!, t.isFeatured)}
                    title={t.isFeatured ? "Featured" : "Not Featured"}
                    className={`p-1.5 rounded-md ${t.isFeatured ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' : 'text-gray-400 hover:bg-gray-100'}`}
                  >
                    <Star className={`w-5 h-5 ${t.isFeatured ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <div className="flex space-x-2">
                  <button 
                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(t.id!)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filteredTestimonials.length === 0 && (
            <div className="col-span-full py-12 text-center bg-white rounded-lg border border-gray-100">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-lg">No feedbacks found.</p>
            </div>
          )}
        </div>
      )}

      {/* Add Feedback Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">Add New Feedback</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <input
                    required
                    type="text"
                    value={formData.course}
                    onChange={e => setFormData({ ...formData, course: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Master Diploma in Mobile Repair"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch (Optional)</label>
                  <input
                    type="text"
                    value={formData.batch}
                    onChange={e => setFormData({ ...formData, batch: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. 2023 Batch"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <select
                    value={formData.rating}
                    onChange={e => setFormData({ ...formData, rating: Number(e.target.value) })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feedback Content</label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Student's feedback goes here..."
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.videoUrl}
                    onChange={e => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. YouTube Link"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Feedback'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
