const NOTION_VERSION = "2022-06-28";
const API = "https://api.notion.com/v1";

export class NotionApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(message);
    this.name = "NotionApiError";
  }
}

export function createNotionClient(token: string) {
  async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
      throw new NotionApiError(`Notion ${method} ${path} → ${res.status}`, res.status, text);
    }
    return (text ? JSON.parse(text) : {}) as T;
  }

  return {
    retrieveDatabase(databaseId: string) {
      return request<{ id: string; title?: unknown; properties?: Record<string, unknown> }>(
        "GET",
        `/databases/${databaseId}`,
      );
    },
    updateDatabase(databaseId: string, properties: Record<string, unknown>) {
      return request<{ id: string; properties?: Record<string, unknown> }>(
        "PATCH",
        `/databases/${databaseId}`,
        { properties },
      );
    },
    queryByOfferId(databaseId: string, offerIdProp: string, offerId: string) {
      return request<{ results: Array<{ id: string; properties: Record<string, unknown> }> }>(
        "POST",
        `/databases/${databaseId}/query`,
        {
          filter: {
            property: offerIdProp,
            rich_text: { equals: offerId },
          },
          page_size: 1,
        },
      );
    },
    createPage(databaseId: string, properties: Record<string, unknown>) {
      return request<{ id: string }>("POST", "/pages", {
        parent: { database_id: databaseId },
        properties,
      });
    },
    updatePage(pageId: string, properties: Record<string, unknown>) {
      return request<{ id: string }>("PATCH", `/pages/${pageId}`, { properties });
    },
  };
}

export type NotionClient = ReturnType<typeof createNotionClient>;
