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
});

afterAll(async () => {
  await mongoose.disconnect();
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
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.user.password).toBeUndefined();
  });

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
    });
    expect(res.status).toBe(422);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Alice", email: "alice@example.com", password: "password123",
    });
  });

  it("returns tokens on valid credentials", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "alice@example.com", password: "password123",
    });
    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });

  it("rejects wrong password with 401", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "alice@example.com", password: "wrongpass",
    });
    expect(res.status).toBe(401);
  });

  it("rejects unknown email with 401", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com", password: "password123",
    });
    expect(res.status).toBe(401);
  });
});
