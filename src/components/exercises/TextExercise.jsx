import React, { useState } from 'react';
import { Box, Text, Button, VStack, HStack, useToast } from '@chakra-ui/react';
import KoreanInput from '../KoreanInput';

const TextExercise = ({ exercise, onComplete }) => {
  const [answer, setAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const toast = useToast();

  const handleSubmit = () => {
    const isCorrect = answer.trim() === exercise.correct_answer.trim();
    
    if (isCorrect) {
      toast({
        title: "Correct!",
        description: exercise.explanation,
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      onComplete(true);
    } else {
      toast({
        title: "Incorrect",
        description: "Try again!",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
    
    setIsSubmitted(true);
  };

  const handleNext = () => {
    setAnswer('');
    setIsSubmitted(false);
    onComplete(false);
  };

  return (
    <VStack spacing={6} align="stretch" w="full">
      <Text fontSize="xl" fontWeight="bold">
        {exercise.prompt}
      </Text>

      <Box>
        <KoreanInput
          value={answer}
          onChange={setAnswer}
          placeholder="Type your answer in Korean..."
          isDisabled={isSubmitted}
          size="lg"
        />
      </Box>

      <HStack spacing={4}>
        <Button
          colorScheme="blue"
          onClick={handleSubmit}
          isDisabled={!answer.trim() || isSubmitted}
        >
          Submit
        </Button>
        
        {isSubmitted && (
          <Button onClick={handleNext}>
            Next Exercise
          </Button>
        )}
      </HStack>
    </VStack>
  );
};

export default TextExercise; 