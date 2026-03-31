const BASE = '/api';

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    ...(body !== undefined && { body: JSON.stringify(body) }),
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data?.errors?.[0]?.msg || data?.error || 'Request failed');
  return data;
}

export const api = {
  getColumns:    ()           => req('GET',    '/columns'),
  createColumn:  (data)       => req('POST',   '/columns', data),
  updateColumn:  (id, data)   => req('PATCH',  `/columns/${id}`, data),
  deleteColumn:  (id)         => req('DELETE', `/columns/${id}`),

  createTask:    (data)       => req('POST',   '/tasks', data),
  updateTask:    (id, data)   => req('PATCH',  `/tasks/${id}`, data),
  deleteTask:    (id)         => req('DELETE', `/tasks/${id}`),
  reorderTasks:  (tasks)      => req('POST',   '/tasks/reorder', { tasks }),
};
