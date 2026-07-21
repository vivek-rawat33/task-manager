import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";

//check existing user and password match then login user and return token
export const userSignin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        message: "password is required",
      });
    }
    const findUser = await User.findOne({ email }).select("+password");

    if (!findUser) {
      return res.status(404).json({
        message: "user not found",
      });
    }

    //check password
    const matchPass = await bcrypt.compare(password, findUser.password);

    if (!matchPass) {
      return res.status(401).json({
        message: "wrong password",
      });
    }
    const token = jwt.sign({ id: findUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.status(200).json({
      message: "user logged in successfully",
      token,
      user: { _id: findUser._id, name: findUser.name, email: findUser.email },
    });
  } catch (error) {
    next(error);
  }
};

//new user create
export const userSignup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }
    if (password.length < 6 || password.length > 100) {
      return res
        .status(400)
        .json({ message: "Password must be between 6 and 100 characters" });
    }
    if (name.length < 3 || name.length > 50) {
      return res
        .status(400)
        .json({ message: "Name must be between 3 and 50 characters" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      message: "User fetched successfully",
      user: { _id: req.user._id, name: req.user.name, email: req.user.email },
    });
  } catch (error) {
    next(error);
  }
};
