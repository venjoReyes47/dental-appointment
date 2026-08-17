import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export type AppointmentStatus = 'P' | 'C' | 'D' | 'X';

export interface AppointmentAttributes {
  AppointmentId: number;
  AppointmentDate: Date;
  PatientUserId: number;
  DentistUserId: number;
  ServiceId: number;
  Status: AppointmentStatus;
  Notes: string | null;
}

type AppointmentCreationAttributes = Optional<AppointmentAttributes, 'AppointmentId' | 'Status' | 'Notes'>;

export class Appointment extends Model<AppointmentAttributes, AppointmentCreationAttributes> implements AppointmentAttributes {
  declare AppointmentId: number;
  declare AppointmentDate: Date;
  declare PatientUserId: number;
  declare DentistUserId: number;
  declare ServiceId: number;
  declare Status: AppointmentStatus;
  declare Notes: string | null;
  declare patient?: import('./User').User;
  declare dentist?: import('./User').User;
  declare service?: import('./Service').Service;
}

export const initAppointment = (sequelize: Sequelize): typeof Appointment => {
  Appointment.init({
    AppointmentId: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    AppointmentDate: { type: DataTypes.DATE, allowNull: false },
    PatientUserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    DentistUserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    ServiceId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    Status: { type: DataTypes.ENUM('P', 'C', 'D', 'X'), allowNull: false, defaultValue: 'P' },
    Notes: { type: DataTypes.STRING(1000), allowNull: true }
  }, { sequelize, modelName: 'Appointment', tableName: 'appointments', timestamps: false });
  return Appointment;
};
