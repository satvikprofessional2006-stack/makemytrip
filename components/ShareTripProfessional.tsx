'use client';

import { useState } from 'react';
import { Copy, Check, Share2, Globe, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareTripProps {
  destination: string;
  tripUrl: string;
  days: number;
  travelers: number;
  budget: number;
}

export function ShareTripProfessional({ 
  destination, 
  tripUrl, 
  days, 
  travelers, 
  budget 
}: ShareTripProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `Check out my AI-planned trip to ${destination}! ${days} days, ${travelers} travelers, ₹${budget.toLocaleString('en-IN')} budget. Planned with Travel-o-pedia 🌍✈️`;

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + tripUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(tripUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(tripUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(tripUrl)}`,
    email: `mailto:?subject=Check out my ${destination} trip&body=${encodeURIComponent(shareText + '\n\n' + tripUrl)}`
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(tripUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const platforms = [
    {
      name: 'WhatsApp',
      url: shareLinks.whatsapp,
      color: 'hover:border-[#25D366] hover:bg-[#25D366]/5 dark:hover:bg-[#25D366]/10',
      textColor: 'text-[#25D366]',
      bgGlow: 'bg-[#25D366]',
      svg: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.025 14.068 1 11.451 1c-5.436 0-9.86 4.37-9.864 9.8.001 1.73.488 3.415 1.417 4.904l-.994 3.63 3.733-.974.314.193z"/>
        </svg>
      )
    },
    {
      name: 'Twitter',
      url: shareLinks.twitter,
      color: 'hover:border-black dark:hover:border-white hover:bg-black/5 dark:hover:bg-white/5',
      textColor: 'text-gray-900 dark:text-white',
      bgGlow: 'bg-black dark:bg-white',
      svg: (
        <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      name: 'Facebook',
      url: shareLinks.facebook,
      color: 'hover:border-[#1877F2] hover:bg-[#1877F2]/5 dark:hover:bg-[#1877F2]/10',
      textColor: 'text-[#1877F2]',
      bgGlow: 'bg-[#1877F2]',
      svg: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      url: shareLinks.linkedin,
      color: 'hover:border-[#0A66C2] hover:bg-[#0A66C2]/5 dark:hover:bg-[#0A66C2]/10',
      textColor: 'text-[#0A66C2]',
      bgGlow: 'bg-[#0A66C2]',
      svg: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6 fill-current" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      )
    },
    {
      name: 'Email',
      url: shareLinks.email,
      color: 'hover:border-[#FF6B35] hover:bg-[#FF6B35]/5 dark:hover:bg-[#FF6B35]/10',
      textColor: 'text-[#FF6B35]',
      bgGlow: 'bg-[#FF6B35]',
      svg: (
        <Mail className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-current" />
      )
    }
  ];

  return (
    <Card className="border border-gray-200/60 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900/60 dark:to-gray-900/10 shadow-md overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#0055CC]/5 rounded-full blur-3xl pointer-events-none" />
      
      <CardContent className="p-4 sm:p-8 space-y-5 sm:space-y-7">
        {/* Header */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#0055CC]/15 dark:bg-[#0055CC]/10 flex items-center justify-center shrink-0">
            <Share2 className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-[#0055CC] dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white leading-tight">
              Share Your Journey
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Share your {destination} trip with friends & family
            </p>
          </div>
        </div>

        {/* Copy Link Section (Prominent) */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-50/50 to-[#FF6B35]/5 dark:from-blue-950/20 dark:to-orange-950/10 rounded-2xl border border-blue-100/50 dark:border-gray-800/80 shadow-inner">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Trip Link
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              type="text"
              value={tripUrl}
              readOnly
              className="flex-1 px-4 h-11 sm:h-12 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-xs sm:text-sm font-mono text-gray-600 dark:text-gray-300 focus:outline-none focus:border-blue-500"
            />
            <Button
              onClick={handleCopyLink}
              className="h-11 sm:h-12 bg-[#0055CC] hover:bg-blue-700 text-white font-bold px-5 sm:px-6 rounded-xl shadow-md transition flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.span
                    key="copied"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" /> Copied!
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <Copy className="w-4 h-4" /> Copy Link
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Social Share Grid */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Share On
          </p>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-3">
            {platforms.map((platform) => (
              <a
                key={platform.name}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex flex-col items-center gap-1.5 sm:gap-3 p-1.5 sm:p-4 bg-white dark:bg-gray-950/45 border border-gray-200/60 dark:border-gray-800/80 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md ${platform.color} group`}
              >
                <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full ${platform.bgGlow}/10 dark:${platform.bgGlow}/5 ${platform.textColor} flex items-center justify-center group-hover:scale-110 transition-transform shrink-0`}>
                  {platform.svg}
                </div>
                <span className={`text-[9px] sm:text-xs font-bold text-gray-700 dark:text-gray-400 group-hover:${platform.textColor} transition-colors truncate w-full text-center`}>
                  {platform.name}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Social Post Preview */}
        <div className="p-3.5 sm:p-4 bg-gray-50/50 dark:bg-gray-950 border border-gray-200/60 dark:border-gray-800 rounded-xl space-y-1 text-xs sm:text-sm shadow-inner">
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>Social Post Preview</span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-semibold pl-0.5">
            {shareText}
          </p>
        </div>

        {/* Footer Info */}
        <div className="pt-4 sm:pt-5 border-t border-gray-200/60 dark:border-gray-800/80 text-center">
          <p className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-medium">
            Anyone with this link can view your {destination} trip plan for free
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
