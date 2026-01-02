
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
 * Requires Private Key for Basic Auth.
 * Includes a timeout to prevent hanging.
 */
export const deleteFromImageKit = async (fileId: string): Promise<void> => {
  if (!fileId) {
    console.warn("[ImageKit Service] No fileId provided, skipping.");
    return;
  }
  
  console.log(`[ImageKit Service] Starting deletion for fileId: ${fileId}`);
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const privateKey = IK_CONFIG.privateKey.trim();
    if (!privateKey) {
        throw new Error("Missing ImageKit Private Key in configuration");
    }

    // Basic Auth header format: "Basic base64(username:password)"
    const auth = btoa(`${privateKey}:`);
    
    // NOTE: We do not set Content-Type for DELETE requests to avoid CORS preflight issues with some servers
    const response = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${auth}`
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log(`[ImageKit Service] API Response Status: ${response.status}`);

    // If file is already gone (404), treat as success
    if (response.status === 404) {
      console.warn(`[ImageKit Service] File ${fileId} not found (already deleted). Treating as success.`);
      return;
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[ImageKit Service] Delete failed. Status: ${response.status}, Body: ${errText}`);
      throw new Error(`ImageKit Delete Failed: ${response.status} ${response.statusText} - ${errText}`);
    }
    
    console.log(`[ImageKit Service] Successfully deleted file ${fileId}`);
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error("[ImageKit Service] Exception during deletion:", error);
    throw error; 
  }
};
