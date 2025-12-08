import React, { useState, useEffect, useRef } from 'react';
import { FiCamera, FiSearch, FiX, FiZap } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const BarcodeScanner = ({
  onScan,
  onCancel,
  placeholder = "Barcode skanerlang yoki kiriting...",
  autoFocus = true,
  showCamera = true
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState('');
  const inputRef = useRef(null);
  const bufferRef = useRef('');
  const timeoutRef = useRef(null);

  // Auto-focus input
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Barcode scanner detection (listens for rapid key input)
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ignore if typing in another input
      if (document.activeElement !== inputRef.current && document.activeElement.tagName !== 'BODY') {
        return;
      }

      // Clear timeout on each keypress
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Add character to buffer
      if (e.key.length === 1) {
        bufferRef.current += e.key;
      }

      // Enter key - submit barcode
      if (e.key === 'Enter' && bufferRef.current) {
        const barcode = bufferRef.current.trim();
        if (barcode.length >= 3) {
          handleBarcodeSubmit(barcode);
        }
        bufferRef.current = '';
        e.preventDefault();
        return;
      }

      // Clear buffer after 100ms of no input (scanner inputs fast, keyboard slow)
      timeoutRef.current = setTimeout(() => {
        // If buffer has content and it was entered quickly (likely scanner)
        if (bufferRef.current.length >= 8) {
          handleBarcodeSubmit(bufferRef.current.trim());
        }
        bufferRef.current = '';
      }, 100);
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleBarcodeSubmit = async (barcode) => {
    if (!barcode || barcode === lastScanned) return;

    setLastScanned(barcode);
    setIsScanning(true);
    setInputValue(barcode);

    try {
      await onScan?.(barcode);
    } finally {
      setIsScanning(false);
      // Clear after short delay
      setTimeout(() => {
        setInputValue('');
        setLastScanned('');
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 500);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      handleBarcodeSubmit(inputValue.trim());
    }
  };

  return (
    <div className="bg-[#1a1a1a] rounded-xl p-4 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-green-500/10 p-2 rounded-lg">
            <FiZap className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-white font-medium">Barcode Scanner</h3>
            <p className="text-gray-400 text-xs">Tez qidirish uchun skanerlang</p>
          </div>
        </div>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white p-2"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scanner Input */}
      <form onSubmit={handleManualSubmit} className="relative">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className={`w-full bg-[#262626] border rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-colors ${
              isScanning ? 'border-green-500' : 'border-gray-700 focus:border-green-500'
            }`}
            autoComplete="off"
          />
          {isScanning && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!inputValue.trim() || isScanning}
          className="mt-3 w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <FiSearch className="w-4 h-4" />
          Qidirish
        </button>
      </form>

      {/* Scanner Status */}
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
        <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
        <span>
          {isScanning
            ? 'Skanerlanmoqda...'
            : 'Barcode skanerini yoqing yoki kodni kiriting'}
        </span>
      </div>

      {/* Tips */}
      <div className="mt-4 bg-[#262626] rounded-lg p-3">
        <p className="text-gray-400 text-xs">
          <span className="text-yellow-400">Maslahat:</span> USB barcode skanerini ulang va mahsulot kodini skanerlang.
          Kod avtomatik tanib olinadi.
        </p>
      </div>
    </div>
  );
};

// Mini inline scanner (for use in forms/modals)
export const InlineBarcodeInput = ({
  value,
  onChange,
  onScan,
  placeholder = "SKU yoki Barcode",
  className = ""
}) => {
  const inputRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onScan?.(value);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
      />
      <FiZap className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
    </div>
  );
};

export default BarcodeScanner;
