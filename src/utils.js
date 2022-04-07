export function makeQueryKey(key = "", type) {
  if (!type) return null;
  return `${type}_${key}`;
}

export function parseQueryKey(keyString) {
  const [type, key] = keyString.split("_");
  return { type, key };
}

export function updateQueryString({ filters, sorts }) {
  const newURL = new URL(window.location.href);
  // remove stale params
  newURL.searchParams.forEach((_, param) => {
    newURL.searchParams.delete(param);
  });

  // set filters to query string
  Object.keys(filters).forEach((key) => {
    if (filters[key] != null) {
      newURL.searchParams.set(makeQueryKey(key, "filter"), filters[key]);
    }
  });
  // set sorts to query string
  Object.keys(sorts).forEach((key) => {
    if (sorts[key] != null) {
      newURL.searchParams.set(makeQueryKey(key, "sort"), sorts[key]);
    }
  });

  window.history.pushState({ path: newURL.href }, "", newURL.href);
}
