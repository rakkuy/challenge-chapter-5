const joi = require('joi');

const createTransactionSchema = joi.object({
  source_account_id: joi.number().required(),
  destination_account_id: joi.number().required(),
  amount: joi.number().required().min(1),
});

module.exports = {
  createTransactionSchema,
};
