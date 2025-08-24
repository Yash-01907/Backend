import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

/* ----------------------- GET ALL VIDEOS ----------------------- */
const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  // TODO: get all videos based on query, sort, pagination
});

/* ----------------------- PUBLISH A VIDEO ----------------------- */
const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;

  if ([title, description].some((field) => field.trim() === "")) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video and thumbnail are required");
  }

  const videoPath = await uploadOnCloudinary(videoLocalPath);
  const thumbnailPath = await uploadOnCloudinary(thumbnailLocalPath);

  if (!videoPath || !thumbnailPath) {
    throw new ApiError(400, "Video and thumbnail upload failed");
  }

  const { duration } = videoPath;

  const video = await Video.create({
    title,
    description,
    isPublished,
    videoFile: videoPath.url,
    thumbnail: thumbnailPath.url,
    owner: req.user._id,
    duration,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, video, "Video published successfully"));
});

/* ----------------------- GET VIDEO BY ID ----------------------- */
const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  return res.status(200).json(new ApiResponse(200, video, "Video found"));
});

/* ----------------------- UPDATE VIDEO ----------------------- */
const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  const { title, description } = req.body;
  if ([title, description].some((field) => field.trim() === "")) {
    throw new ApiError(400, "Title and description are required");
  }

  const thumbnailLocalPath = req.file?.path;
  if (!thumbnailLocalPath) throw new ApiError(400, "Thumbnail is required");

  const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

  video.title = title;
  video.description = description;
  video.thumbnail = thumbnail.url;
  await video.save({ validateBeforeSave: false });

  return res.status(200).json(new ApiResponse(200, video, "Video updated"));
});

/* ----------------------- DELETE VIDEO ----------------------- */
const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { user } = req;

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  if (video.owner.toString() !== user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video deleted successfully"));
});

/* ----------------------- TOGGLE PUBLISH STATUS ----------------------- */
const togglePublishStatus = asyncHandler(async (req, res) => {
    console.log(req)
  const { videoId } = req.params;

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found");

  video.isPublished = !video.isPublished;
  await video.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video updated successfully"));
});

/* ----------------------- EXPORTS ----------------------- */
export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
