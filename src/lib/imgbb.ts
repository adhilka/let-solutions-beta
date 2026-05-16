export const API_KEY = import.meta.env.VITE_IMGBB_API_KEY || '';
const ENDPOINT = 'https://api.imgbb.com/1/upload';

export interface ImgBBResult {
  url:        string;   // Full-size direct image URL
  displayUrl: string;   // Display-optimized URL
  thumbUrl:   string;   // 180x180 thumbnail
  deleteUrl:  string;   // URL to delete the image via ImgBB
  id:         string;   // ImgBB image ID
}

export async function uploadToImgBB(
  file: File,
  name?: string
): Promise<ImgBBResult> {
  if (!API_KEY) throw new Error("ImgBB API key is missing");
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
}
