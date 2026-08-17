import { Sequelize } from 'sequelize';
import { env } from '../config/env';
import { Appointment, initAppointment } from './Appointment';
import { Role, initRole } from './Role';
import { Service, initService } from './Service';
import { User, initUser } from './User';
import { UserRole, initUserRole } from './UserRole';

export const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASS, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: 'mysql',
  timezone: '+00:00',
  logging: env.NODE_ENV === 'development' ? console.log : false,
  pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
  dialectOptions: env.DB_SSL
    ? { ssl: { require: true, rejectUnauthorized: env.DB_SSL_REJECT_UNAUTHORIZED } }
    : undefined
});

initUser(sequelize);
initRole(sequelize);
initUserRole(sequelize);
initService(sequelize);
initAppointment(sequelize);

User.hasOne(UserRole, { foreignKey: 'UserId', as: 'role' });
UserRole.belongsTo(User, { foreignKey: 'UserId', as: 'user' });
Role.hasMany(UserRole, { foreignKey: 'RoleId', as: 'userRoles' });
UserRole.belongsTo(Role, { foreignKey: 'RoleId', as: 'roleDefinition' });
Appointment.belongsTo(User, { foreignKey: 'PatientUserId', as: 'patient' });
Appointment.belongsTo(User, { foreignKey: 'DentistUserId', as: 'dentist' });
Appointment.belongsTo(Service, { foreignKey: 'ServiceId', as: 'service' });
Service.hasMany(Appointment, { foreignKey: 'ServiceId', as: 'appointments' });

export { Appointment, Role, Service, User, UserRole };
