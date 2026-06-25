<<<<<<< HEAD
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.example' });
process.env.JWT_ACCESS_SECRET  = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';

import authRoutes from '../routes/auth';

let mongod: MongoMemoryServer;

const app = express();
app.use(express.json());
app.use(cors());
app.use('/api/auth', authRoutes);

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
=======
import request  from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import express from "express";

process.env.JWT_ACCESS_SECRET  = "test-access-secret-32chars-long!!";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-32chars-long!";

import { authRouter } from "../src/routes/auth";

const app = express();
app.use(express.json());
app.use("/api/auth", authRouter);

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
});

afterAll(async () => {
  await mongoose.disconnect();
<<<<<<< HEAD
  await mongod.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('POST /api/auth/register', () => {
  it('creates a new user and returns tokens', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name:     'Jane Doe',
      email:    'jane@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('jane@example.com');
=======
  await mongo.stop();
});

afterEach(async () => {
  for (const col of Object.values(mongoose.connection.collections)) {
    await col.deleteMany({});
  }
});

describe("POST /api/auth/register", () => {
  it("creates user and returns tokens", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User", email: "test@example.com", password: "password123",
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

<<<<<<< HEAD
  it('rejects duplicate email', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Jane', email: 'jane@example.com', password: 'password123',
    });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane2', email: 'jane@example.com', password: 'password123',
    });
    expect(res.status).toBe(409);
  });

  it('rejects short password', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test', email: 'test@example.com', password: 'short',
=======
  it("rejects duplicate email with 409", async () => {
    const body = { name: "A", email: "dup@example.com", password: "password123" };
    await request(app).post("/api/auth/register").send(body);
    const res = await request(app).post("/api/auth/register").send(body);
    expect(res.status).toBe(409);
  });

  it("rejects short password with 422", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "B", email: "b@example.com", password: "short",
    });
    expect(res.status).toBe(422);
  });

  it("rejects invalid email with 422", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "C", email: "not-an-email", password: "password123",
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
    });
    expect(res.status).toBe(422);
  });
});

<<<<<<< HEAD
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Jane', email: 'jane@example.com', password: 'password123',
    });
  });

  it('returns tokens for valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'jane@example.com', password: 'password123',
=======
describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Alice", email: "alice@example.com", password: "password123",
    });
  });

  it("returns tokens on valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "alice@example.com", password: "password123",
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

<<<<<<< HEAD
  it('rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'jane@example.com', password: 'wrongpass',
=======
  it("rejects wrong password with 401", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "alice@example.com", password: "wrongpass",
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
    });
    expect(res.status).toBe(401);
  });

<<<<<<< HEAD
  it('rejects non-existent user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'ghost@example.com', password: 'password123',
=======
  it("rejects unknown email with 401", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com", password: "password123",
>>>>>>> 1ffa244ce9d959b0dbdc0e06d9b8fbe8ee15f699
    });
    expect(res.status).toBe(401);
  });
});
