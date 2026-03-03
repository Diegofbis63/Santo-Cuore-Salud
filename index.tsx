import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Heart, Activity, Shield, ArrowRight, Phone, MapPin, Clock, ChevronRight, CheckCircle2, Star, Quote, MessageCircle, Instagram, Facebook, Mail, Menu, X } from 'lucide-react';
import './index.css';
import ReservarPage from './app/reservar/page';
import AdminDashboard from './app/admin/page';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''} ${isOpen ? 'menu-open' : ''}`}>
      <div className="container nav-content">
        <Link to="/" className="logo">
          <img
            src="/logo.png"
            alt="Santo Cuore"
            className="brand-logo"
          />
        </Link>

        {/* Desktop Links */}
        <div className="nav-links desktop-only">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Inicio</Link>
          <Link to="/especialidades" className={`nav-link ${location.pathname === '/especialidades' ? 'active' : ''}`}>Especialidades</Link>
          <Link to="/staff" className={`nav-link ${location.pathname === '/staff' ? 'active' : ''}`}>Staff</Link>
          <Link to="/reservar" className={`nav-link ${location.pathname === '/reservar' ? 'active' : ''}`}>Turnos</Link>
          <Link to="/contacto" className={`nav-link ${location.pathname === '/contacto' ? 'active' : ''}`}>Contacto</Link>
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-menu-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Menu Overlay */}
        <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
          <Link to="/" className={`mobile-nav-link ${location.pathname === '/' ? 'active' : ''}`}>Inicio</Link>
          <Link to="/especialidades" className={`mobile-nav-link ${location.pathname === '/especialidades' ? 'active' : ''}`}>Especialidades</Link>
          <Link to="/staff" className={`mobile-nav-link ${location.pathname === '/staff' ? 'active' : ''}`}>Staff</Link>
          <Link to="/reservar" className={`mobile-nav-link ${location.pathname === '/reservar' ? 'active' : ''}`}>Turnos</Link>
          <Link to="/contacto" className={`mobile-nav-link ${location.pathname === '/contacto' ? 'active' : ''}`}>Contacto</Link>

          <div className="mobile-menu-footer">
            <div className="mobile-contact-item">
              <Phone size={18} />
              <span>+54 (351) 4241928</span>
            </div>
            <div className="mobile-contact-item">
              <MapPin size={18} />
              <span>9 de Julio 660, Córdoba</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Footer = () => (
  <footer className="footer">
    <div className="container">
      <div className="footer-grid">
        <div className="footer-col">
          <Link to="/" className="logo" style={{ marginBottom: '24px' }}>
            <img
              src="/logo.png"
              alt="Santo Cuore"
              className="brand-logo"
            />
          </Link>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '300px' }}>
            Centro de salud y medicina estética en Córdoba. Tu bienestar es nuestra prioridad.
          </p>
        </div>
        <div className="footer-col">
          <h4>Contacto</h4>
          <ul className="footer-links">
            <li><a href="https://maps.app.goo.gl/iHKJthuxi41C8Yb59" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}><MapPin size={16} style={{ marginTop: '4px', flexShrink: 0 }} /> <span>9 de Julio 660 – 1º Piso Of. 13<br />Córdoba, Argentina</span></a></li>
            <li><a href="tel:+543514241928" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Phone size={16} style={{ flexShrink: 0 }} /> Tel: +54 (351) 4241928</a></li>
            <li><a href="https://api.whatsapp.com/send?phone=543518079549" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MessageCircle size={16} style={{ flexShrink: 0 }} /> Cel: +54 351 807 9549</a></li>
            <li><a href="mailto:info@santocuore.com.ar" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Mail size={16} style={{ flexShrink: 0 }} /> info@santocuore.com.ar</a></li>
            <li><span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}><Clock size={16} style={{ flexShrink: 0 }} /> Lu. a Vi. – 9 a 20 Hs.</span></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Enlaces</h4>
          <ul className="footer-links">
            <li><Link to="/">Inicio</Link></li>
            <li><Link to="/especialidades">Especialidades</Link></li>
            <li><Link to="/staff">Staff Profesional</Link></li>
            <li><Link to="/contacto">Contacto</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        &copy; {new Date().getFullYear()} Santo Cuore Salud. Todos los derechos reservados.
      </div>
    </div>
  </footer>
);

const Home = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 200]);

  const [width, setWidth] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (carouselRef.current) {
      setWidth(carouselRef.current.scrollWidth - carouselRef.current.offsetWidth);
    }
  }, []);

  const reviews = [
    {
      author: "María Laura G.",
      text: "Excelente atención de los profesionales. Las instalaciones son modernas y muy limpias. Fui por una consulta de cardiología y me atendieron a horario. Muy recomendable.",
      rating: 5
    },
    {
      author: "Carlos M.",
      text: "Muy buena atención en recepción y los médicos son muy cálidos y profesionales. El lugar es hermoso y la tecnología de primera. Sin dudas volveré.",
      rating: 5
    },
    {
      author: "Sofía R.",
      text: "Fui para un tratamiento estético y los resultados fueron increíbles. El equipo médico te explica todo con detalle y te hacen sentir muy cómoda desde que llegás.",
      rating: 5
    },
    {
      author: "Javier T.",
      text: "Destaco la puntualidad y el profesionalismo del Dr. Vivero. El centro cuenta con equipos de última generación para estudios cardiovasculares.",
      rating: 5
    },
    {
      author: "Ana Paula D.",
      text: "Me atiendo en el departamento metabólico y mi experiencia es de 10. Te acompañan en todo el proceso y los resultados son reales.",
      rating: 5
    },
    {
      author: "Roberto F.",
      text: "Instalaciones impecables y atención rápida. Fui por un apto físico y me hicieron todos los estudios en el mismo lugar y en menos de una hora.",
      rating: 5
    },
    {
      author: "Lucía C.",
      text: "Las chicas de recepción son un amor y la Dra. Loiacono es una excelente profesional. Me explicó todo el tratamiento estético con mucha paciencia.",
      rating: 5
    },
    {
      author: "Martín E.",
      text: "Excelente centro médico. Muy completo, limpio y con profesionales de primer nivel. Lo recomiendo a todos mis conocidos.",
      rating: 5
    }
  ];

  return (
    <>
      <section className="hero-v2" style={{ position: 'relative', width: '100%' }}>
        {/* Banner Image Container */}
        <div style={{
          width: '100%',
          height: '60vh',
          position: 'relative',
          marginTop: '110px',
          overflow: 'hidden'
        }}>
          <motion.img
            src="/logo-hover.png"
            alt=""
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'none'
            }}
          />
        </div>

        {/* Hero Content below image */}
        <div className="container" style={{ paddingTop: '80px', paddingBottom: '120px' }}>
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}
          >
            <motion.span
              className="hero-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Centro de Salud y Medicina Estética
            </motion.span>

            <h1 className="hero-title" style={{ marginTop: '20px' }}>
              <span className="text-gradient" style={{ display: 'block', marginBottom: '10px' }}>Innovación en</span>
              <span className="text-gradient-brand">Salud Integral</span>
            </h1>

            <p className="hero-desc" style={{ fontSize: '1.25rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '40px', maxWidth: '700px', margin: '0 auto 40px' }}>
              Desde 2013 brindamos servicios de medicina ambulatoria con profesionales especializados, tecnología de vanguardia y un enfoque profundamente humano.
            </p>

            <div className="hero-actions" style={{ justifyContent: 'center' }}>
              <Link to="/reservar" className="btn-primary" style={{ padding: '18px 40px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                Solicitar Turno <ArrowRight size={20} />
              </Link>
              <Link to="/especialidades" className="btn-glass" style={{ padding: '18px 40px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                Conocer Especialidades
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container">
        <div className="features-grid">
          <motion.div
            className="glass-card feature-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="feature-icon-wrapper">
              <Activity size={32} />
            </div>
            <h3 className="feature-title">Cardiología</h3>
            <p className="feature-desc">
              Nuestro foco principal. Atención especializada para el paciente cardiovascular con tecnología de diagnóstico avanzada.
            </p>
          </motion.div>

          <motion.div
            className="glass-card feature-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="feature-icon-wrapper">
              <Shield size={32} />
            </div>
            <h3 className="feature-title">Medicina Estética</h3>
            <p className="feature-desc">
              Tratamientos innovadores y personalizados para realzar tu belleza natural con el respaldo de profesionales médicos.
            </p>
          </motion.div>

          <motion.div
            className="glass-card feature-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="feature-icon-wrapper">
              <Heart size={32} />
            </div>
            <h3 className="feature-title">Atención Humana</h3>
            <p className="feature-desc">
              Una experiencia grata, personalizada y expeditiva en un entorno diseñado para tu confort y bienestar.
            </p>
          </motion.div>
        </div>
      </section>

      <section id="nosotros" className="about-section container">
        <div className="about-grid">
          <motion.div
            className="about-video-wrapper"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass-panel" style={{ padding: '16px', borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>
              <div className="ambient-glow glow-teal" style={{ width: '200px', height: '200px', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.3 }} />
              <iframe
                width="100%"
                height="450"
                src="https://www.youtube.com/embed/PnoRARyOxMY"
                title="Sede Santo Cuore"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ borderRadius: '16px', display: 'block', position: 'relative', zIndex: 2 }}
              ></iframe>
            </div>
          </motion.div>

          <motion.div
            className="about-content"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="hero-subtitle">Sobre Nosotros</span>
            <h2 className="hero-title" style={{ fontSize: '3rem', marginBottom: '32px' }}>
              <span className="text-gradient">Nuestra</span>
              <span className="text-gradient-teal"> Esencia</span>
            </h2>

            <div className="glass-card" style={{ marginBottom: '24px', padding: '32px', borderLeft: '4px solid var(--brand-red)' }}>
              <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Activity size={24} color="var(--brand-red)" /> Misión
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1.05rem' }}>
                Prestar servicios médicos de alta calidad, con talento humano calificado que contribuya en el desarrollo integral, la prevención y el mantenimiento de la salud.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '32px', borderLeft: '4px solid var(--brand-teal)' }}>
              <h3 style={{ color: 'white', marginBottom: '12px', fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Heart size={24} color="var(--brand-teal)" /> Visión
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '1.05rem' }}>
                Ser un centro médico de excelencia en la prestación de servicios de salud ambulatoria, y la mejor alternativa al momento de elegir el asesoramiento en medicina vascular, estética, ginecológica y nutricional.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Obras Sociales Section */}
      <section className="container" style={{ padding: '80px 0' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
          style={{ marginBottom: '60px' }}
        >
          <h2 className="hero-title" style={{ fontSize: '2.5rem', display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <span className="text-gradient">OBRAS</span>
            <span className="text-gradient-teal">SOCIALES</span>
          </h2>
          <div style={{ width: '80px', height: '3px', background: 'var(--brand-teal)', margin: '20px auto', borderRadius: '2px' }} />
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '30px',
          alignItems: 'center',
          justifyItems: 'center'
        }}>
          {[
            { name: 'UN', url: 'https://logo.clearbit.com/unionpersonal.com.ar', fallbackColor: '#8b2b7c' },
            { name: 'SanCor Salud', url: 'https://logo.clearbit.com/sancorsalud.com.ar', fallbackColor: '#005b9f' },
            { name: 'OSPG', url: 'https://logo.clearbit.com/ospg.org.ar', fallbackColor: '#00a99d' },
            { name: 'UMANA', url: 'https://logo.clearbit.com/umana.com.ar', fallbackColor: '#00a99d' },
            { name: 'OSDE', url: 'https://logo.clearbit.com/osde.com.ar', fallbackColor: '#1a237e' },
            { name: 'JERÁRQUICOS', url: 'https://logo.clearbit.com/jerarquicos.com', fallbackColor: '#005b9f' }
          ].map((obra, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
              className="glass-card"
              style={{
                width: '100%',
                height: '110px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'white', // White background for logos
                borderRadius: '16px',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <img
                src={obra.url}
                alt={obra.name}
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'block';
                }}
              />
              <span style={{
                display: 'none',
                color: obra.fallbackColor,
                fontSize: obra.name === 'UN' ? '3rem' : '1.3rem',
                fontWeight: 800,
                letterSpacing: obra.name === 'OSDE' ? '-1px' : '1px',
                textTransform: obra.name === 'OSDE' ? 'lowercase' : 'uppercase',
                textAlign: 'center'
              }}>
                {obra.name}
              </span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Reseñas Section */}
      <section className="container" style={{ padding: '80px 0 120px 0' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
          style={{ marginBottom: '60px' }}
        >
          <span className="hero-subtitle" style={{ justifyContent: 'center' }}>Testimonios</span>
          <h2 className="hero-title" style={{ fontSize: '2.5rem' }}>
            <span className="text-gradient">Reseñas de </span>
            <span className="text-gradient-teal">Pacientes</span>
          </h2>
        </motion.div>

        <motion.div ref={carouselRef} style={{ overflow: 'hidden', cursor: 'grab', padding: '20px 0' }} whileTap={{ cursor: 'grabbing' }}>
          <motion.div
            drag="x"
            dragConstraints={{ right: 0, left: -width }}
            style={{ display: 'flex', gap: '32px', width: 'max-content', padding: '0 20px' }}
          >
            {reviews.map((review, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (idx % 3) * 0.2 }}
                className="glass-card"
                style={{ padding: '32px', position: 'relative', width: '350px', flexShrink: 0, display: 'flex', flexDirection: 'column' }}
              >
                <Quote size={40} color="var(--brand-teal)" style={{ opacity: 0.2, position: 'absolute', top: '24px', right: '24px' }} />
                <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={18} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '24px', fontStyle: 'italic', flexGrow: 1 }}>
                  "{review.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--brand-teal)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
                    {review.author.charAt(0)}
                  </div>
                  <div>
                    <h4 style={{ color: 'white', margin: 0 }}>{review.author}</h4>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Reseña de Google</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>
    </>
  );
};

const Especialidades = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const departments = [
    {
      title: "Departamento Cardiovascular",
      icon: <Heart size={32} color="var(--brand-red)" />,
      items: [
        "Cardiología", "Angiología", "Flebología", "Clínica de heridas", "Kinesiología flebo-linfática",
        "Ecocardiograma doppler color", "Ecografía doppler periférica", "Electrocardiograma",
        "Mapa 24 hs", "Holter 24 hs", "Tratamiento de varices con láser Nd-YAG 1064 nm"
      ]
    },
    {
      title: "Departamento Metabólico",
      icon: <Activity size={32} color="var(--brand-teal)" />,
      items: [
        "Medicina nutricional", "Obesiología", "Diabetología", "Nutrición", "Endocrinología",
        "Medición de composición corporal", "Kinesiología corporal"
      ]
    },
    {
      title: "Médico Estético",
      icon: <Shield size={32} color="var(--brand-red)" />,
      items: [
        "Medicina estética", "Cirugía plástica", "Kinesiología estetica y dermatofuncional",
        "Recuperación, prevención y mantenimiento capilar", "Eliminación de lesiones de piel",
        "Depilación láser Soprano Ice", "Luz pulsada Harmony", "Vela Velvet", "Criolipolisis",
        "Body Up", "Plasma rico en plaquetas", "Peeling", "Limpieza facial", "Radiofrecuencia",
        "Combos corporales celulitis, estrías, adiposidad localizada, flacidez"
      ]
    },
    {
      title: "Especialidades Varias",
      icon: <Activity size={32} color="var(--brand-teal)" />,
      items: [
        "Ginecología", "Sexologia", "Medicina reproductiva", "Kinesiología de piso pélvico",
        "Psicología", "Dermatología", "Clínica médica", "Entrenamiento funcional personalizado"
      ]
    }
  ];

  return (
    <div style={{ paddingTop: '140px', paddingBottom: '80px' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
          style={{ marginBottom: '60px', textAlign: 'center' }}
        >
          <span className="hero-subtitle" style={{ justifyContent: 'center' }}>Nuestras Especialidades</span>
          <h1 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '24px' }}>
            <span className="text-gradient">Medicina </span>
            <span className="text-gradient-teal">Ambulatoria</span>
          </h1>
          <p className="hero-desc" style={{ margin: '0 auto', maxWidth: '800px', fontSize: '1.2rem' }}>
            Como prestador de servicios de medicina ambulatoria especializada, trabajamos para que nuestro paciente viva una experiencia grata y ajustada a sus necesidades, en la que resuelva su problema de salud y con esto consiga transitar su vida con calidad.
          </p>
        </motion.div>

        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          style={{ marginBottom: '80px', padding: '40px' }}
        >
          <h2 style={{ color: 'white', fontSize: '2rem', marginBottom: '32px', textAlign: 'center' }}>Virtudes y Valores</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
            {[
              "Médicos subespecialistas en constante formación.",
              "Servicio personalizado y expeditivo.",
              "Buenas experiencias.",
              "Evitamos la sobre prestación médica."
            ].map((value, idx) => (
              <motion.div
                key={idx}
                whileHover={{ x: 5 }}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <CheckCircle2 size={20} color="var(--brand-teal)" />
                <span style={{ fontSize: '1.1rem' }}>{value}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
          {departments.map((dept, idx) => (
            <motion.div
              key={idx}
              className="glass-card feature-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
              style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
            >
              <div className="feature-icon-wrapper" style={{ marginBottom: '24px' }}>
                {dept.icon}
              </div>
              <h3 className="feature-title" style={{ marginBottom: '24px', fontSize: '1.4rem' }}>{dept.title}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1 }}>
                {dept.items.map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.4 }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--brand-teal)', marginTop: '6px', flexShrink: 0 }} />
                    {item}
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-glass"
                style={{ marginTop: '32px', width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                Ver más detalles
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Staff = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const staffMembers = [
    { name: "Dr. Alejandro Vivero", role: "Médico especialista en Cardiología, esp. Medicina Vascular.", image: "/especialistas/1.jpg" },
    { name: "Dra Loiacono Mariana", role: "Médica especialista en clínica médica, esp. en Med Estetica.", image: "/especialistas/2.webp" },
    { name: "Lic. Verde Maria José", role: "Lic. en kinesiología y fisioterapia. Esp en rehabilitación vascular.", image: "/especialistas/3.webp" },
    { name: "Matías Ramírez", role: "Licenciado en Educación Física.", image: "/especialistas/4.png" },
    { name: "Lic. Tobares Andrea", role: "Lic. en kinesiología y fisioterapia. Esp. en rehabilitación vascular.", image: "/especialistas/5.webp" },
    { name: "Gasparrini Tamara Julieta", role: "Licenciada en nutrición.", image: "/especialistas/6.webp" },
    { name: "Dra Carboni Mariela", role: "Médica especialista en cirugía, esp. Flebologia.", image: "/especialistas/7.jpg" },
    { name: "Dr Loson Ricardo", role: "Médico especialista en cirugía vascular. Esp. Flebologia.", image: "/especialistas/8.webp" },
    { name: "Daniela Gualtieri", role: "Licenciada en kinesiología y fisioterapia", image: "/especialistas/9.jpeg" },
    { name: "Dra. Eugenia Bazan Quiroga", role: "Médica ginecóloga, esp. en sexología.", image: "/especialistas/10.jpeg" },
    { name: "Cecilia Taburet", role: "Licenciada en psicología.", image: "/especialistas/11.jpeg" },
    { name: "Dra Actis Danna Zaieg Rocio", role: "Médica espe. en clínica médica y en Psicoinmunoneuroendocrinología.", image: "/especialistas/12.jpg" },
    { name: "Dra. Vanella Sofia", role: "Médica especialista en dermatología.", image: "/especialistas/13.jpeg" },
    { name: "Dra. Romina Medina", role: "Médica especialista en Endocrinología.", image: "/especialistas/14.jpeg" },
    { name: "Lic. Gutierres Guillermo", role: "Licenciado en educación física.", image: "/especialistas/15.webp" },
    { name: "Dra. Natalia Batello", role: "Médica ginecóloga, esp. en medicina reproductiva.", image: "/especialistas/16.jpeg" }
  ];

  return (
    <div style={{ paddingTop: '140px', paddingBottom: '80px' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
          style={{ marginBottom: '60px', textAlign: 'center' }}
        >
          <span className="hero-subtitle" style={{ justifyContent: 'center' }}>Nuestro Equipo</span>
          <h1 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '24px' }}>
            <span className="text-gradient">Nuestro Staff </span>
            <span className="text-gradient-teal">Profesional</span>
          </h1>
          <p className="hero-desc" style={{ margin: '0 auto', maxWidth: '800px', fontSize: '1.2rem' }}>
            Nuestros médicos, kinesiólogos y licenciados especializados en diferentes campos de la medicina trabajan dentro de cuatro departamentos interconectados, resolviendo así la pluralidad de factores que hacen a una enfermedad en un mismo lugar.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '32px' }}>
          {staffMembers.map((member, idx) => (
            <motion.div
              key={idx}
              className="glass-card"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (idx % 4) * 0.1 }}
              whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
              style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', padding: 0 }}
            >
              <div style={{ width: '100%', height: '320px', background: 'rgba(255,255,255,0.05)', position: 'relative' }}>
                <img
                  src={member.image}
                  alt={member.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(20%) contrast(110%)' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(10,5,2,1) 0%, rgba(10,5,2,0.8) 40%, transparent 100%)' }} />
              </div>
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flexGrow: 1, position: 'relative', zIndex: 2, marginTop: '-80px' }}>
                <h3 style={{ color: 'white', fontSize: '1.3rem', marginBottom: '8px', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{member.name}</h3>
                <p style={{ color: 'var(--brand-teal)', fontSize: '0.95rem', lineHeight: 1.5, fontWeight: 500 }}>
                  {member.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Contacto = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ paddingTop: '140px', paddingBottom: '80px' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
          style={{ marginBottom: '60px', textAlign: 'center' }}
        >
          <span className="hero-subtitle" style={{ justifyContent: 'center' }}>Comunicate con nosotros</span>
          <h1 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '24px' }}>
            <span className="text-gradient">Contacto y </span>
            <span className="text-gradient-teal">Ubicación</span>
          </h1>
          <p className="hero-desc" style={{ margin: '0 auto', maxWidth: '800px', fontSize: '1.2rem' }}>
            Estamos a tu disposición para responder tus consultas y coordinar tus turnos. Escribinos o visitanos en nuestro centro médico.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '80px' }}>
          {/* WhatsApp Card */}
          <motion.a
            href="https://api.whatsapp.com/send?phone=543518079549"
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
            style={{ padding: '40px 32px', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          >
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(37, 211, 102, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <MessageCircle size={40} color="#25D366" />
            </div>
            <h3 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '16px' }}>WhatsApp</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.1rem', lineHeight: 1.6 }}>Escribinos para solicitar turnos o realizar consultas de manera rápida y directa.</p>
            <span style={{ color: '#25D366', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.1rem' }}>
              Enviar mensaje <ArrowRight size={20} />
            </span>
          </motion.a>

          {/* Redes Sociales */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
            style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          >
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(225, 48, 108, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <Instagram size={40} color="#E1306C" />
            </div>
            <h3 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '16px' }}>Redes Sociales</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.1rem', lineHeight: 1.6 }}>Seguinos para enterarte de nuestras novedades, tips de salud y tratamientos exclusivos.</p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <a href="https://www.instagram.com/santocuoresalud/" target="_blank" rel="noopener noreferrer" className="btn-glass" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Instagram size={20} /> Instagram
              </a>
              <a href="https://www.facebook.com/santocuoresalud" target="_blank" rel="noopener noreferrer" className="btn-glass" style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Facebook size={20} /> Facebook
              </a>
            </div>
          </motion.div>

          {/* Info Adicional */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ y: -10, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}
            style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
          >
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(0, 131, 137, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <MapPin size={40} color="var(--brand-teal)" />
            </div>
            <h3 style={{ color: 'white', fontSize: '1.8rem', marginBottom: '16px' }}>Nuestra Sede</h3>
            <a href="https://maps.app.goo.gl/iHKJthuxi41C8Yb59" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1.1rem', lineHeight: 1.6, transition: 'color 0.3s ease' }} onMouseOver={(e) => e.currentTarget.style.color = 'white'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
              9 de Julio 660 – 1º Piso Of. 13<br />
              Córdoba, Argentina
            </a>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '1.05rem', background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: '12px' }}>
                <Clock size={20} color="var(--brand-teal)" style={{ flexShrink: 0 }} />
                <span>Lu. a Vi. – 9 a 20 Hs.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '1.05rem', background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: '12px' }}>
                <Phone size={20} color="var(--brand-teal)" style={{ flexShrink: 0 }} />
                <span>Tel: +54 (351) 4241928</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '1.05rem', background: 'rgba(255,255,255,0.05)', padding: '12px 20px', borderRadius: '12px' }}>
                <Mail size={20} color="var(--brand-teal)" style={{ flexShrink: 0 }} />
                <span>info@santocuore.com.ar</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Mapa */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass-card"
          style={{ padding: '24px', borderRadius: '24px', overflow: 'hidden' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingLeft: '8px' }}>
            <MapPin size={28} color="var(--brand-red)" />
            <h3 style={{ color: 'white', fontSize: '1.8rem', margin: 0 }}>Encontranos en Google Maps</h3>
          </div>
          <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
            <iframe
              width="100%"
              height="500"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              allowFullScreen
              src="https://maps.google.com/maps?q=Santo%20Cuore,%209%20de%20Julio%20660,%20C%C3%B3rdoba&t=&z=16&ie=UTF8&iwloc=&output=embed"
              title="Ubicación Santo Cuore"
            ></iframe>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      {/* Ambient Background Glows */}
      <div className="ambient-glow glow-red" />
      <div className="ambient-glow glow-teal" />

      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/especialidades" element={<Especialidades />} />
        <Route path="/staff" element={<Staff />} />
        <Route path="/contacto" element={<Contacto />} />
        <Route path="/reservar" element={<ReservarPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
