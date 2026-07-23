const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;

function getApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error(
      "Chưa cấu hình NEXT_PUBLIC_API_BASE_URL."
    );
  }

  return API_BASE_URL;
}

async function readErrorMessage(
  response: Response
) {
  let message =
    `Backend trả về lỗi HTTP ${response.status}.`;

  try {
    const errorBody = await response.json();

    if (typeof errorBody?.message === "string") {
      message = errorBody.message;
    }
  } catch {
    // Backend không trả về JSON.
  }

  return message;
}

export async function apiGet<T>(
  path: string
): Promise<T> {
  const response = await fetch(
    `${getApiBaseUrl()}${path}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response)
    );
  }

  return response.json() as Promise<T>;
}

export async function apiPost<
  TResponse,
  TRequest = unknown
>(
  path: string,
  request: TRequest
): Promise<TResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}${path}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response)
    );
  }

  return response.json() as Promise<TResponse>;
}
export async function apiPut<
  TResponse,
  TRequest = unknown
>(
  path: string,
  request: TRequest
): Promise<TResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}${path}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    }
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response)
    );
  }

  return response.json() as Promise<TResponse>;
}
export async function apiDelete<TResponse = void>(
  path: string
): Promise<TResponse> {
  const response = await fetch(
    `${getApiBaseUrl()}${path}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response)
    );
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return response.json() as Promise<TResponse>;
}