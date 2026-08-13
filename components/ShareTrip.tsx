'use client';

import { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Globe
} from 'lucide-react';
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

export function ShareTrip({ 
  destination, 
  tripUrl, 
  days, 
  travelers, 
  budget 
}: ShareTripProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `Check out my AI-planned trip to ${destination}! ${days} days, ${travelers} travelers, ₹${budget.toLocaleString('en-IN')} budget. Planned with Travel-o-pedia 🌍✈️`;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(tripUrl)}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(tripUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + tripUrl)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(tripUrl)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(tripUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${destination} Trip by Travel-o-pedia`,
          text: shareText,
          url: tripUrl
        });
      } catch (err) {
        console.log('Share cancelled', err);
      }
    }
  };

  // Check if Web Share API is supported
  const isShareSupported = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <Card className="border border-gray-150 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900/60 dark:to-gray-900/10 shadow-sm overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <CardContent className="p-6 space-y-6">
        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center">
            <Share2 className="w-4 h-4 text-[#FF6B35]" />
          </div>
          <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
            Share Your Itinerary
          </h3>
        </div>

        {/* Share Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* X / Twitter */}
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-2 p-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition hover:border-[#FF6B35] dark:hover:border-[#FF6B35]/50 group"
          >
            <div className="p-1.5 bg-black rounded-full text-white group-hover:scale-110 transition-transform flex items-center justify-center">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Twitter</span>
          </a>

          {/* Facebook */}
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-2 p-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition hover:border-[#0055CC] dark:hover:border-blue-500/50 group"
          >
            <div className="p-1.5 bg-blue-600 rounded-full text-white group-hover:scale-110 transition-transform flex items-center justify-center">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Facebook</span>
          </a>

          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-2 p-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition hover:border-[#00A878] dark:hover:border-green-500/50 group"
          >
            <div className="p-1.5 bg-[#25D366] rounded-full text-white group-hover:scale-110 transition-transform flex items-center justify-center">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 2.025 14.068 1 11.451 1c-5.436 0-9.86 4.37-9.864 9.8.001 1.73.488 3.415 1.417 4.904l-.994 3.63 3.733-.974.314.193z"/>
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">WhatsApp</span>
          </a>

          {/* LinkedIn */}
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-2 p-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition hover:border-blue-700 dark:hover:border-blue-600/50 group"
          >
            <div className="p-1.5 bg-blue-700 rounded-full text-white group-hover:scale-110 transition-transform flex items-center justify-center">
              <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
            </div>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">LinkedIn</span>
          </a>

          {/* Native Share or Copy Link */}
          <button
            onClick={isShareSupported ? handleNativeShare : handleCopyLink}
            className="flex flex-col items-center justify-center gap-2 p-3 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl hover:shadow-md transition hover:border-gray-400 dark:hover:border-gray-700 group cursor-pointer"
          >
            <div className="p-1.5 bg-gray-100 dark:bg-gray-900 rounded-full text-gray-700 dark:text-gray-300 group-hover:scale-110 transition-transform flex items-center justify-center">
              {isShareSupported ? <Share2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </div>
            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
              {isShareSupported ? 'Share Native' : 'Copy'}
            </span>
          </button>
        </div>

        {/* Copy Link Section */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Itinerary Link
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={tripUrl}
              readOnly
              className="flex-1 px-3.5 h-11 border border-gray-200 dark:border-gray-800 rounded-xl bg-gray-50/50 dark:bg-gray-950 text-gray-800 dark:text-gray-300 text-sm shadow-inner"
            />
            <Button
              onClick={handleCopyLink}
              className="h-11 bg-[#FF6B35] text-white hover:bg-[#e55a28] font-bold px-5 rounded-xl shadow-md transition-all shrink-0 min-w-[100px]"
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
                    <Check className="w-4 h-4" />
                    Copied!
                  </motion.span>
                ) : (
                  <motion.span
                    key="copy"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1.5"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </motion.span>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>

        {/* Share Preview */}
        <div className="p-4 bg-gray-50/50 dark:bg-gray-950 border border-gray-150 dark:border-gray-800 rounded-xl space-y-1 text-sm shadow-inner">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            <Globe className="w-3.5 h-3.5" />
            <span>Social Post Preview</span>
          </div>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed font-medium pl-0.5">
            {shareText}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
