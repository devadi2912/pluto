
import ImageKit from "imagekit-javascript";
import { IK_CONFIG } from "./imagekit-config";
import { generateSignature } from "./imagekit-auth";

// Initialize the SDK
export const imagekit = new ImageKit({
  publicKey: IK_CONFIG.publicKey,
  urlEndpoint: IK_CONFIG.urlEndpoint,
});

/**
 * Uploads a file to ImageKit using the signed authentication flow.
 */
export const uploadToImageKit = async (file: File, fileName?: string): Promise<{ url: string, fileId: string, name: string }> => {
  try {
    const token = crypto.randomUUID();
    const expire = Math.floor(Date.now() / 1000) + 2400; // 40 minutes from now
    const signature = await generateSignature(token, expire.toString());

    return new Promise((resolve, reject) => {
      imagekit.upload({
        file: file,
        fileName: fileName || file.name,
        token: token,
        expire: expire,
        signature: signature,
        useUniqueFileName: true,
        tags: ["pluto_app_upload"],
        folder: "/pluto_uploads"
      }, (err, result) => {
        if (err) {
          console.error("ImageKit Upload Error:", err);
          reject(err);
        } else if (result) {
          resolve({
            url: result.url,
            fileId: result.fileId,
            name: result.name
          });
        }
      });
    });
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

/**
 * Deletes a file from ImageKit using the Management API.
 * Requires Private Key for Basic Auth (Client-side usage allowed for this MVP architecture).
 */
export const deleteFromImageKit = async (fileId: string): Promise<void> => {
  try {
    // Encode private key for Basic Auth (username is private key, password is empty)
    const auth = btoa(IK_CONFIG.privateKey + ':');
    
    const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("ImageKit Delete Error Response:", errText);
      throw new Error(`Failed to delete file from ImageKit: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Delete failed:", error);
    throw error;
  }
};
