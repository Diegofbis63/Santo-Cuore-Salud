import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Calendar, Activity, Shield, Clock, AlertCircle, RefreshCcw } from 'lucide-react';
import { useChat } from 'ai/react';

const ReservarPage = () => {
    const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload, setMessages } = useChat({
        api: '/api/chat',
        initialMessages: [
            { id: 'welcome', role: 'assistant', content: '¡Hola! Soy el asistente virtual de Santo Cuore. ¿En qué especialidad estás buscando un turno?' }
        ],
        onResponse: (response) => {
            console.log('IA Responsive received with status:', response.status);
        },
        onError: (err) => {
            console.error('Chat Error:', err);
        }
    });

    const [summary, setSummary] = useState({
        paciente: '',
        especialidad: '',
        fecha: '',
        status: 'Esperando datos...'
    });

    const chatContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    // Update Summary from Tool Results
    useEffect(() => {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg?.toolInvocations) {
            lastMsg.toolInvocations.forEach((inv: any) => {
                if (inv.toolName === 'actualizarResumenTurno' && inv.state === 'result') {
                    const data = inv.result.updated;
                    setSummary(prev => ({
                        ...prev,
                        paciente: data.paciente || prev.paciente,
                        especialidad: data.especialidad || prev.especialidad,
                        fecha: data.fechaHora || prev.fecha,
                        status: (data.paciente || prev.paciente) && (data.especialidad || prev.especialidad) ? 'Casi listo...' : 'Esperando datos...'
                    }));
                }
            });
        }
    }, [messages]);

    const handleOnSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        handleSubmit(e);
    };

    const resetChat = () => {
        setMessages([{ id: 'welcome', role: 'assistant', content: '¡Hola! Soy el asistente virtual de Santo Cuore. ¿En qué especialidad estás buscando un turno?' }]);
    };

    return (
        <div style={{ paddingTop: '100px', minHeight: '100vh', background: '#010505', color: 'white' }}>
            <div className="container reservar-grid">

                {/* Chat Column */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.99 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card"
                    style={{ height: '75vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                    <div style={{ padding: '20px', background: 'rgba(0,131,137,0.08)', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ background: '#008389', padding: '10px', borderRadius: '50%' }}><Activity size={20} /></div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Recepción Virtual</h3>
                                <span style={{ fontSize: '0.8rem', color: '#008389' }}>{isLoading ? 'IA procesando respuesta...' : 'En línea • Santo Cuore'}</span>
                            </div>
                        </div>
                        <button onClick={resetChat} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }} title="Reiniciar chat">
                            <RefreshCcw size={16} />
                        </button>
                    </div>

                    <div ref={chatContainerRef} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {messages.map(m => {
                            let contentToDisplay = m.content;
                            if (!contentToDisplay && m.toolInvocations && m.toolInvocations.length > 0) {
                                const tool = m.toolInvocations[0];
                                if (tool && tool.args && (tool.args as any).respuesta) {
                                    contentToDisplay = (tool.args as any).respuesta;
                                }
                            }
                            if (!contentToDisplay) return null;
                            return (
                                <motion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    style={{
                                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                                        padding: '14px 20px',
                                        borderRadius: m.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                        fontSize: '1rem',
                                        maxWidth: '85%',
                                        lineHeight: '1.5',
                                        background: m.role === 'user' ? '#008389' : 'rgba(255,255,255,0.07)',
                                        color: 'white',
                                        boxShadow: m.role === 'user' ? '0 10px 20px rgba(0,131,137,0.2)' : 'none',
                                        border: '1px solid rgba(255,255,255,0.05)'
                                    }}
                                >
                                    {contentToDisplay}
                                </motion.div>
                            );
                        })}
                        {isLoading && messages[messages.length - 1].role === 'user' && (
                            <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '15px', display: 'flex', gap: '5px' }}>
                                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }}>.</motion.span>
                                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}>.</motion.span>
                                <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}>.</motion.span>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div style={{ margin: '10px 24px', padding: '15px', background: 'rgba(255,50,50,0.1)', border: '1px solid rgba(255,50,50,0.2)', color: '#ff7a7a', borderRadius: '12px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <AlertCircle size={18} /> Error de conexión. Reintentando...
                            <button onClick={() => reload()} style={{ background: 'white', color: 'black', border: 'none', padding: '5px 10px', borderRadius: '5px', fontSize: '0.75rem', cursor: 'pointer', marginLeft: 'auto' }}>Reintentar</button>
                        </div>
                    )}

                    <form onSubmit={handleOnSubmit} style={{ padding: '24px', display: 'flex', gap: '12px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <input
                            value={input}
                            onChange={handleInputChange}
                            placeholder={isLoading ? "La IA está pensando..." : "Escribe tu consulta aquí..."}
                            style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', color: 'white', outline: 'none', transition: 'all 0.3s' }}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            style={{
                                background: isLoading || !input.trim() ? 'rgba(255,255,255,0.1)' : '#008389',
                                border: 'none',
                                borderRadius: '16px',
                                width: '56px',
                                height: '56px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            <Send size={22} color="white" />
                        </button>
                    </form>
                </motion.div>

                {/* Summary Column */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <div className="glass-card" style={{ padding: '35px', borderRadius: '28px', height: 'fit-content', position: 'sticky', top: '140px', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <h3 style={{ marginTop: 0, fontSize: '1.4rem', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold' }}><Calendar color="#ca141c" size={28} /> Confirmación</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#008389', fontWeight: '800', letterSpacing: '1px' }}>PACIENTE</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '1.1rem', color: summary.paciente ? 'white' : 'rgba(255,255,255,0.2)' }}>
                                    <User size={18} /> {summary.paciente || 'Esperando nombre...'}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#008389', fontWeight: '800', letterSpacing: '1px' }}>ESPECIALIDAD</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '1.1rem', color: summary.especialidad ? 'white' : 'rgba(255,255,255,0.2)' }}>
                                    <Activity size={18} /> {summary.especialidad || 'Esperando especialidad...'}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: '#008389', fontWeight: '800', letterSpacing: '1px' }}>FECHA Y HORA</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', fontSize: '1.1rem', color: summary.fecha ? 'white' : 'rgba(255,255,255,0.2)' }}>
                                    <Clock size={18} /> {summary.fecha || 'Sin definir'}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '35px', padding: '18px', borderRadius: '16px', background: 'rgba(0,131,137,0.1)', border: '1px solid rgba(0,131,137,0.2)', color: '#00c2cb', fontSize: '0.95rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                            <Shield size={18} /> <strong>{summary.status}</strong>
                        </div>

                        <button
                            disabled={!summary.paciente || !summary.especialidad}
                            style={{
                                width: '100%',
                                marginTop: '30px',
                                padding: '18px',
                                borderRadius: '16px',
                                background: summary.paciente && summary.especialidad ? 'white' : 'rgba(255,255,255,0.05)',
                                color: summary.paciente && summary.especialidad ? 'black' : 'rgba(255,255,255,0.2)',
                                border: 'none',
                                fontWeight: '900',
                                fontSize: '1rem',
                                cursor: summary.paciente && summary.especialidad ? 'pointer' : 'not-allowed',
                                transition: 'all 0.3s'
                            }}
                        >
                            CONFIRMAR TURNO
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ReservarPage;
