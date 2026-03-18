const STORAGE_KEY = "video_segments";

// Utils
const buildKey = (videoUrl, segment) => {
  if (segment?.metadata) {
    return `segments_metadata_${videoUrl}`;
  }
  return `segments_${videoUrl}`;
};

const safeParse = (value, fallback) => {
  try {
    return JSON.parse(value) ?? fallback;
  } catch {
    return fallback;
  }
};

// Gette methods
export function getAllSegments() {
  if (typeof window === "undefined") return {};
  return safeParse(localStorage.getItem(STORAGE_KEY), {});
}

export const getVideoSegments = (videoUrl, key, defaultResponse = []) => {
  const storageKey = key ?? `segments_${videoUrl}`;
  return safeParse(localStorage.getItem(storageKey), defaultResponse);
};

//Add method
export const addSegment = (videoUrl, segment) => {
  const key = buildKey(videoUrl, segment);
  const existing = getVideoSegments(videoUrl, key, []);

  if (Array.isArray(existing)) {
    existing.push(segment);
  } else {
    existing.metadata = segment.metadata;
  }

  localStorage.setItem(key, JSON.stringify(existing));
};

// Edit method
export const editItem = (videoUrl, updatedItem, index = null) => {
  const key = buildKey(videoUrl, updatedItem);
  const existing = getVideoSegments(videoUrl, key, []);

  if (!Array.isArray(existing)) return;

  const updated = existing.map((item, i) => {
    if (updatedItem.id && item.id === updatedItem.id) {
      return { ...item, ...updatedItem };
    }
    if (index !== null && i === index) {
      return { ...item, ...updatedItem };
    }
    return item;
  });

  localStorage.setItem(key, JSON.stringify(updated));
};

// Delete function
export const deleteItem = (videoUrl, id = null, index = null) => {
  const key = `segments_${videoUrl}`;
  const existing = getVideoSegments(videoUrl, key, []);

  if (!Array.isArray(existing)) return;

  let filtered;

  if (id) {
    filtered = existing.filter((item) => item.id !== id);
  } else if (index !== null) {
    filtered = existing.filter((_, i) => i !== index);
  } else {
    return;
  }

  localStorage.setItem(key, JSON.stringify(filtered));
};
