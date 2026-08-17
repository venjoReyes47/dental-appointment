import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface UserAttributes {
  UserId: number;
  Email: string;
  Password: string;
  FirstName: string;
  LastName: string;
  Gender: string | null;
  Phone: string | null;
  BirthDate: string | null;
  IsActive: number;
  DateUpdated: Date;
}

type UserCreationAttributes = Optional<UserAttributes, 'UserId' | 'Gender' | 'Phone' | 'BirthDate' | 'IsActive' | 'DateUpdated'>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare UserId: number;
  declare Email: string;
  declare Password: string;
  declare FirstName: string;
  declare LastName: string;
  declare Gender: string | null;
  declare Phone: string | null;
  declare BirthDate: string | null;
  declare IsActive: number;
  declare DateUpdated: Date;
  declare role?: import('./UserRole').UserRole;
}

export const initUser = (sequelize: Sequelize): typeof User => {
  User.init({
    UserId: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    Email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    Password: { type: DataTypes.STRING(255), allowNull: false },
    FirstName: { type: DataTypes.STRING(100), allowNull: false },
    LastName: { type: DataTypes.STRING(100), allowNull: false },
    Gender: { type: DataTypes.STRING(20), allowNull: true },
    Phone: { type: DataTypes.STRING(30), allowNull: true },
    BirthDate: { type: DataTypes.DATEONLY, allowNull: true },
    IsActive: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
    DateUpdated: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, { sequelize, modelName: 'User', tableName: 'users', timestamps: false });
  return User;
};
