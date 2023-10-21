const joi = require('joi');

const createProfileSchema = joi.object({
  identity_type: joi.string().required(),
  identity_number: joi.string().required(),
  address: joi.string().default(''),
});
module.exports = {
  createProfileSchema,
};
