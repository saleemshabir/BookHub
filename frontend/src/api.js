export async function api(path, { method = 'GET', body, signal } = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch('/api' + path, {
    method,
    signal,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
    body: body && JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}
