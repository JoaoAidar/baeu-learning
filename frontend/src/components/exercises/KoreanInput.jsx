import React, { useState, useRef, useEffect } from 'react';
import { Box, Input, Text, SimpleGrid, Flex, Button } from '@chakra-ui/react';

// Visual keyboard layout for reference
const KEYBOARD_LAYOUT = [
  ['ㅂ', 'ㅈ', 'ㄷ', 'ㄱ', 'ㅅ', 'ㅛ', 'ㅕ', 'ㅑ', 'ㅐ', 'ㅔ'],
  ['ㅁ', 'ㄴ', 'ㅇ', 'ㄹ', 'ㅎ', 'ㅗ', 'ㅓ', 'ㅏ', 'ㅣ'],
  ['ㅋ', 'ㅌ', 'ㅊ', 'ㅍ', 'ㅠ', 'ㅜ', 'ㅡ']
];

const KoreanInput = ({ value, onChange, placeholder, showKeyboard = true, ...props }) => {
  // Extract only the props we want to pass to the Input component
  const { onFocus, onBlur, disabled, readOnly, className, style, name, id, tabIndex } = props;
  const inputProps = { onFocus, onBlur, disabled, readOnly, className, style, name, id, tabIndex };
  
  const [text, setText] = useState(value || '');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef();
  const hiddenInputRef = useRef();

  // Update internal state when value prop changes
  useEffect(() => {
    setText(value || '');
  }, [value]);

  const handleInputChange = (e) => {
    const newText = e.target.value;
    const newCursor = e.target.selectionStart;
    setText(newText);
    setCursor(newCursor);
    onChange?.(newText);
  };

  return (
    <Box>
      <Input
        ref={inputRef}
        value={text}
        onChange={handleInputChange}
        placeholder={placeholder}
        {...inputProps}
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
        onChange={handleInputChange}
      />
      
      {showKeyboard && (
        <Box mt={2} p={2} borderWidth={1} borderRadius="md" bg="whiteAlpha.100">
          <Text fontSize="sm" mb={2} color="gray.500" fontStyle="italic">
            For reference in western keyboards - Shows Korean character positions on QWERTY layout
          </Text>
          {KEYBOARD_LAYOUT.map((row, rowIndex) => (
            <Flex key={rowIndex} gap={1} mb={1}>
              {row.map((key) => (
                <Box
                  key={key}
                  p={2}
                  borderWidth={1}
                  borderRadius="md"
                  bg="whiteAlpha.50"
                  textAlign="center"
                  flex={1}
                  fontSize="sm"
                  color="inherit"
                  userSelect="none"
                  _dark={{
                    borderColor: 'whiteAlpha.300'
                  }}
                >
                  {key}
                </Box>
              ))}
            </Flex>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default KoreanInput; 