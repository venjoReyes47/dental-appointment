import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { Op, type WhereOptions } from 'sequelize';
import { env } from '../config/env';
import { User, UserRole } from '../models';

const PATIENT_ROLE_ID = 2;

const signAccessToken = (user: User, roleId: number): string => jwt.sign(
  { id: user.UserId, email: user.Email, role: roleId },
  env.JWT_SECRET_KEY,
  { expiresIn: env.JWT_TOKEN_EXPIRATION as SignOptions['expiresIn'] }
);

const signRefreshToken = (user: User): string => jwt.sign(
  { id: user.UserId, email: user.Email },
  env.JWT_REFRESH_SECRET_KEY,
  { expiresIn: '7d' }
);

const publicUser = (user: User, roleId: number) => ({
  userId: user.UserId,
  firstName: user.FirstName,
  lastName: user.LastName,
  email: user.Email,
  roleId
});

export const createUser = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, phone, gender, birthDate, password } = req.body as {
    firstName: string; lastName: string; email: string; phone?: string; gender?: string; birthDate?: string; password: string;
  };
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await User.findOne({ where: { Email: normalizedEmail } });
  if (existingUser) {
    res.status(409).json({ success: false, message: 'User with this email already exists.' });
    return;
  }

  const transaction = await User.sequelize!.transaction();
  try {
    const user = await User.create({
      Email: normalizedEmail,
      Password: await bcrypt.hash(password, 12),
      FirstName: firstName.trim(),
      LastName: lastName.trim(),
      Gender: gender?.trim() || null,
      Phone: phone?.trim() || null,
      BirthDate: birthDate || null,
      IsActive: 1,
      DateUpdated: new Date()
    }, { transaction });

    await UserRole.create({ UserId: user.UserId, RoleId: PATIENT_ROLE_ID, DateUpdated: new Date() }, { transaction });
    await transaction.commit();

    res.status(201).json({ success: true, message: 'User created successfully.', data: publicUser(user, PATIENT_ROLE_ID) });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const allowedSort = new Set(['UserId', 'Email', 'FirstName', 'LastName', 'DateUpdated']);
  const sortBy = typeof req.query.sortBy === 'string' && allowedSort.has(req.query.sortBy) ? req.query.sortBy : 'UserId';
  const sortOrder = req.query.sortOrder === 'desc' ? 'DESC' : 'ASC';
  const where: WhereOptions = search ? {
    [Op.or]: [
      { FirstName: { [Op.like]: `%${search}%` } },
      { LastName: { [Op.like]: `%${search}%` } },
      { Email: { [Op.like]: `%${search}%` } }
    ]
  } : {};

  const { count, rows } = await User.findAndCountAll({ where, limit, offset: (page - 1) * limit, order: [[sortBy, sortOrder]] });
  res.json({
    success: true,
    data: rows.map((user) => ({
      userId: user.UserId, email: user.Email, firstName: user.FirstName, lastName: user.LastName,
      gender: user.Gender, phone: user.Phone, birthDate: user.BirthDate, isActive: user.IsActive, dateUpdated: user.DateUpdated
    })),
    pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) }
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email: string; password: string };
  const user = await User.findOne({
    where: { Email: email.trim().toLowerCase(), IsActive: 1 },
    include: [{ model: UserRole, as: 'role', attributes: ['RoleId'] }]
  });

  if (!user || !(await bcrypt.compare(password, user.Password))) {
    res.status(401).json({ success: false, message: 'Invalid credentials.' });
    return;
  }

  const roleId = user.role?.RoleId ?? PATIENT_ROLE_ID;
  await user.update({ DateUpdated: new Date() });

  res.json({
    success: true,
    message: 'Login successful.',
    data: {
      user: publicUser(user, roleId),
      tokens: { accessToken: signAccessToken(user, roleId), refreshToken: signRefreshToken(user), expiresIn: env.JWT_TOKEN_EXPIRATION }
    }
  });
};

export const verifyToken = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'No token provided.' });
    return;
  }

  try {
    const decoded = jwt.verify(authHeader.slice(7), env.JWT_SECRET_KEY) as JwtPayload & { id: number };
    const user = await User.findOne({
      where: { UserId: decoded.id, IsActive: 1 },
      include: [{ model: UserRole, as: 'role', attributes: ['RoleId'] }]
    });
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found or inactive.' });
      return;
    }

    const roleId = user.role?.RoleId ?? PATIENT_ROLE_ID;
    res.json({
      success: true,
      data: {
        user: publicUser(user, roleId),
        tokens: { accessToken: signAccessToken(user, roleId), refreshToken: signRefreshToken(user), expiresIn: env.JWT_TOKEN_EXPIRATION }
      }
    });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body as { refreshToken?: string };
  if (!token) {
    res.status(400).json({ success: false, message: 'Refresh token is required.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET_KEY) as JwtPayload & { id: number };
    const user = await User.findOne({
      where: { UserId: decoded.id, IsActive: 1 },
      include: [{ model: UserRole, as: 'role', attributes: ['RoleId'] }]
    });
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found or inactive.' });
      return;
    }
    const roleId = user.role?.RoleId ?? PATIENT_ROLE_ID;
    res.json({ success: true, data: { accessToken: signAccessToken(user, roleId), expiresIn: env.JWT_TOKEN_EXPIRATION } });
  } catch {
    res.status(401).json({ success: false, message: 'Invalid refresh token.' });
  }
};
