import React, { useState, useRef, useEffect } from 'react';
import Hangul from 'hangul-js';
import { Box, Input, Flex, Button, Text, SimpleGrid } from '@chakra-ui/react';

// Standard 2-Set Dubeolsik QWERTY → Jamo mapping
const KEY_TO_JAMO = {
  // consonants
  r: 'ㄱ', s: 'ㄴ', e: 'ㄷ', f: 'ㄹ', a: 'ㅁ', q: 'ㅂ', t: 'ㅅ',
  d: 'ㅇ', w: 'ㅈ', c: 'ㅊ', z: 'ㅋ', x: 'ㅌ', v: 'ㅍ', g: 'ㅎ',
  // double consonants
  R: 'ㄲ', E: 'ㄸ', Q: 'ㅃ', T: 'ㅆ', W: 'ㅉ',
  // vowels
  k: 'ㅏ', o: 'ㅐ', i: 'ㅑ', O: 'ㅒ', j: 'ㅓ', p: 'ㅔ',
  u: 'ㅕ', P: 'ㅖ', h: 'ㅗ', y: 'ㅛ', n: 'ㅜ', b: 'ㅠ',
  m: 'ㅡ', l: 'ㅣ'
};

// Virtual keyboard layout
const KEYBOARD_LAYOUT = [
  ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
  ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
  ['Shift', 'ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ', '⌫']
];

// QWERTY to Hangul mapping for virtual keyboard
const VIRTUAL_KEY_MAP = {
  'ㅂ': 'q', 'ㅈ': 'w', 'ㄷ': 'e', 'ㄱ': 'r', 'ㅅ': 't',
  'ㅛ': 'y', 'ㅕ': 'u', 'ㅑ': 'i', 'ㅐ': 'o', 'ㅔ': 'p',
  'ㅁ': 'a', 'ㄴ': 's', 'ㅇ': 'd', 'ㄹ': 'f', 'ㅎ': 'g',
  'ㅗ': 'h', 'ㅓ': 'j', 'ㅏ': 'k', 'ㅣ': 'l',
  'ㅋ': 'z', 'ㅌ': 'x', 'ㅊ': 'c', 'ㅍ': 'v',
  'ㅠ': 'b', 'ㅜ': 'n', 'ㅡ': 'm'
};

const KoreanInput = ({ value, onChange, placeholder, showKeyboard = true, ...props }) => {
  // Remove showKeyboard from props that will be spread to any DOM elements
  const { showKeyboard: _, ...restProps } = props;
  
  const [text, setText] = useState(value || '');
  const [cursor, setCursor] = useState(0);
  const [isShiftPressed, setIsShiftPressed] = useState(false);
  const inputRef = useRef();
  const hiddenInputRef = useRef();

  // Helper function to update text and notify parent
  const updateText = (newText, newCursor) => {
    setText(newText);
    setCursor(newCursor);
    onChange?.(newText);
  };

  // Handle input event from hidden input
  const handleHiddenInput = (e) => {
    const input = e.target.value;
    const selectionStart = e.target.selectionStart;
    updateText(input, selectionStart);
  };

  // Handle physical keyboard input
  const handleKeyDown = (e) => {
    const { key } = e;

    if (key === 'Shift') {
      setIsShiftPressed(true);
      return;
    }

    // Focus hidden input for IME composition
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === 'Shift') {
      setIsShiftPressed(false);
    }
  };

  // Handle virtual keyboard input
  const handleVirtualKeyPress = (key) => {
    if (key === '⌫') {
      if (cursor === 0) return;
      const before = text.slice(0, cursor);
      const after = text.slice(cursor);
      const newText = before.slice(0, -1) + after;
      updateText(newText, cursor - 1);
      return;
    }

    if (key === 'Shift') {
      setIsShiftPressed(!isShiftPressed);
      return;
    }

    // Focus hidden input for IME composition
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  return (
    <Box>
      <Input
        ref={inputRef}
        value={text}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        placeholder={placeholder}
        {...restProps}
      />
      
      {/* Hidden input for IME composition */}
      <input
        ref={hiddenInputRef}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: 0,
          height: 0,
          padding: 0,
          border: 'none',
          margin: 0
        }}
        value={text}
        onChange={handleHiddenInput}
      />
      
      {showKeyboard && (
        <Box mt={2} p={2} borderWidth={1} borderRadius="md">
          {KEYBOARD_LAYOUT.map((row, rowIndex) => (
            <Flex key={rowIndex} gap={1} mb={1}>
              {row.map((key) => (
                <Button
                  key={key}
                  size="sm"
                  flex={1}
                  onClick={() => handleVirtualKeyPress(key)}
                  variant={key === 'Shift' && isShiftPressed ? 'solid' : 'outline'}
                >
                  <Text fontSize="sm">{key}</Text>
                </Button>
              ))}
            </Flex>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default KoreanInput; 