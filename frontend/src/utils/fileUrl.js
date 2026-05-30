/**
 * Base URL du serveur Laravel (sans /api).
 */
export const getAppBaseUrl = () => {
  const apiUrl = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

/**
 * URL pour afficher le fichier dans le navigateur (sans forcer le téléchargement).
 */
export const getCoursFileUrl = (file, coursId) => {
  if (!file) return null;

  if (file.view_url) {
    return stripDownloadParam(file.view_url);
  }

  if (file.url) {
    if (file.url.startsWith('http')) {
      return file.url;
    }
    if (file.url.startsWith('/')) {
      return `${getAppBaseUrl()}${file.url}`;
    }
  }

  const filename = file.nom || (file.chemin ? file.chemin.split('/').pop() : null);
  if (coursId && filename) {
    return `${getAppBaseUrl()}/storage/cours/${coursId}/${encodeURIComponent(filename)}`;
  }

  if (file.chemin) {
    const relative = file.chemin.replace(/^public\//, '');
    return `${getAppBaseUrl()}/storage/${relative}`;
  }

  return null;
};

/**
 * URL pour télécharger le fichier sur le poste (Laravel ?download=1 → attachment).
 */
export const getCoursFileDownloadUrl = (file, coursId) => {
  if (!file) return null;

  if (file.download_url) {
    return file.download_url;
  }

  const viewUrl = getCoursFileUrl(file, coursId);
  if (!viewUrl) return null;

  if (viewUrl.startsWith('http') && !viewUrl.includes('/storage/cours/')) {
    return viewUrl;
  }

  return appendDownloadParam(viewUrl);
};

export const getDownloadFilename = (file) => {
  if (!file) return 'fichier';
  return file.nom || (file.chemin ? file.chemin.split('/').pop() : 'fichier');
};

const stripDownloadParam = (url) => {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete('download');
    return parsed.toString().replace(/\?$/, '');
  } catch {
    return url.replace(/([?&])download=1(&)?/, (_, q, amp) => (amp ? q : '')).replace(/\?$/, '');
  }
};

const appendDownloadParam = (url) => {
  try {
    const parsed = new URL(url);
    parsed.searchParams.set('download', '1');
    return parsed.toString();
  } catch {
    return url.includes('?') ? `${url}&download=1` : `${url}?download=1`;
  }
};

export const openFileInNewTab = (file, coursId) => {
  const url = getCoursFileUrl(file, coursId);
  if (!url) {
    console.error('URL du fichier introuvable', file);
    return;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
};
