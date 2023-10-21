const prisma = require('../libs/prisma');
const { Prisma } = require('@prisma/client');
const { createAccountSchema } = require('../validations/accounts.validation');

const createAccount = async (req, res, next) => {
  try {
    const { user_id, bank_name, bank_account_number, balance } = req.body;
    const { value, error } = await createAccountSchema.validate({
      user_id,
      bank_name,
      bank_account_number,
      balance,
    });

    if (error) return res.status(400).json({ success: false, message: error.message, data: null });
    const account = await prisma.bank_Accounts.create({
      data: {
        bank_name: value.bank_name,
        bank_account_number: value.bank_account_number, // apakah perlu dikirimkan??
        balance: value.balance,
        user: {
          connect: {
            id: value.user_id,
          },
        },
      },
    });

    res.status(201).json({ success: true, message: 'Created', data: account });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return res.status(404).json({ success: false, message: 'user_id not found', data: null });
      return res.status(400).json({ success: false, message: error.message, data: null });
    }
    next(error);
  }
};

const getAccounts = async (req, res, next) => {
  try {
    const accounts = await prisma.bank_Accounts.findMany({
      select: {
        id: true,
        bank_name: true,
        balance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({ success: true, message: 'OK', data: accounts });
  } catch (error) {
    next(error);
  }
};

const getAccountById = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const account = await prisma.bank_Accounts.findUnique({
      where: {
        id: id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!account) return res.status(404).json({ success: false, message: 'Not Found', data: null });

    const sendTransactions = await prisma.transactions.findMany({
      where: {
        source_account_id: account.id,
      },
    });
    const reciveTransactions = await prisma.transactions.findMany({
      where: {
        destination_account_id: account.id,
      },
      select: {
        amount: true,
        source_account_id: true,
        destination_account_id: true,
      },
    });
    account.history = {
      sender: [...sendTransactions],
      recive: [...reciveTransactions],
    };

    if (!account) return res.status(404).json({ success: false, message: 'Not Found', data: null });

    res.status(200).json({ success: true, message: 'OK', data: account });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAccount,
  getAccounts,
  getAccountById,
};
