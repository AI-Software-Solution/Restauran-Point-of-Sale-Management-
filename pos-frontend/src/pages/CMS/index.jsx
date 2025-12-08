import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useSnackbar } from 'notistack';
import {
  FaHome,
  FaComments,
  FaImages,
  FaSave,
  FaPlus,
  FaTrash,
  FaEdit,
  FaStar,
  FaSync
} from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

const CMS = () => {
  const [activeTab, setActiveTab] = useState('hero');
  const [content, setContent] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const tabs = [
    { id: 'hero', label: 'Hero', icon: FaHome },
    { id: 'features', label: 'Xususiyatlar', icon: FaStar },
    { id: 'contact', label: 'Aloqa', icon: FaComments },
    { id: 'testimonials', label: 'Sharhlar', icon: FaComments },
    { id: 'media', label: 'Media', icon: FaImages },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [contentRes, testimonialsRes] = await Promise.all([
        axios.get(`${API_URL}/api/cms/content`, { withCredentials: true }),
        axios.get(`${API_URL}/api/cms/testimonials`, { withCredentials: true })
      ]);

      if (contentRes.data.success) {
        setContent(contentRes.data.data);
      }
      if (testimonialsRes.data.success) {
        setTestimonials(testimonialsRes.data.data);
      }
    } catch {
      enqueueSnackbar('Ma\'lumotlarni yuklashda xatolik', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const seedDefaultContent = async () => {
    try {
      setSaving(true);
      const response = await axios.post(`${API_URL}/api/cms/seed`, {}, { withCredentials: true });
      if (response.data.success) {
        enqueueSnackbar('Boshlang\'ich ma\'lumotlar qo\'shildi', { variant: 'success' });
        fetchData();
      }
    } catch {
      enqueueSnackbar('Xatolik yuz berdi', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleContentUpdate = async (id, data) => {
    try {
      setSaving(true);
      const response = await axios.put(`${API_URL}/api/cms/content/${id}`, data, { withCredentials: true });
      if (response.data.success) {
        enqueueSnackbar('Saqlandi', { variant: 'success' });
        fetchData();
      }
    } catch {
      enqueueSnackbar('Xatolik yuz berdi', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestimonialUpdate = async (id, data) => {
    try {
      setSaving(true);
      const response = await axios.put(`${API_URL}/api/cms/testimonials/${id}`, data, { withCredentials: true });
      if (response.data.success) {
        enqueueSnackbar('Saqlandi', { variant: 'success' });
        fetchData();
      }
    } catch {
      enqueueSnackbar('Xatolik yuz berdi', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleTestimonialDelete = async (id) => {
    if (!confirm('Rostdan ham o\'chirmoqchimisiz?')) return;
    try {
      const response = await axios.delete(`${API_URL}/api/cms/testimonials/${id}`, { withCredentials: true });
      if (response.data.success) {
        enqueueSnackbar('O\'chirildi', { variant: 'success' });
        fetchData();
      }
    } catch {
      enqueueSnackbar('Xatolik yuz berdi', { variant: 'error' });
    }
  };

  const handleAddTestimonial = async () => {
    try {
      setSaving(true);
      const response = await axios.post(`${API_URL}/api/cms/testimonials`, {
        customerName: 'Yangi mijoz',
        content: 'Sharh matni...',
        rating: 5
      }, { withCredentials: true });
      if (response.data.success) {
        enqueueSnackbar('Qo\'shildi', { variant: 'success' });
        fetchData();
      }
    } catch {
      enqueueSnackbar('Xatolik yuz berdi', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const getContentBySection = (section) => {
    return content.filter(item => item.section === section);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1a2e] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a2e] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">
            Landing Page <span className="text-yellow-500">CMS</span>
          </h1>
          <div className="flex gap-4">
            <button
              onClick={seedDefaultContent}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <FaSync className={saving ? 'animate-spin' : ''} />
              Boshlang'ich ma'lumotlar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id
                  ? 'bg-yellow-500 text-black'
                  : 'bg-[#2d2d44] text-gray-300 hover:bg-[#3d3d54]'
              }`}
            >
              <tab.icon />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#2d2d44] rounded-xl p-6"
        >
          {/* Hero Section */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Hero Section</h2>
              {getContentBySection('hero').length === 0 ? (
                <p className="text-gray-400">Ma'lumotlar mavjud emas. "Boshlang'ich ma'lumotlar" tugmasini bosing.</p>
              ) : (
                getContentBySection('hero').map((item) => (
                  <ContentEditor
                    key={item._id}
                    item={item}
                    onSave={handleContentUpdate}
                    saving={saving}
                  />
                ))
              )}
            </div>
          )}

          {/* Features Section */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Xususiyatlar</h2>
              {getContentBySection('features').length === 0 ? (
                <p className="text-gray-400">Ma'lumotlar mavjud emas. "Boshlang'ich ma'lumotlar" tugmasini bosing.</p>
              ) : (
                getContentBySection('features').map((item) => (
                  <ContentEditor
                    key={item._id}
                    item={item}
                    onSave={handleContentUpdate}
                    saving={saving}
                  />
                ))
              )}
            </div>
          )}

          {/* Contact Section */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Aloqa Ma'lumotlari</h2>
              {getContentBySection('contact').length === 0 ? (
                <p className="text-gray-400">Ma'lumotlar mavjud emas. "Boshlang'ich ma'lumotlar" tugmasini bosing.</p>
              ) : (
                getContentBySection('contact').map((item) => (
                  <ContentEditor
                    key={item._id}
                    item={item}
                    onSave={handleContentUpdate}
                    saving={saving}
                  />
                ))
              )}
            </div>
          )}

          {/* Testimonials Section */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">Mijoz Sharhlari</h2>
                <button
                  onClick={handleAddTestimonial}
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <FaPlus />
                  Yangi Sharh
                </button>
              </div>
              {testimonials.length === 0 ? (
                <p className="text-gray-400">Sharhlar mavjud emas.</p>
              ) : (
                testimonials.map((item) => (
                  <TestimonialEditor
                    key={item._id}
                    item={item}
                    onSave={handleTestimonialUpdate}
                    onDelete={handleTestimonialDelete}
                    saving={saving}
                  />
                ))
              )}
            </div>
          )}

          {/* Media Section */}
          {activeTab === 'media' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Media Fayllar</h2>
              <p className="text-gray-400">Media boshqaruvi tez orada qo'shiladi...</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Content Editor Component
const ContentEditor = ({ item, onSave, saving }) => {
  const [value, setValue] = useState(item.contentValue || '');
  const [imageUrl, setImageUrl] = useState(item.imageUrl || '');
  const [isActive, setIsActive] = useState(item.isActive);

  const handleSave = () => {
    onSave(item._id, {
      contentValue: value,
      imageUrl,
      isActive
    });
  };

  const getLabel = (key) => {
    const labels = {
      title: 'Sarlavha',
      subtitle: 'Qo\'shimcha sarlavha',
      description: 'Tavsif',
      backgroundImage: 'Fon rasmi URL',
      address: 'Manzil',
      phone: 'Telefon',
      email: 'Email',
      workingHours: 'Ish vaqti',
      mapLat: 'Xarita (lat)',
      mapLng: 'Xarita (lng)',
      feature1: 'Xususiyat 1',
      feature2: 'Xususiyat 2',
      feature3: 'Xususiyat 3',
      feature4: 'Xususiyat 4',
    };
    return labels[key] || key;
  };

  return (
    <div className="bg-[#1a1a2e] rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <label className="text-gray-300 font-medium">{getLabel(item.contentKey)}</label>
        <label className="flex items-center gap-2 text-sm text-gray-400">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded"
          />
          Faol
        </label>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full bg-[#2d2d44] text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
          placeholder="Qiymat"
        />
        {(item.contentKey.includes('Image') || item.section === 'features') && (
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="w-full bg-[#2d2d44] text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
            placeholder="Rasm URL yoki icon nomi"
          />
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50"
        >
          <FaSave />
          Saqlash
        </button>
      </div>
    </div>
  );
};

// Testimonial Editor Component
const TestimonialEditor = ({ item, onSave, onDelete, saving }) => {
  const [name, setName] = useState(item.customerName || '');
  const [content, setContent] = useState(item.content || '');
  const [rating, setRating] = useState(item.rating || 5);
  const [isActive, setIsActive] = useState(item.isActive);

  const handleSave = () => {
    onSave(item._id, {
      customerName: name,
      content,
      rating,
      isActive
    });
  };

  return (
    <div className="bg-[#1a1a2e] rounded-lg p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-medium">{name || 'Yangi sharh'}</h3>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-400">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded"
            />
            Faol
          </label>
          <button
            onClick={() => onDelete(item._id)}
            className="text-red-500 hover:text-red-400"
          >
            <FaTrash />
          </button>
        </div>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#2d2d44] text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
          placeholder="Mijoz ismi"
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="w-full bg-[#2d2d44] text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none resize-none"
          placeholder="Sharh matni"
        />
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Reyting:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-xl ${star <= rating ? 'text-yellow-500' : 'text-gray-600'}`}
                >
                  <FaStar />
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 ml-auto"
          >
            <FaSave />
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
};

export default CMS;
