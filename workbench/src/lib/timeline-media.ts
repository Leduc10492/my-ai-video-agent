export function previewMediaUrl(src: string, origin: string): string {
  return src.startsWith("/api/projects/")
    ? new URL(src, origin).href
    : src;
}

export function timelineForPreview<T>(project: T, origin: string): T {
  const preview = structuredClone(project) as T & {
    tracks?: { elements?: { type: string; props?: { src?: string } }[] }[];
  };
  // Twick Audio compares HTMLMediaElement.src (absolute) with the supplied URL.
  // A relative URL reloads on every read and leaves the player buffering.
  // Normalize the playback copy; API binding keeps saved projects portable.
  for (const track of preview.tracks ?? []) {
    for (const element of track.elements ?? []) {
      if (
        ["video", "audio", "image"].includes(element.type) &&
        typeof element.props?.src === "string"
      ) {
        element.props.src = previewMediaUrl(element.props.src, origin);
      }
    }
  }
  return preview;
}
