// utils.js
import {Share} from 'react-native';

export const truncateText = (text, maxLength) => {
  if (text?.length > maxLength) {
    return text?.substring(0, maxLength) + '...';
  }
  return text;
};

export const toTitleCase = str => {
  return str?.replace(/\b\w/g, char => char.toUpperCase());
};

export const handleSinglePostShare = async post => {
  try {
    // const postUrl = `https://app.circlespace.in/single-post-share/${post._id}`;
    const postUrl = `https://app.circlespace.in/post/${post._id}`;
    const message =
      `Check out this amazing design on CircleSpace! Explore more inspiration here\n\n` +
      `View the design: ${postUrl}`;
    await Share.share({
      message: message,
    });
  } catch (error) {
    console.error('Error sharing post:', error);
  }
};

export const handleShareProfile = async (profile, isBusiness = false) => {
  try {
    // Construct the shareable profile URL based on the account type
    // const profileUrl = isBusiness
    //   ? `https://app.circlespace.in/business-profile/${profile._id}`
    //   : `https://app.circlespace.in/personal-profile/${profile._id}`;
    const profileUrl = `https://app.circlespace.in/profile/${profile._id}`;
    // Construct the message to be shared
    const message =
      `Check out this ${
        isBusiness ? 'business' : ''
      } profile on CircleSpace!\n\n` +
      `Username: ${profile.username}\n\n` +
      `View profile: ${profileUrl}`;

    // Use the Share API to share the message
    await Share.share({
      message: message,
    });
  } catch (error) {
    console.error('Error sharing profile:', error);
  }
};

export const handleShareProject = async project => {
  try {
    // Construct the shareable project URL
    const projectUrl = `https://app.circlespace.in/project/${project._id}`;

    // Construct the message to be shared
    const message =
      `Check out this amazing project on CircleSpace!\n\n` +
      `View the project: ${projectUrl}`;

    // Use the Share API to share the message
    await Share.share({
      message: message,
    });
  } catch (error) {
    console.error('Error sharing project:', error);
  }
};

export const handleShareVideo = async video => {
  try {
    // Construct the shareable video URL
    const videoUrl = `https://app.circlespace.in/video/${video._id}`;
    console.log('videoUrl ::', videoUrl);

    // Construct the message to be shared
    const message =
      `Check out this amazing project video on CircleSpace!\n\n` +
      `View the Video: ${videoUrl}`;

    // Use the Share API to share the message
    await Share.share({
      message: message,
    });
  } catch (error) {
    console.error('Error sharing project:', error);
  }
};

export const handleShareJob = async job => {
  try {
    // Construct the shareable video URL
    const jobUrl = `https://app.circlespace.in/job/${job._id}`;
    // Construct the message to be shared
    const message =
      `Check out this amazing job posted on CircleSpace!\n\n` +
      `View the Job: ${jobUrl}`;

    // Use the Share API to share the message
    await Share.share({
      message: message,
    });
  } catch (error) {
    console.error('Error sharing project:', error);
  }
};

export const handleShareCollection = async collection => {
  try {
    // Construct the shareable video URL
    const collectionUrl = `https://app.circlespace.in/collection/${collection._id}`;
    // Construct the message to be shared
    const message =
      `Check out this amazing Collection posted on CircleSpace!\n\n` +
      `View the collection: ${collectionUrl}`;

    // Use the Share API to share the message
    await Share.share({
      message: message,
    });
  } catch (error) {
    console.error('Error sharing project:', error);
  }
};
