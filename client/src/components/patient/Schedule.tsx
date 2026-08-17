import { useState, useEffect } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { DentalService, Dentist } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getDentist, saveAppointment, getServices } from '../../apis/services';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const Schedule = () => {
    const [formData, setFormData] = useState({
        appointmentDate: '',
        dentistUserId: '',
        serviceId: '',
        notes: ''
    });
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [dentists, setDentists] = useState<Dentist[]>([]);
    const [services, setServices] = useState<DentalService[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dentistsRes, servicesRes] = await Promise.all([
                    getDentist(),
                    getServices()
                ]);
                setDentists(dentistsRes.data);
                setServices(servicesRes.data);
            } catch (error) {
                setError('Failed to fetch data');
            }
        };
        fetchData();
    }, []);

    const handleChange = (e: ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleDateChange = (date: Date | null) => {
        setStartDate(date);
        if (date) {
            setFormData(prev => ({
                ...prev,
                appointmentDate: date.toISOString()
            }));
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (!user) throw new Error('Please sign in again.');
            if (!startDate) throw new Error('Please select an appointment date and time.');
            const appointmentData = {
                appointmentDate: formData.appointmentDate,
                dentistUserId: parseInt(formData.dentistUserId),
                serviceId: parseInt(formData.serviceId),
                patientUserId: user.userId,
                notes: formData.notes,
                status: 'P'
            };

            await saveAppointment(appointmentData);

            setSuccess('Appointment scheduled successfully!');
            setFormData({
                appointmentDate: '',
                dentistUserId: '',
                serviceId: '',
                notes: ''
            });
            setStartDate(null);
        } catch (error) {
            console.error(error);
            setError(error instanceof Error ? error.message : 'Failed to schedule appointment');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5 mt-5">
            <div className="row justify-content-center">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body p-5">
                            <div className="text-center mb-5">
                                <h2 className="fw-bold mb-3">Schedule Appointment</h2>
                                <p className="text-muted mb-0">Book your dental appointment with ease</p>
                            </div>

                            {error && (
                                <div className="alert alert-danger rounded-4 border-0 shadow-sm mb-4" role="alert">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-exclamation-circle me-2" viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success rounded-4 border-0 shadow-sm mb-4" role="alert">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle me-2" viewBox="0 0 16 16">
                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                        <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05" />
                                    </svg>
                                    {success}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                                <div className="mb-4">
                                    <label htmlFor="appointmentDate" className="form-label fw-medium text-muted">Appointment Date and Time</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-calendar" viewBox="0 0 16 16">
                                                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z" />
                                            </svg>
                                        </span>
                                        <DatePicker
                                            selected={startDate}
                                            onChange={handleDateChange}
                                            showTimeSelect
                                            dateFormat="MMMM d, yyyy h:mm aa"
                                            className="form-control border-0 bg-light rounded-end"
                                            placeholderText="Select date and time"
                                            minDate={new Date()}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="dentistUserId" className="form-label fw-medium text-muted">Select Dentist</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-badge" viewBox="0 0 16 16">
                                                <path d="M6.5 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1zM11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                                                <path d="M4.5 0A2.5 2.5 0 0 0 2 2.5V14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2.5A2.5 2.5 0 0 0 11.5 0zM3 2.5A1.5 1.5 0 0 1 4.5 1h7A1.5 1.5 0 0 1 13 2.5v10.795a4.2 4.2 0 0 0-.776-.492C11.392 12.387 10.063 12 8 12s-3.392.387-4.224.803a4.2 4.2 0 0 0-.776.492z" />
                                            </svg>
                                        </span>
                                        <select
                                            className="form-select border-0 bg-light rounded-end"
                                            id="dentistUserId"
                                            name="dentistUserId"
                                            value={formData.dentistUserId}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select a Dentist</option>
                                            {dentists.length > 0 && dentists.map(dentist => (
                                                <option key={dentist.userId} value={dentist.userId}>
                                                    Dr. {dentist.firstName} {dentist.lastName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="serviceId" className="form-label fw-medium text-muted">Select Service</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-clipboard2-pulse" viewBox="0 0 16 16">
                                                <path d="M9.5 0a.5.5 0 0 1 .5.5.5.5 0 0 0 .5.5.5.5 0 0 1 .5.5V2a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 5 2v-.5a.5.5 0 0 1 .5-.5.5.5 0 0 0 .5-.5.5.5 0 0 1 .5-.5z" />
                                                <path d="M3 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5" />
                                                <path d="M3.5 1h9a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-9a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5" />
                                                <path d="M2.5 4a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V4.5a.5.5 0 0 0-.5-.5zm-1 3a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V7.5a.5.5 0 0 0-.5-.5zm2 0a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V7.5a.5.5 0 0 0-.5-.5zm2 0a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V7.5a.5.5 0 0 0-.5-.5zm2 0a.5.5 0 0 0-.5.5v1.5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V7.5a.5.5 0 0 0-.5-.5z" />
                                            </svg>
                                        </span>
                                        <select
                                            className="form-select border-0 bg-light rounded-end"
                                            id="serviceId"
                                            name="serviceId"
                                            value={formData.serviceId}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="">Select a Service</option>
                                            {services.length > 0 && services.map(service => (
                                                <option key={service.ServiceId} value={service.ServiceId}>
                                                    {service.Description}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="notes" className="form-label fw-medium text-muted">Notes</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                                                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325" />
                                            </svg>
                                        </span>
                                        <textarea
                                            className="form-control border-0 bg-light rounded-end"
                                            id="notes"
                                            name="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            rows={3}
                                            placeholder="Any specific concerns or notes for the dentist..."
                                        />
                                    </div>
                                </div>

                                <div className="d-grid">
                                    <button
                                        type="submit"
                                        className="btn btn-dark rounded-pill py-3 px-4 fw-medium"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Scheduling...
                                            </>
                                        ) : (
                                            'Schedule Appointment'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Schedule; 