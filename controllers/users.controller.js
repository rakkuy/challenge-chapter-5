const prisma = require("../libs/prisma");
const bcrypt = require("bcrypt");
const { createProfileSchema } = require("../validations/profiles.validation");
const { createUserSchema } = require("../validations/users.validation");

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, identity_type, identity_number, address } =
      req.body;
    const { value, error } = await createUserSchema.validate({
      name,
      email,
      password,
      identity_type,
      identity_number,
      address,
    });

    const hashPasword = await bcrypt.hash(value.password, 10);

    if (error)
      return res
        .status(400)
        .json({ success: false, message: error.message, data: null });

    const user = await prisma.users.create({
      data: {
        name: value.name,
        email: value.email,
        password: hashPasword,
        profile: {
          create: {
            identity_type: value.identity_type,
            identity_number: value.identity_number,
            address: value.address,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: false, // karena password bersifat enkripsi maka tidak akan ditampilkan
        profile: {
          select: {
            identity_type: true,
            identity_number: true,
            address: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(201).json({ success: true, message: "Created", data: user });
  } catch (error) {
    next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        password: false, // karena password bersifat eskripsi maka tidak akan ditampilkan
        createdAt: true,
        updatedAt: true,
      },
    });
    res.status(200).json({ success: true, message: "OK", data: users });
  } catch (error) {
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: false, // karena password bersifat Ekskripsi maka tidak akan ditampilkan
        profile: {
          select: {
            identity_type: true,
            identity_number: true,
            address: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Not Found", data: null });

    res.status(200).json({ success: true, message: "OK", data: user });
  } catch (error) {
    next(error);
  }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { identity_type, identity_number, address } = req.body;
    const { value, error } = await createProfileSchema.validate({
      identity_type,
      identity_number,
      address,
    });

    if (error)
      return res
        .status(400)
        .json({ success: false, message: error.message, data: null });

    const profile = await prisma.users.update({
      where: {
        id: Number(userId),
      },
      data: {
        profile: {
          update: {
            where: {
              user_id: Number(userId),
            },
            data: {
              identity_type: value.identity_type,
              identity_number: value.identity_number,
              address: value.address,
            },
          },
        },
      },
      include: {
        profile: true,
      },
    });

    delete profile.password;

    return res
      .status(200)
      .json({ success: true, message: "Profile updated", data: profile });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUserProfile,
};
