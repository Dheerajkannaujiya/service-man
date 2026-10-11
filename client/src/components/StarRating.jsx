import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({
  rating = 5,
  maxStars = 5,
  size = 16,
  interactive = false,
  onRatingChange = () => {},
  showScore = false
}) {
  return (
    <div className="inline-flex items-center gap-1">
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
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-300 fill-slate-100'
                }
              />
            </button>
          );
        })}
      </div>
      {showScore && (
        <span className="text-xs font-bold text-slate-700 ml-1">
          {Number(rating).toFixed(1)}
        </span>
      )}
    </div>
  );
}
