export default function StarRating({ rating }) {
  return (
    <div className="h-stars">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= rating ? "star-filled" : "star-empty"}>★</span>
      ))}
    </div>
  );
}
