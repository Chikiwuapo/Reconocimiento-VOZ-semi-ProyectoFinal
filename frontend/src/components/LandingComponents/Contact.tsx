import React, { useState } from 'react';

interface ContactProps {
  isDarkMode?: boolean;
}

const initialState = { name: '', email: '', message: '' };

const Contact: React.FC<ContactProps> = ({ isDarkMode = false }) => {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string; message?: string } = {};
    if (!form.name.trim()) newErrors.name = 'Por favor ingresa tu nombre.';
    if (!form.email.trim()) newErrors.email = 'Por favor ingresa tu email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(form.email)) newErrors.email = 'Ingresa un email válido.';
    if (!form.message.trim()) newErrors.message = 'Cuéntanos tu mensaje.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    // Simulación de envío
    await new Promise((r) => setTimeout(r, 1000));
    setSending(false);
    setSubmitted(true);
    setForm(initialState);
    setTimeout(() => setSubmitted(false), 2500);
  };

  const cardBase = isDarkMode ? 'bg-[#1A1A1A]' : 'bg-[#F5F5F5]';
  const labelColor = isDarkMode ? 'text-white' : 'text-[#1B4965]';
  const helpColor = isDarkMode ? 'text-gray-300' : 'text-gray-600';
  const inputBase = isDarkMode ? 'bg-[#0F0F0F] text-white border-[#262626] placeholder-gray-400' : 'bg-white text-[#1B4965] border-gray-200 placeholder-gray-400';
  const primaryBtn = isDarkMode
    ? 'bg-gradient-to-r from-[#6A11CB] to-[#3A7BD5] hover:from-[#5A0CB8] hover:to-[#2A6BCB] text-white'
    : 'bg-gradient-to-r from-[#1B4965] to-[#62B6CB] hover:from-[#0A3954] hover:to-[#4A9CA8] text-white';

  return (
    <section id="contacto" className={`py-20 ${isDarkMode ? 'bg-[#0D0D0D]' : 'bg-[#EAF6F9]'}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className={`rounded-lg shadow-lg p-8 ${cardBase}`}>
            <h2 className={`text-3xl font-bold mb-2 ${labelColor}`}>Contáctanos</h2>
            <p className={`mb-8 ${helpColor}`}>¿Tienes preguntas o necesitas ayuda? Estamos aquí para asistirte.</p>

            <form onSubmit={handleSubmit} noValidate>
              {/* Nombre */}
              <div className="mb-5">
                <label htmlFor="name" className={`block mb-2 font-semibold ${labelColor}`}>Nombre completo</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className={`w-full rounded-md border px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#62B6CB] ${inputBase}`}
                  placeholder="Tu nombre completo"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="mb-5">
                <label htmlFor="email" className={`block mb-2 font-semibold ${labelColor}`}>Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full rounded-md border px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#62B6CB] ${inputBase}`}
                  placeholder="tu@email.com"
                  aria-invalid={!!errors.email}
                />
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              {/* Mensaje */}
              <div className="mb-6">
                <label htmlFor="message" className={`block mb-2 font-semibold ${labelColor}`}>Mensaje</label>
                <textarea
                  id="message"
                  name="message"
                  rows={6}
                  value={form.message}
                  onChange={handleChange}
                  className={`w-full rounded-md border px-4 py-3 resize-y outline-none transition focus:ring-2 focus:ring-[#62B6CB] ${inputBase}`}
                  placeholder="Cuéntanos cómo podemos ayudarte..."
                  aria-invalid={!!errors.message}
                />
                {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={sending}
                  className={`inline-flex items-center gap-2 rounded-md px-6 py-3 font-semibold transition transform hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed ${primaryBtn}`}
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2 .01 7z" />
                  </svg>
                  {sending ? 'Enviando…' : 'Enviar mensaje'}
                </button>

                {submitted && (
                  <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>
                    ¡Gracias! Tu mensaje fue enviado.
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;


