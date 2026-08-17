import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Assuming path is correct

const Navigation = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <nav className="navbar navbar-expand-lg bg-light shadow-sm " style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
            <div className="container">
                <Link className="navbar-brand fw-bold" to="/" style={{ fontSize: '1.5rem' }}>
                    Dental Care
                </Link>
                <button
                    className="navbar-toggler border-0"
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-expanded={isOpen}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`}>
                    <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                        {user ? (
                            <>
                                {user.roleId === 1 ? (
                                    // Dentist navigation
                                    <>
                                        <li className="nav-item px-2">
                                            <Link className="nav-link fw-semibold" to={`/appointments`}>
                                                My Appointments
                                            </Link>
                                        </li>
                                        <li className="nav-item px-2">
                                            <Link className="nav-link fw-semibold" to="/dentists">
                                                Manage Dentists
                                            </Link>
                                        </li>
                                        <li className="nav-item px-2">
                                            <Link className="nav-link fw-semibold" to="/services">
                                                Manage Services
                                            </Link>
                                        </li>

                                    </>
                                ) : (
                                    // Patient navigation
                                    <>
                                        <li className="nav-item px-2">
                                            <Link className="nav-link fw-semibold" to="/schedule">
                                                Schedule Appointment
                                            </Link>
                                        </li>
                                        <li className="nav-item px-2">
                                            <Link className="nav-link fw-semibold" to={`/appointments`}>
                                                My Appointments
                                            </Link>
                                        </li>
                                    </>
                                )}
                            </>
                        ) : (
                            <>

                            </>
                        )}
                    </ul>
                    <div className="d-flex align-items-center">
                        {user ? (
                            <>
                                <span className="d-none d-xl-block me-3 fw-semibold">
                                    {user.firstName} {user.lastName}
                                </span>
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-outline-dark rounded-pill px-4 fw-semibold"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <div className="d-flex gap-2">
                                <Link
                                    to="/login"
                                    className="btn btn-outline-dark rounded-pill px-4 fw-semibold"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn btn-dark rounded-pill px-4 fw-semibold"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;