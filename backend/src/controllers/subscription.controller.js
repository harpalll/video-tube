import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }

  const subscribed = await Subscription.findOne({
    $and: [{ channel: channelId }, { subscriber: req.user._id }],
  });

  if (!subscribed) {
    const subscribe = await Subscription.create({
      subscriber: req.user._id,
      channel: channelId,
    });

    if (!subscribe) {
      throw new ApiError(500, "Error while Subscribing");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, subscribe, "Channel Subscribed"));
  }

  const unsubscribe = await Subscription.findByIdAndDelete(subscribed._id);
  if (!unsubscribe) {
    throw new ApiError(500, "Error while Unsubscribing");
  }

  return res.status(200).json(new ApiResponse(200, {}, "Channel Unsubscribed"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId)) {
    throw new ApiError(400, "Invalid Subscriber Id.");
  }

  const subscriberList = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "subscriber",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        subscriber: {
          $first: "$subscriber",
        },
      },
    },
    {
      $project: {
        subscriber: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!subscriberList) {
    throw new ApiError(400, "Error Fetching Subscribers List");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, subscriberList, "Subscriber Fetched Successfully.")
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid Channel Id");
  }

  const channelList = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $lookup: {
        from: "User",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
        pipeline: [
          {
            $project: {
              fullName: 1,
              username: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        channel: {
          $first: "$channel",
        },
      },
    },
    {
      $project: {
        channel: 1,
        createdAt: 1,
      },
    },
  ]);

  if (!channelList) {
    throw new ApiError(500, "Error fetching Subscribed Channels.");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelList,
        "Subscribed Channels fetched Successfully."
      )
    );
});

export { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription };

