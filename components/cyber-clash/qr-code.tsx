"use client";

import { useEffect, useState } from "react";

interface QRCodeProps {
  value: string;
  size?: number;
}

export function QRCode({ value, size = 180 }: QRCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!value) return;
    setError(false);
    setDataUrl(null);

    // Use the qrcode library to generate a data URL
    import("qrcode").then((QRCodeLib) => {
      const lib = QRCodeLib.default || QRCodeLib;
      lib.toDataURL(value, {
        width: size * 2, // 2x for retina
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      })
        .then((url: string) => {
          setDataUrl(url);
        })
        .catch((err: unknown) => {
          console.log("[v0] QR generation failed:", err);
          setError(true);
        });
    }).catch((err) => {
      console.log("[v0] QR import failed:", err);
      setError(true);
    });
  }, [value, size]);

  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-white text-center text-xs font-bold text-black"
        style={{ width: size, height: size }}
      >
        <span>QR unavailable.<br />Use room code.</span>
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        className="flex items-center justify-center rounded-xl bg-white"
        style={{ width: size, height: size }}
      >
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={`QR code to join game`}
      width={size}
      height={size}
      className="rounded-xl"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
