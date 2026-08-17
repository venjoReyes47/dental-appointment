import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface RoleAttributes {
  RoleId: number;
  Description: string;
  DateCreated: Date;
  DateUpdated: Date;
}

type RoleCreationAttributes = Optional<RoleAttributes, 'RoleId' | 'DateCreated' | 'DateUpdated'>;

export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  declare RoleId: number;
  declare Description: string;
  declare DateCreated: Date;
  declare DateUpdated: Date;
}

export const initRole = (sequelize: Sequelize): typeof Role => {
  Role.init({
    RoleId: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    Description: { type: DataTypes.STRING(100), allowNull: false },
    DateCreated: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    DateUpdated: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, { sequelize, modelName: 'Role', tableName: 'roles', timestamps: false });
  return Role;
};
