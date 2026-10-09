const gradients = [
  "from-violet-500 via-purple-500 to-fuchsia-500",
  "from-cyan-500 via-blue-500 to-indigo-500",
  "from-amber-400 via-orange-500 to-rose-500",
  "from-emerald-400 via-teal-500 to-cyan-600",
  "from-pink-500 via-rose-500 to-red-500",
] as const;

export function getWorkspaceGradient(workspaceId: string) {
  let hash = 0;

  for (const character of workspaceId) {
    hash = (hash * 31 + character.charCodeAt(0)) | 0;
  }

  return gradients[Math.abs(hash) % gradients.length];
}
