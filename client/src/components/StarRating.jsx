import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({
  rating = 5,
  maxStars = 5,
  size = 14,
  interactive = false,
  onRatingChange = () => {},
  showScore = false
}) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <div className="flex items-center">
        {[...Array(maxStars)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = rating >= starValue;
          return (
            <button
              key={index}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onRatingChange(starValue)}
              className={`p-0.5 transition-transform ${
                interactive ? 'hover:scale-125 cursor-pointer focus:outline-none' : 'cursor-default'
              }`}
            >
              <Star
                size={size}
                className={
                  isFilled
                    ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.4)]'
                    : 'text-slate-600 fill-slate-800/40'
                }
              />
            </button>
          );
        })}
      </div>
      {showScore && (
        <span className="text-xs font-mono font-bold text-amber-300 ml-0.5">
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
}
