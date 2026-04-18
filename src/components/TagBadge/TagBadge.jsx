export default function TagBadge({ tag, matched }) {
  return (
    <span className={`tag-badge${matched ? ' tag-badge--matched' : ''}`}>
      {matched ? `✓ ${tag}` : tag}
    </span>
  );
}
