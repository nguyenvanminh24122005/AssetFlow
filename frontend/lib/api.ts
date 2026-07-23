const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiGet<T>(
  path: string
): Promise<T> {
  if (!API_BASE_URL) {
    throw new Error(
      "Chưa cấu hình NEXT_PUBLIC_API_BASE_URL."
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    let message =
      `Backend trả về lỗi HTTP ${response.status}.`;

    try {
      const errorBody = await response.json();

      if (
        typeof errorBody?.message === "string"
      ) {
        message = errorBody.message;
      }
    } catch {
      // Backend không trả về JSON.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}