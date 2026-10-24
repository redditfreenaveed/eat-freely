import { getAllProfiles } from '../../utils/dietaryProfiles';

export default function DietaryProfileSelector({ selectedId, onToggle }) {
  const profiles = getAllProfiles();
  return (
    <div className="profile-strip">
      {profiles.map((profile) => (
        <button
          key={profile.id}
          className={`profile-chip${selectedId === profile.id ? ' profile-chip--active' : ''}`}
          onClick={() => onToggle(profile.id)}
        >
          {profile.icon} {profile.label}
        </button>
      ))}
    </div>
  );
}
