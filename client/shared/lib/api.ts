export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081";

function buildUrl(path: string) {
  return new URL(path, `${apiBaseUrl.replace(/\/$/, "")}/`).toString();
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    credentials: "include",
    headers,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const errorData =
      typeof data === "object" && data !== null
        ? (data as { error?: unknown; details?: unknown })
        : {};
    const message =
      typeof errorData.error === "string" ? errorData.error : "Request failed";

    throw new ApiError(response.status, message, errorData.details);
  }

  return data as T;
}
