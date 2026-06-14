'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Sparkles, Send, User as UserIcon, Calendar, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User } from '@supabase/supabase-js';

interface Review {
  id: string;
  destination: string;
  user_id: string;
  rating: number;
  review_text: string;
  created_at: string;
}

export function DestinationReviews({ destination }: { destination: string }) {
  const supabase = createClient();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }, [supabase.auth]);

  const fetchReviews = useCallback(async () => {
    const { data } = await supabase
      .from('destination_reviews')
      .select('*')
      .eq('destination', destination)
      .order('created_at', { ascending: false });
    
    setReviews((data as Review[]) || []);
  }, [supabase, destination]);

  useEffect(() => {
    requestAnimationFrame(() => {
      fetchUser();
      fetchReviews();
    });
  }, [fetchUser, fetchReviews]);

  const handleSubmitReview = async () => {
    if (!user) {
      alert('Please login to submit a review');
      return;
    }

    if (rating === 0 || !reviewText.trim()) {
      alert('Please provide both rating and review text');
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('destination_reviews')
      .insert([{
        destination,
        user_id: user.id,
        rating,
        review_text: reviewText
      }]);

    if (error) {
      alert('Error: ' + error.message);
    } else {
      setRating(0);
      setReviewText('');
      setSubmitted(true);
      fetchReviews();
      setTimeout(() => setSubmitted(false), 3000);
    }

    setLoading(false);
  };

  const handleDeleteReview = useCallback(async (reviewId: string) => {
    if (!confirm('Delete this review?')) return;

    setDeleting(reviewId);

    const { error } = await supabase
      .from('destination_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      alert('Error deleting review: ' + error.message);
    } else {
      fetchReviews();
    }

    setDeleting(null);
  }, [supabase, fetchReviews]);

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  // Calculate rating breakdown distribution
  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { stars, count, percentage };
  });

  return (
    <div className="space-y-8 w-full max-w-3xl mx-auto my-10 px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#0055CC]" />
            Traveler Reviews
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Real experiences shared by Travelopedia explorers for {destination}
          </p>
        </div>
        <Badge variant="outline" className="w-fit border-[#0055CC] text-[#0055CC] font-bold py-1 px-3 dark:border-[#0055CC]/50 dark:text-blue-400">
          {destination}
        </Badge>
      </div>

      {/* Ratings Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Side: Large Score */}
        <Card className="md:col-span-5 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900/60 dark:to-gray-900/10 border-gray-100 dark:border-gray-800/80 shadow-md">
          <CardContent className="p-6 flex flex-col items-center justify-center text-center">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-wider uppercase mb-1">
              Average Rating
            </span>
            <div className="text-5xl font-black text-gray-900 dark:text-white flex items-baseline gap-1">
              {avgRating}
              <span className="text-lg font-medium text-gray-400">/5</span>
            </div>
            
            {/* Stars rendering */}
            <div className="flex items-center gap-1 my-3">
              {[1, 2, 3, 4, 5].map((star) => {
                const numericAvg = parseFloat(avgRating);
                const isFull = star <= Math.floor(numericAvg);
                const isHalf = !isFull && star === Math.ceil(numericAvg) && numericAvg % 1 >= 0.5;
                return (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      isFull
                        ? 'fill-[#FF6B35] text-[#FF6B35]'
                        : isHalf
                        ? 'fill-[#FF6B35]/50 text-[#FF6B35]'
                        : 'text-gray-300 dark:text-gray-700'
                    }`}
                  />
                );
              })}
            </div>
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Based on {reviews.length} total reviews
            </span>
          </CardContent>
        </Card>

        {/* Right Side: Rating Progress Bars */}
        <Card className="md:col-span-7 bg-white dark:bg-gray-900/40 border-gray-100 dark:border-gray-800/80 shadow-sm">
          <CardContent className="p-6 space-y-2.5">
            {ratingBreakdown.map((row) => (
              <div key={row.stars} className="flex items-center gap-3 text-sm">
                <span className="w-12 text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1.5 justify-end">
                  {row.stars} <Star className="w-3.5 h-3.5 fill-gray-400 text-gray-400" />
                </span>
                <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${row.percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-[#0055CC] to-[#00A878]"
                  />
                </div>
                <span className="w-8 text-right text-gray-400 dark:text-gray-500 font-mono text-xs">
                  {row.count}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Review Submission Section */}
      {user ? (
        <Card className="relative overflow-hidden border-2 border-dashed border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
          <CardContent className="p-6 space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#FF6B35]" />
              </div>
              <h3 className="font-extrabold text-lg text-gray-900 dark:text-white">
                Share Your Experience in {destination}
              </h3>
            </div>

            {/* Rating Stars Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Select Rating
              </label>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-3xl transition-colors duration-150 outline-none"
                  >
                    <Star
                      className={`w-9 h-9 transition-all ${
                        star <= (hoveredRating || rating)
                          ? 'fill-[#FF6B35] text-[#FF6B35] drop-shadow-md'
                          : 'text-gray-300 dark:text-gray-700 hover:text-gray-400'
                      }`}
                    />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Textarea review comment */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Review description
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Describe your itinerary experience, must-see attractions, hotels, or budget tips..."
                className="w-full p-4 border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-950 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0055CC] transition-all min-h-[100px] resize-y shadow-inner"
                rows={4}
              />
            </div>

            {/* Submit Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Logged in as <span className="font-semibold">{user.email}</span>
              </p>
              
              <Button
                onClick={handleSubmitReview}
                disabled={loading}
                className="w-full sm:w-auto gap-2 bg-[#FF6B35] text-white hover:bg-[#e55a28] font-bold shadow-md transition-all px-6 py-2.5 rounded-xl disabled:bg-gray-300 dark:disabled:bg-gray-800"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Review
                  </>
                )}
              </Button>
            </div>

            <AnimatePresence>
              {submitted && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-600 dark:text-green-400 text-sm font-semibold text-center flex items-center justify-center gap-2"
                >
                  <span>✅ Review posted successfully!</span>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm text-yellow-800 dark:text-yellow-400 font-medium">
            <UserIcon className="w-5 h-5 text-yellow-600" />
            <span>You must be logged in to submit a review for {destination}.</span>
          </div>
          <Button
            onClick={() => window.location.href = '/login'}
            variant="outline"
            className="border-yellow-600/30 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/10 text-xs px-4"
          >
            Log In
          </Button>
        </div>
      )}

      {/* Reviews List container */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-lg text-gray-900 dark:text-white flex items-center gap-2">
          User Reviews ({reviews.length})
        </h3>
        
        {reviews.length === 0 ? (
          <Card className="border border-dashed border-gray-200 dark:border-gray-800 bg-transparent py-10">
            <CardContent className="flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-400">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-semibold">No reviews yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
                Be the first to share your travel experiences and help others plan their dream itinerary!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {reviews.map((review) => {
                // Generate a visual pseudonym for privacy & styling since we don't have profile names
                const userShort = `Explorer #${review.user_id.slice(0, 5).toUpperCase()}`;
                
                return (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="bg-white dark:bg-gray-900/35 border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                      <CardContent className="p-5 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          {/* User Avatar + Short Name */}
                          <div className="flex items-center gap-3">
                            <Avatar className="w-9 h-9 border border-[#0055CC]/25">
                              <AvatarFallback className="bg-gradient-to-br from-[#0055CC] to-[#00A878] text-white text-xs font-bold font-mono">
                                {userShort.slice(10, 12)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">
                                {userShort}
                              </p>
                              <div className="flex items-center gap-1 text-gray-400 dark:text-gray-500 text-[11px]">
                                <Calendar className="w-3 h-3" />
                                <span>
                                  {new Date(review.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Star Display */}
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
                                    ? 'fill-[#FF6B35] text-[#FF6B35]'
                                    : 'text-gray-200 dark:text-gray-800'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Review text comment */}
                        <div className="flex justify-between items-start gap-4">
                          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap pl-1 flex-1">
                            {review.review_text}
                          </p>
                          {user && user.id === review.user_id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteReview(review.id)}
                              disabled={deleting === review.id}
                              className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-semibold gap-1.5 h-8 px-2.5 rounded-lg border border-transparent hover:border-red-200/50 transition-all shrink-0"
                            >
                              {deleting === review.id ? (
                                <span className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                              <span>Delete</span>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
