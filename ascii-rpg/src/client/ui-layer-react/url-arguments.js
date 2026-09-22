const urlArgumentBase = "http://ascii-rpg.local";

export function withUrlArgument(currentUrl, name, value) {
  const nextUrl = new URL(currentUrl, urlArgumentBase);
  nextUrl.searchParams.set(name, value);
  return nextUrl;
}

export function getUrlBooleanArgument(currentUrl, name, defaultValue = false) {
  const value = new URL(currentUrl, urlArgumentBase).searchParams.get(name);
  if (value === null) return defaultValue;
  return value === "true";
}
