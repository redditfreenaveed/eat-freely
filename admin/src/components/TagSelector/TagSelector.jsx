const DIETARY_TAGS = [
  { id: 'halal', label: 'Halal' },
  { id: 'vegetarian', label: 'Vegetarian' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'gluten-free', label: 'Gluten-Free' },
  { id: 'kosher', label: 'Kosher' },
  { id: 'pescatarian', label: 'Pescatarian' },
  { id: 'sattvic', label: 'Sattvic' },
];

export default function TagSelector({ selected = [], onChange }) {
  const toggle = (id) => {
    onChange(selected.includes(id) ? selected.filter((t) => t !== id) : [...selected, id]);
  };

  return (
    <div className="tag-selector">
      {DIETARY_TAGS.map(({ id, label }) => (
        <label key={id} className={`tag-checkbox${selected.includes(id) ? ' tag-checkbox--checked' : ''}`}>
          <input type="checkbox" checked={selected.includes(id)} onChange={() => toggle(id)} />
          {label}
        </label>
      ))}
    </div>
  );
}
