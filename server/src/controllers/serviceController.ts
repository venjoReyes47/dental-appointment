import type { Request, Response } from 'express';
import { Service } from '../models';

export const createService = async (req: Request, res: Response): Promise<void> => {
  const description = typeof req.body?.description === 'string' ? req.body.description.trim() : '';
  if (!description) { res.status(400).json({ success: false, message: 'Description is required.' }); return; }
  if (await Service.findOne({ where: { Description: description } })) {
    res.status(409).json({ success: false, message: 'A service with this description already exists.' }); return;
  }
  const service = await Service.create({ Description: description, DateCreated: new Date(), DateUpdated: new Date() });
  res.status(201).json({ success: true, data: service });
};

export const getAllServices = async (_req: Request, res: Response): Promise<void> => {
  const services = await Service.findAll({ order: [['Description', 'ASC']] });
  res.json({ success: true, data: services });
};

export const getService = async (req: Request, res: Response): Promise<void> => {
  const service = await Service.findByPk(Number(req.params.id));
  if (!service) { res.status(404).json({ success: false, message: 'Service not found.' }); return; }
  res.json({ success: true, data: service });
};

export const updateService = async (req: Request, res: Response): Promise<void> => {
  const service = await Service.findByPk(Number(req.params.id));
  if (!service) { res.status(404).json({ success: false, message: 'Service not found.' }); return; }
  const description = typeof req.body?.description === 'string' ? req.body.description.trim() : '';
  if (!description) { res.status(400).json({ success: false, message: 'Description is required.' }); return; }
  const duplicate = await Service.findOne({ where: { Description: description } });
  if (duplicate && duplicate.ServiceId !== service.ServiceId) {
    res.status(409).json({ success: false, message: 'A service with this description already exists.' }); return;
  }
  await service.update({ Description: description, DateUpdated: new Date() });
  res.json({ success: true, data: service });
};

export const deleteService = async (req: Request, res: Response): Promise<void> => {
  const service = await Service.findByPk(Number(req.params.id));
  if (!service) { res.status(404).json({ success: false, message: 'Service not found.' }); return; }
  try {
    await service.destroy();
    res.json({ success: true, message: 'Service deleted successfully.' });
  } catch (error) {
    if (error instanceof Error && error.name === 'SequelizeForeignKeyConstraintError') {
      res.status(409).json({ success: false, message: 'Cannot delete service because appointments are linked to it.' });
      return;
    }
    throw error;
  }
};
