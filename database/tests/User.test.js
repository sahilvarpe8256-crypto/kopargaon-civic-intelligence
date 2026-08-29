const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');

describe('User Model Tests', () => {
  let mongoServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  afterEach(async () => {
    await User.deleteMany({});
  });

  it('should successfully create a valid citizen user', async () => {
    const validUser = new User({
      role: 'citizen',
      name: 'Ramesh Pawar',
      email: 'ramesh.pawar@example.com',
      phone: '9876543210',
      password_hash: '$2a$10$abcdefghijklmnopqrstuv'
    });

    const savedUser = await validUser.save();
    expect(savedUser._id).toBeDefined();
    expect(savedUser.role).toBe('citizen');
    expect(savedUser.name).toBe('Ramesh Pawar');
    expect(savedUser.email).toBe('ramesh.pawar@example.com');
    expect(savedUser.phone).toBe('9876543210');
    expect(savedUser.is_active).toBe(true);
    expect(savedUser.created_at).toBeDefined();
    expect(savedUser.updated_at).toBeDefined();
  });

  it('should fail validation if required fields are missing', async () => {
    const invalidUser = new User({});
    let err;
    try {
      await invalidUser.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.role).toBeDefined();
    expect(err.errors.name).toBeDefined();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.phone).toBeDefined();
    expect(err.errors.password_hash).toBeDefined();
  });

  it('should reject invalid role enum values', async () => {
    const userWithInvalidRole = new User({
      role: 'superadmin',
      name: 'Admin User',
      email: 'admin@kopargaon.gov.in',
      phone: '9822112233',
      password_hash: 'hashedpassword'
    });

    let err;
    try {
      await userWithInvalidRole.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.role).toBeDefined();
  });

  it('should reject invalid email format', async () => {
    const userWithBadEmail = new User({
      role: 'citizen',
      name: 'Bad Email User',
      email: 'not-an-email',
      phone: '9822112233',
      password_hash: 'hashedpassword'
    });

    let err;
    try {
      await userWithBadEmail.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });

  it('should reject invalid phone numbers (not 10 digits starting with 6-9)', async () => {
    const userWithBadPhone = new User({
      role: 'citizen',
      name: 'Bad Phone User',
      email: 'user@example.com',
      phone: '12345', // invalid length
      password_hash: 'hashedpassword'
    });

    let err;
    try {
      await userWithBadPhone.save();
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
    expect(err.errors.phone).toBeDefined();
  });

  it('should enforce unique email constraint', async () => {
    await User.create({
      role: 'citizen',
      name: 'User One',
      email: 'duplicate@example.com',
      phone: '9822112233',
      password_hash: 'hashedpassword'
    });

    let err;
    try {
      await User.create({
        role: 'officer',
        name: 'User Two',
        email: 'duplicate@example.com',
        phone: '9822445566',
        password_hash: 'hashedpassword'
      });
    } catch (error) {
      err = error;
    }
    expect(err).toBeDefined();
  });

  it('should hide password_hash by default when querying (select: false)', async () => {
    const user = await User.create({
      role: 'officer',
      name: 'Officer Shinde',
      email: 'shinde@kopargaon.gov.in',
      phone: '9822998877',
      password_hash: '$2a$10$supersecretsecurehash'
    });

    const queriedUser = await User.findById(user._id);
    expect(queriedUser.password_hash).toBeUndefined();

    // When explicitly selected, it is present
    const userWithPassword = await User.findById(user._id).select('+password_hash');
    expect(userWithPassword.password_hash).toBe('$2a$10$supersecretsecurehash');
  });
});
