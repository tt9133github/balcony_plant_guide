const STORAGE_KEY = "balcony-garden-care-logs-v1";

export function getLogs() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function addLog(log) {
  const logs = getLogs();
  const next = [{ ...log, id: crypto.randomUUID(), createdAt: new Date().toISOString() }, ...logs];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function exportLogs() {
  const blob = new Blob([JSON.stringify({
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    logs: getLogs(),
  }, null, 2)], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `balcony-garden-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export async function importLogs(file) {
  const parsed = JSON.parse(await file.text());
  const incoming = Array.isArray(parsed) ? parsed : parsed.logs;
  if (!Array.isArray(incoming)) throw new Error("备份文件格式不正确");

  const existing = getLogs();
  const ids = new Set(existing.map((item) => item.id));
  const merged = [...existing, ...incoming.filter((item) => item && item.id && !ids.has(item.id))];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return merged;
}
