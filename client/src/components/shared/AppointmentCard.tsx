import { useState } from 'react';
import { format } from 'date-fns';
import type { Appointment, AppointmentStatus } from '../../types';

type AppointmentAction = 'confirm' | 'cancel';

interface AppointmentCardProps {
  appointment: Appointment;
  onAction?: (appointmentId: number, action: AppointmentAction) => Promise<void>;
  isDentist?: boolean;
  showNotification?: (message: string, type?: 'success' | 'error') => void;
}

const statusClass = (status: AppointmentStatus): string => ({
  P: 'bg-warning', C: 'bg-success', D: 'bg-primary', X: 'bg-danger'
}[status]);

const statusText = (status: AppointmentStatus): string => ({
  P: 'Pending', C: 'Confirmed', D: 'Completed', X: 'Cancelled'
}[status]);

export default function AppointmentCard({ appointment, onAction, isDentist = false }: AppointmentCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const date = new Date(appointment.appointmentDate);
  const patient = appointment.patient;
  const dentist = appointment.dentist;

  const handleAction = async (action: AppointmentAction) => {
    if (!onAction) return;
    setIsLoading(true);
    try {
      await onAction(appointment.appointmentId, action);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm rounded-4 mb-3">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 className="fw-bold mb-1">
              {isDentist
                ? (patient ? `${patient.firstName} ${patient.lastName}` : 'Patient')
                : (dentist ? `Dr. ${dentist.firstName} ${dentist.lastName}` : 'Dentist')}
            </h5>
            <p className="text-muted mb-0">{appointment.service?.description ?? 'Dental service'}</p>
          </div>
          <span className={`badge ${statusClass(appointment.status)} rounded-pill px-3 py-2`}>
            {statusText(appointment.status)}
          </span>
        </div>

        <div className="d-flex align-items-center mb-3 gap-2 flex-wrap">
          <span>{format(date, 'MMMM d, yyyy')}</span>
          <span className="text-muted">•</span>
          <span>{format(date, 'h:mm a')}</span>
        </div>

        {appointment.notes && <p className="text-muted mb-3">{appointment.notes}</p>}

        {onAction && appointment.status === 'P' && (
          <div className="d-flex gap-2">
            {isDentist && (
              <button className="btn btn-success btn-sm rounded-pill px-3" onClick={() => void handleAction('confirm')} disabled={isLoading}>
                {isLoading ? 'Working...' : 'Confirm'}
              </button>
            )}
            <button className="btn btn-danger btn-sm rounded-pill px-3" onClick={() => void handleAction('cancel')} disabled={isLoading}>
              {isLoading ? 'Working...' : 'Cancel'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
