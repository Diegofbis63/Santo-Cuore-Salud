import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Calendar, Activity, CheckCircle, Clock,
    XCircle, Search, Filter, Download, Plus, Edit3,
    LogOut, X, Save, Eye, EyeOff, Lock, User
} from 'lucide-react';
import * as XLSX from 'xlsx';

// ─── AUTH ───────────────────────────────────────────────────────────────────
const ADMIN_USER = 'admin.santocuore';
const ADMIN_PASS = 'SC#2024$Salud!Admin';

// ─── TYPES ──────────────────────────────────────────────────────────────────
type Status = 'confirmado' | 'pendiente' | 'cancelado';
interface Appointment {
    id: number;
    patient: string;
    specialty: string;
    date: string;
    status: Status;
    phone: string;
    email: string;
}

const SPECIALTIES = [
    'Cardiología', 'Medicina Estética', 'Nutrición',
    'Ginecología', 'Clínica General', 'Traumatología'
];

const initialAppointments: Appointment[] = [
    { id: 1, patient: 'Juan Pérez', specialty: 'Cardiología', date: '2025-03-05 09:00', status: 'confirmado', phone: '+54 9 351 111 0001', email: 'juan@email.com' },
    { id: 2, patient: 'María García', specialty: 'Medicina Estética', date: '2025-03-05 10:30', status: 'pendiente', phone: '+54 9 351 222 0002', email: 'maria@email.com' },
    { id: 3, patient: 'Carlos López', specialty: 'Nutrición', date: '2025-03-05 11:15', status: 'cancelado', phone: '+54 9 351 333 0003', email: 'carlos@email.com' },
    { id: 4, patient: 'Ana Martínez', specialty: 'Ginecología', date: '2025-03-06 08:45', status: 'confirmado', phone: '+54 9 351 444 0004', email: 'ana@email.com' },
    { id: 5, patient: 'Roberto Gómez', specialty: 'Cardiología', date: '2025-03-06 12:00', status: 'pendiente', phone: '+54 9 351 555 0005', email: 'roberto@email.com' },
    { id: 6, patient: 'Lucía Torres', specialty: 'Clínica General', date: '2025-03-06 14:00', status: 'pendiente', phone: '+54 9 351 666 0006', email: 'lucia@email.com' },
    { id: 7, patient: 'Diego Fernández', specialty: 'Traumatología', date: '2025-03-07 09:30', status: 'confirmado', phone: '+54 9 351 777 0007', email: 'diego@email.com' },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const statusColor: Record<Status, string> = {
    confirmado: '#10b981',
    pendiente: '#f59e0b',
    cancelado: '#ef4444',
};

const statusBg: Record<Status, string> = {
    confirmado: 'rgba(16,185,129,0.12)',
    pendiente: 'rgba(245,158,11,0.12)',
    cancelado: 'rgba(239,68,68,0.12)',
};

const today = new Date().toISOString().split('T')[0];

function exportToExcel(appointments: Appointment[]) {
    const data = appointments.map(a => ({
        'Nro. Turno': a.id,
        'Paciente': a.patient,
        'Especialidad': a.specialty,
        'Fecha y Hora': a.date,
        'Estado': a.status.charAt(0).toUpperCase() + a.status.slice(1),
        'Teléfono': a.phone,
        'Email': a.email
    }));

    const ws = XLSX.utils.json_to_sheet(data);

    // Ajustar anchos de columnas automáticamente al exportar
    ws['!cols'] = [
        { wch: 12 }, // Nro Turno
        { wch: 25 }, // Paciente
        { wch: 20 }, // Especialidad
        { wch: 18 }, // Fecha y Hora
        { wch: 15 }, // Estado
        { wch: 22 }, // Teléfono
        { wch: 30 }  // Email
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Turnos");

    XLSX.writeFile(wb, `turnos_santo_cuore_${today}.xlsx`);
}

// ─── LOGIN SCREEN ────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }: { onLogin: () => void }) {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            if (user === ADMIN_USER && pass === ADMIN_PASS) {
                onLogin();
            } else {
                setError('Usuario o contraseña incorrectos.');
                setLoading(false);
            }
        }, 600);
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#020617', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '20px', padding: '48px', width: '100%', maxWidth: '400px'
                }}
            >
                <div style={{ textAlign: 'center', marginBottom: '36px' }}>
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '14px',
                        background: 'linear-gradient(135deg,var(--brand-teal),var(--brand-red))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <Lock size={24} color="white" />
                    </div>
                    <h2 style={{ color: '#f8fafc', fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
                        Panel Administrativo
                    </h2>
                    <p style={{ color: '#64748b', marginTop: '8px', fontSize: '0.9rem' }}>
                        Santo Cuore — Acceso Restringido
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ position: 'relative' }}>
                        <User size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input
                            type="text"
                            placeholder="Usuario"
                            value={user}
                            onChange={e => setUser(e.target.value)}
                            style={{
                                width: '100%', background: '#0f172a',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px', padding: '12px 12px 12px 42px',
                                color: 'white', fontSize: '0.95rem', boxSizing: 'border-box'
                            }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input
                            type={showPass ? 'text' : 'password'}
                            placeholder="Contraseña"
                            value={pass}
                            onChange={e => setPass(e.target.value)}
                            style={{
                                width: '100%', background: '#0f172a',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '10px', padding: '12px 42px 12px 42px',
                                color: 'white', fontSize: '0.95rem', boxSizing: 'border-box'
                            }}
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)}
                            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    {error && (
                        <p style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', margin: 0 }}>
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={loading} className="btn-primary" style={{
                        padding: '13px', fontSize: '0.95rem', marginTop: '8px',
                        opacity: loading ? 0.7 : 1
                    }}>
                        {loading ? 'Verificando...' : 'Ingresar al Panel'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}

// ─── MODAL WRAPPER ───────────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
        }} onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={e => e.stopPropagation()}
                style={{
                    background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px', width: '100%', maxWidth: '520px',
                    maxHeight: '90vh', overflowY: 'auto'
                }}
            >
                <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '24px 24px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)'
                }}>
                    <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1.1rem' }}>{title}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>
                <div style={{ padding: '24px' }}>{children}</div>
            </motion.div>
        </div>
    );
}

