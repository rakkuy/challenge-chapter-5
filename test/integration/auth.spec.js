const request = require("supertest");
const app = require("../../app");

describe("Testing Authentication endpoint", () => {
  describe("Testing Register POST /api/v1/auth/register endpoint", () => {
    test("should can register new account", async () => {
      const name = "Galuh Tetsing",
        email = "galuhtesting@gmail.com",
        password = "12345678",
        identity_type = "KTP",
        identity_number = "08123456789",
        address = "Solo";
      const { statusCode, body } = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name,
          email,
          password,
          identity_type,
          identity_number,
          address,
        });

      expect(statusCode).toBe(201);
      expect(body).toHaveProperty("success");
      expect(body).toHaveProperty("message");
      expect(body).toHaveProperty("data");
      expect(body.data).toHaveProperty("name");
      expect(body.data).toHaveProperty("email");
      expect(body.data).toHaveProperty("profile");
      expect(body.data.profile).toHaveProperty("identity_type");
      expect(body.data.profile).toHaveProperty("identity_number");
      expect(body.data.profile).toHaveProperty("address");
      expect(body.data.name).toBe(name);
      expect(body.data.email).toBe(email);
      expect(body.data.profile.identity_type).toBe(identity_type);
      expect(body.data.profile.identity_number).toBe(identity_number);
      expect(body.data.profile.address).toBe(address);
    });
    test("should can't register new account email alredy exist", async () => {
      const name = "Galuh Tetsing",
        email = "galuhtesting@gmail.com",
        password = "12345678",
        identity_type = "KTP",
        identity_number = "08123456789",
        address = "Yogyakarta";
      const { statusCode, body } = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name,
          email,
          password,
          identity_type,
          identity_number,
          address,
        });

      expect(statusCode).toBe(400);
      expect(body).toHaveProperty("success");
      expect(body).toHaveProperty("message");
      expect(body).toHaveProperty("data");
      expect(body.success).toBe(false);
    });

    test("should can't create user with invalid password length", async () => {
      const name = "usertest3";
      const email = "usertest3asas@mail.com";
      const password = "12345";
      const { statusCode, body } = await request(app)
        .post("/api/v1/auth/register")
        .send({
          name,
          email,
          password,
        });
      expect(statusCode).toBe(400);
      expect(body).toHaveProperty("success");
      expect(body).toHaveProperty("message");
      expect(body).toHaveProperty("data");
      expect(body.success).toBe(false);
    });
  });

  describe("Testing Login POST /api/v1/auth/login endpoint", () => {
    let email = "galuhtestlogin@gmail.com";
    let password = "12345678";
    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send({
        name: "Galuh Test Login",
        email,
        password,
      });
    });

    test("should can login", async () => {
      const { statusCode, body } = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email,
          password,
        });

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("success");
      expect(body).toHaveProperty("message");
      expect(body).toHaveProperty("data");
      expect(body.data).toHaveProperty("accessToken");
    });

    test("should can't login invalid credentials", async () => {
      const { statusCode, body } = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: email + email,
          password: password + password,
        });

      expect(statusCode).toBe(400);
      expect(body).toHaveProperty("success");
      expect(body).toHaveProperty("message");
      expect(body).toHaveProperty("data");
      expect(body.success).toBe(false);
    });
  });

  describe("Testing Authenticate GET /api/v1/auth/authenticate", () => {
    const name = "Galuh Test Authenticate";
    const email = "galuhtestauthenticate@gmail.com";
    const password = "12345678";
    let token = "";
    beforeEach(async () => {
      await request(app).post("/api/v1/auth/register").send({
        name,
        email,
        password,
      });
      const { body } = await request(app).post("/api/v1/auth/login").send({
        email,
        password,
      });
      token = body.data.accessToken;
    });

    test("should can authenticate", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/v1/auth/authenticate")
        .set("Authorization", `Bearer ${token}`);

      expect(statusCode).toBe(200);
      expect(body).toHaveProperty("success");
      expect(body).toHaveProperty("message");
      expect(body).toHaveProperty("data");
      expect(body.data).toHaveProperty("name");
      expect(body.data).toHaveProperty("email");
      expect(body.data.name).toBe(name);
      expect(body.data.email).toBe(email);
    });

    test("should can't authenticate invalid token", async () => {
      const { statusCode, body } = await request(app)
        .get("/api/v1/auth/authenticate")
        .set("Authorization", `Bearer ${token}asasas`);

      expect(statusCode).toBe(403);
      expect(body).toHaveProperty("success");
      expect(body).toHaveProperty("message");
      expect(body).toHaveProperty("data");
      expect(body.success).toBe(false);
    });
  });
});
