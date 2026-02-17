"use client";

import { useEffect, useRef } from "react";

/**
 * QR Code generator using Canvas.
 * Supports Version 1-6 with auto-detection based on content length.
 * Uses byte-mode encoding with Error Correction Level L and mask pattern 0.
 */

interface QRCodeProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
}

// ---------- GF(256) math ----------
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
  }
  for (let i = 255; i < 512; i++) GF_EXP[i] = GF_EXP[i - 255];
})();

function gfMul(a: number, b: number) {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsEncode(data: number[], ecLen: number): number[] {
  const gen = new Array(ecLen + 1).fill(0);
  gen[0] = 1;
  for (let i = 0; i < ecLen; i++) {
    for (let j = i + 1; j >= 1; j--) {
      gen[j] = gen[j] ^ gfMul(gen[j - 1], GF_EXP[i]);
    }
  }
  const ec = new Array(ecLen).fill(0);
  for (const b of data) {
    const lead = b ^ ec[0];
    for (let j = 0; j < ecLen - 1; j++) ec[j] = ec[j + 1] ^ gfMul(gen[j + 1], lead);
    ec[ecLen - 1] = gfMul(gen[ecLen], lead);
  }
  return ec;
}

// ---------- Version configs (Level L) ----------
// [totalCodewords, dataCodewords, ecCodewordsPerBlock, numBlocks, alignmentPatternCenters[]]
const VERSION_CONFIGS: Record<number, { total: number; data: number; ec: number; blocks: number; align: number[] }> = {
  1: { total: 26, data: 19, ec: 7, blocks: 1, align: [] },
  2: { total: 44, data: 34, ec: 10, blocks: 1, align: [6, 18] },
  3: { total: 70, data: 55, ec: 15, blocks: 1, align: [6, 22] },
  4: { total: 100, data: 80, ec: 20, blocks: 1, align: [6, 26] },
  5: { total: 134, data: 108, ec: 26, blocks: 1, align: [6, 30] },
  6: { total: 172, data: 136, ec: 18, blocks: 2, align: [6, 34] },
};

// Format info bits for Level L, mask 0
const FORMAT_BITS = 0x77C4;

function pickVersion(byteLen: number): number {
  // Byte mode overhead: 4-bit mode + 8-bit count (V1-9) = 12 bits = ~2 bytes
  const overhead = 2;
  for (let v = 1; v <= 6; v++) {
    if (VERSION_CONFIGS[v].data >= byteLen + overhead) return v;
  }
  return 6; // Max we support
}

function generateQR(text: string): boolean[][] {
  const textBytes: number[] = [];
  for (let i = 0; i < text.length; i++) textBytes.push(text.charCodeAt(i));

  const version = pickVersion(textBytes.length);
  const config = VERSION_CONFIGS[version];
  const size = 17 + version * 4;

  // --- Encode data in byte mode ---
  const bits: number[] = [];
  bits.push(0, 1, 0, 0); // byte mode indicator
  for (let i = 7; i >= 0; i--) bits.push((textBytes.length >> i) & 1);
  for (const b of textBytes) for (let i = 7; i >= 0; i--) bits.push((b >> i) & 1);
  // Terminator
  for (let i = 0; i < 4 && bits.length < config.data * 8; i++) bits.push(0);
  while (bits.length % 8 !== 0) bits.push(0);
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < config.data * 8) {
    for (let i = 7; i >= 0; i--) bits.push((padBytes[padIdx] >> i) & 1);
    padIdx = (padIdx + 1) % 2;
  }

  // Convert to bytes
  const dataBytes: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) byte = (byte << 1) | (bits[i + j] || 0);
    dataBytes.push(byte);
  }

  // --- Reed-Solomon (block interleaving for multi-block versions) ---
  const ecPerBlock = config.ec / config.blocks;
  const dataPerBlock = Math.floor(config.data / config.blocks);
  const allInterleaved: number[] = [];

  const dataBlocks: number[][] = [];
  const ecBlocks: number[][] = [];
  for (let b = 0; b < config.blocks; b++) {
    const blockData = dataBytes.slice(b * dataPerBlock, (b + 1) * dataPerBlock);
    dataBlocks.push(blockData);
    ecBlocks.push(rsEncode(blockData, ecPerBlock));
  }

  // Interleave data
  for (let i = 0; i < dataPerBlock; i++) {
    for (let b = 0; b < config.blocks; b++) {
      if (i < dataBlocks[b].length) allInterleaved.push(dataBlocks[b][i]);
    }
  }
  // Interleave EC
  for (let i = 0; i < ecPerBlock; i++) {
    for (let b = 0; b < config.blocks; b++) {
      if (i < ecBlocks[b].length) allInterleaved.push(ecBlocks[b][i]);
    }
  }

  // --- Build matrix ---
  const matrix: (boolean | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const reserved: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  function placeFinder(row: number, col: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const mr = row + r, mc = col + c;
        if (mr < 0 || mr >= size || mc < 0 || mc >= size) continue;
        const isBorder = r === -1 || r === 7 || c === -1 || c === 7;
        const isOuter = r === 0 || r === 6 || c === 0 || c === 6;
        const isInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[mr][mc] = !isBorder && (isOuter || isInner);
        reserved[mr][mc] = true;
      }
    }
  }
  placeFinder(0, 0);
  placeFinder(0, size - 7);
  placeFinder(size - 7, 0);

  // Alignment patterns
  if (config.align.length > 0) {
    const centers = config.align;
    for (let ai = 0; ai < centers.length; ai++) {
      for (let aj = 0; aj < centers.length; aj++) {
        const cr = centers[ai], cc = centers[aj];
        if (reserved[cr]?.[cc]) continue;
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            const mr = cr + r, mc = cc + c;
            if (mr < 0 || mr >= size || mc < 0 || mc >= size) continue;
            if (reserved[mr][mc]) continue;
            matrix[mr][mc] = Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0);
            reserved[mr][mc] = true;
          }
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (!reserved[6][i]) { matrix[6][i] = i % 2 === 0; reserved[6][i] = true; }
    if (!reserved[i][6]) { matrix[i][6] = i % 2 === 0; reserved[i][6] = true; }
  }

  // Dark module
  matrix[size - 8][8] = true;
  reserved[size - 8][8] = true;

  // Reserve format info areas
  for (let i = 0; i < 8; i++) {
    reserved[8][i] = true; reserved[i][8] = true;
    reserved[8][size - 1 - i] = true; reserved[size - 1 - i][8] = true;
  }
  reserved[8][8] = true;

  // Reserve version info for V7+ (not needed for V1-6)

  // --- Place data bits ---
  const allBits: number[] = [];
  for (const b of allInterleaved) for (let i = 7; i >= 0; i--) allBits.push((b >> i) & 1);

  let bitIdx = 0;
  let upward = true;
  for (let col = size - 1; col >= 1; col -= 2) {
    if (col === 6) col = 5; // skip timing column
    for (let row = 0; row < size; row++) {
      const actualRow = upward ? size - 1 - row : row;
      for (let c = 0; c < 2; c++) {
        const actualCol = col - c;
        if (actualCol < 0 || actualCol >= size) continue;
        if (actualRow < 0 || actualRow >= size) continue;
        if (reserved[actualRow][actualCol]) continue;
        if (bitIdx < allBits.length) {
          const masked = allBits[bitIdx] ^ ((actualRow + actualCol) % 2 === 0 ? 1 : 0);
          matrix[actualRow][actualCol] = masked === 1;
          bitIdx++;
        } else {
          matrix[actualRow][actualCol] = (actualRow + actualCol) % 2 === 0;
        }
      }
    }
    upward = !upward;
  }

  // --- Format info ---
  const fmtPositionsA: [number, number][] = [];
  for (let i = 0; i <= 5; i++) fmtPositionsA.push([8, i]);
  fmtPositionsA.push([8, 7], [8, 8], [7, 8]);
  for (let i = 5; i >= 0; i--) fmtPositionsA.push([i, 8]);

  const fmtPositionsB: [number, number][] = [];
  for (let i = 0; i < 7; i++) fmtPositionsB.push([size - 1 - i, 8]);
  for (let i = 0; i < 8; i++) fmtPositionsB.push([8, size - 8 + i]);

  for (let i = 0; i < 15; i++) {
    const bit = ((FORMAT_BITS >> (14 - i)) & 1) === 1;
    if (i < fmtPositionsA.length) { const [r, c] = fmtPositionsA[i]; matrix[r][c] = bit; }
    if (i < fmtPositionsB.length) { const [r, c] = fmtPositionsB[i]; matrix[r][c] = bit; }
  }

  return matrix.map((row) => row.map((cell) => cell === true));
}

export function QRCode({ value, size = 200, fgColor = "#000000", bgColor = "#ffffff" }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !value) return;

    try {
      const modules = generateQR(value);
      const moduleCount = modules.length;
      const quietZone = 4;
      const totalModules = moduleCount + quietZone * 2;
      const cellSize = size / totalModules;
      const offset = cellSize * quietZone;

      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);

      // Modules
      ctx.fillStyle = fgColor;
      const r = Math.max(cellSize * 0.12, 0.5);
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (!modules[row][col]) continue;
          const x = offset + col * cellSize;
          const y = offset + row * cellSize;
          const w = cellSize + 0.5; // slight overlap to avoid gaps
          const h = cellSize + 0.5;
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + r);
          ctx.lineTo(x + w, y + h - r);
          ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          ctx.lineTo(x + r, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.fill();
        }
      }
    } catch {
      // Fall back to showing the text
    }
  }, [value, size, fgColor, bgColor]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ width: size, height: size, imageRendering: "pixelated" }}
      aria-label={`QR code for: ${value}`}
      role="img"
    />
  );
}
