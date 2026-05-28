export const API = "http://localhost:3000";

export const BG_COLORS = [
  "linear-gradient(135deg,#1a0a2e,#0f0820)",
  "linear-gradient(135deg,#0a1a2e,#050f1e)",
  "linear-gradient(135deg,#1a2a0a,#0f1a05)",
  "linear-gradient(135deg,#2e1a0a,#1e0f05)",
  "linear-gradient(135deg,#1a0a1a,#0f050f)",
  "linear-gradient(135deg,#0a2e2e,#051e1e)",
];

export function getUserId(obj) {
  if (!obj) return null;
  return obj.UserID ?? obj.userId ?? obj.userid ?? obj.user_id ?? obj.USERID ?? null;
}

export function getMovieId(obj) {
  if (!obj) return null;
  return obj.MovieID ?? obj.movieId ?? obj.movieid ?? obj.movie_id ?? obj.MOVIEID ?? null;
}

export function getTitle(obj) {
  if (!obj) return "Unknown";
  return obj.Title ?? obj.title ?? obj.TITLE ?? "Unknown";
}
