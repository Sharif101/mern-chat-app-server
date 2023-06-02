const asynsHandler = require("express-async-handler");
const User = require("../Models/userModel");
const generateToken = require("../config/generateToken");

// api/user?serach=sharif
const allUsers = asynsHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  // akhhne sudu word diye search krle chole asbe
  // const users = await User.find(keyword);

  //akhn serach er sate jwt use kra
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });

  res.send(users);
});

const registerUser = asynsHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all feild");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Faild to create the user");
  }
});

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
// -------------------------
const authUser = asynsHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

// (module.exports = registerUser), authUser, allUsers;
// module.exports = { authUser };
// module.exports = authUser;
// module.exports = { registerUser, authUser };

// export default registerUser;

module.exports = { allUsers, registerUser, authUser };
