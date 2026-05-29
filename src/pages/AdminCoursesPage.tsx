import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchActiveCourses, fetchAllCourses } from '../lib/api';
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
    queryFn: fetchAllCourses
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

      <div className="hidden md:block bg-[var(--color-surface-alt)] rounded-[var(--radius-xl)] shadow-lg border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          {/* ... table content remains same ... */}
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-[#1a1a1a] border-b border-[var(--color-border)]">
              <tr>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)] uppercase tracking-wider">Title</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)] uppercase tracking-wider">Category</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)] uppercase tracking-wider">Price</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-[var(--color-text-secondary)] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {isLoading ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-400">Loading courses...</td></tr>
              ) : courses?.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-[var(--color-text-secondary)]">No courses found.</td></tr>
              ) : (
                courses?.map(course => (
                  <tr key={course.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-medium max-w-[250px] text-white">
                      <div className="flex items-center gap-3">
                        {course.imageUrl && <img src={course.imageUrl} className="w-10 h-10 object-cover rounded border border-[var(--color-border)]" alt="" />}
                        <span className="truncate">{course.title}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm"><span className="badge badge-blue">{course.category}</span></td>
                    <td className="py-4 px-6 text-sm font-bold text-[var(--color-primary-400)] font-mono">₹{course.price}</td>
                    <td className="py-4 px-6">
                      <span className={`badge ${course.isActive ? 'badge-green' : 'badge-yellow'}`}>
                        {course.isActive ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/courses/${course.id}/edit`} className="p-2 text-[var(--color-text-secondary)] hover:text-white bg-[var(--color-surface)] border border-[var(--color-border)] rounded transition-colors" title="Edit">
                          <Edit2 size={16} />
                        </Link>
                        <button onClick={() => toggleStatus(course)} className="p-2 text-[var(--color-text-secondary)] hover:text-white bg-[var(--color-surface)] border border-[var(--color-border)] rounded transition-colors" title={course.isActive ? 'Make Draft' : 'Publish'}>
                          {course.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button onClick={() => togglePinned(course)} className={`p-2 rounded border transition-colors ${course.isPinned ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/50' : 'text-[var(--color-text-secondary)] bg-[var(--color-surface)] border-[var(--color-border)] hover:text-yellow-500'}`} title="Toggle Pin">
                          <Star size={16} fill={course.isPinned ? "currentColor" : "none"} />
                        </button>
                        <button onClick={() => deleteCourse(course)} className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-error)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded transition-colors" title="Delete">
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

      <div className="md:hidden space-y-4">
        {isLoading ? (
          <div className="py-8 text-center bg-[var(--color-surface-alt)] rounded-[var(--radius-xl)] border border-[var(--color-border)] text-slate-400">Loading...</div>
        ) : courses?.length === 0 ? (
          <div className="py-8 text-center text-[var(--color-text-secondary)] bg-[var(--color-surface-alt)] rounded-[var(--radius-xl)] border border-[var(--color-border)]">No courses found.</div>
        ) : (
          courses?.map(course => (
            <div key={course.id} className="bg-[var(--color-surface-alt)] rounded-[var(--radius-xl)] shadow-md border border-[var(--color-border)] p-4 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                {course.imageUrl ? (
                  <img src={course.imageUrl} className="w-12 h-12 object-cover rounded border border-[var(--color-border)]" alt="" />
                ) : (
                  <div className="w-12 h-12 bg-[var(--color-surface)] rounded border border-[var(--color-border)]"></div>
                )}
                <div>
                  <h3 className="font-bold text-sm line-clamp-1 text-white">{course.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${course.isActive ? 'badge-green' : 'badge-yellow'} text-[10px]`}>
                      {course.isActive ? 'Active' : 'Draft'}
                    </span>
                    <span className="text-xs font-bold text-[var(--color-primary-400)] font-mono">₹{course.price}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 border-t border-[var(--color-border)] pt-3">
                <Link to={`/admin/courses/${course.id}/edit`} className="flex-1 flex justify-center py-2 text-[var(--color-text-secondary)] hover:text-white bg-[var(--color-surface)] border border-[var(--color-border)] rounded transition-colors" title="Edit">
                  <Edit2 size={16} />
                </Link>
                <button onClick={() => toggleStatus(course)} className="flex-1 flex justify-center py-2 text-[var(--color-text-secondary)] hover:text-white bg-[var(--color-surface)] border border-[var(--color-border)] rounded transition-colors" title={course.isActive ? 'Make Draft' : 'Publish'}>
                  {course.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button onClick={() => togglePinned(course)} className={`flex-1 flex justify-center py-2 rounded border transition-colors ${course.isPinned ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/50' : 'text-[var(--color-text-secondary)] bg-[var(--color-surface)] border-[var(--color-border)] hover:text-yellow-500'}`} title="Toggle Pin">
                  <Star size={16} fill={course.isPinned ? "currentColor" : "none"} />
                </button>
                <button onClick={() => deleteCourse(course)} className="flex-1 flex justify-center py-2 text-[var(--color-text-secondary)] hover:text-[var(--color-error)] bg-[var(--color-surface)] border border-[var(--color-border)] rounded transition-colors" title="Delete">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
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
