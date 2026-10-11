
const request = require("supertest");
const app = require("./app");

describe("Health API", () => {
  test("GET /api/health should return 200", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
  });
});

describe("Authentication API", () => {
  test("GET /api/auth/me without token should return 401", async () => {
    const response = await request(app).get("/api/auth/me");
    expect(response.status).toBe(401);
  });

  test("POST /api/auth/login with invalid credentials should fail", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "invalid-user-test@example.com",
        password: "WrongPassword123!"
      });

    expect(response.status).toBe(401);
  });
});


describe("Application API security", () => {
  test("GET /api/applications without token should return 401", async () => {
    const response = await request(app).get("/api/applications");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  test("POST /api/applications without token should return 401", async () => {
    const response = await request(app)
      .post("/api/applications")
      .send({
        programId: "6aca000bb7b699bcdd7d1bba",
        intake: "September"
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
