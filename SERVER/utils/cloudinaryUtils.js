const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadStream = (file, folder, options = {}) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, ...options },
      (error, result) => {
        if (error) {
          console.error("Cloudinary Upload Error:", error);
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    ).end(file.data);
  });
};

exports.uploadResume = async (file) => {
  if (!file) throw new Error("No file provided");
  
  const fileExt = file.name ? file.name.split('.').pop().toLowerCase() : '';
  const isPdf = file.mimetype === "application/pdf" || fileExt === "pdf";
  if (!isPdf) throw new Error("Only PDF resumes are allowed");
  if (file.size > 2 * 1024 * 1024) throw new Error("File size exceeds the 2MB limit");

  return await uploadStream(file, "campusbridge/resumes", {
    resource_type: "auto",
    format: "pdf",
  });
};

exports.uploadLogo = async (file) => {
  if (!file) throw new Error("No file provided");

  const fileExt = file.name ? file.name.split('.').pop().toLowerCase() : '';
  const isImage = file.mimetype === "image/jpeg" || file.mimetype === "image/jpg" || file.mimetype === "image/png" ||
                  fileExt === "jpg" || fileExt === "jpeg" || fileExt === "png";
  if (!isImage) throw new Error("Only JPG, JPEG, and PNG logos are allowed");
  if (file.size > 1 * 1024 * 1024) throw new Error("File size exceeds the 1MB limit");

  return await uploadStream(file, "campusbridge/logos", {
    resource_type: "image",
  });
};

exports.uploadJD = async (file) => {
  if (!file) throw new Error("No file provided");

  const fileExt = file.name ? file.name.split('.').pop().toLowerCase() : '';
  const isPdf = file.mimetype === "application/pdf" || fileExt === "pdf";
  if (!isPdf) throw new Error("Only PDF job description documents are allowed");
  if (file.size > 5 * 1024 * 1024) throw new Error("File size exceeds the 5MB limit");

  return await uploadStream(file, "campusbridge/jds", {
    resource_type: "auto",
    format: "pdf",
  });
};
