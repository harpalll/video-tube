import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video Id");
  }

  const user = req.user._id;
  const likedVideo = await Like.findOne({
    $and: [{ video: videoId }, { likedBy: user }],
  });

  if (!likedVideo) {
    const like = await Like.create({
      video: videoId,
      likedBy: user,
    });

    if (!like) {
      throw new ApiError(500, "Error while liking the video");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, like, "Video Liked Successfully."));
  }

  const unlikeVideo = await Like.findByIdAndDelete(likedVideo._id);
  if (!unlikeVideo) {
    throw new ApiError(500, "Error while unliking the video");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, unlikeVideo, "Video Unliked Successfully."));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  if (!isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid Comment Id");
  }

  const user = req.user._id;
  const likedComment = await Like.findOne({
    $and: [{ comment: { commentId } }, { likedBy: user }],
  });

  if (!likedComment) {
    const like = await Like.create({
      video: videoId,
      likedBy: user,
    });

    if (!like) {
      throw new ApiError(500, "Error while liking comment");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, like, "Comment Liked Successfully."));
  }

  const unlikedComment = await Like.findByIdAndDelete(likedComment._id);
  if (!unlikedComment) {
    throw new ApiError(500, "Error while unliking the comment");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, unlikedComment, "Comment Unliked Successfully.")
    );
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid Tweet Id");
  }

  const user = req.user._id;
  const likedTweet = await Like.findOne({
    $and: [{ tweet: { tweetId } }, { likedBy: user }],
  });

  if (!likedTweet) {
    const like = await Like.create({
      tweet: tweetId,
      likedBy: user,
    });

    if (!like) {
      throw new ApiError(500, "Error while liking tweet");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, like, "Tweet Liked Successfully."));
  }

  const unlikedTweet = await Like.findByIdAndDelete(likedTweet._id);
  if (!unlikedTweet) {
    throw new ApiError(500, "Error while unliking the tweet");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, unlikedTweet, "Tweet Unliked Successfully."));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        video: { $exists: true, $ne: null },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: "$video",
    },
    {
      $lookup: {
        from: "users",
        localField: "video.owner",
        foreignField: "_id",
        as: "video.owner",
      },
    },
    {
      $addFields: {
        "video.owner": { $arrayElemAt: ["$video.owner", 0] },
      },
    },
    {
      $project: {
        "video.videoFile": 1,
        "video.thumbnail": 1,
        "video.title": 1,
        "video.duration": 1,
        "video.views": 1,
        "video.owner.avatar": 1,
        "video.owner.username": 1,
        "video.owner.fullName": 1,
      },
    },
  ]);

  if (!likedVideos.length) {
    return res
      .status(404)
      .json(new ApiResponse(404, [], "No liked videos found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, likedVideos, "Fetched Liked Videos"));
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getLikedVideos };
