const mongoose = require('mongoose');
const { connectDB } = require('../../src/config/db');

describe('Database Configuration Unit Tests', () => {
  const originalUri = process.env.MONGODB_URI;

  afterEach(() => {
    process.env.MONGODB_URI = originalUri;
    jest.restoreAllMocks();
  });

  it('throws an error when MONGODB_URI is not defined in environment variables', async () => {
    delete process.env.MONGODB_URI;

    await expect(connectDB()).rejects.toThrow('MONGODB_URI is not defined in environment variables');
  });

  it('connects successfully when valid MONGODB_URI is provided', async () => {
    process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/test_db';

    const mockConnection = {
      connection: {
        host: '127.0.0.1',
        name: 'test_db'
      }
    };

    jest.spyOn(mongoose, 'connect').mockResolvedValue(mockConnection);

    const conn = await connectDB();

    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://127.0.0.1:27017/test_db');
    expect(conn).toBe(mockConnection);
  });

  it('throws and logs when mongoose.connect fails', async () => {
    process.env.MONGODB_URI = 'mongodb://invalid-host:27017/test_db';

    const connectError = new Error('Connection refused to MongoDB host');
    jest.spyOn(mongoose, 'connect').mockRejectedValue(connectError);

    await expect(connectDB()).rejects.toThrow('Connection refused to MongoDB host');
    expect(mongoose.connect).toHaveBeenCalledWith('mongodb://invalid-host:27017/test_db');
  });
});