import bcrypt from 'bcryptjs';
import { sequelize, User, UserRole } from '../models';

const getArg = (name: string): string | undefined => {
  const prefix = `--${name}=`;
  const value = process.argv.find((arg) => arg.startsWith(prefix));
  return value?.slice(prefix.length);
};

const requiredArg = (name: string): string => {
  const value = getArg(name)?.trim();
  if (!value) throw new Error(`Missing required argument --${name}=...`);
  return value;
};

const main = async (): Promise<void> => {
  const email = requiredArg('email').toLowerCase();
  const password = requiredArg('password');
  const firstName = requiredArg('firstName');
  const lastName = requiredArg('lastName');
  const phone = getArg('phone')?.trim() || null;

  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('A valid --email is required.');
  if (password.length < 10) throw new Error('Bootstrap password must be at least 10 characters.');

  await sequelize.authenticate();

  const existing = await User.findOne({ where: { Email: email } });
  if (existing) throw new Error(`A user with ${email} already exists.`);

  const transaction = await sequelize.transaction();
  try {
    const user = await User.create({
      Email: email,
      Password: await bcrypt.hash(password, 12),
      FirstName: firstName,
      LastName: lastName,
      Gender: null,
      Phone: phone,
      BirthDate: null,
      IsActive: 1,
      DateUpdated: new Date()
    }, { transaction });

    await UserRole.create({
      UserId: user.UserId,
      RoleId: 1,
      DateUpdated: new Date()
    }, { transaction });

    await transaction.commit();
    console.log(`Dentist account created for ${email}.`);
  } catch (error) {
    await transaction.rollback();
    throw error;
  } finally {
    await sequelize.close();
  }
};

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
