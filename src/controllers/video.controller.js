import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiErrors.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description, isPublished } = req.body;
  // TODO: get video, upload to cloudinary, create video
  //Steps:
  /*
    check whether the user logged in or not.
    Get the user details.
    Check whether video and thumbnail are available from multer
    upload them to cloudinary.
    Check if the video and thumbnail uploaded successfully.
    Create a video model and upload
    */

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(401, "Login to continue");

  if ([title, description].some((field) => field.trim() == "")) {
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

  console.log(videoPath);
  const video = await Video.create({
    title,
    description,
    isPublished,
    videoFile: videoPath.url,
    thumbnail: thumbnailPath.url,
    owner: user._id,
    duration,
  });
  return res
    .status(201)
    .json(new ApiResponse(200, video, "Video published successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
