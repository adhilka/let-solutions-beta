export const API_KEY = import.meta.env.VITE_IMGBB_API_KEY || '';
const ENDPOINT = 'https://api.imgbb.com/1/upload';

export interface ImgBBResult {
  url:        string;
  displayUrl: string;
  thumbUrl:   string;
  deleteUrl:  string;
  id:         string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export async function uploadToImgBB(
  file: File,
  name?: string
): Promise<ImgBBResult> {
  try {
    if (!API_KEY) {
      throw new Error("ImgBB API key is missing");
    }
    const form = new FormData();
    form.append('key',   API_KEY);
    form.append('image', file);
    if (name) form.append('name', name);

    const res = await fetch(ENDPOINT, { method: 'POST', body: form });
    if (!res.ok) throw new Error(`ImgBB HTTP error: ${res.status}`);

    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message ?? 'ImgBB upload failed');

    return {
      url:        json.data.url,
      displayUrl: json.data.display_url,
      thumbUrl:   json.data.thumb?.url ?? json.data.url,
      deleteUrl:  json.data.delete_url,
      id:         json.data.id,
    };
  } catch (error) {
    console.warn("ImgBB upload failed or not configured. Falling back to inline Base64 content:", error);
    try {
      const base64String = await fileToBase64(file);
      return {
        url:        base64String,
        displayUrl: base64String,
        thumbUrl:   base64String,
        deleteUrl:  '',
        id:         `local-${Date.now()}`,
      };
    } catch (fallbackError) {
      console.error("Base64 fallback encoding failed:", fallbackError);
      throw error;
    }
  }
}
