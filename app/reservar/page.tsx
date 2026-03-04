import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Calendar, Activity, Shield, Clock, Phone, CheckCircle, RefreshCcw, ChevronRight } from 'lucide-react';

// ── TIPOS ────────────────────────────────────────────────────────────────────

type Step = 'especialidad' | 'nombre' | 'slots' | 'contacto' | 'confirmado' | 'error';

interface Slot {
    iso: string;
    label: string;
    hora: string;
    fecha: string;
}

interface Message {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    slots?: Slot[];       // para el paso de selección de horario
    opciones?: string[];  // para selección de especialidad
}

interface Summary {
    paciente: string;
    especialidad: string;
    slot: Slot | null;
    contacto: string;
}

// ── ESPECIALIDADES ────────────────────────────────────────────────────────────

const ESPECIALIDADES = [
    'Traumatología', 'Cardiología', 'Pediatría',
    'Ginecología', 'Dermatología', 'Nutrición', 'Medicina Estética'
];

// ── BOT RESPONSES ─────────────────────────────────────────────────────────────
// Todas las respuestas son predefinidas — adiós cuotas de API.

const BOT = {
    welcome: '¡Hola! Soy la recepción virtual de Santo Cuore. ¿En qué especialidad estás buscando un turno?',
    pedirNombre: (esp: string) => `Perfecto, te agendamos en **${esp}**. ¿Cuál es tu nombre completo?`,
    cargandoSlots: (nombre: string) => `Un momento, ${nombre.split(' ')[0]}. Estoy verificando disponibilidad...`,
    ofrecerSlots: (nombre: string, esp: string) => `Encontré los siguientes turnos disponibles en **${esp}** para vos, ${nombre.split(' ')[0]}. ¿Cuál te queda mejor?`,
    sinSlots: (esp: string) => `En este momento no tenemos turnos disponibles en **${esp}** para los próximos días. Te recomendamos comunicarte al +54 11 xxxx-xxxx para consultar disponibilidad.`,
    pedirContacto: (slot: Slot) => `Excelente elección. Turno seleccionado: **${slot.label}**.\n\n¿Me das un número de teléfono o correo electrónico para confirmar la reserva?`,
    confirmado: (s: Summary) => `¡Turno confirmado exitosamente! 🎉\n\nTe esperamos en Santo Cuore:\n• **Paciente:** ${s.paciente}\n• **Especialidad:** ${s.especialidad}\n• **Fecha:** ${s.slot!.label}\n• **Contacto registrado:** ${s.contacto}\n\nSi necesitás cancelar o modificar, comunicate con nosotros con anticipación. ¡Hasta pronto!`,
    errorSlot: 'Ese horario fue tomado por otro paciente mientras seleccionabas. Por favor elegí otro turno disponible.',
    errorGeneral: 'Ocurrió un error al procesar tu solicitud. Por favor intentalo de nuevo.',
};

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

