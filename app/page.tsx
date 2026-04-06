import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PresentationMode from '@/components/ui/PresentationMode';
import Hero from '@/components/sections/Hero';
import StatsBar from '@/components/sections/StatsBar';
import About from '@/components/sections/About';
import Experience from '@/components/sections/Experience';
import Portfolio from '@/components/sections/Portfolio';
import Skills from '@/components/sections/Skills';
import Contact from '@/components/sections/Contact';

export default function Home() {
  return (
    <div className="relative min-h-screen">
      <Header />
      <PresentationMode />

      <main className="relative z-10">
        <Hero />
        <StatsBar />
        <About />
        <Experience />
        <Portfolio />
        <Skills />
        <Contact />
      </main>

      <Footer />
    </div>
  );
}