const inputStyle: React.CSSProperties = {
    width: '100%', background: '#020617',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px', padding: '10px 12px',
    color: 'white', fontSize: '0.9rem', boxSizing: 'border-box'
};

const labelStyle: React.CSSProperties = {
    display: 'block', color: '#94a3b8', fontSize: '0.8rem',
    marginBottom: '6px', fontWeight: 500
};

// ─── MAIN DASHBOARD ──────────────────────────────────────────────────────────
const AdminDashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('todos');
    const [showFilter, setShowFilter] = useState(false);

    // Modals
    const [editTarget, setEditTarget] = useState<Appointment | null>(null);
    const [newTurno, setNewTurno] = useState(false);

    // Edit form state
    const [editForm, setEditForm] = useState<Partial<Appointment>>({});
    // New turno form state
    const [newForm, setNewForm] = useState({ patient: '', specialty: SPECIALTIES[0], date: '', status: 'pendiente' as Status, phone: '', email: '' });

    // ── FILTER + SEARCH ───────────────────────────────────────────────────────
    const filtered = useMemo(() => appointments.filter(a => {
        const matchSearch = a.patient.toLowerCase().includes(search.toLowerCase()) ||
            a.specialty.toLowerCase().includes(search.toLowerCase());

        let matchStatus = true;
        if (filterStatus === 'hoy') {
            matchStatus = a.date.startsWith(today);
        } else if (filterStatus !== 'todos') {
            matchStatus = a.status === filterStatus;
        }

        return matchSearch && matchStatus;
    }), [appointments, search, filterStatus]);

    if (!isAuthenticated) {
        return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
    }

    // ── STATS ────────────────────────────────────────────────────────────────
    const todayTurnos = appointments.filter(a => a.date.startsWith(today)).length;
    const pendientes = appointments.filter(a => a.status === 'pendiente').length;
    const confirmados = appointments.filter(a => a.status === 'confirmado').length;
    const eficiencia = appointments.length > 0
        ? Math.round((confirmados / appointments.length) * 100)
        : 0;

    // ── ACTIONS ───────────────────────────────────────────────────────────────
    const setStatus = (id: number, status: Status) =>
        setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));

    const openEdit = (apt: Appointment) => {
        setEditForm({ ...apt });
        setEditTarget(apt);
    };

    const saveEdit = () => {
        if (!editTarget) return;
        setAppointments(prev => prev.map(a => a.id === editTarget.id ? { ...a, ...editForm } as Appointment : a));
        setEditTarget(null);
    };

    const createTurno = () => {
        if (!newForm.patient || !newForm.date) return;
        const id = Math.max(0, ...appointments.map(a => a.id)) + 1;
        setAppointments(prev => [...prev, { ...newForm, id } as Appointment]);
        setNewTurno(false);
        setNewForm({ patient: '', specialty: SPECIALTIES[0], date: '', status: 'pendiente', phone: '', email: '' });
    };

    return (
        <div style={{ paddingTop: '110px', minHeight: '100vh', background: '#020617', color: '#f8fafc' }}>
            <div className="container" style={{ padding: '40px 0' }}>

                {/* Header */}
                <div className="admin-header">
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>Panel de Control</h1>
                        <p style={{ color: '#94a3b8', marginTop: '8px' }}>Gestión de turnos y pacientes • Santo Cuore</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-glass" onClick={() => exportToExcel(filtered)}
                            style={{ padding: '10px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Download size={18} /> Exportar Excel
                        </button>
                        <button className="btn-primary" onClick={() => setNewTurno(true)}
                            style={{ padding: '10px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={18} /> Nuevo Turno
                        </button>
                        <button onClick={() => setIsAuthenticated(false)}
                            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 16px', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                            <LogOut size={16} /> Salir
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="admin-stats-grid">
                    {([
                        { id: 'hoy', label: 'Turnos Hoy', value: String(todayTurnos), Icon: Calendar, color: 'var(--brand-teal)' },
                        { id: 'todos', label: 'Total Pacientes', value: String(appointments.length), Icon: Users, color: 'var(--brand-red)' },
                        { id: 'pendiente', label: 'Pendientes', value: String(pendientes), Icon: Clock, color: '#f59e0b' },
                        { id: 'confirmado', label: 'Eficiencia', value: `${eficiencia}%`, Icon: Activity, color: '#10b981' },
                    ] as const).map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="glass-card"
                            onClick={() => setFilterStatus(stat.id)}
                            style={{
                                padding: '24px', display: 'flex', alignItems: 'center', gap: '20px',
                                cursor: 'pointer',
                                border: filterStatus === stat.id ? `1px solid ${stat.color}` : '1px solid rgba(255,255,255,0.05)',
                                background: filterStatus === stat.id ? `rgba(255,255,255,0.04)` : undefined,
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
                        >
                            <div style={{ padding: '12px', borderRadius: '12px', background: `${stat.color}15`, color: stat.color }}>
                                <stat.Icon size={22} />
                            </div>
                            <div>
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{stat.label}</span>
                                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{stat.value}</h3>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Table */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                    className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>

                    <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                        <h3 style={{ margin: 0 }}>Próximos Turnos <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.9rem' }}>({filtered.length} resultados)</span></h3>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {/* Search */}
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input
                                    type="text"
                                    placeholder="Buscar paciente o especialidad..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px 8px 36px', fontSize: '0.875rem', color: 'white', width: '240px' }}
                                />
                            </div>
                            {/* Filter dropdown */}
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={() => setShowFilter(!showFilter)}
                                    style={{ background: filterStatus !== 'todos' ? 'rgba(99,102,241,0.2)' : '#0f172a', border: filterStatus !== 'todos' ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '8px 12px', color: filterStatus !== 'todos' ? '#818cf8' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem' }}>
                                    <Filter size={16} /> {filterStatus === 'todos' ? 'Filtrar' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                                </button>
                                <AnimatePresence>
                                    {showFilter && (
                                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                            style={{ position: 'absolute', top: '44px', right: 0, background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px', zIndex: 100, minWidth: '160px' }}>
                                            {['todos', 'hoy', 'pendiente', 'confirmado', 'cancelado'].map(s => (
                                                <button key={s} onClick={() => { setFilterStatus(s); setShowFilter(false); }}
                                                    style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', background: filterStatus === s ? 'rgba(255,255,255,0.05)' : 'none', border: 'none', color: filterStatus === s ? 'white' : '#94a3b8', borderRadius: '6px', cursor: 'pointer', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                                                    {s}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <div className="table-responsive">
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.02)', color: '#64748b', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                                    {['Paciente', 'Especialidad', 'Fecha y Hora', 'Estado', 'Acciones'].map(h => (
                                        <th key={h} style={{ padding: '14px 24px', fontWeight: 600 }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#475569' }}>
                                            No se encontraron turnos.
                                        </td>
                                    </tr>
                                ) : filtered.map(apt => (
                                    <tr key={apt.id}
                                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                                        <td style={{ padding: '18px 24px', fontWeight: 500 }}>{apt.patient}</td>
                                        <td style={{ padding: '18px 24px', color: '#94a3b8' }}>{apt.specialty}</td>
                                        <td style={{ padding: '18px 24px', color: '#94a3b8', fontFamily: 'monospace', fontSize: '0.875rem' }}>{apt.date}</td>
                                        <td style={{ padding: '18px 24px' }}>
                                            <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600, background: statusBg[apt.status], color: statusColor[apt.status], textTransform: 'capitalize' }}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '18px 24px' }}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                {/* Confirm */}
                                                <button title="Confirmar turno" onClick={() => setStatus(apt.id, 'confirmado')}
                                                    style={{ color: '#10b981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '7px', padding: '6px 8px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center' }}>
                                                    <CheckCircle size={16} />
                                                </button>
                                                {/* Cancel */}
                                                <button title="Cancelar turno" onClick={() => setStatus(apt.id, 'cancelado')}
                                                    style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '7px', padding: '6px 8px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center' }}>
                                                    <XCircle size={16} />
                                                </button>
                                                {/* Edit */}
                                                <button title="Editar turno" onClick={() => openEdit(apt)}
                                                    style={{ color: '#818cf8', background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.25)', borderRadius: '7px', padding: '6px 8px', cursor: 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center' }}>
                                                    <Edit3 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>
            </div>

            {/* ── EDIT MODAL ── */}
            <AnimatePresence>
                {editTarget && (
                    <Modal title={`Editar Turno — ${editTarget.patient}`} onClose={() => setEditTarget(null)}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={labelStyle}>Nombre del Paciente</label>
                                <input style={inputStyle} value={editForm.patient || ''} onChange={e => setEditForm(p => ({ ...p, patient: e.target.value }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>Especialidad</label>
                                <select style={{ ...inputStyle, appearance: 'none' }} value={editForm.specialty || ''} onChange={e => setEditForm(p => ({ ...p, specialty: e.target.value }))}>
                                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Fecha y Hora</label>
                                <input style={inputStyle} type="datetime-local" value={editForm.date?.replace(' ', 'T') || ''} onChange={e => setEditForm(p => ({ ...p, date: e.target.value.replace('T', ' ') }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>Estado</label>
                                <select style={{ ...inputStyle, appearance: 'none' }} value={editForm.status || 'pendiente'} onChange={e => setEditForm(p => ({ ...p, status: e.target.value as Status }))}>
                                    <option value="pendiente">Pendiente</option>
                                    <option value="confirmado">Confirmado</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Teléfono</label>
                                <input style={inputStyle} value={editForm.phone || ''} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input style={inputStyle} type="email" value={editForm.email || ''} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button onClick={() => setEditTarget(null)} className="btn-glass" style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}>Cancelar</button>
                                <button onClick={saveEdit} className="btn-primary" style={{ flex: 1, padding: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    <Save size={16} /> Guardar Cambios
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            {/* ── NUEVO TURNO MODAL ── */}
            <AnimatePresence>
                {newTurno && (
                    <Modal title="Nuevo Turno" onClose={() => setNewTurno(false)}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={labelStyle}>Nombre del Paciente *</label>
                                <input style={inputStyle} placeholder="Ej: Valentina Rodríguez" value={newForm.patient} onChange={e => setNewForm(p => ({ ...p, patient: e.target.value }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>Especialidad *</label>
                                <select style={{ ...inputStyle, appearance: 'none' }} value={newForm.specialty} onChange={e => setNewForm(p => ({ ...p, specialty: e.target.value }))}>
                                    {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Fecha y Hora *</label>
                                <input style={inputStyle} type="datetime-local" value={newForm.date.replace(' ', 'T')} onChange={e => setNewForm(p => ({ ...p, date: e.target.value.replace('T', ' ') }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>Estado Inicial</label>
                                <select style={{ ...inputStyle, appearance: 'none' }} value={newForm.status} onChange={e => setNewForm(p => ({ ...p, status: e.target.value as Status }))}>
                                    <option value="pendiente">Pendiente</option>
                                    <option value="confirmado">Confirmado</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Teléfono</label>
                                <input style={inputStyle} placeholder="+54 9 351 000 0000" value={newForm.phone} onChange={e => setNewForm(p => ({ ...p, phone: e.target.value }))} />
                            </div>
                            <div>
                                <label style={labelStyle}>Email</label>
                                <input style={inputStyle} type="email" placeholder="paciente@email.com" value={newForm.email} onChange={e => setNewForm(p => ({ ...p, email: e.target.value }))} />
                            </div>
                            {(!newForm.patient || !newForm.date) && (
                                <p style={{ color: '#f59e0b', fontSize: '0.8rem', margin: 0 }}>* Completá al menos Nombre y Fecha para continuar.</p>
                            )}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button onClick={() => setNewTurno(false)} className="btn-glass" style={{ flex: 1, padding: '10px', fontSize: '0.9rem' }}>Cancelar</button>
                                <button onClick={createTurno} disabled={!newForm.patient || !newForm.date} className="btn-primary"
                                    style={{ flex: 1, padding: '10px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: (!newForm.patient || !newForm.date) ? 0.5 : 1 }}>
                                    <Plus size={16} /> Crear Turno
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminDashboard;
