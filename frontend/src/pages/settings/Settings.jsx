import { useState, useEffect } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../api/supabaseClient';

export default function Settings() {
  const [settings, setSettings] = useState({
    id: null,
    gym_name: 'FitCore Flagship',
    currency: 'USD',
    tax_rate: '5.00',
    address: '100 Fitness Way, Austin, TX',
    phone: '555-0199'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from('gym_settings')
          .select('*')
          .limit(1)
          .single();

        if (err && err.code !== 'PGRST116') {
          throw err;
        }

        if (data) {
          setSettings({
            id: data.id,
            gym_name: data.gym_name || '',
            currency: data.currency || 'USD',
            tax_rate: data.tax_rate?.toString() || '0.00',
            address: data.address || '',
            phone: data.phone || ''
          });
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const payload = {
        gym_name: settings.gym_name,
        currency: settings.currency,
        tax_rate: parseFloat(settings.tax_rate) || 0,
        address: settings.address,
        phone: settings.phone,
        updated_at: new Date().toISOString()
      };

      if (settings.id) {
        const { error: err } = await supabase
          .from('gym_settings')
          .update(payload)
          .eq('id', settings.id);
        if (err) throw err;
      } else {
        const { data, error: err } = await supabase
          .from('gym_settings')
          .insert([payload])
          .select()
          .single();
        if (err) throw err;
        if (data) setSettings((prev) => ({ ...prev, id: data.id }));
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      setError(err.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gym Settings</h2>
          <p className="text-gray-500 text-sm">Manage branch details, currency preferences, and operating tax rates.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-2xl shadow-sm">
        {loading ? (
          <p className="text-gray-400 text-sm">Loading configurations...</p>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            {savedSuccess && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg">
                <CheckCircle2 size={16} /> Settings saved successfully!
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Gym / Branch Name</label>
              <input
                type="text"
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none"
                value={settings.gym_name}
                onChange={(e) => setSettings({ ...settings, gym_name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Currency Code</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none bg-white"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none"
                  value={settings.tax_rate}
                  onChange={(e) => setSettings({ ...settings, tax_rate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Address</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Contact Phone</label>
              <input
                type="tel"
                className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-[#84c22a] outline-none"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#84c22a] hover:bg-[#72a823] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <Save size={16} /> {saving ? 'Saving...' : 'Save Configurations'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
