"use client";

import { useEffect, useRef, useState } from "react";
import QRCodeLib from "qrcode";

interface QRCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
}

export function QRCode({ value, size = 180, fgColor = "#000000", bgColor = "#ffffff" }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;

    QRCodeLib.toCanvas(canvas, value, {
      width: size,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: "M",
    }, (err) => {
      if (err) {
        console.error("QR code generation failed:", err);
        setError(true);
      } else {
        setError(false);
      }
    });
  }, [value, size, fgColor, bgColor]);

  if (error) {
    return (
      <div
        className="flex items-center justify-center rounded-xl text-center text-xs font-bold"
        style={{ width: size, height: size, background: bgColor, color: fgColor }}
      >
        <span>QR unavailable.<br />Use the room code above.</span>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size }}
      aria-label={`QR code to join game: ${value}`}
      role="img"
    />
  );
}
