"use client";

import { useState } from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt?: string;
  width: number;
  height: number;
  className?: string;
  fallback: string;
  sizes?: string;
  priority?: boolean;
};

export default function SafeImage({ src, alt = "", width, height, className = "", fallback, sizes, priority }: Props) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return <>{fallback}</>;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
