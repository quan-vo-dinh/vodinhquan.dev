const CLOUDINARY_IMAGE_UPLOAD_PATH = "/image/upload/";

export function getCloudinaryImageDeliveryUrl(
  secureUrl: string,
  maxWidth: number
) {
  try {
    const url = new URL(secureUrl);
    const uploadPathIndex = url.pathname.indexOf(CLOUDINARY_IMAGE_UPLOAD_PATH);

    if (
      url.protocol !== "https:" ||
      !url.hostname.endsWith(".cloudinary.com") ||
      uploadPathIndex === -1
    ) {
      return secureUrl;
    }

    const prefix = url.pathname.slice(
      0,
      uploadPathIndex + CLOUDINARY_IMAGE_UPLOAD_PATH.length
    );
    const sourcePath = url.pathname.slice(
      uploadPathIndex + CLOUDINARY_IMAGE_UPLOAD_PATH.length
    );
    const transformation = `f_auto,q_auto,c_limit,w_${maxWidth}`;

    url.pathname = `${prefix}${transformation}/${sourcePath}`;
    return url.toString();
  } catch {
    return secureUrl;
  }
}
