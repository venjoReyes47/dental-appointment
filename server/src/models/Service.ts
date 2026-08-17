import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface ServiceAttributes {
  ServiceId: number;
  Description: string;
  DateCreated: Date;
  DateUpdated: Date;
}

type ServiceCreationAttributes = Optional<ServiceAttributes, 'ServiceId' | 'DateCreated' | 'DateUpdated'>;

export class Service extends Model<ServiceAttributes, ServiceCreationAttributes> implements ServiceAttributes {
  declare ServiceId: number;
  declare Description: string;
  declare DateCreated: Date;
  declare DateUpdated: Date;
}

export const initService = (sequelize: Sequelize): typeof Service => {
  Service.init({
    ServiceId: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    Description: { type: DataTypes.STRING(255), allowNull: false },
    DateCreated: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    DateUpdated: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, { sequelize, modelName: 'Service', tableName: 'services', timestamps: false });
  return Service;
};
