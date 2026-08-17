import type { Request, Response } from 'express';
import { Role, UserRole } from '../models';

export const createRole = async (req: Request, res: Response): Promise<void> => {
  const description = typeof req.body?.description === 'string' ? req.body.description.trim() : '';
  if (!description) { res.status(400).json({ success: false, message: 'Description is required.' }); return; }
  if (await Role.findOne({ where: { Description: description } })) {
    res.status(409).json({ success: false, message: 'A role with this description already exists.' }); return;
  }
  const role = await Role.create({ Description: description, DateCreated: new Date(), DateUpdated: new Date() });
  res.status(201).json({ success: true, data: role });
};

export const getAllRoles = async (_req: Request, res: Response): Promise<void> => {
  res.json({ success: true, data: await Role.findAll({ order: [['RoleId', 'ASC']] }) });
};

export const getRoleById = async (req: Request, res: Response): Promise<void> => {
  const role = await Role.findByPk(Number(req.params.id));
  if (!role) { res.status(404).json({ success: false, message: 'Role not found.' }); return; }
  res.json({ success: true, data: role });
};

export const updateRole = async (req: Request, res: Response): Promise<void> => {
  const role = await Role.findByPk(Number(req.params.id));
  if (!role) { res.status(404).json({ success: false, message: 'Role not found.' }); return; }
  if (role.RoleId === 1 || role.RoleId === 2) {
    res.status(400).json({ success: false, message: 'Core Dentist and Patient roles cannot be renamed.' }); return;
  }
  const description = typeof req.body?.description === 'string' ? req.body.description.trim() : '';
  if (!description) { res.status(400).json({ success: false, message: 'Description is required.' }); return; }
  const duplicate = await Role.findOne({ where: { Description: description } });
  if (duplicate && duplicate.RoleId !== role.RoleId) {
    res.status(409).json({ success: false, message: 'A role with this description already exists.' }); return;
  }
  await role.update({ Description: description, DateUpdated: new Date() });
  res.json({ success: true, data: role });
};

export const deleteRole = async (req: Request, res: Response): Promise<void> => {
  const role = await Role.findByPk(Number(req.params.id));
  if (!role) { res.status(404).json({ success: false, message: 'Role not found.' }); return; }
  if (role.RoleId === 1 || role.RoleId === 2) {
    res.status(400).json({ success: false, message: 'Core Dentist and Patient roles cannot be deleted.' }); return;
  }
  if (await UserRole.count({ where: { RoleId: role.RoleId } })) {
    res.status(409).json({ success: false, message: 'Cannot delete a role that is assigned to users.' });
    return;
  }
  await role.destroy();
  res.json({ success: true, message: 'Role deleted successfully.' });
};
