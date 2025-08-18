import { ApiError } from "../utlis/ApiErrors.js";
import { asyncHandler } from "../utlis/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utlis/cloudinary.js";
import { ApiResponse } from "../utlis/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  // Get user details from frontend
  const { username, email, fullname, password } = req.body;
  
  // Validation - check if all fields are provided
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // Check if user already exists
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  // Check for uploaded files
  console.log("Avatar files:", req.files?.avatar);
  console.log("Cover image files:", req.files?.coverImage);

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  console.log("Avatar local path:", avatarLocalPath);
  console.log("Cover image local path:", coverImageLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  // Upload files to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Failed to upload avatar to Cloudinary");
  }

  console.log("Avatar uploaded successfully:", avatar.url);
  console.log("Cover image uploaded:", coverImage?.url);

  // Create user object - create entry in db
  const user = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // Remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

export { registerUser };