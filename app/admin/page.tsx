import React from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Activity, CheckCircle, Clock, XCircle, Search, Filter, Download } from 'lucide-react';

const AdminDashboard = () => {
    const appointments = [
        { id: 1, patient: 'Juan Pérez', specialty: 'Cardiología', date: '2024-03-05 09:00', status: 'confirmado' },
        { id: 2, patient: 'María García', specialty: 'Medicina Estética', date: '2024-03-05 10:30', status: 'pendiente' },
        { id: 3, patient: 'Carlos López', specialty: 'Nutrición', date: '2024-03-05 11:15', status: 'cancelado' },
        { id: 4, patient: 'Ana Martínez', specialty: 'Ginecología', date: '2024-03-06 08:45', status: 'confirmado' },
        { id: 5, patient: 'Roberto Gómez', specialty: 'Cardiología', date: '2024-03-06 12:00', status: 'pendiente' },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmado': return '#10b981';
            case 'pendiente': return '#f59e0b';
            case 'cancelado': return '#ef4444';
            default: return 'white';
        }
    };

    return (
        <div style={{ paddingTop: '110px', minHeight: '100vh', background: '#020617', color: '#f8fafc' }}>
            <div className="container" style={{ padding: '40px 0' }}>

                {/* Header Section */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>Panel de Control</h1>
                        <p style={{ color: '#94a3b8', marginTop: '8px' }}>Gestión de turnos y pacientes • Santo Cuore B2B</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-glass" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                            <Download size={18} /> Exportar
                        </button>
                        <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>
                            Nuevo Turno
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '40px' }}>
                    {[
                        { label: 'Turnos Hoy', value: '24', icon: <Calendar />, color: 'var(--brand-teal)' },
                        { label: 'Nuevos Pacientes', value: '12', icon: <Users />, color: 'var(--brand-red)' },
                        { label: 'Pendientes', value: '8', icon: <Clock />, color: '#f59e0b' },
                        { label: 'Eficiencia', value: '94%', icon: <Activity />, color: '#10b981' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="glass-card"
                            style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}
                        >
                            <div style={{ padding: '12px', borderRadius: '12px', background: `${stat.color}15`, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div>
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{stat.label}</span>
                                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stat.value}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Table Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                    style={{ padding: 0, overflow: 'hidden' }}
                >
                    <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0 }}>Próximos Turnos</h3>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input
                                    type="text"
                                    placeholder="Buscar paciente..."
                                    style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px 8px 38px', fontSize: '0.9rem', color: 'white' }}
                                />
                            </div>
                            <button style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: '#94a3b8' }}>
                                <Filter size={18} />
                            </button>
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(255,255,255,0.02)', color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Paciente</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Especialidad</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Fecha y Hora</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Estado</th>
                                <th style={{ padding: '16px 24px', fontWeight: 600 }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((apt) => (
                                <tr key={apt.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '20px 24px', fontWeight: 500 }}>{apt.patient}</td>
                                    <td style={{ padding: '20px 24px', color: '#94a3b8' }}>{apt.specialty}</td>
                                    <td style={{ padding: '20px 24px', color: '#94a3b8' }}>{apt.date}</td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <span style={{
                                            padding: '4px 12px',
                                            borderRadius: '20px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            background: `${getStatusColor(apt.status)}15`,
                                            color: getStatusColor(apt.status),
                                            textTransform: 'capitalize'
                                        }}>
                                            {apt.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button style={{ color: '#10b981', background: 'none', border: 'none', cursor: 'pointer' }}><CheckCircle size={18} /></button>
                                            <button style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><XCircle size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
