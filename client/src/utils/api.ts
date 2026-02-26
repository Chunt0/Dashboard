export const apiKey = import.meta.env.VITE_API_KEY as string | undefined;

export function withAuth(init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers);
  if (apiKey) {
    headers.set('Authorization', `Bearer ${apiKey}`);
  }
  return { ...init, headers };
}

export function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit) {
	return fetch(input, withAuth(init));
}

export function appendApiKey(url: string) {
	if (!apiKey) return url;
	const separator = url.includes('?') ? '&' : '?';
	return `${url}${separator}apiKey=${encodeURIComponent(apiKey)}`;
}
