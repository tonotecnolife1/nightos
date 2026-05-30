"use client";

import { Camera, User, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type ChangeEvent } from "react";

const STORAGE_PREFIX = "nightos.customer-photo";

interface Props {
  customerId: string;
  customerName: string;
}

export function CustomerPhotoUpload({ customerId, customerName }: Props) {
  const [photo, setPhoto] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}.${customerId}`);
    if (stored) setPhoto(stored);
  }, [customerId]);

  const handleFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read and compress
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      try {
        localStorage.setItem(`${STORAGE_PREFIX}.${customerId}`, dataUrl);
        setPhoto(dataUrl);
      } catch {
        // localStorage quota exceeded — just show in session
        setPhoto(dataUrl);
      }
    };
    reader.readAsDataURL(file);

    // Reset input so re-uploading the same file triggers onChange
    e.target.value = "";
  };

  const removePhoto = () => {
    localStorage.removeItem(`${STORAGE_PREFIX}.${customerId}`);
    setPhoto(null);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-pearl-soft border border-pearl-soft shadow-soft">
          {photo ? (
            <Image
              src={photo}
              alt={customerName}
              width={64}
              height={64}
              className="w-full h-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-ink-mute">
              <User size={28} />
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gold-deep text-pearl-light-light flex items-center justify-center shadow-soft"
        >
          <Camera size={13} />
        </button>
      </div>
      <div className="flex-1">
        <p className="text-label-sm text-ink-mute">
          お客さんとの写真をプロフィールに
        </p>
        {photo && (
          <button
            type="button"
            onClick={removePhoto}
            className="text-label-sm text-wine-deep flex items-center gap-1 mt-0.5"
          >
            <X size={11} />
            写真を削除
          </button>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
