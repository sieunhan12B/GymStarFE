export const isVideo = (url = "") => {
  return /\.(mp4|webm|ogg)$/i.test(url);
};
