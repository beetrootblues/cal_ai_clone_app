import type { FoodItem, Analysis } from "../lib/scan";

const MAX_EDGE = 1024;

/** Downscale + compress a photo to a base64 data URL that fits Convex arg limits */
export async function fileToCompressedDataUrl(file: File | Blob): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);

  let quality = 0.72;
  let dataUrl = canvas.toDataURL("image/jpeg", quality);
  while (dataUrl.length > 850_000 && quality > 0.35) {
    quality -= 0.12;
    dataUrl = canvas.toDataURL("image/jpeg", quality);
  }
  return dataUrl;
}

export function splitDataUrl(dataUrl: string): { mimeType: string; base64: string } {
  const match = /^data:([^;]+);base64,(.*)$/.exec(dataUrl);
  if (!match) throw new Error("Invalid image data");
  return { mimeType: match[1], base64: match[2] };
}

export async function uploadMealPhoto(
  generateUploadUrl: () => Promise<string>,
  attachPhoto: (args: { mealId: string; storageId: string }) => Promise<void>,
  mealId: string,
  dataUrl: string
): Promise<void> {
  const postUrl = await generateUploadUrl();
  const blob = await (await fetch(dataUrl)).blob();
  const res = await fetch(postUrl, {
    method: "POST",
    headers: { "Content-Type": blob.type || "image/jpeg" },
    body: blob,
  });
  const { storageId } = (await res.json()) as { storageId: string };
  await attachPhoto({ mealId, storageId });
}
