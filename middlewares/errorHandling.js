const { Prisma } = require('@prisma/client');

const prismaError = (err, req, res, next) => {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(400).json({ success: false, message: `${err.meta.target[0]} already in use`, data: null });
    }
    return res.status(400).json({ success: false, message: err.message, data: null });
  } else {
    next(err);
  }
};

const serverError = (err, req, res, next) => {
  return res.status(500).json({ success: false, message: err.message, data: null });
};

const clientError = (err, req, res, next) => {
  if (err instanceof SyntaxError) {
    return res.status(400).json({ success: false, message: err.message, data: null });
  } else {
    next(err);
  }
};

const notFound = (req, res, next) => {
  return res.status(404).json({ success: false, message: 'Page Not Found', data: null });
};

module.exports = {
  prismaError,
  serverError,
  clientError,
  notFound,
};
