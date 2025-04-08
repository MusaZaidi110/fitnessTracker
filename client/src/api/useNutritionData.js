import { useState, useEffect } from 'react';

export const useNutritionData = (initialQuery = 'banana') => {
  const [nutritionData, setNutritionData] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start in loading state
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(initialQuery);

  const fetchNutritionData = async (searchQuery) => {
    if (!searchQuery || typeof searchQuery !== 'string' || searchQuery.trim().length === 0) {
      setError('Please enter a valid food item');
      return;
    }

    setIsLoading(true);
    setError(null);
    setQuery(searchQuery);
    
    try {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      const response = await fetch(
        `https://api.api-ninjas.com/v1/nutrition?query=${encodedQuery}`,
        {
          headers: {
            'X-Api-Key': 'a4vvbiCuAI0zp9u82b1VVg==H1sGBTcBgKTByhWR',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format received from API');
      }

      setNutritionData(data);
    } catch (err) {
      console.error('Nutrition API error:', err);
      setError(err.message || 'Failed to fetch nutrition data');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data on initial load
  useEffect(() => {
    fetchNutritionData(initialQuery);
  }, []); // Empty dependency array means this runs once on mount

  return { 
    nutritionData, 
    isLoading, 
    error, 
    query,
    fetchNutritionData,
    setQuery 
  };
};