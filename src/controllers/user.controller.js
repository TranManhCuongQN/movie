import userModel from "../models/user.model.js";
import jsonwebtoken from "jsonwebtoken";
import responseHandler from "../handlers/response.handler.js";

const signup = async (req, res) => {
  try {
    const { username, password, displayName } = req.body;
    const checkUser = await userModel.findOne({ username });

    if (checkUser) {
      return responseHandler.badRequest(res, "User already exist");
    }

    const user = new userModel();
    user.displayName = displayName;
    user.username = username;
    user.setPassword(password);

    await user.save();

    const token = jsonwebtoken.sign(
      { data: user.id },
      process.env.TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    let userObj = user._doc;
    delete userObj.password, delete userObj.salt;

    responseHandler.created(res, {
      token,
      ...userObj,
      id: user.id,
    });
  } catch (error) {
    responseHandler.error(res);
  }
};

const signin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await userModel
      .findOne({ username })
      .select("username displayName salt password");

    if (!user) return responseHandler.badRequest(res, "User not exist");

    if (!user.validPassword(password))
      return responseHandler.badRequest(res, "Wrong password");

    const token = jsonwebtoken.sign(
      { data: user.id },
      process.env.TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    user.password = undefined;
    user.salt = undefined;

    responseHandler.created(res, {
      token,
      ...user._doc,
      id: user.id,
    });
  } catch (error) {
    responseHandler.error(res);
  }
};

const updatePassword = async (req, res) => {
  try {
    const { password, newPassword } = req.body;

    console.log("password:", password);
    console.log("newPassword:", newPassword);

    const user = await userModel
      .findById(req.user.id)
      .select("password id salt");

    if (!user) return responseHandler.unauthorized(res);

    if (!user.validPassword(password))
      return responseHandler.badRequest(res, "Wrong password");

    user.setPassword(newPassword);

    await user.save();

    responseHandler.OK(res);
  } catch (error) {
    responseHandler.error(res);
  }
};

const getInfo = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) return responseHandler.notFound(res);

    responseHandler.OK(res, user);
  } catch (error) {
    responseHandler.error(res);
  }
};

export default {
  signup,
  signin,
  updatePassword,
  getInfo,
};