const ReservarPage = () => {
    const [step, setStep] = useState<Step>('especialidad');
    const [messages, setMessages] = useState<Message[]>([
        { id: '0', role: 'assistant', content: BOT.welcome, opciones: ESPECIALIDADES }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [summary, setSummary] = useState<Summary>({
        paciente: '', especialidad: '', slot: null, contacto: ''
    });
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // ── AGREGAR MENSAJE ────────────────────────────────────────────────────────

    const addMsg = (msg: Omit<Message, 'id'>) => {
        const id = Date.now().toString() + Math.random();
        setMessages(prev => [...prev, { id, ...msg }]);
    };

    const addUserMsg = (content: string) => {
        addMsg({ role: 'user', content });
    };

    const addBotMsg = (content: string, extras: Partial<Message> = {}) => {
        addMsg({ role: 'assistant', content, ...extras });
    };

    // ── HANDLERS POR PASO ─────────────────────────────────────────────────────

    const handleEspecialidad = async (esp: string) => {
        if (isLoading) return;
        addUserMsg(esp);
        setSummary(prev => ({ ...prev, especialidad: esp }));
        setStep('nombre');
        setTimeout(() => addBotMsg(BOT.pedirNombre(esp)), 400);
    };

    const handleNombre = async (nombre: string) => {
        if (!nombre.trim() || isLoading) return;
        addUserMsg(nombre);
        setSummary(prev => ({ ...prev, paciente: nombre.trim() }));
        setStep('slots');
        setIsLoading(true);
        setTimeout(() => addBotMsg(BOT.cargandoSlots(nombre.trim())), 300);

        try {
            const res = await fetch('/api/reservar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'get_slots', especialidad: summary.especialidad })
            });
            const data = await res.json();
            setIsLoading(false);

            if (!data.slots || data.slots.length === 0) {
                addBotMsg(BOT.sinSlots(summary.especialidad));
                setStep('error');
                return;
            }

            addBotMsg(BOT.ofrecerSlots(nombre.trim(), summary.especialidad), { slots: data.slots });
        } catch (e) {
            setIsLoading(false);
            addBotMsg(BOT.errorGeneral);
            setStep('error');
        }
    };

    const handleSlot = async (slot: Slot) => {
        if (isLoading) return;
        addUserMsg(slot.label);
        setSummary(prev => ({ ...prev, slot }));
        setStep('contacto');
        setTimeout(() => addBotMsg(BOT.pedirContacto(slot)), 400);
    };

    const handleContacto = async (contacto: string) => {
        if (!contacto.trim() || isLoading) return;
        addUserMsg(contacto);
        const newSummary = { ...summary, contacto: contacto.trim() };
        setSummary(newSummary);
        setIsLoading(true);

        try {
            const res = await fetch('/api/reservar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create_booking',
                    paciente: newSummary.paciente,
                    especialidad: newSummary.especialidad,
                    fechaHora: newSummary.slot!.iso,
                    contacto: contacto.trim()
                })
            });
            const data = await res.json();
            setIsLoading(false);

            if (data.code === 'SLOT_TAKEN') {
                addBotMsg(BOT.errorSlot);
                setStep('slots');
                return;
            }

            if (!data.success) {
                addBotMsg(BOT.errorGeneral);
                setStep('error');
                return;
            }

            setStep('confirmado');
            addBotMsg(BOT.confirmado(newSummary));

        } catch (e) {
            setIsLoading(false);
            addBotMsg(BOT.errorGeneral);
            setStep('error');
        }
    };

    // ── SUBMIT DEL INPUT TEXT ─────────────────────────────────────────────────

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        const text = input.trim();
        setInput('');

        if (step === 'nombre') handleNombre(text);
        else if (step === 'contacto') handleContacto(text);
    };

    const handleReset = () => {
        setStep('especialidad');
        setMessages([{ id: '0', role: 'assistant', content: BOT.welcome, opciones: ESPECIALIDADES }]);
        setInput('');
        setIsLoading(false);
        setSummary({ paciente: '', especialidad: '', slot: null, contacto: '' });
    };

    // ── RENDER MENSAJE ────────────────────────────────────────────────────────

    const renderMessageContent = (msg: Message) => {
        // Parse **bold**
        const parsed = msg.content.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
            part.startsWith('**') && part.endsWith('**')
                ? <strong key={i}>{part.slice(2, -2)}</strong>
                : <span key={i}>{part}</span>
        );

        return (
            <div>
                <div style={{ lineHeight: '1.6', whiteSpace: 'pre-line' }}>{parsed}</div>

                {/* Botones de especialidad */}
                {msg.opciones && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '14px' }}>
                        {msg.opciones.map(op => (
                            <button key={op} onClick={() => handleEspecialidad(op)} style={{
                                padding: '8px 14px', borderRadius: '20px', border: '1px solid rgba(0,194,203,0.4)',
                                background: 'rgba(0,131,137,0.15)', color: '#00c2cb', cursor: 'pointer',
                                fontSize: '0.9rem', fontWeight: '600', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', gap: '6px'
                            }}
                                onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(0,131,137,0.35)'; }}
                                onMouseLeave={e => { (e.target as HTMLElement).style.background = 'rgba(0,131,137,0.15)'; }}
                            >
                                <ChevronRight size={14} />{op}
                            </button>
                        ))}
                    </div>
                )}

                {/* Botones de slots */}
                {msg.slots && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
                        {msg.slots.map(slot => (
                            <button key={slot.iso} onClick={() => handleSlot(slot)} style={{
                                padding: '12px 16px', borderRadius: '16px', border: '1px solid rgba(0,194,203,0.3)',
                                background: 'rgba(0,131,137,0.12)', color: 'white', cursor: 'pointer',
                                fontSize: '0.95rem', textAlign: 'left', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', gap: '10px'
                            }}
                                onMouseEnter={e => { (e.target as HTMLElement).style.background = 'rgba(0,131,137,0.3)'; }}
                                onMouseLeave={e => { (e.target as HTMLElement).style.background = 'rgba(0,131,137,0.12)'; }}
                            >
                                <Clock size={16} color="#00c2cb" style={{ flexShrink: 0 }} />
                                <span>{slot.label}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // ── UI ─────────────────────────────────────────────────────────────────────

    const inputVisible = step === 'nombre' || step === 'contacto';
    const statusLabel = step === 'confirmado' ? '✅ Turno confirmado'
        : summary.especialidad && summary.paciente && summary.slot ? 'Casi listo...'
            : summary.especialidad && summary.paciente ? 'Esperando horario...'
                : summary.especialidad ? 'Esperando nombre...'
                    : 'Esperando datos...';

    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', paddingTop: '100px', paddingBottom: '60px', fontFamily: 'Inter, sans-serif', position: 'relative', overflow: 'hidden' }}>
            {/* Ambient Glows */}
            <div style={{
                position: 'fixed', width: '60vw', height: '60vw', borderRadius: '50%',
                background: 'rgba(202, 20, 28, 0.15)', filter: 'blur(120px)',
                top: '-20vw', right: '-10vw', zIndex: 0, pointerEvents: 'none'
            }} />
            <div style={{
                position: 'fixed', width: '50vw', height: '50vw', borderRadius: '50%',
                background: 'rgba(0, 131, 137, 0.15)', filter: 'blur(120px)',
                bottom: '-10vw', left: '-10vw', zIndex: 0, pointerEvents: 'none'
            }} />

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '30px', alignItems: 'start', position: 'relative', zIndex: 1 }}>

                {/* ── CHAT PANEL ─────────────────────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '28px', border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden' }}>

                    {/* Header */}
                    <div style={{ padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                            <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'linear-gradient(135deg, #008389, #00c2cb)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Activity size={22} color="white" />
                            </div>
                            <div>
                                <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>Recepción Virtual</div>
                                <div style={{ fontSize: '0.8rem', color: '#00c2cb', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#00c2cb', display: 'inline-block' }}></span>
                                    En línea • Santo Cuore
                                </div>
                            </div>
                        </div>
                        <button onClick={handleReset} title="Reiniciar chat" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: '8px', borderRadius: '8px' }}>
                            <RefreshCcw size={18} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div ref={chatRef} style={{ height: '480px', overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <AnimatePresence>
                            {messages.map(msg => (
                                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                                    style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                                    <div style={{
                                        maxWidth: '82%', padding: '14px 18px', borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                        background: msg.role === 'user' ? 'linear-gradient(135deg, #008389, #00c2cb)' : 'rgba(255,255,255,0.06)',
                                        color: 'white', fontSize: '0.97rem', lineHeight: '1.5',
                                        border: msg.role === 'assistant' ? '1px solid rgba(255,255,255,0.07)' : 'none'
                                    }}>
                                        {renderMessageContent(msg)}
                                    </div>
                                </motion.div>
                            ))}

                            {isLoading && (
                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    style={{ display: 'flex', gap: '6px', padding: '14px 18px', background: 'rgba(255,255,255,0.06)', borderRadius: '20px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.07)' }}>
                                    {[0, 1, 2].map(i => (
                                        <motion.span key={i} style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00c2cb', display: 'block' }}
                                            animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Input */}
                    {inputVisible && (
                        <form onSubmit={handleSubmit} style={{ padding: '18px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '12px' }}>
                            <input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder={step === 'nombre' ? 'Escribí tu nombre completo...' : 'Teléfono o correo electrónico...'}
                                disabled={isLoading}
                                autoFocus
                                style={{
                                    flex: 1, padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)',
                                    background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.95rem', outline: 'none'
                                }}
                            />
                            <button type="submit" disabled={isLoading || !input.trim()} style={{
                                background: isLoading || !input.trim() ? 'rgba(0,131,137,0.3)' : 'linear-gradient(135deg, #008389, #00c2cb)',
                                border: 'none', borderRadius: '16px', width: '52px', height: '52px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer', transition: 'all 0.3s'
                            }}>
                                <Send size={20} color="white" />
                            </button>
                        </form>
                    )}

                    {step === 'confirmado' && (
                        <div style={{ padding: '18px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                            <button onClick={handleReset} style={{
                                padding: '12px 28px', borderRadius: '14px', background: 'rgba(0,131,137,0.2)',
                                border: '1px solid rgba(0,194,203,0.3)', color: '#00c2cb', cursor: 'pointer', fontWeight: '600'
                            }}>
                                Reservar otro turno
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* ── SIDEBAR CONFIRMACIÓN ──────────────────────────────────────── */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="glass-card" style={{ padding: '35px', borderRadius: '28px', height: 'fit-content', position: 'sticky', top: '140px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <h3 style={{ marginTop: 0, fontSize: '1.4rem', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold' }}>
                            <Calendar color="#ca141c" size={28} /> Confirmación
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
                            <div>
                                <label style={{ fontSize: '0.72rem', color: '#008389', fontWeight: '800', letterSpacing: '1px' }}>PACIENTE</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '1rem', color: summary.paciente ? 'white' : 'rgba(255,255,255,0.2)' }}>
                                    <User size={16} /> {summary.paciente || 'Esperando nombre...'}
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.72rem', color: '#008389', fontWeight: '800', letterSpacing: '1px' }}>ESPECIALIDAD</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '1rem', color: summary.especialidad ? 'white' : 'rgba(255,255,255,0.2)' }}>
                                    <Activity size={16} /> {summary.especialidad || 'Sin seleccionar'}
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.72rem', color: '#008389', fontWeight: '800', letterSpacing: '1px' }}>FECHA Y HORA</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '1rem', color: summary.slot ? 'white' : 'rgba(255,255,255,0.2)' }}>
                                    <Clock size={16} /> {summary.slot ? summary.slot.label : 'Sin definir'}
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.72rem', color: '#008389', fontWeight: '800', letterSpacing: '1px' }}>CONTACTO</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '1rem', color: summary.contacto ? 'white' : 'rgba(255,255,255,0.2)' }}>
                                    <Phone size={16} /> {summary.contacto || 'Teléfono o email...'}
                                </div>
                            </div>
                        </div>

                        {/* Status badge */}
                        <div style={{
                            marginTop: '28px', padding: '15px', borderRadius: '14px',
                            background: step === 'confirmado' ? 'rgba(0,200,100,0.12)' : 'rgba(0,131,137,0.1)',
                            border: `1px solid ${step === 'confirmado' ? 'rgba(0,200,100,0.3)' : 'rgba(0,131,137,0.2)'}`,
                            color: step === 'confirmado' ? '#00c864' : '#00c2cb',
                            fontSize: '0.9rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}>
                            {step === 'confirmado' ? <CheckCircle size={16} /> : <Shield size={16} />}
                            <strong>{statusLabel}</strong>
                        </div>

                        {/* Progress indicator */}
                        <div style={{ marginTop: '20px', display: 'flex', gap: '6px' }}>
                            {(['especialidad', 'nombre', 'slots', 'contacto', 'confirmado'] as Step[]).map((s, i) => {
                                const idx = ['especialidad', 'nombre', 'slots', 'contacto', 'confirmado'].indexOf(step);
                                const active = i <= idx;
                                return (
                                    <div key={s} style={{
                                        flex: 1, height: '4px', borderRadius: '2px',
                                        background: active ? (step === 'confirmado' ? '#00c864' : '#00c2cb') : 'rgba(255,255,255,0.1)',
                                        transition: 'background 0.4s'
                                    }} />
                                );
                            })}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)' }}>
                            <span>Especialidad</span><span>Nombre</span><span>Horario</span><span>Contacto</span><span>Listo</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ReservarPage;
