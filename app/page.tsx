import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import StatsBar from '@/components/sections/StatsBar';
import About from '@/components/sections/About';
import Portfolio from '@/components/sections/Portfolio';
import Skills from '@/components/sections/Skills';
import Contact from '@/components/sections/Contact';

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <Header />

      <main className="relative z-10">
        <Hero />
        <StatsBar />
        <About />
        <Portfolio />
        <Skills />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
