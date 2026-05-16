import { Helmet } from 'react-helmet-async';
import { Users, Target, ShieldCheck, MapPin } from 'lucide-react';

export default function AboutPage() {
  return (
    <>
      <Helmet>
        <title>About Us | Let Solutions</title>
        <meta name="description" content="Empowering the next generation of technicians through accessible, high-end technical education." />
      </Helmet>

      {/* Hero */}
      <section className="bg-[var(--color-primary-900)] text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
           <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
           </svg>
        </div>
        <div className="max-w-[var(--container-md)] mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Empowering Future Technicians</h1>
          <p className="text-xl text-[var(--color-primary-200)] leading-relaxed">
            At Let Solutions, we bridge the gap between ambition and career stability by offering industry-standard training.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6">Our Story</h2>
            <div className="prose text-[var(--color-text-secondary)] space-y-4 text-lg">
              <p>
                Founded with a vision to make high-end technical education accessible, Let Solutions has grown into a premier training institute in Tirur, Kerala.
              </p>
              <p>
                We realized that many ambitious students lacked the financial resources to pursue specialized engineering degrees. Our short-term, high-impact curriculum is designed to transform these students into skilled professionals without the burden of excessive educational expenses.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Lab session" className="w-full aspect-[4/5] object-cover rounded-[var(--radius-xl)]" />
            <img src="https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Students" className="w-full aspect-[4/5] object-cover rounded-[var(--radius-xl)] translate-y-8" />
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-[var(--color-surface)]">
        <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-10 rounded-[var(--radius-2xl)] border border-[var(--color-border)] shadow-sm">
            <div className="w-16 h-16 bg-[var(--color-primary-100)] text-[var(--color-primary-600)] rounded-[var(--radius-xl)] flex items-center justify-center mb-6">
              <Target size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-[var(--color-text-secondary)] leading-relaxed">
              To become the most trusted and accessible technical training institute, fostering a self-reliant generation equipped with the skills to thrive in the rapid digital transformation of the modern world.
            </p>
          </div>
          
          <div className="bg-[var(--color-primary-600)] text-white p-10 rounded-[var(--radius-2xl)] shadow-[var(--shadow-card)]">
             <div className="w-16 h-16 bg-white/20 text-white rounded-[var(--radius-xl)] flex items-center justify-center mb-6">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-[var(--color-primary-100)] leading-relaxed">
              To deliver practical, industry-aligned training bridging the gap between theoretical knowledge and real-world application, ensuring 100% employability for our graduates.
            </p>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 bg-white">
        <div className="max-w-[var(--container-xl)] mx-auto px-4 sm:px-6 lg:px-8">
           <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Faculty & Leadership</h2>
            <p className="text-[var(--color-text-secondary)]">Guided by experts committed to your success.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-6 items-center text-center md:text-left bg-white p-6 border border-[var(--color-border)] rounded-[var(--radius-xl)]">
              <div className="w-32 h-32 bg-[var(--color-primary-100)] rounded-full shrink-0"></div>
              <div>
                <h4 className="text-xl font-bold">Sanal SP</h4>
                <div className="text-[var(--color-primary-600)] font-medium mb-3">Academic Director</div>
                <p className="text-sm text-[var(--color-text-secondary)]">Driving academic excellence and industry-standard curriculum development.</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-6 items-center text-center md:text-left bg-white p-6 border border-[var(--color-border)] rounded-[var(--radius-xl)]">
              <div className="w-32 h-32 bg-[var(--color-primary-100)] rounded-full shrink-0"></div>
              <div>
                <h4 className="text-xl font-bold">Faisal KK</h4>
                <div className="text-[var(--color-primary-600)] font-medium mb-3">Center Incharge</div>
                <p className="text-sm text-[var(--color-text-secondary)]">Ensuring state-of-the-art infrastructure and seamless student experiences.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
