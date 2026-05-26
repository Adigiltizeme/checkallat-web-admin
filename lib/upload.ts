import { getAccessToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const token = getAccessToken();
  const res = await fetch(`${API_URL}/upload/image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Échec de l\'upload');
  }

  const data = await res.json();
  return data.url as string;
}

export async function uploadFiles(files: File[]): Promise<string[]> {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));

  const token = getAccessToken();
  const res = await fetch(`${API_URL}/upload/images`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Échec de l\'upload');
  }

  const data = await res.json();
  return (data.files as { url: string }[]).map((f) => f.url);
}
