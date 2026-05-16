import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchActiveCourses } from '../lib/api';
import { getReadDb } from '../lib/firebase/loadBalancer';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Edit2, Eye, EyeOff, Star, Trash2 } from 'lucide-react';
import { dualWrite, dualDelete } from '../lib/firebase/dualWrite';
import { docToData } from '../lib/api';
import ConfirmationModal from '../components/ConfirmationModal';

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmVariant: 'danger' | 'primary' | 'success';
    confirmText?: string;
    mode?: 'confirm' | 'status';
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmVariant: 'primary',
    confirmText: 'Confirm',
    mode: 'confirm',
    onConfirm: () => {},
  });

  const { data: courses, isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: async () => {
      const db = getReadDb();
      const q = query(collection(db, 'artifacts/tech-institute/public/data/courses'), orderBy('order', 'asc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => docToData<any>(doc));
    }
  });

  const toggleStatus = async (course: any) => {
    await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'courses', course.id], { isActive: !course.isActive });
    queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    queryClient.invalidateQueries({ queryKey: ['active-courses'] });
  };

  const togglePinned = async (course: any) => {
    const isCurrentlyPinned = course.isPinned;
    
    if (!isCurrentlyPinned) {
      const pinnedCount = courses?.filter(c => c.isPinned).length || 0;
      if (pinnedCount >= 3) {
        setModalConfig({
          isOpen: true,
          title: 'Pin Limit Reached',
          message: 'You can only pin up to 3 courses to the home screen. Please unpin another course first.',
          confirmVariant: 'primary',
          confirmText: 'Understood',
          mode: 'status',
          onConfirm: () => {}
        });
        return;
      }
    }

    await dualWrite(['artifacts', 'tech-institute', 'public', 'data', 'courses', course.id], { isPinned: !isCurrentlyPinned });
    queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    queryClient.invalidateQueries({ queryKey: ['active-courses'] });
  };

  const deleteCourse = async (course: any) => {
    setModalConfig({
      isOpen: true,
      title: 'Delete Course?',
      message: `Are you sure you want to delete "${course.title}"? This action cannot be undone.`,
      confirmVariant: 'danger',
      confirmText: 'Yes, Delete',
      mode: 'confirm',
      onConfirm: async () => {
        await dualDelete(['artifacts', 'tech-institute', 'public', 'data', 'courses', course.id]);
        queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
        queryClient.invalidateQueries({ queryKey: ['active-courses'] });
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-[var(--color-text-primary)] mb-2">Courses</h1>
          <p className="text-[var(--color-text-secondary)] text-sm">Manage institute courses and their details.</p>
        </div>
        <Link to="/admin/courses/new" className="btn-primary flex items-center gap-2">
          + Add Course
        </Link>
      </div>

      <div className="bg-white rounded-[var(--radius-xl)] shadow-sm border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          {/* ... table content remains same ... */}
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)]">
              <tr>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Title</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Category</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Price</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 text-center">Loading...</td></tr>
              ) : courses?.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-[var(--color-text-secondary)]">No courses found.</td></tr>
              ) : (
                courses?.map(course => (
                  <tr key={course.id} className="hover:bg-[var(--color-primary-50)] transition-colors">
                    <td className="py-4 px-6 font-medium max-w-[200px]">
                      <div className="flex items-center gap-3">
                        {course.imageUrl && <img src={course.imageUrl} className="w-10 h-10 object-cover rounded border" alt="" />}
                        <span className="truncate">{course.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm"><span className="badge badge-blue">{course.category}</span></td>
                    <td className="py-4 px-6 text-sm font-bold text-[var(--color-primary-700)]">₹{course.price}</td>
                    <td className="py-4 px-6">
                      <span className={`badge ${course.isActive ? 'badge-green' : 'badge-yellow'}`}>
                        {course.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Link to={`/admin/courses/${course.id}/edit`} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)] bg-[var(--color-primary-50)] rounded transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </Link>
                        <button onClick={() => toggleStatus(course)} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-primary-600)] bg-[var(--color-primary-50)] rounded transition-colors" title={course.isActive ? 'Make Draft' : 'Publish'}>
                          {course.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button onClick={() => togglePinned(course)} className={`p-2 rounded transition-colors ${course.isPinned ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' : 'text-[var(--color-text-secondary)] bg-[var(--color-primary-50)] hover:text-yellow-500'}`} title="Toggle Pin">
                          <Star size={16} fill={course.isPinned ? "currentColor" : "none"} />
                        </button>
                        <button onClick={() => deleteCourse(course)} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-error)] bg-[var(--color-primary-50)] rounded transition-colors" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmVariant={modalConfig.confirmVariant}
        confirmText={modalConfig.confirmText}
        mode={modalConfig.mode}
      />
    </div>
  );
}
