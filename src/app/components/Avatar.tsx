"use client";

import { useMemo, useState } from "react";
import { User as UserIcon } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: number;
  className?: string;
  fallbackClassName?: string;
}

export function Avatar({
  src,
  alt,
  size = 64,
  className = "",
  fallbackClassName = "",
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const showImage = src && !hasError;

  const containerClass = useMemo(
    () =>
      [
        "relative overflow-hidden bg-primary-100 rounded-full flex items-center justify-center",
        className,
      ]
        .filter(Boolean)
        .join(" "),
    [className]
  );

  return (
    <div className={containerClass} style={{ width: size, height: size }}>
      {showImage ? (
        <img
          src={src as string}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`w-full h-full object-cover transition-opacity duration-200 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : (
        <div
          className={[
            "flex items-center justify-center text-primary-600",
            fallbackClassName,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <UserIcon className="w-1/2 h-1/2" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
