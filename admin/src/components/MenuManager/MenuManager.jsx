import TagSelector from '../TagSelector/TagSelector';

export default function MenuManager({ menu = [], onChange }) {
  const updateSection = (idx, updated) => {
    onChange(menu.map((s, i) => (i === idx ? updated : s)));
  };

  const deleteSection = (idx) => onChange(menu.filter((_, i) => i !== idx));

  const addSection = () => onChange([...menu, { section: 'New Section', items: [], _key: Date.now() }]);

  const addItem = (sIdx) => {
    const section = menu[sIdx];
    updateSection(sIdx, {
      ...section,
      items: [...section.items, { name: '', description: '', price: '', tags: [], _key: Date.now() }],
    });
  };

  const updateItem = (sIdx, iIdx, field, value) => {
    const section = menu[sIdx];
    updateSection(sIdx, {
      ...section,
      items: section.items.map((item, i) =>
        i === iIdx ? { ...item, [field]: value } : item
      ),
    });
  };

  const deleteItem = (sIdx, iIdx) => {
    const section = menu[sIdx];
    updateSection(sIdx, {
      ...section,
      items: section.items.filter((_, i) => i !== iIdx),
    });
  };

  return (
    <div className="menu-manager">
      {menu.map((section, sIdx) => (
        <div key={section._key ?? sIdx} className="menu-section">
          <div className="menu-section__header">
            <input
              className="form-input menu-section__name"
              value={section.section}
              onChange={(e) => updateSection(sIdx, { ...section, section: e.target.value })}
            />
            <button type="button" className="btn btn--danger btn--small" onClick={() => deleteSection(sIdx)}>
              Remove section
            </button>
          </div>
          <div className="menu-section__body">
            {section.items.map((item, iIdx) => (
              <div key={item._key ?? iIdx} className="menu-item-row">
                <div className="menu-item-row__fields">
                  <input
                    className="form-input"
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => updateItem(sIdx, iIdx, 'name', e.target.value)}
                  />
                  <input
                    className="form-input"
                    placeholder="Price (e.g. $12)"
                    value={item.price}
                    onChange={(e) => updateItem(sIdx, iIdx, 'price', e.target.value)}
                  />
                  <button type="button" className="btn btn--danger btn--small" onClick={() => deleteItem(sIdx, iIdx)}>✕</button>
                </div>
                <input
                  className="form-input menu-item-row__desc"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateItem(sIdx, iIdx, 'description', e.target.value)}
                />
                <TagSelector
                  selected={item.tags}
                  onChange={(tags) => updateItem(sIdx, iIdx, 'tags', tags)}
                />
              </div>
            ))}
            <button type="button" className="menu-add-btn" onClick={() => addItem(sIdx)}>+ Add item</button>
          </div>
        </div>
      ))}
      <button type="button" className="add-section-btn" onClick={addSection}>+ Add section</button>
    </div>
  );
}
