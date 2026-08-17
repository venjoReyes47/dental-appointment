import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Op, type WhereOptions } from 'sequelize';
import { User, UserRole } from '../models';
import { isValidEmail, validatePassword } from '../middleware/validators';

const DENTIST_ROLE_ID = 1;
const dentistJson = (user: User) => ({
  userId: user.UserId, firstName: user.FirstName, lastName: user.LastName, email: user.Email,
  gender: user.Gender, phone: user.Phone, birthDate: user.BirthDate, isActive: user.IsActive, roleId: DENTIST_ROLE_ID
});

export const createDentist = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, phone, phoneNumber, gender, birthDate, password } = req.body as Record<string, string | undefined>;
  if (!firstName || !lastName || !email || !password || !isValidEmail(email)) {
    res.status(400).json({ success: false, message: 'Valid first name, last name, email and password are required.' });
    return;
  }
  const passwordResult = validatePassword(password);
  if (!passwordResult.valid) {
    res.status(400).json({ success: false, message: passwordResult.message });
    return;
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (await User.findOne({ where: { Email: normalizedEmail } })) {
    res.status(409).json({ success: false, message: 'Dentist with this email already exists.' });
    return;
  }

  const transaction = await User.sequelize!.transaction();
  try {
    const dentist = await User.create({
      Email: normalizedEmail,
      Password: await bcrypt.hash(password, 12),
      FirstName: firstName.trim(), LastName: lastName.trim(), Gender: gender?.trim() || null,
      Phone: (phone ?? phoneNumber)?.trim() || null, BirthDate: birthDate || null, IsActive: 1, DateUpdated: new Date()
    }, { transaction });
    await UserRole.create({ UserId: dentist.UserId, RoleId: DENTIST_ROLE_ID, DateUpdated: new Date() }, { transaction });
    await transaction.commit();
    res.status(201).json({ success: true, message: 'Dentist created successfully.', data: dentistJson(dentist) });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getAllDentists = async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 100);
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const where: WhereOptions = {
    IsActive: 1,
    ...(search ? { [Op.or]: [
      { FirstName: { [Op.like]: `%${search}%` } },
      { LastName: { [Op.like]: `%${search}%` } },
      { Email: { [Op.like]: `%${search}%` } }
    ] } : {})
  };
  const { count, rows } = await User.findAndCountAll({
    where,
    include: [{ model: UserRole, as: 'role', where: { RoleId: DENTIST_ROLE_ID }, attributes: ['RoleId'] }],
    limit, offset: (page - 1) * limit, order: [['FirstName', 'ASC']]
  });
  res.json({ success: true, data: rows.map(dentistJson), pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) } });
};

export const getDentistById = async (req: Request, res: Response): Promise<void> => {
  const dentist = await User.findOne({
    where: { UserId: Number(req.params.id) },
    include: [{ model: UserRole, as: 'role', where: { RoleId: DENTIST_ROLE_ID }, attributes: ['RoleId'] }]
  });
  if (!dentist) {
    res.status(404).json({ success: false, message: 'Dentist not found.' });
    return;
  }
  res.json({ success: true, data: dentistJson(dentist) });
};

export const updateDentist = async (req: Request, res: Response): Promise<void> => {
  const dentist = await User.findOne({
    where: { UserId: Number(req.params.id) },
    include: [{ model: UserRole, as: 'role', where: { RoleId: DENTIST_ROLE_ID }, attributes: ['RoleId'] }]
  });
  if (!dentist) {
    res.status(404).json({ success: false, message: 'Dentist not found.' });
    return;
  }

  const { firstName, lastName, email, phone, gender, birthDate, password, isActive } = req.body as Record<string, unknown>;
  const updates: Partial<{ FirstName: string; LastName: string; Email: string; Phone: string | null; Gender: string | null; BirthDate: string | null; Password: string; IsActive: number; DateUpdated: Date }> = { DateUpdated: new Date() };
  if (typeof firstName === 'string' && firstName.trim()) updates.FirstName = firstName.trim();
  if (typeof lastName === 'string' && lastName.trim()) updates.LastName = lastName.trim();
  if (typeof email === 'string' && email.trim()) {
    if (!isValidEmail(email)) { res.status(400).json({ success: false, message: 'Invalid email.' }); return; }
    const normalizedEmail = email.trim().toLowerCase();
    const duplicate = await User.findOne({ where: { Email: normalizedEmail } });
    if (duplicate && duplicate.UserId !== dentist.UserId) {
      res.status(409).json({ success: false, message: 'Another user already uses this email.' }); return;
    }
    updates.Email = normalizedEmail;
  }
  if (typeof phone === 'string') updates.Phone = phone.trim() || null;
  if (typeof gender === 'string') updates.Gender = gender.trim() || null;
  if (typeof birthDate === 'string') updates.BirthDate = birthDate || null;
  const requestedActive = typeof isActive === 'boolean' ? isActive : typeof isActive === 'number' ? Boolean(isActive) : undefined;
  if (req.user?.id === dentist.UserId && requestedActive === false) {
    res.status(400).json({ success: false, message: 'You cannot deactivate your own signed-in dentist account.' }); return;
  }
  if (requestedActive !== undefined) updates.IsActive = requestedActive ? 1 : 0;
  if (typeof password === 'string' && password) {
    const result = validatePassword(password);
    if (!result.valid) { res.status(400).json({ success: false, message: result.message }); return; }
    updates.Password = await bcrypt.hash(password, 12);
  }

  await dentist.update(updates);
  res.json({ success: true, message: 'Dentist updated successfully.', data: dentistJson(dentist) });
};

export const deleteDentist = async (req: Request, res: Response): Promise<void> => {
  const dentist = await User.findOne({
    where: { UserId: Number(req.params.id) },
    include: [{ model: UserRole, as: 'role', where: { RoleId: DENTIST_ROLE_ID }, attributes: ['RoleId'] }]
  });
  if (!dentist) { res.status(404).json({ success: false, message: 'Dentist not found.' }); return; }

  if (req.user?.id === dentist.UserId) {
    res.status(400).json({ success: false, message: 'You cannot delete your own signed-in dentist account.' }); return;
  }
  const dentistCount = await UserRole.count({ where: { RoleId: DENTIST_ROLE_ID } });
  if (dentistCount <= 1) {
    res.status(400).json({ success: false, message: 'The last dentist account cannot be deleted.' }); return;
  }

  const transaction = await User.sequelize!.transaction();
  try {
    await UserRole.destroy({ where: { UserId: dentist.UserId }, transaction });
    await dentist.destroy({ transaction });
    await transaction.commit();
    res.json({ success: true, message: 'Dentist deleted successfully.' });
  } catch (error) {
    await transaction.rollback();
    if (error instanceof Error && error.name === 'SequelizeForeignKeyConstraintError') {
      res.status(409).json({ success: false, message: 'Cannot delete dentist because appointments are linked to this account.' });
      return;
    }
    throw error;
  }
};
