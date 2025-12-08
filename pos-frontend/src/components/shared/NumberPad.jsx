import React, { useState, useEffect } from 'react';
import { FiDelete, FiCheck, FiX } from 'react-icons/fi';

const NumberPad = ({
  value = '',
  onChange,
  onConfirm,
  onCancel,
  title = 'Miqdor kiriting',
  unit = '',
  showDecimal = true,
  maxValue = 999999,
  className = ''
}) => {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleDigit = (digit) => {
    let newValue = inputValue;

    // Prevent multiple decimals
    if (digit === '.' && inputValue.includes('.')) return;

    // Prevent leading zeros (except for decimals)
    if (inputValue === '0' && digit !== '.') {
      newValue = digit;
    } else {
      newValue = inputValue + digit;
    }

    // Check max value
    if (parseFloat(newValue) > maxValue) return;

    // Limit decimal places to 3
    if (newValue.includes('.')) {
      const parts = newValue.split('.');
      if (parts[1] && parts[1].length > 3) return;
    }

    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handleBackspace = () => {
    const newValue = inputValue.slice(0, -1) || '0';
    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handleClear = () => {
    setInputValue('0');
    onChange?.('0');
  };

  const handleConfirm = () => {
    const numValue = parseFloat(inputValue) || 0;
    onConfirm?.(numValue);
  };

  const buttons = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    [showDecimal ? '.' : 'C', '0', 'backspace']
  ];

  return (
    <div className={`bg-[#1a1a1a] rounded-xl p-4 ${className}`}>
      {/* Title */}
      {title && (
        <p className="text-gray-400 text-sm text-center mb-2">{title}</p>
      )}

      {/* Display */}
      <div className="bg-[#262626] rounded-lg p-4 mb-4 border border-gray-700">
        <div className="text-right">
          <span className="text-white text-3xl font-bold">
            {inputValue || '0'}
          </span>
          {unit && (
            <span className="text-gray-400 text-lg ml-2">{unit}</span>
          )}
        </div>
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {buttons.map((row, rowIndex) => (
          row.map((btn, colIndex) => {
            if (btn === 'backspace') {
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={handleBackspace}
                  className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white p-4 rounded-lg flex items-center justify-center transition-colors active:scale-95"
                >
                  <FiDelete className="w-6 h-6" />
                </button>
              );
            }
            if (btn === 'C') {
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={handleClear}
                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-4 rounded-lg font-bold text-xl transition-colors active:scale-95"
                >
                  C
                </button>
              );
            }
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                onClick={() => handleDigit(btn)}
                className="bg-[#262626] hover:bg-[#3a3a3a] text-white p-4 rounded-lg font-bold text-xl transition-colors active:scale-95"
              >
                {btn}
              </button>
            );
          })
        ))}
      </div>

      {/* Action Buttons */}
      {(onCancel || onConfirm) && (
        <div className="flex gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <FiX className="w-5 h-5" />
              Bekor
            </button>
          )}
          {onConfirm && (
            <button
              onClick={handleConfirm}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              <FiCheck className="w-5 h-5" />
              Tasdiqlash
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Inline NumberPad for quick entry (smaller version)
export const InlineNumberPad = ({
  value = '',
  onChange,
  placeholder = '0',
  unit = '',
  className = ''
}) => {
  const [inputValue, setInputValue] = useState(value.toString());
  const [showPad, setShowPad] = useState(false);

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleDigit = (digit) => {
    let newValue = inputValue;
    if (digit === '.' && inputValue.includes('.')) return;
    if (inputValue === '0' && digit !== '.') {
      newValue = digit;
    } else {
      newValue = inputValue + digit;
    }
    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handleBackspace = () => {
    const newValue = inputValue.slice(0, -1) || '';
    setInputValue(newValue);
    onChange?.(newValue);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input Display */}
      <div
        onClick={() => setShowPad(!showPad)}
        className="bg-[#262626] border border-gray-700 rounded-lg px-4 py-2 cursor-pointer flex items-center justify-between hover:border-green-500 transition-colors"
      >
        <span className={inputValue ? 'text-white' : 'text-gray-500'}>
          {inputValue || placeholder}
        </span>
        {unit && <span className="text-gray-400 text-sm">{unit}</span>}
      </div>

      {/* Mini Pad Dropdown */}
      {showPad && (
        <div className="absolute top-full left-0 mt-2 bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 z-50 shadow-xl">
          <div className="grid grid-cols-3 gap-1.5">
            {['7', '8', '9', '4', '5', '6', '1', '2', '3', '.', '0'].map((btn) => (
              <button
                key={btn}
                onClick={() => handleDigit(btn)}
                className="bg-[#262626] hover:bg-[#3a3a3a] text-white w-12 h-12 rounded-lg font-bold text-lg transition-colors"
              >
                {btn}
              </button>
            ))}
            <button
              onClick={handleBackspace}
              className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
            >
              <FiDelete className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => setShowPad(false)}
            className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm"
          >
            Tayyor
          </button>
        </div>
      )}
    </div>
  );
};

export default NumberPad;
