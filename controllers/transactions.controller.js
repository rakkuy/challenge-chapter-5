const prisma = require('../libs/prisma');
const { createTransactionSchema } = require('../validations/transactions.validation');

const createTransaction = async (req, res, next) => {
  try {
    const { amount, source_account_id, destination_account_id } = req.body;
    const { value, error } = await createTransactionSchema.validate({
      amount,
      source_account_id,
      destination_account_id,
    });

    if (error) return res.status(400).json({ success: false, message: error.message, data: null });

    const sourceAccount = await prisma.bank_Accounts.findUnique({
      where: {
        id: value.source_account_id,
      },
    });

    if (!sourceAccount) return res.status(404).json({ success: false, message: 'Source account Id Not Found', data: null });

    const destinationAccount = await prisma.bank_Accounts.findUnique({
      where: {
        id: value.destination_account_id,
      },
    });

    if (!destinationAccount) return res.status(404).json({ success: false, message: 'Destination account Id Not Found', data: null });

    // validasi apakah saldo cukup
    if (sourceAccount.balance < value.amount) return res.status(400).json({ success: false, message: 'Balance less', data: null });

    // kurangi saldo pengirim
    await prisma.bank_Accounts.update({
      where: {
        id: sourceAccount.id,
      },
      data: {
        balance: Number(sourceAccount.balance) - value.amount,
      },
    });

    // tambahkan saldo penerima
    await prisma.bank_Accounts.update({
      where: {
        id: destinationAccount.id,
      },
      data: {
        balance: Number(destinationAccount.balance) + value.amount,
      },
    });

    // jika berhasil tambahkan data pada tabel transaction
    const transaction = await prisma.transactions.create({
      data: {
        amount: value.amount,
        source_account_id: value.source_account_id,
        destination_account_id: value.destination_account_id,
      },
    });

    res.status(201).json({ success: true, message: 'Created', data: transaction });
  } catch (error) {
    next(error);
  }
};

const getTransactions = async (req, res, next) => {
  try {
    const transactions = await prisma.transactions.findMany();

    res.status(200).json({ success: true, message: 'OK ', data: transactions });
  } catch (error) {
    next(error);
  }
};

const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const transaction = await prisma.transactions.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        destinationAccount: {
          select: {
            user_id: true,
            user: {
              select: {
                name: true,
              },
            },
            bank_name: true,
          },
        },
        sourceAccount: {
          select: {
            user_id: true,
            user: {
              select: {
                name: true,
              },
            },
            bank_name: true,
          },
        },
      },
    });

    if (!transaction) return res.status(404).json({ success: false, message: 'Not Found', data: null });
    transaction.source_account_detail = {
      user_id: transaction.sourceAccount.user_id,
      ...transaction.sourceAccount.user,
      bank_name: transaction.sourceAccount.bank_name,
    };

    transaction.destination_account_detail = {
      user_id: transaction.destinationAccount.user_id,
      ...transaction.destinationAccount.user,
      bank_name: transaction.destinationAccount.bank_name,
    };

    delete transaction.sourceAccount;
    delete transaction.destinationAccount;

    res.status(200).json({ success: true, message: 'OK ', data: transaction });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
};
