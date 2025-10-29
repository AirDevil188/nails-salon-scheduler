import { useQueryClient, useMutation } from "@tanstack/react-query";
import api from "../utils/axiosInstance";
import { userKeys } from "../utils/queryKeys";

// Constants (These should come from environment variables)
const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/";

const uploadToCloudinary = async (imageUri) => {
  // fetch from backend
  const {
    signature,
    timestamp,
    publicId,
    cloudName,
    apiKey,
    folder,
    eager,
    invalidate,
  } = await api
    .get("api/users/profile/upload/signature")
    .then((res) => res.data);

  const formData = new FormData();

  // 2. Prepare the file
  const uriParts = imageUri.split(".");
  const fileType = uriParts[uriParts.length - 1];

  formData.append("file", {
    uri: imageUri,
    type: `image/${fileType}`,
    name: `user_avatar.${fileType}`,
  });

  // 3. Append ALL necessary parameters (Signed and Auth)
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("api_key", apiKey);

  // Signed parameters (MUST match backend's signed options)
  formData.append("public_id", publicId);
  formData.append("folder", folder);
  formData.append("eager", eager);
  formData.append("invalidate", invalidate); // Included in signature for maximum reliability
  formData.append("overwrite", "true"); // Always overwrite user avatar

  const cloudinaryUrl = `${CLOUDINARY_UPLOAD_URL}${cloudName}/image/upload`;

  // 4. Execute the upload
  const response = await fetch(cloudinaryUrl, {
    method: "POST",
    body: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Cloudinary Response Error:", response.status, errorText);
    throw new Error(
      "Failed to upload image to Cloudinary. Status: " + response.status
    );
  }

  const result = await response.json();

  // return the full URL for the backend to save
  return result.secure_url;
};

// saving full cloudinary url to db
const saveAvatarOnServer = async (fullUrl) => {
  const response = await api.post("api/users/profile/avatar", {
    publicId: fullUrl,
  });
  return response.data;
};

export default function useUploadProfileAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (imageUri) => {
      const fullUrl = await uploadToCloudinary(imageUri);
      return saveAvatarOnServer(fullUrl);
    },

    onSuccess: (data) => {
      // get the newPublicId and newAvatarVersion
      const newAvatarPublicId = data.avatar;
      const newAvatarVersion = data.avatarVersion;

      // update the local cache
      queryClient.setQueryData(userKeys.profile, (oldData) => {
        if (oldData?.profile) {
          return {
            ...oldData,
            profile: {
              ...oldData.profile,
              // update with new full url
              avatar: newAvatarPublicId,
              // update version number
              avatarVersion: newAvatarVersion,
            },
          };
        }
        return oldData;
      });

      queryClient.invalidateQueries({ queryKey: userKeys.profile });
    },

    onError: (error) => {
      console.error("Avatar upload failed in mutation:", error);
    },
  });
}
