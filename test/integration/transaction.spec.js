const request = require('supertest');
const app = require('../../app');
let userTemp, transactionTemp, account1, account2, token;

const name = 'Taufik Test Transaction';
const email = 'taufiktesttransaction@dev.com';
const password = '12345678';

describe('Testing Transactions endpoint', () => {
  beforeAll(async () => {
    const user = await request(app).post('/api/v1/auth/register').send({
      name,
      email,
      password,
    });
    const userLogin = await request(app).post('/api/v1/auth/login').send({
      email,
      password,
    });
    token = userLogin.body.data.accessToken;

    const account_1 = await request(app)
      .post('/api/v1/accounts')
      .send({
        user_id: Number(user.body.data.id),
        bank_name: 'BCA',
        bank_account_number: '1234567890',
        balance: 100000,
      })
      .set('Authorization', `Bearer ${token}`);

    const account_2 = await request(app)
      .post('/api/v1/accounts')
      .send({
        user_id: Number(user.body.data.id),
        bank_name: 'BRI',
        bank_account_number: '1234567890',
        balance: 100000,
      })
      .set('Authorization', `Bearer ${token}`);

    const transction_temp = await request(app)
      .post('/api/v1/transactions')
      .send({
        source_account_id: account_1.body.data.id,
        destination_account_id: account_2.body.data.id,
        amount: 200,
      })
      .set('Authorization', `Bearer ${token}`);

    account1 = account_1.body.data;
    account2 = account_2.body.data;
    userTemp = user.body.data;
    transactionTemp = transction_temp.body.data;
  });
  describe('Testing transaction POST /api/v1/transaction endpoint', () => {
    test('should can create new transaction', async () => {
      const { statusCode, body } = await request(app)
        .post('/api/v1/transactions')
        .send({
          source_account_id: account1.id,
          destination_account_id: account2.id,
          amount: 10000,
        })
        .set('Authorization', `Bearer ${token}`);
      expect(statusCode).toBe(201);
      expect(body).toHaveProperty('success');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.data).toHaveProperty('id');
      expect(body.data).toHaveProperty('source_account_id');
      expect(body.data).toHaveProperty('destination_account_id');
      expect(body.data).toHaveProperty('amount');
    });

    test("should can't create new transaction balance less", async () => {
      const { statusCode, body } = await request(app)
        .post('/api/v1/transactions')
        .send({
          source_account_id: account1.id,
          destination_account_id: account2.id,
          amount: 100000000,
        })
        .set('Authorization', `Bearer ${token}`);
      expect(statusCode).toBe(400);
      expect(body).toHaveProperty('success');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.success).toBe(false);
    });

    test("should can't create new transaction source_account_id or destination_account_id not found", async () => {
      const { statusCode, body } = await request(app)
        .post('/api/v1/transactions')
        .send({
          source_account_id: account1.id + 99,
          destination_account_id: account2.id + 99,
          amount: 100,
        })
        .set('Authorization', `Bearer ${token}`);
      expect(statusCode).toBe(404);
      expect(body).toHaveProperty('success');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.success).toBe(false);
    });

    test("should can't create new transaction unauthorized", async () => {
      const { statusCode, body } = await request(app)
        .post('/api/v1/transactions')
        .send({
          source_account_id: account1.id + 99,
          destination_account_id: account2.id + 99,
          amount: 100,
        });

      expect(statusCode).toBe(401);
      expect(body).toHaveProperty('success');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.success).toBe(false);
    });
  });

  describe('Testing get all of transaction GET /api/v1/transactions endpoint', () => {
    test('should can get all transactions', async () => {
      const { statusCode, body } = await request(app).get('/api/v1/transactions');
      expect(statusCode).toBe(200);
      expect(body).toHaveProperty('success');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
    });
  });

  describe('Tetsing get detail transaction GET /api/v1/transactions/{transactionId} endpoint ', () => {
    test('should can get detail transactions', async () => {
      const { statusCode, body } = await request(app).get(`/api/v1/transactions/${transactionTemp.id}`);
      expect(statusCode).toBe(200);
      expect(body).toHaveProperty('success');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.data.id).toBe(transactionTemp.id);
      expect(body.data.amount).toBe(transactionTemp.amount);
      expect(body.data.source_account_id).toBe(transactionTemp.source_account_id);
      expect(body.data.destination_account_id).toBe(transactionTemp.destination_account_id);
    });

    test("should can't get detail transactions tranasactionId not found", async () => {
      const { statusCode, body } = await request(app).get(`/api/v1/transactions/${transactionTemp.id}99`);
      expect(statusCode).toBe(404);
      expect(body).toHaveProperty('success');
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('data');
      expect(body.success).toBe(false);
    });
  });
});
