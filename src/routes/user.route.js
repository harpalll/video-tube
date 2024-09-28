import { Router } from "express";
import {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { Auth } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);

//* secured routes
router.route("/logout").post(Auth, logOutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(Auth, changeCurrentPassword);
router.route("/current-user").get(Auth, getCurrentUser);
router.route("/update-account").patch(Auth, updateAccountDetails);
router
  .route("/update-avatar")
  .patch(Auth, upload.single("avatar"), updateUserAvatar);
router
  .route("/update-cover-image")
  .patch(Auth, upload.single("coverImage"), updateUserCoverImage);
router.route("/channel/:username").get(Auth, getUserChannelProfile);
router.route("/history").get(Auth, getWatchHistory);

export default router;
