import { apiClient } from './client';

export interface IAssetCreateResult {
  identifier: string;
  versionKey: string;
}

export async function createMediaAsset(
  file: File,
  channel: string,
  createdBy: string,
): Promise<IAssetCreateResult> {
  const response = await apiClient.post('/action/asset/v1/create', {
    request: {
      asset: {
        name: file.name,
        mimeType: file.type,
        primaryCategory: 'asset',
        mediaType: file.type.startsWith('image/') ? 'image' : 'video',
        channel,
        createdBy,
        contentType: 'Asset',
      },
    },
  });
  return response.data?.result as IAssetCreateResult;
}

export async function getPreSignedUrl(
  assetId: string,
  fileName: string,
  mimeType: string,
): Promise<{ preSignedUrl: string; url: string; fields?: Record<string, string> }> {
  const response = await apiClient.post(
    `/action/content/v3/upload/url/${assetId}`,
    { request: { content: { fileName } } },
    { headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'Content-Type-Original': mimeType } },
  );
  return response.data?.result as { preSignedUrl: string; url: string; fields?: Record<string, string> };
}

export async function uploadToBlob(
  preSignedUrl: string,
  file: File,
  fields?: Record<string, string>,
): Promise<void> {
  if (fields) {
    const formData = new FormData();
    Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
    formData.append('file', file);
    await fetch(preSignedUrl, { method: 'POST', body: formData });
  } else {
    await fetch(preSignedUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
  }
}

export async function finalizeAssetUpload(assetId: string): Promise<string> {
  const response = await apiClient.post(`/action/asset/v1/upload/${assetId}`, {});
  return response.data?.result?.content_url as string;
}

export async function uploadAsset(
  file: File,
  channel: string,
  createdBy: string,
): Promise<string> {
  const { identifier } = await createMediaAsset(file, channel, createdBy);
  const { preSignedUrl, fields } = await getPreSignedUrl(identifier, file.name, file.type);
  await uploadToBlob(preSignedUrl, file, fields);
  const url = await finalizeAssetUpload(identifier);
  return url;
}
