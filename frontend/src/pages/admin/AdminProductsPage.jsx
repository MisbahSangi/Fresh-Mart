import { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX } from "react-icons/fi";
import AdminLayout from "../../components/admin/AdminLayout";
import API from "../../api/axios";
import toast from "react-hot-toast";
import { optimizeImageUrl } from "../../utils/image";

const EMPTY_FORM = {
  nameEn: "",
  nameUr: "",
  descEn: "",
  categoryId: "",
  priceCurrent: "",
  priceOriginal: "",
  unit: "",
  stock: "50",
  stockStatus: "in_stock",
  image: "",
  imageMode: "",
  isFeatured: false,
  isOnSale: false,
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([API.get("/products"), API.get("/categories")])
      .then(([pRes, cRes]) => {
        setProducts(pRes.data.data);
        setCategories(cRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
    setEditProduct(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (product) => {
    setEditProduct(product);
    setForm({
      nameEn: product.name?.en || "",
      nameUr: product.name?.ur || "",
      descEn: product.description?.en || "",
      categoryId: product.categoryId?._id || product.categoryId || "",
      priceCurrent: product.price?.current || "",
      priceOriginal: product.price?.original || "",
      unit: product.unit || "",
      stock: product.stock?.quantity || 50,
      stockStatus: product.stock?.status || "in_stock",
      image: product.images?.[0] || "",
      isFeatured: product.isFeatured || false,
      isOnSale: product.isOnSale || false,
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.nameEn || !form.categoryId || !form.priceCurrent) {
      return toast.error("Name, category and price are required");
    }
    setSaving(true);
    try {
      const token = localStorage.getItem("adminToken");
      let imageUrl = form.image;

      // If file was selected (starts with data:) — upload to Cloudinary first
      if (form.image && form.image.startsWith("data:")) {
        // Convert base64 to blob then upload
        const blob = await fetch(form.image).then((r) => r.blob());
        const imageData = new FormData();
        imageData.append("image", blob, "product.jpg");

        const uploadRes = await API.post("/upload/product", imageData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        });
        imageUrl = uploadRes.data.url;
      }

      const payload = {
        name: { en: form.nameEn, ur: form.nameUr },
        description: { en: form.descEn },
        categoryId: form.categoryId,
        price: {
          current: Number(form.priceCurrent),
          original: Number(form.priceOriginal || form.priceCurrent),
          currency: "PKR",
        },
        unit: form.unit,
        stock: { quantity: Number(form.stock), status: form.stockStatus },
        images: imageUrl ? [imageUrl] : [],
        isFeatured: form.isFeatured,
        isOnSale: form.isOnSale,
      };

      if (editProduct) {
        await API.put(`/products/${editProduct._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts((prev) =>
          prev.map((p) =>
            p._id === editProduct._id
              ? { ...p, ...payload, images: imageUrl ? [imageUrl] : p.images }
              : p,
          ),
        );
        toast.success("Product updated! ✅");
      } else {
        const res = await API.post("/products", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProducts((prev) => [res.data.data, ...prev]);
        toast.success("Product added! ✅");
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      const token = localStorage.getItem("adminToken");
      await API.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Products</h2>
            <p className="text-gray-500 text-sm">{products.length} products</p>
          </div>
          <button
            onClick={openAdd}
            className="bg-primary text-white px-4 py-2 rounded-xl
                             text-sm font-medium flex items-center gap-2
                             hover:bg-secondary transition"
          >
            <FiPlus /> Add Product
          </button>
        </div>

        {/* Products Table */}
        <div
          className="bg-white rounded-2xl shadow-sm border
                        border-gray-100 overflow-hidden"
        >
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 animate-pulse h-14 rounded-xl"
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {[
                      "Product",
                      "Category",
                      "Price",
                      "Stock",
                      "Featured",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left text-xs font-semibold
                                     text-gray-500 px-4 py-3 uppercase
                                     tracking-wide whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-gray-50 transition"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg bg-gray-100
                                          flex items-center justify-center
                                          flex-shrink-0 overflow-hidden"
                          >
                            {product.images?.[0] ? (
                              <img
                                src={optimizeImageUrl(product.images[0], 80)}
                                alt=""
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-lg">🛍️</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">
                              {product.name?.en}
                            </p>
                            <p className="text-xs text-gray-400">
                              {product.unit}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="text-xs bg-gray-100 text-gray-600
                                         px-2 py-1 rounded-full"
                        >
                          {product.categoryId?.name?.en || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-bold text-primary">
                          Rs. {product.price?.current}
                        </p>
                        {product.price?.original > product.price?.current && (
                          <p className="text-xs text-gray-400 line-through">
                            Rs. {product.price?.original}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full
                          ${
                            product.stock?.status === "in_stock"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {product.stock?.quantity} left
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {product.isFeatured ? (
                          <span
                            className="text-xs bg-yellow-100
                                             text-yellow-700 px-2 py-1
                                             rounded-full"
                          >
                            ⭐ Yes
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(product)}
                            className="text-blue-500 hover:text-blue-700
                                             transition p-1"
                          >
                            <FiEdit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            className="text-red-400 hover:text-red-600
                                             transition p-1"
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ────────────────────── */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50
                        flex items-center justify-center px-4"
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh]
                          overflow-y-auto"
          >
            <div
              className="flex items-center justify-between p-5
                            border-b border-gray-100"
            >
              <h3 className="font-bold text-gray-800">
                {editProduct ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Name (English) *
                  </label>
                  <input
                    value={form.nameEn}
                    onChange={(e) =>
                      setForm({ ...form, nameEn: e.target.value })
                    }
                    placeholder="e.g. Fresh Milk"
                    className="w-full border border-gray-200 rounded-xl
                                    px-3 py-2.5 text-sm outline-none
                                    focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Name (Urdu)
                  </label>
                  <input
                    value={form.nameUr}
                    onChange={(e) =>
                      setForm({ ...form, nameUr: e.target.value })
                    }
                    placeholder="e.g. تازہ دودھ"
                    dir="rtl"
                    className="w-full border border-gray-200 rounded-xl
                                    px-3 py-2.5 text-sm outline-none
                                    focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Description
                </label>
                <textarea
                  value={form.descEn}
                  onChange={(e) => setForm({ ...form, descEn: e.target.value })}
                  placeholder="Product description..."
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl
                                     px-3 py-2.5 text-sm outline-none
                                     focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Category *
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm({ ...form, categoryId: e.target.value })
                  }
                  className="w-full border border-gray-200 rounded-xl
                                   px-3 py-2.5 text-sm outline-none
                                   focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.icon} {c.name?.en}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Price (PKR) *
                  </label>
                  <input
                    type="number"
                    value={form.priceCurrent}
                    onChange={(e) =>
                      setForm({ ...form, priceCurrent: e.target.value })
                    }
                    placeholder="180"
                    className="w-full border border-gray-200 rounded-xl
                                    px-3 py-2.5 text-sm outline-none
                                    focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Original Price
                  </label>
                  <input
                    type="number"
                    value={form.priceOriginal}
                    onChange={(e) =>
                      setForm({ ...form, priceOriginal: e.target.value })
                    }
                    placeholder="200"
                    className="w-full border border-gray-200 rounded-xl
                                    px-3 py-2.5 text-sm outline-none
                                    focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Unit
                  </label>
                  <input
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="1kg"
                    className="w-full border border-gray-200 rounded-xl
                                    px-3 py-2.5 text-sm outline-none
                                    focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Stock quantity + status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                    placeholder="50"
                    className="w-full border border-gray-200 rounded-xl
                               px-3 py-2.5 text-sm outline-none
                               focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Stock Status
                  </label>
                  <select
                    value={form.stockStatus}
                    onChange={(e) =>
                      setForm({ ...form, stockStatus: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-xl
                               px-3 py-2.5 text-sm outline-none
                               focus:ring-2 focus:ring-primary bg-white"
                  >
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Product Image
                </label>

                {/* Tab Switch */}
                <div className="flex gap-2 mb-2">
                  {["url", "upload"].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() =>
                        setForm({ ...form, imageMode: mode, image: "" })
                      }
                      className={`px-3 py-1 rounded-full text-xs font-medium transition
                    ${
                      (form.imageMode || "url") === mode
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                    >
                      {mode === "url" ? "🔗 Paste URL" : "📁 Upload File"}
                    </button>
                  ))}
                </div>

                {/* URL Input */}
                {(!form.imageMode || form.imageMode === "url") && (
                  <input
                    value={form.image}
                    onChange={(e) =>
                      setForm({ ...form, image: e.target.value })
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="w-full border border-gray-200 rounded-xl
                 px-3 py-2.5 text-sm outline-none
                 focus:ring-2 focus:ring-primary"
                  />
                )}

                {/* File Upload */}
                {form.imageMode === "upload" && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) {
                          toast.error("Image must be under 2MB");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setForm({ ...form, image: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="w-full border border-gray-200 rounded-xl
                   px-3 py-2 text-sm text-gray-600
                   file:mr-3 file:py-1 file:px-3
                   file:rounded-full file:border-0
                   file:text-xs file:font-medium
                   file:bg-primary file:text-white
                   hover:file:bg-secondary cursor-pointer"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Max size: 2MB · JPG, PNG, WEBP
                    </p>
                  </div>
                )}

                {/* Image Preview */}
                {form.image && (
                  <div className="mt-2 relative w-20 h-20">
                    <img
                      src={form.image}
                      alt="preview"
                      className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, image: "" })}
                      className="absolute -top-2 -right-2 bg-red-500 text-white
                   w-5 h-5 rounded-full flex items-center justify-center
                   text-xs hover:bg-red-600 transition"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) =>
                      setForm({ ...form, isFeatured: e.target.checked })
                    }
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isOnSale}
                    onChange={(e) =>
                      setForm({ ...form, isOnSale: e.target.checked })
                    }
                    className="accent-primary w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">On Sale</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600
                                   py-2.5 rounded-xl text-sm font-medium
                                   hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary text-white py-2.5
                                   rounded-xl text-sm font-semibold
                                   hover:bg-secondary transition
                                   disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editProduct
                      ? "Update"
                      : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProductsPage;
