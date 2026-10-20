// Round 1 — built from a single vague prompt: "make a settings form"
// Accepted exactly as generated. No follow-up prompts, no edits.

export default function SettingsForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Settings saved!');
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      style={{ maxWidth: 400, margin: '2rem auto', fontFamily: 'sans-serif' }}
    >
      <h2>Settings</h2>
      <input
        type="text"
        placeholder="Full name"
        required
        style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
      />
      <input
        type="email"
        placeholder="Email"
        required
        style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
      />
      <input
        type="text"
        placeholder="Username"
        required
        style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
      />
      <textarea
        placeholder="Bio"
        rows={3}
        style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }}
      />
      <label style={{ display: 'block', marginBottom: 12 }}>
        <input type="checkbox" /> Email notifications
      </label>
      <button type="submit" style={{ padding: '8px 16px' }}>
        Save
      </button>
    </form>
  );
}
