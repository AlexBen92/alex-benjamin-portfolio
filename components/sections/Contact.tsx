'use client';

import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { FaEnvelope, FaPhone, FaLinkedin, FaGithub, FaTelegram } from 'react-icons/fa';
import { SiDiscord } from 'react-icons/si';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function Contact() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    console.log('Form submitted:', data);
    // TODO: Implement email sending logic
    alert('Message envoyé! Je vous répondrai bientôt.');
    reset();
  };

  const contactInfo = [
    {
      icon: FaEnvelope,
      label: 'Email',
      value: 'aleex.b95@gmail.com',
      href: 'mailto:aleex.b95@gmail.com',
      color: 'from-amber-500 to-orange-600',
    },
    {
      icon: FaPhone,
      label: 'Téléphone',
      value: '06-62-03-90-64',
      href: 'tel:+33662039064',
      color: 'from-purple-500 to-violet-600',
    },
  ];

  const socialLinks = [
    {
      icon: FaLinkedin,
      label: 'LinkedIn',
      href: '#',
      color: 'hover:text-blue-500',
    },
    {
      icon: FaGithub,
      label: 'GitHub',
      href: '#',
      color: 'hover:text-gray-400',
    },
    {
      icon: FaTelegram,
      label: 'Telegram',
      href: '#',
      color: 'hover:text-blue-400',
    },
    {
      icon: SiDiscord,
      label: 'Discord',
      href: '#',
      color: 'hover:text-indigo-500',
    },
  ];

  return (
    <section id="contact" className="relative py-32 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-500 to-purple-600 bg-clip-text text-transparent">
            Contact
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-amber-500 to-purple-600 mx-auto rounded-full" />
          <p className="text-gray-400 mt-6 text-lg">
            Intéressé par une collaboration? N'hésitez pas à me contacter!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <h3 className="text-3xl font-bold text-white mb-6">Informations de Contact</h3>

            {contactInfo.map((info, index) => (
              <motion.a
                key={info.label}
                href={info.href}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, x: 10 }}
                className="flex items-center gap-4 p-4 bg-[#1a1f3a] rounded-lg border border-gray-700 hover:border-amber-500 transition-all duration-300 group"
              >
                <div className={`w-14 h-14 rounded-lg bg-gradient-to-r ${info.color} flex items-center justify-center flex-shrink-0`}>
                  <info.icon size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">{info.label}</p>
                  <p className="text-white font-semibold text-lg group-hover:text-amber-500 transition-colors">
                    {info.value}
                  </p>
                </div>
              </motion.a>
            ))}

            {/* Social Links */}
            <div className="pt-8">
              <h4 className="text-xl font-semibold text-white mb-4">Réseaux Sociaux</h4>
              <div className="flex gap-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    className={`w-12 h-12 rounded-lg bg-[#1a1f3a] border border-gray-700 flex items-center justify-center text-gray-400 ${social.color} transition-all duration-300`}
                    aria-label={social.label}
                  >
                    <social.icon size={24} />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Availability */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="p-6 bg-gradient-to-r from-amber-500/10 to-purple-600/10 border border-amber-500/30 rounded-lg"
            >
              <p className="text-white font-semibold mb-2">Disponibilité</p>
              <p className="text-gray-300">
                Ouvert aux opportunités freelance et collaborations sur des projets blockchain innovants.
              </p>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-white font-semibold mb-2">
                  Nom
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name', { required: 'Le nom est requis' })}
                  className="w-full px-4 py-3 bg-[#1a1f3a] border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="Votre nom"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-white font-semibold mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'L\'email est requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email invalide',
                    },
                  })}
                  className="w-full px-4 py-3 bg-[#1a1f3a] border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                  placeholder="votre@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-white font-semibold mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  rows={6}
                  {...register('message', { required: 'Le message est requis' })}
                  className="w-full px-4 py-3 bg-[#1a1f3a] border border-gray-700 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors resize-none"
                  placeholder="Votre message..."
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                )}
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-purple-600 text-white rounded-lg font-semibold text-lg shadow-lg shadow-amber-500/50 hover:shadow-amber-500/70 transition-all duration-300"
              >
                Envoyer le Message
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
