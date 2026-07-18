const assert = require('node:assert/strict');
const test = require('node:test');

// Mock mongoose Models & Logger
const User = require('../models/User');
const logActivity = require('../utils/activityLogger');
const { resetUserPassword } = require('../controllers/userController');

// Helper to create mocked response object
const createResponse = () => {
  const res = {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

// Store original methods to restore later
const originalFindById = User.findById;
const originalHashPassword = User.hashPassword;

test('resetUserPassword rejects password shorter than 8 characters', async () => {
  const req = {
    params: { id: 'user123' },
    body: { password: 'short' },
  };
  const res = createResponse();

  await resetUserPassword(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /at least 8 characters/);
});

test('resetUserPassword branch faculty cannot reset student coordinator in another branch', async () => {
  // Mock User.findById
  User.findById = () => ({
    populate() {
      return {
        _id: 'user123',
        role: 'student_coordinator',
        branch: 'ECE',
        passwordHash: '',
        save: async () => {}
      };
    }
  });

  const req = {
    params: { id: 'user123' },
    body: { password: 'newSecurePassword123' },
    user: { role: 'branch_faculty', branch: 'CSE', userId: 'faculty456' }
  };
  const res = createResponse();

  await resetUserPassword(req, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /other branches/);

  // Restore
  User.findById = originalFindById;
});

test('resetUserPassword branch faculty cannot reset non-student coordinator', async () => {
  User.findById = () => ({
    populate() {
      return {
        _id: 'user123',
        role: 'branch_faculty',
        branch: 'CSE',
        passwordHash: '',
        save: async () => {}
      };
    }
  });

  const req = {
    params: { id: 'user123' },
    body: { password: 'newSecurePassword123' },
    user: { role: 'branch_faculty', branch: 'CSE', userId: 'faculty456' }
  };
  const res = createResponse();

  await resetUserPassword(req, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /student coordinators/);

  User.findById = originalFindById;
});

test('resetUserPassword central faculty cannot reset other central faculty', async () => {
  User.findById = () => ({
    populate() {
      return {
        _id: 'admin123',
        role: 'central_faculty',
        branch: 'CENTRAL',
        passwordHash: '',
        save: async () => {}
      };
    }
  });

  const req = {
    params: { id: 'admin123' },
    body: { password: 'newSecurePassword123' },
    user: { role: 'central_faculty', userId: 'superadmin' }
  };
  const res = createResponse();

  await resetUserPassword(req, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /central faculty/);

  User.findById = originalFindById;
});

test('resetUserPassword central faculty can reset branch faculty', async () => {
  let saved = false;
  User.findById = () => ({
    populate() {
      return {
        _id: 'faculty123',
        role: 'branch_faculty',
        branch: 'CSE',
        passwordHash: '',
        save: async () => { saved = true; }
      };
    }
  });
  User.hashPassword = async () => 'hashed_pwd';

  const req = {
    params: { id: 'faculty123' },
    body: { password: 'newSecurePassword123' },
    user: { role: 'central_faculty', userId: 'superadmin' }
  };
  const res = createResponse();

  await resetUserPassword(req, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(saved, true);

  // Restore
  User.findById = originalFindById;
  User.hashPassword = originalHashPassword;
});
