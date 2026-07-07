import { v4 as uuidv4 } from 'uuid';
import { apiClient } from './client';
import { URLS } from './urls';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IAssetCreateResult {
  identifier: string;
  versionKey: string;
}

export interface IAssetItem {
  identifier: string;
  name: string;
  downloadUrl?: string;
  appIcon?: string;
  thumbnail?: string;
  mimeType?: string;
}

// ---------------------------------------------------------------------------
// Asset search (image/video/audio assets — NOT questions)
// ---------------------------------------------------------------------------

export async function searchAssets(params: {
  mediaType: 'image' | 'video' | 'audio';
  query?: string;
  limit?: number;
  offset?: number;
  createdBy?: string;
}): Promise<{ items: IAssetItem[]; count: number }> {
  // Old editor's questionService.getAssetMedia request shape.
  const filters: Record<string, unknown> = {
    contentType: 'Asset',
    compatibilityLevel: { min: 1, max: 2 },
    status: ['Live'],
    mediaType: [params.mediaType],
  };
  if (params.createdBy) filters['createdBy'] = params.createdBy;

  const response = await apiClient.post(URLS.composite.search, {
    request: {
      filters,
      limit:  params.limit  ?? 50,
      offset: params.offset ?? 0,
      ...(params.query ? { query: params.query } : {}),
    },
  });

  const result = response.data?.result ?? {};
  return {
    items: (result.content ?? []) as IAssetItem[],
    count: (result.count  ?? 0)  as number,
  };
}

// ---------------------------------------------------------------------------
// 5-step asset upload pipeline
//
// Step 1  POST  asset/v1/create              → get assetId
// Step 2  POST  content/v3/upload/url/{id}   → get pre-signed blob URL
// Step 3  PUT   {preSignedUrl}               → upload binary to blob storage
// Step 4  POST  asset/v1/upload/{id}         → register finalised URL with Sunbird
// Step 5  GET   asset/v1/read/{id}           → fetch downloadUrl for insertion
// ---------------------------------------------------------------------------

// Step 1
export async function createMediaAsset(
  file: File,
  channel: string,
  createdBy: string,
  creator = '',
): Promise<IAssetCreateResult> {
  // Exact old-editor body: question.service.createMediaAsset merges
  // {primaryCategory:'Asset', language:['English'], code:uuid} with the
  // component's {name, mediaType, mimeType, createdBy, creator, channel}.
  // No contentType — the v4 API rejects it from the request.
  const response = await apiClient.post(URLS.asset.create, {
    request: {
      asset: {
        primaryCategory: 'Asset',
        language: ['English'],
        code: uuidv4(),
        name: file.name,
        mediaType: file.type.startsWith('image/') ? 'image'
                 : file.type.startsWith('video/') ? 'video'
                 : 'audio',
        mimeType: file.type,
        createdBy,
        ...(creator ? { creator } : {}),
        channel,
      },
    },
  });
  // Real KP returns node_id (old editor consumed it); accept both spellings.
  const result = (response.data?.result ?? {}) as Record<string, string>;
  return {
    identifier: result.identifier ?? result.node_id ?? '',
    versionKey: result.versionKey ?? '',
  };
}

// Step 2
export async function getPreSignedUrl(
  assetId: string,
  fileName: string,
): Promise<{ preSignedUrl: string; url: string }> {
  const response = await apiClient.post(
    `${URLS.content.uploadUrl}/${assetId}`,
    { request: { content: { fileName } } },
  );
  // Real KP returns pre_signed_url (old editor consumed it); accept both.
  const result = (response.data?.result ?? {}) as Record<string, string>;
  const preSignedUrl = result.pre_signed_url ?? result.preSignedUrl ?? '';
  return {
    preSignedUrl,
    url: result.url ?? preSignedUrl.split('?')[0] ?? '',
  };
}

// Step 3 — direct PUT to blob storage (external URL, not through apiClient)
export async function uploadToBlob(
  preSignedUrl: string,
  file: File,
  presignedHeaders: Record<string, string> = {},
): Promise<void> {
  const response = await fetch(preSignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
      'x-ms-blob-type': 'BlockBlob',
      ...presignedHeaders,
    },
  });
  // fetch() only rejects on network failure — an expired pre-signed URL or a
  // storage rejection (403/413/500) resolves normally and must be surfaced.
  if (!response.ok) {
    throw new Error(`Blob upload failed: ${response.status} ${response.statusText}`);
  }
}

// Step 4 — register the blob URL with Sunbird via FormData
export async function finalizeAssetUpload(
  assetId: string,
  blobUrl: string,
  mimeType: string,
): Promise<void> {
  const fd = new FormData();
  fd.append('fileUrl', blobUrl);
  fd.append('mimeType', mimeType);
  await apiClient.post(`${URLS.asset.upload}/${assetId}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

// Step 5
export async function readAsset(assetId: string): Promise<IAssetItem> {
  const response = await apiClient.get(`${URLS.asset.read}/${assetId}`);
  return response.data?.result?.content as IAssetItem;
}

// ---------------------------------------------------------------------------
// Orchestrator — runs all 5 steps, returns the final downloadUrl
// ---------------------------------------------------------------------------

export async function uploadAsset(
  file: File,
  channel: string,
  createdBy: string,
  presignedHeaders: Record<string, string> = {},
  creator = '',
): Promise<string> {
  const { identifier }   = await createMediaAsset(file, channel, createdBy, creator);
  const { preSignedUrl } = await getPreSignedUrl(identifier, file.name);
  await uploadToBlob(preSignedUrl, file, presignedHeaders);
  // Old editor registers the blob URL as signedURL minus the query string.
  const url = preSignedUrl.split('?')[0]!;
  await finalizeAssetUpload(identifier, url, file.type);
  const asset = await readAsset(identifier);
  return asset.downloadUrl ?? url;
}
