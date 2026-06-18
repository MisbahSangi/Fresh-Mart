import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiX } from 'react-icons/fi';
import AdminLayout from '../../components/admin/AdminLayout';
import API from '../../api/axios';
import toast from 'react-hot-toast';

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [showModal,  setShowModal]  = useState(false);
  const [editCat,    setEditCat]    = useState(null);
  const [form,       setForm]       = useState({ nameEn: '', nameUr: '', icon: '', slug: '' });
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    API.get('/categories')
      .then(res => setCategories(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditCat(null);
    setForm({ nameEn: '', nameUr: '', icon: '', slug: '' });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditCat(cat);
    setForm({
      nameEn: cat.name?.en || '',
      nameUr: cat.name?.ur || '',
      icon:   cat.icon     || '',
      slug:   cat.slug     || ''
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nameEn || !form.icon) {
      return toast.error('Name and icon are required');
    }
    setSaving(true);
    try {
      const payload = {
        name: { en: form.nameEn, ur: form.nameUr },
        icon: form.icon,
        slug: form.slug || form.nameEn.toLowerCase().replace(/\s+/g, '-')
      };

      if (editCat) {
        await API.put(`/categories/${editCat._id}`, payload);
        setCategories(prev =>
          prev.map(c => c._id === editCat._id ? { ...c, ...payload } : c)
        );
        toast.success('Category updated! ✅');
      } else {
        const res = await API.post('/categories', payload);
        setCategories(prev => [...prev, res.data.data]);
        toast.success('Category added! ✅');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Categories</h2>
            <p className="text-gray-500 text-sm">
              {categories.length} categories
            </p>
          </div>
          <button onClick={openAdd}
                  className="bg-primary text-white px-4 py-2 rounded-xl
                             text-sm font-medium flex items-center gap-2
                             hover:bg-secondary transition">
            <FiPlus /> Add Category
          </button>
        </div>

        {/* Categories Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i}
                   className="bg-gray-200 animate-pulse h-28 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map(cat => (
              <div key={cat._id}
                   className="bg-white rounded-2xl border border-gray-100
                              shadow-sm p-5 flex items-center
                              justify-between hover:shadow-md transition">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cat.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {cat.name?.en}
                    </p>
                    <p className="text-xs text-gray-400">{cat.name?.ur}</p>
                    <p className="text-xs text-gray-300 mt-0.5">
                      /{cat.slug}
                    </p>
                  </div>
                </div>
                <button onClick={() => openEdit(cat)}
                        className="text-blue-500 hover:text-blue-700
                                   transition p-1">
                  <FiEdit2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50
                        flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5
                            border-b border-gray-100">
              <h3 className="font-bold text-gray-800">
                {editCat ? 'Edit Category' : 'Add Category'}
              </h3>
              <button onClick={() => setShowModal(false)}
                      className="text-gray-400 hover:text-gray-600">
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Name (English) *
                </label>
                <input value={form.nameEn}
                       onChange={e => setForm({...form, nameEn: e.target.value})}
                       placeholder="e.g. Dairy Products"
                       className="w-full border border-gray-200 rounded-xl
                                  px-3 py-2.5 text-sm outline-none
                                  focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Name (Urdu)
                </label>
                <input value={form.nameUr}
                       onChange={e => setForm({...form, nameUr: e.target.value})}
                       placeholder="e.g. دودھ کی مصنوعات"
                       dir="rtl"
                       className="w-full border border-gray-200 rounded-xl
                                  px-3 py-2.5 text-sm outline-none
                                  focus:ring-2 focus:ring-primary" />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Icon (Emoji) *
                </label>
                <input value={form.icon}
                       onChange={e => setForm({...form, icon: e.target.value})}
                       placeholder="e.g. 🥛"
                       className="w-full border border-gray-200 rounded-xl
                                  px-3 py-2.5 text-sm outline-none
                                  focus:ring-2 focus:ring-primary" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                        className="flex-1 border border-gray-200 text-gray-600
                                   py-2.5 rounded-xl text-sm font-medium
                                   hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                        className="flex-1 bg-primary text-white py-2.5
                                   rounded-xl text-sm font-semibold
                                   hover:bg-secondary transition
                                   disabled:opacity-60">
                  {saving ? 'Saving...' : editCat ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategoriesPage;