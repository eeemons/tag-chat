export const AVATAR_GRADIENTS = [
  "from-emerald-500 to-teal-700 text-white",
  "from-indigo-500 to-blue-700 text-white",
  "from-violet-500 to-purple-700 text-white",
  "from-rose-500 to-pink-700 text-white",
  "from-amber-500 to-orange-700 text-white",
  "from-cyan-500 to-sky-700 text-white",
  "from-fuchsia-500 to-pink-700 text-white",
  "from-teal-500 to-emerald-800 text-white",
];

export function getAvatarGradient(nameOrId = ""): string {
  let hash = 0;
  for (let i = 0; i < nameOrId.length; i++) {
    hash = nameOrId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[index];
}
