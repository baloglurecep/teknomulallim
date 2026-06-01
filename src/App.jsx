import React, { useState, useEffect, useCallback, useRef } from 'react';
import { initialData } from './data/initialData';
import { initAuthHash, isSessionValid, clearSession } from './utils/auth';
import {
  loadProfile,
  loadProjects,
  loadSiteContent,
  saveProfile,
  saveProjects,
  subscribeContentUpdates,
} from './utils/contentStore';
import BackgroundCanvas from './components/BackgroundCanvas';
import CursorGlow from './components/CursorGlow';
import IntroOverlay from './components/IntroOverlay';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import About from './components/About';
import Contact from './components/Contact';
import AdminConsole from './components/AdminConsole';

function App() {
  const [profile, setProfile] = useState(() => loadProfile());
  const [projects, setProjects] = useState(() => loadProjects());
  const [activeSection, setActiveSection] = useState('hero');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(() => isSessionValid());

  useEffect(() => {
    initAuthHash();
  }, []);

  // Netlify'daki site-data.json → tüm ziyaretçiler aynı içeriği görür
  useEffect(() => {
    let cancelled = false;
    loadSiteContent().then(({ profile: p, projects: pr }) => {
      if (cancelled) return;
      setProfile(p);
      setProjects(pr);
    });
    return () => { cancelled = true; };
  }, []);

  // Sayfa başlığı ve meta — admin panelinden anında güncellenir
  useEffect(() => {
    const site = profile.site || {};
    document.title = site.pageTitle || profile.name || 'Teknomuallim';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && site.pageDescription) {
      metaDesc.setAttribute('content', site.pageDescription);
    }
  }, [profile]);

  // Çoklu sekme / anlık senkronizasyon
  useEffect(() => {
    return subscribeContentUpdates(({ type, data }) => {
      if (type === 'profile') setProfile(data);
      if (type === 'projects') setProjects(data);
    });
  }, []);

  useEffect(() => {
    const sections = ['hero', 'projects', 'about', 'contact'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isAdminMode && !isSessionValid()) setIsAdminMode(false);
    }, 60000);
    return () => clearInterval(interval);
  }, [isAdminMode]);

  const handleSaveProfile = useCallback(async (updatedProfile) => {
    try {
      const normalized = await saveProfile(updatedProfile);
      setProfile(normalized);
    } catch (err) {
      console.error(err);
      alert(`Kayıt hatası: ${err.message}`);
    }
  }, []);

  const handleSaveProjects = useCallback(async (updatedProjects) => {
    try {
      const saved = await saveProjects(updatedProjects);
      setProjects(saved);
      return saved;
    } catch (err) {
      console.error(err);
      alert(`Kayıt hatası: ${err.message}`);
      throw err;
    }
  }, []);

  const handleAdminAuthorize = (status) => {
    setIsAdminMode(status);
    sessionStorage.setItem('teknomuallim_admin_active', status ? 'true' : 'false');
  };

  const handleLogout = () => {
    clearSession();
    setIsAdminMode(false);
  };

  const handleResetData = async () => {
    localStorage.removeItem('teknomuallim_profile');
    localStorage.removeItem('teknomuallim_projects');
    setProfile(initialData.profile);
    setProjects(initialData.projects);
    await saveProfile(initialData.profile);
    await saveProjects(initialData.projects);
    clearSession();
    setIsAdminMode(false);
    setIsAdminOpen(false);
  };

  const handleIntroComplete = useCallback(() => setIntroDone(true), []);

  const closeProjectModalRef = useRef(() => {});

  const handleNavigate = useCallback((sectionId) => {
    closeProjectModalRef.current?.();
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const registerCloseProjectModal = useCallback((fn) => {
    closeProjectModalRef.current = typeof fn === 'function' ? fn : () => {};
  }, []);

  return (
    <>
      {!introDone && <IntroOverlay onComplete={handleIntroComplete} />}

      <BackgroundCanvas />
      <div className="cyber-grid" />
      {introDone && <CursorGlow />}

      <Navbar
        profile={profile}
        onOpenAdmin={() => setIsAdminOpen(true)}
        activeSection={activeSection}
        isAdminMode={isAdminMode}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
      />

      <Hero profile={profile} projectCount={projects.length} onNavigate={handleNavigate} />
      <Projects
        profile={profile}
        projects={projects}
        onSaveProjects={handleSaveProjects}
        isAdminMode={isAdminMode}
        onRegisterCloseModal={registerCloseProjectModal}
      />
      <About profile={profile} />
      <Contact profile={profile} />

      {isAdminOpen && (
        <AdminConsole
          profile={profile}
          projects={projects}
          onSaveProfile={handleSaveProfile}
          onSaveProjects={handleSaveProjects}
          onResetData={handleResetData}
          onClose={() => setIsAdminOpen(false)}
          isAdminMode={isAdminMode}
          onAuthorize={handleAdminAuthorize}
        />
      )}
    </>
  );
}

export default App;
