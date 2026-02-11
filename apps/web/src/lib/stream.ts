// apps/web/src/lib/stream.ts
export async function readNdjsonStream<T>(
  stream: ReadableStream<Uint8Array>,
  onEvent: (event: T) => void,
  onError?: (err: unknown, raw?: string) => void
) {
  const reader = stream.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split("\n")
    buffer = lines.pop() || ""

    for (const line of lines) {
      if (!line.trim()) continue
      try {
        onEvent(JSON.parse(line) as T)
      } catch (err) {
        onError?.(err, line)
      }
    }
  }

  if (buffer.trim()) {
    try {
      onEvent(JSON.parse(buffer) as T)
    } catch (err) {
      onError?.(err, buffer)
    }
  }
}