import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return new ApiError(400, "Tweet Content is missing.");
  }

  const tweet = await Tweet.create({
    content,
    owner: req.user?._id,
  });

  if (!tweet) {
    return new ApiError(500, "Error while creating tweet.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet Uploaded Successfully."));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid User Id.");
  }

  const tweets = await Tweet.find({ owner: userId });

  if (tweets.length === 0) {
    throw new ApiError(404, "No tweets found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets Fetched Successfully."));
});

const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    return new ApiError(400, "Tweet Content is missing.");
  }

  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet Id.");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(400, "Tweet ID is invalid");
  }

  const owner = req.user._id;

  if (!tweet.owner.equals(owner)) {
    throw new ApiError(400, "You are not allowed to modify this tweet");
  }

  const modifiedTweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: {
        content,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(201, modifiedTweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  if (!isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet Id.");
  }

  const tweet = await Tweet.findById(tweetId);
  if (!tweet) {
    throw new ApiError(404, "Tweet not found");
  }
  if (tweet.owner !== req.user?._id) {
    throw new ApiError(403, "You are not allowed to delete this tweet");
  }

  const response = await Tweet.findByIdAndDelete(tweetId);
  if (!response) {
    throw new ApiError(400, "Something went wrong while deleting the tweet");
  }

  return response
    .status(200)
    .json(new ApiResponse(200, {}, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
