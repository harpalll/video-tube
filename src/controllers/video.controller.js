import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType } = req.query;
  const videos = await Video.aggregate([
    {
      $match: {
        $or: [
          {
            title: { $regex: query, $options: "i" },
          },
          {
            description: { $regex: query, $options: "i" },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "createdBy",
      },
    },
    {
      $unwind: "$createdBy",
    },
    {
      $project: {
        thumbnail: 1,
        videoFile: 1,
        title: 1,
        description: 1,
        createdBy: {
          fullName: 1,
          username: 1,
          avatar: 1,
        },
      },
    },
    {
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1,
      },
    },
    {
      $skip: (page - 1) * limit,
    },
    {
      $limit: parseInt(limit),
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Fetched All Videos"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  let videoLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.videoFile) &&
    req.files.videoFile.length > 0
  ) {
    videoLocalPath = req.files.videoFile[0].path;
  }
  let thumbnailLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.thumbnail) &&
    req.files.thumbnail.length > 0
  ) {
    thumbnailLocalPath = req.files.thumbnail[0].path;
  }

  if (!videoLocalPath) {
    throw new ApiError(400, "Video file required");
  }
  if (!thumbnailLocalPath) {
    throw new ApiError(400, "thumbnail file required");
  }

  const videoFile = await uploadToCloudinary(videoLocalPath);
  const thumbnail = await uploadToCloudinary(thumbnailLocalPath);

  if (!videoFile)
    throw new ApiError(409, "Error While Uploading The videoFile");
  if (!thumbnail)
    throw new ApiError(409, "Error While Uploading The Thumbnail");

  const duration = videoFile?.duration;

  const video = await Video.create({
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    title,
    description,
    duration,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(500, "Error while publishing the video");
  }

  return res.status(201).json(new ApiResponse(201, video, "Video Published."));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }
  const video = await Video.findByIdAndUpdate(
    videoId,
    { $inc: { views: 1 } },
    { new: true }
  );

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  const user = await User.findById(req.user._id);

  if (!user.watchHistory.includes(videoId)) {
    user.watchHistory.push(videoId);
    await user.save();
  }

  return res.status(200).json(new ApiResponse(200, video, "Video Fetched"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const newThumbnailLocalPath = req.file?.path;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }
  if (!title || !description) {
    throw new ApiError(400, "Provide updated Title and Description");
  }
  if (!newThumbnailLocalPath) {
    throw new ApiError(400, "Provide Thumbnail file");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() != req.user._id) {
    throw new ApiError(403, "You are not allowed to update this video");
  }

  const deleteThumbnailResponse = await deleteFromCloudinary(video.thumbnail);
  if (deleteThumbnailResponse.result !== "ok") {
    throw new ApiError(
      500,
      "Error while deleting old thumbnail from cloudinary"
    );
  }

  const newThumbnail = await uploadToCloudinary(newThumbnailLocalPath);
  if (!newThumbnail.url) {
    throw new ApiError(500, "Error while uploading new thumbnail");
  }

  const updateVideo = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        title,
        description,
        thumbnail: newThumbnail.url,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updateVideo, "Video details updated"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id) {
    throw new ApiError(403, "You are not allowed to delete this video");
  }

  const cloudinaryDeleteVideoResponse = await deleteFromCloudinary(
    video.videoFile
  );
  if (cloudinaryDeleteVideoResponse.result !== "ok") {
    throw new ApiError(500, "Error while deleting video from cloudinary");
  }

  const cloudinaryDeleteThumbnailResponse = await deleteFromCloudinary(
    video.thumbnail
  );
  if (cloudinaryDeleteThumbnailResponse.result !== "ok") {
    throw new ApiError(500, "Error while deleting thumbnail from cloudinary");
  }

  const deleteVideo = await Video.findByIdAndDelete(videoId);
  if (!deleteVideo) {
    throw new ApiError(500, "Error while deleting video");
  }

  return res.status(200).json(new ApiResponse(200, {}, "Video Deleted"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid Video ID");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video Not Found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not allowed to modify this video status");
  }

  const modifyVideoPublishStatus = await Video.findByIdAndUpdate(
    videoId,
    {
      $set: {
        isPublished: !video.isPublished,
      },
    },
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        modifyVideoPublishStatus,
        "Video Publish status modified"
      )
    );
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
