const urlArgumentBase = "http://ascii-rpg.local";

export function withUrlArgument(currentUrl, name, value) {
  const nextUrl = new URL(currentUrl, urlArgumentBase);
  nextUrl.searchParams.set(name, value);
  return nextUrl;
}
