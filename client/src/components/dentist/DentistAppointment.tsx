import { useState, useEffect } from 'react';
import type { Appointment, AppointmentStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getDentistAppointment, updateAppointment } from "../../apis/services"
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import AppointmentCard from '../shared/AppointmentCard';

const DentistAppointment = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list'); // 'list' or 'calendar'
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        const fetchAppointments = async () => {
            try {
                if (!user) return;
                const response = await getDentistAppointment(user.userId);
                setAppointments(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching appointments:', error);
                setLoading(false);
            }
        };

        fetchAppointments();
    }, [user]);

    const handleAppointmentAction = async (appointmentId: number, action: 'confirm' | 'cancel') => {
        try {
            if (user?.roleId === 2 && action !== 'cancel') { // Patient can only cancel
                setNotification({ message: 'Patients can only cancel appointments', type: 'error' });
                return;
            }

            const newStatus: AppointmentStatus = action === 'confirm' ? 'C' : 'X';
            await updateAppointment(appointmentId, { status: newStatus });

            setAppointments(prevAppointments =>
                prevAppointments.map(appointment =>
                    appointment.appointmentId === appointmentId
                        ? { ...appointment, status: newStatus }
                        : appointment
                )
            );

            setNotification({
                message: `Appointment ${action === 'confirm' ? 'confirmed' : 'cancelled'} successfully`,
                type: 'success'
            });
        } catch (error) {
            setNotification({
                message: `Failed to ${action} appointment`,
                type: 'error'
            });
        }
    };

    const getAppointmentsForDate = (date: Date): Appointment[] => {
        return appointments.filter(appointment => {
            const appointmentDate = new Date(appointment.appointmentDate);
            return appointmentDate.toDateString() === date.toDateString();
        });
    };

    const getStatusColor = (status: AppointmentStatus): string => {
        switch (status) {
            case 'P':
                return 'bg-warning';
            case 'C':
                return 'bg-success';
            case 'D':
                return 'bg-primary';
            case 'X':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification(null);
        }, 3000);
    };

    const tileContent = ({ date, view }: { date: Date; view: string }) => {
        if (view === 'month') {
            const dayAppointments = getAppointmentsForDate(date);
            if (dayAppointments.length > 0) {
                return (
                    <div className="d-flex flex-wrap gap-1 justify-content-center mt-1">
                        {dayAppointments.map(appointment => {
                            const appointmentTime = new Date(appointment.appointmentDate).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true
                            });
                            return (
                                <div
                                    key={appointment.appointmentId}
                                    className={`rounded-pill ${getStatusColor(appointment.status)}`}
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        cursor: 'pointer'
                                    }}
                                    title={`${appointment.patient?.firstName ?? 'Patient'} ${appointment.patient?.lastName ?? ''}
Time: ${appointmentTime}
Status: ${appointment.status === 'P' ? 'Pending' :
                                            appointment.status === 'C' ? 'Confirmed' :
                                                appointment.status === 'D' ? 'Completed' :
                                                    'Cancelled'
                                        }`}
                                />
                            );
                        })}
                    </div>
                );
            }
        }
        return null;
    };

    const AppointmentListForDate = ({ date }: { date: Date }) => {
        const dayAppointments = getAppointmentsForDate(date);

        if (dayAppointments.length === 0) {
            return (
                <div className="text-center text-muted py-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-calendar-x mb-3" viewBox="0 0 16 16">
                        <path d="M6.146 7.146a.5.5 0 0 1 .708 0L8 8.293l1.146-1.147a.5.5 0 1 1 .708.708L8.707 9l1.147 1.146a.5.5 0 0 1-.708.708L8 9.707l-1.146 1.147a.5.5 0 0 1-.708-.708L7.293 9 6.146 7.854a.5.5 0 0 1 0-.708" />
                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                    </svg>
                    <h5>No Appointments</h5>
                    <p>No appointments scheduled for this date</p>
                </div>
            );
        }

        return (
            <div className="mt-4">
                <h5 className="mb-3">Appointments for {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h5>
                {dayAppointments.map(appointment => (
                    <AppointmentCard key={appointment.appointmentId} appointment={appointment} showNotification={showNotification} isDentist={user?.roleId === 1} onAction={handleAppointmentAction} />
                ))}
            </div>
        );
    };

    return (
        <div className="container py-4">
            <div className="row g-4">
                {/* View Mode Toggle */}
                <div className="col-12">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
                        <h2 className="fw-bold mb-0">
                            {user?.roleId === 1 ? 'My Appointments' : 'My Scheduled Appointments'}
                        </h2>
                        <div className="btn-group">
                            <button
                                className={`btn btn-sm ${viewMode === 'list' ? 'btn-dark' : 'btn-outline-dark'} rounded-pill px-3 py-1`}
                                onClick={() => setViewMode('list')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-list me-1" viewBox="0 0 16 16">
                                    <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z" />
                                </svg>
                                List
                            </button>
                            <button
                                className={`btn btn-sm ${viewMode === 'calendar' ? 'btn-dark' : 'btn-outline-dark'} rounded-pill px-3 py-1`}
                                onClick={() => setViewMode('calendar')}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar3 me-1" viewBox="0 0 16 16">
                                    <path d="M14 0H2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM1 3.857C1 3.384 1.448 3 2 3h12c.552 0 1 .384 1 .857v10.286c0 .473-.448.857-1 .857H2c-.552 0-1-.384-1-.857V3.857z" />
                                    <path d="M6.5 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-9 3a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm3 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
                                </svg>
                                Calendar
                            </button>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="col-12">
                        <div className="d-flex justify-content-center py-5">
                            <div className="spinner-border text-dark" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                        </div>
                    </div>
                ) : viewMode === 'list' ? (
                    <>
                        {/* List View */}
                        <div className="col-12 col-lg-8">
                            {appointments.length > 0 ? (
                                appointments.map(appointment => (
                                    <AppointmentCard
                                        key={appointment.appointmentId}
                                        appointment={appointment}
                                        onAction={handleAppointmentAction}
                                        isDentist={user?.roleId === 1}
                                    />
                                ))
                            ) : (
                                <div className="card border-0 shadow-sm rounded-4">
                                    <div className="card-body p-4 p-md-5 text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-calendar-x mb-3 text-muted" viewBox="0 0 16 16">
                                            <path d="M6.146 7.146a.5.5 0 0 1 .708 0L8 8.293l1.146-1.147a.5.5 0 1 1 .708.708L8.707 9l1.147 1.146a.5.5 0 0 1-.708.708L8 9.707l-1.146 1.147a.5.5 0 0 1-.708-.708L7.293 9 6.146 7.854a.5.5 0 0 1 0-.708z" />
                                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
                                        </svg>
                                        <h4 className="fw-bold mb-2">No Appointments</h4>
                                        <p className="text-muted mb-0">You don't have any appointments scheduled.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {/* Statistics for List View */}
                        <div className="col-12 col-lg-4">
                            <div className="card border-0 shadow-sm rounded-4 sticky-lg-top" style={{ top: '1rem' }}>
                                <div className="card-body p-3 p-md-4">
                                    <h5 className="fw-bold mb-4">Appointment Statistics</h5>
                                    <div className="d-flex flex-column gap-3">
                                        <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4">
                                            <div className="d-flex align-items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-calendar-check text-primary me-3" viewBox="0 0 16 16">
                                                    <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                                                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                                                </svg>
                                                <div>
                                                    <div className="text-muted small">Total Appointments</div>
                                                    <div className="fw-bold h5 mb-0">{appointments.length}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4">
                                            <div className="d-flex align-items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-check-circle text-success me-3" viewBox="0 0 16 16">
                                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                                    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
                                                </svg>
                                                <div>
                                                    <div className="text-muted small">Confirmed</div>
                                                    <div className="fw-bold h5 mb-0 text-success">
                                                        {appointments.filter(a => a.status === 'C').length}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4">
                                            <div className="d-flex align-items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-clock text-warning me-3" viewBox="0 0 16 16">
                                                    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
                                                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0" />
                                                </svg>
                                                <div>
                                                    <div className="text-muted small">Pending</div>
                                                    <div className="fw-bold h5 mb-0 text-warning">
                                                        {appointments.filter(a => a.status === 'P').length}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4">
                                            <div className="d-flex align-items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-check-circle-fill text-primary me-3" viewBox="0 0 16 16">
                                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
                                                </svg>
                                                <div>
                                                    <div className="text-muted small">Completed</div>
                                                    <div className="fw-bold h5 mb-0 text-primary">
                                                        {appointments.filter(a => a.status === 'D').length}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4">
                                            <div className="d-flex align-items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-x-circle text-danger me-3" viewBox="0 0 16 16">
                                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                                                </svg>
                                                <div>
                                                    <div className="text-muted small">Cancelled</div>
                                                    <div className="fw-bold h5 mb-0 text-danger">
                                                        {appointments.filter(a => a.status === 'X').length}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Calendar View */}
                        <div className="col-12 col-lg-9">
                            <div className="card border-0 shadow-sm rounded-4 mb-4">
                                <div className="card-body p-3 p-md-4">
                                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
                                        <h5 className="fw-bold mb-0">Appointment Calendar</h5>
                                        <div className="d-flex flex-wrap gap-2">
                                            <div className="d-flex align-items-center">
                                                <div className="rounded-pill bg-warning me-2" style={{ width: '12px', height: '12px' }}></div>
                                                <span className="small">Pending</span>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <div className="rounded-pill bg-success me-2" style={{ width: '12px', height: '12px' }}></div>
                                                <span className="small">Confirmed</span>
                                            </div>

                                            <div className="d-flex align-items-center">
                                                <div className="rounded-pill bg-danger me-2" style={{ width: '12px', height: '12px' }}></div>
                                                <span className="small">Cancelled</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Calendar
                                        onChange={(value: unknown) => { if (value instanceof Date) setSelectedDate(value); }}
                                        value={selectedDate}
                                        tileContent={tileContent}
                                        className="border-0 w-100"
                                        tileClassName={({ date }: { date: Date }) => {
                                            const dayAppointments = getAppointmentsForDate(date);
                                            return dayAppointments.length > 0 ? 'has-appointments' : '';
                                        }}
                                    />
                                </div>
                            </div>
                            <AppointmentListForDate date={selectedDate} />
                        </div>
                        {/* Statistics for Calendar View */}
                        <div className="col-12 col-lg-3">
                            <div className="card border-0 shadow-sm rounded-4 sticky-lg-top" style={{ top: '1rem' }}>
                                <div className="card-body p-3 p-md-4">
                                    <h5 className="fw-bold mb-4">Appointment Statistics</h5>
                                    <div className="d-flex flex-column gap-3">
                                        <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4">
                                            <div className="d-flex align-items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-calendar-check text-primary me-3" viewBox="0 0 16 16">
                                                    <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                                                    <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                                                </svg>
                                                <div>
                                                    <div className="text-muted small">Total Appointments</div>
                                                    <div className="fw-bold h5 mb-0">{appointments.length}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4">
                                            <div className="d-flex align-items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-check-circle text-success me-3" viewBox="0 0 16 16">
                                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                                    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
                                                </svg>
                                                <div>
                                                    <div className="text-muted small">Confirmed</div>
                                                    <div className="fw-bold h5 mb-0 text-success">
                                                        {appointments.filter(a => a.status === 'C').length}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4">
                                            <div className="d-flex align-items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-clock text-warning me-3" viewBox="0 0 16 16">
                                                    <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
                                                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0" />
                                                </svg>
                                                <div>
                                                    <div className="text-muted small">Pending</div>
                                                    <div className="fw-bold h5 mb-0 text-warning">
                                                        {appointments.filter(a => a.status === 'P').length}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded-4">
                                            <div className="d-flex align-items-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-x-circle text-danger me-3" viewBox="0 0 16 16">
                                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                                                </svg>
                                                <div>
                                                    <div className="text-muted small">Cancelled</div>
                                                    <div className="fw-bold h5 mb-0 text-danger">
                                                        {appointments.filter(a => a.status === 'X').length}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Notification Component */}
            {notification && (
                <div
                    className={`position-fixed bottom-0 start-0 m-3 p-3 rounded-4 shadow-sm ${notification.type === 'success' ? 'bg-success' : 'bg-danger'} text-white`}
                    style={{ zIndex: 1000, minWidth: '300px', maxWidth: '90%' }}
                >
                    <div className="d-flex align-items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            fill="currentColor"
                            className="bi bi-check-circle me-2"
                            viewBox="0 0 16 16"
                        >
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                            <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
                        </svg>
                        <span className="text-break">{notification.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DentistAppointment;