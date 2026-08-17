import type { Appointment, AppointmentStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import AppointmentCard from "./AppointmentCard"

export default function DentistDashboard({ appointments }: { appointments: Appointment[] }) {
    const { user } = useAuth();
    const today = new Date().toDateString();
    const todayAppointments = appointments.filter(a =>
        new Date(a.appointmentDate).toDateString() === today
    );
    const pendingAppointments = appointments.filter(a => a.status === 'P');
    const completedAppointments = appointments.filter(a => a.status === 'D');
    const upcomingAppointments = appointments.filter(a =>
        new Date(a.appointmentDate) > new Date() && a.status !== 'D' && a.status !== 'X'
    );

    const getStatusText = (status: AppointmentStatus): string => {
        switch (status) {
            case 'P':
                return 'Pending';
            case 'C':
                return 'Confirmed';
            case 'D':
                return 'Completed';
            case 'X':
                return 'Cancelled';
            default:
                return status;
        }
    };


    const getStatusColor = (status: AppointmentStatus): string => {
        switch (status) {
            case 'P':
                return 'text-warning';
            case 'C':
                return 'text-success';
            case 'D':
                return 'text-primary';
            case 'X':
                return 'text-danger';
            default:
                return 'text-muted';
        }
    };
    return (
        <div className="container py-4">
            {/* Welcome Section */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h2 className="h4 fw-bold mb-1">Welcome, Dr. {user?.firstName}</h2>
                                    <p className="text-muted mb-0">Here's your daily overview</p>
                                </div>
                                <Link to="/appointments" className="btn btn-sm btn-dark rounded-pill px-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar-check me-2" viewBox="0 0 16 16">
                                        <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                                    </svg>
                                    View Appointments
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="row g-4 mb-4">
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center mb-3">
                                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-calendar-check text-primary" viewBox="0 0 16 16">
                                        <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                                    </svg>
                                </div>
                                <div>
                                    <h6 className="text-muted mb-1">Today's Appointments</h6>
                                    <h3 className="h4 fw-bold mb-0">{todayAppointments.length}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center mb-3">
                                <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-clock text-warning" viewBox="0 0 16 16">
                                        <path d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z" />
                                        <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0" />
                                    </svg>
                                </div>
                                <div>
                                    <h6 className="text-muted mb-1">Pending</h6>
                                    <h3 className="h4 fw-bold mb-0 text-warning">{pendingAppointments.length}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center mb-3">
                                <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-check-circle text-success" viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                        <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
                                    </svg>
                                </div>
                                <div>
                                    <h6 className="text-muted mb-1">Completed</h6>
                                    <h3 className="h4 fw-bold mb-0 text-success">{completedAppointments.length}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card border-0 shadow-sm rounded-4 h-100">
                        <div className="card-body p-4">
                            <div className="d-flex align-items-center mb-3">
                                <div className="bg-info bg-opacity-10 rounded-circle p-3 me-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-calendar-week text-info" viewBox="0 0 16 16">
                                        <path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm-5 3a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5zm3 0a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5z" />
                                        <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                                    </svg>
                                </div>
                                <div>
                                    <h6 className="text-muted mb-1">Upcoming</h6>
                                    <h3 className="h4 fw-bold mb-0 text-info">{upcomingAppointments.length}</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's Schedule */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body p-4">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h3 className="h5 fw-bold mb-0">Today's Schedule</h3>
                                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                            {todayAppointments.length > 0 ? (
                                <div className="row">
                                    {todayAppointments.map(appointment => (
                                        <div key={appointment.appointmentId} className="col-md-6 mb-3">
                                            <AppointmentCard appointment={appointment} isDentist />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-muted mb-0">No appointments scheduled for today</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};