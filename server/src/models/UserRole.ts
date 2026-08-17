import { DataTypes, Model, Optional, Sequelize } from 'sequelize';

export interface UserRoleAttributes {
  UserRoleId: number;
  UserId: number;
  RoleId: number;
  DateUpdated: Date;
}

type UserRoleCreationAttributes = Optional<UserRoleAttributes, 'UserRoleId' | 'RoleId' | 'DateUpdated'>;

export class UserRole extends Model<UserRoleAttributes, UserRoleCreationAttributes> implements UserRoleAttributes {
  declare UserRoleId: number;
  declare UserId: number;
  declare RoleId: number;
  declare DateUpdated: Date;
  declare user?: import('./User').User;
  declare roleDefinition?: import('./Role').Role;
}

export const initUserRole = (sequelize: Sequelize): typeof UserRole => {
  UserRole.init({
    UserRoleId: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    UserId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    RoleId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 2 },
    DateUpdated: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
  }, { sequelize, modelName: 'UserRole', tableName: 'user_roles', timestamps: false });
  return UserRole;
};
