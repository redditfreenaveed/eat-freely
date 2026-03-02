/**
 * dietaryProfiles.js
 * Core dietary profile definitions.
 * Each profile defines which food tags are compatible and what must be excluded.
 */

export const DIETARY_PROFILES = {
  muslim: {
    id: 'muslim',
    label: 'Muslim / Halal',
    icon: '☪️',
    color: '#2D6A4F',
    accent: '#74C69D',
    description: 'Halal certified, vegetarian-friendly, or pescatarian',
    compatibleTags: ['halal', 'vegetarian', 'vegan', 'pescatarian'],
    excludedIngredients: ['pork', 'alcohol'],
  },
  hindu: {
    id: 'hindu',
    label: 'Hindu / Vegetarian',
    icon: '🕉️',
    color: '#7B2D00',
    accent: '#FF8C42',
    description: 'Vegetarian, vegan, or Sattvic cuisine',
    compatibleTags: ['vegetarian', 'vegan', 'sattvic'],
    excludedIngredients: ['beef'],
  },
  vegan: {
    id: 'vegan',
    label: 'Vegan',
    icon: '🌱',
    color: '#1B4332',
    accent: '#52B788',
    description: '100% plant-based options available',
    compatibleTags: ['vegan'],
    excludedIngredients: ['meat', 'dairy', 'eggs'],
  },
  glutenFree: {
    id: 'glutenFree',
    label: 'Gluten-Free',
    icon: '🌾',
    color: '#5C4033',
    accent: '#D4A853',
    description: 'Safe options for celiac or gluten sensitivity',
    compatibleTags: ['gluten-free'],
    excludedIngredients: ['gluten', 'wheat'],
  },
  kosher: {
    id: 'kosher',
    label: 'Jewish / Kosher',
    icon: '✡️',
    color: '#1A3A5C',
    accent: '#4A90D9',
    description: 'Kosher certified or vegetarian options',
    compatibleTags: ['kosher', 'vegetarian', 'vegan'],
    excludedIngredients: ['pork', 'shellfish'],
  },
  vegetarian: {
    id: 'vegetarian',
    label: 'Vegetarian',
    icon: '🥗',
    color: '#3D5A1E',
    accent: '#8BC34A',
    description: 'No meat or fish',
    compatibleTags: ['vegetarian', 'vegan'],
    excludedIngredients: ['meat', 'fish'],
  },
};

export const getAllProfiles = () => Object.values(DIETARY_PROFILES);

export const getProfileById = (id) => DIETARY_PROFILES[id] || null;
