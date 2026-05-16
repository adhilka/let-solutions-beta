import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';

// Import pages
import HomePage from './pages/HomePage';
import CoursesPage from './pages/CoursesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdmissionsPage from './pages/AdmissionsPage';
import BlogListPage from './pages/BlogListPage';
import BlogDetailPage from './pages/BlogDetailPage';
import TestimonialsPage from './pages/TestimonialsPage';
import CourseDetailPage from './pages/CourseDetailPage';
import AdminDashboard from './pages/AdminDashboard';

import AdminCoursesPage from './pages/AdminCoursesPage';
import AdminCourseForm from './pages/AdminCourseForm';
import AdminEnquiriesPage from './pages/AdminEnquiriesPage';
import AdminPostsPage from './pages/AdminPostsPage';
import AdminPostEditor from './pages/AdminPostEditor';
import AdminTestimonialsPage from './pages/AdminTestimonialsPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import AdminOffersPage from './pages/AdminOffersPage';
import AdminAboutPage from './pages/AdminAboutPage';
import AdminHomeSettings from './pages/AdminHomeSettings';
import LoginPage from './pages/LoginPage';
import AdminRoute from './components/AdminRoute';
import { AuthProvider } from './hooks/useAuth';

const queryClient = new QueryClient();

export default function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="courses" element={<CoursesPage />} />
                <Route path="courses/:slug" element={<CourseDetailPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
                <Route path="admissions" element={<AdmissionsPage />} />
                <Route path="blog" element={<BlogListPage />} />
                <Route path="blog/:slug" element={<BlogDetailPage />} />
                <Route path="feedbacks" element={<TestimonialsPage />} />
              </Route>

              {/* Admin Login Route */}
              <Route path="/admin/login" element={<LoginPage />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="courses" element={<AdminCoursesPage />} />
                  <Route path="courses/new" element={<AdminCourseForm />} />
                  <Route path="courses/:id/edit" element={<AdminCourseForm />} />
                  <Route path="enquiries" element={<AdminEnquiriesPage />} />
                  <Route path="posts" element={<AdminPostsPage />} />
                  <Route path="posts/new" element={<AdminPostEditor />} />
                  <Route path="posts/:id/edit" element={<AdminPostEditor />} />
                  <Route path="testimonials" element={<AdminTestimonialsPage />} />
                  <Route path="about" element={<AdminAboutPage />} />
                  <Route path="home" element={<AdminHomeSettings />} />
                  <Route path="offers" element={<AdminOffersPage />} />
                  <Route path="settings" element={<AdminSettingsPage />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
