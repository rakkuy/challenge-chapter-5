const joi = require('joi');

const createUserSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().email().required(),
  password: joi.string().min(8).required(),
  identity_type: joi.string().default(''),
  identity_number: joi.string().default(''),
  address: joi.string().default(''),
});

module.exports = {
  createUserSchema,
};
