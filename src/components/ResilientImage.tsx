import {useState} from 'react';
import {UtensilsCrossed} from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function ResilientImage({src, alt, className = ''}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-stone-100 via-stone-200 to-stone-100 text-stone-500 p-6 text-center ${className}`}
      >
        <UtensilsCrossed className="w-8 h-8 mb-2 text-stone-400" strokeWidth={1.5} />
        <span className="text-xs font-medium text-stone-600 line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
