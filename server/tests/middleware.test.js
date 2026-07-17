const assert = require('node:assert/strict');
const test = require('node:test');

const requireRole = require('../middleware/requireRole');
const branchIsolation = require('../middleware/branchIsolation');
const sanitizeInput = require('../middleware/sanitize');

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

test('requireRole rejects unauthenticated requests', () => {
  const req = {};
  const res = createResponse();
  let nextCalled = false;

  requireRole('central_faculty')(req, res, () => {
    nextCalled = true;
  });

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);
  assert.equal(nextCalled, false);
});

test('requireRole allows matching roles and rejects others', () => {
  const allowedReq = { user: { role: 'central_faculty' } };
  const allowedRes = createResponse();
  let allowedNext = false;

  requireRole('central_faculty')(allowedReq, allowedRes, () => {
    allowedNext = true;
  });

  assert.equal(allowedNext, true);
  assert.equal(allowedRes.statusCode, 200);

  const rejectedReq = { user: { role: 'student_coordinator' } };
  const rejectedRes = createResponse();
  let rejectedNext = false;

  requireRole('central_faculty')(rejectedReq, rejectedRes, () => {
    rejectedNext = true;
  });

  assert.equal(rejectedRes.statusCode, 403);
  assert.equal(rejectedRes.body.success, false);
  assert.equal(rejectedNext, false);
});

test('branchIsolation lets central faculty bypass branch checks', () => {
  const req = {
    user: { role: 'central_faculty', branch: 'CENTRAL' },
    body: { branch: 'CSE' },
    query: { branch: 'ECE' },
  };
  const res = createResponse();
  let nextCalled = false;

  branchIsolation(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, 200);
});

test('branchIsolation blocks cross-branch writes and reads', () => {
  const writeReq = {
    user: { role: 'branch_faculty', branch: 'CSE' },
    body: { branch: 'ECE' },
    query: {},
  };
  const writeRes = createResponse();

  branchIsolation(writeReq, writeRes, () => {});

  assert.equal(writeRes.statusCode, 403);
  assert.match(writeRes.body.message, /CSE/);

  const readReq = {
    user: { role: 'branch_faculty', branch: 'CSE' },
    body: {},
    query: { branch: 'IT' },
  };
  const readRes = createResponse();

  branchIsolation(readReq, readRes, () => {});

  assert.equal(readRes.statusCode, 403);
  assert.match(readRes.body.message, /CSE/);
});

test('branchIsolation attaches userBranch when request is allowed', () => {
  const req = {
    user: { role: 'branch_faculty', branch: 'CSE' },
    body: { branch: 'CSE' },
    query: { branch: 'CSE' },
  };
  const res = createResponse();
  let nextCalled = false;

  branchIsolation(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.userBranch, 'CSE');
});

test('sanitizeInput strips script/event handlers while preserving rich content fields', () => {
  const req = {
    body: {
      title: '<script>alert(1)</script><img src=x onerror=alert(1)>Safe',
      content: '<p onclick="evil()">TipTap content is sanitized on render</p>',
      nested: { url: 'javascript:alert(1)' },
    },
    query: { q: 'data:text/html,<script>bad()</script>' },
    params: {},
  };
  const res = createResponse();
  let nextCalled = false;

  sanitizeInput(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.body.title, '<img src=x>Safe');
  assert.equal(req.body.content, '<p onclick="evil()">TipTap content is sanitized on render</p>');
  assert.equal(req.body.nested.url, 'alert(1)');
  assert.equal(req.query.q, '');
});
