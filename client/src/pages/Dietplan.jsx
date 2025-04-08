import React, { useState, useMemo, useCallback } from "react";
import styled from "styled-components";
import { CircularProgress } from "@mui/material";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import { useNutritionData } from "../api/useNutritionData";

// Styled Components
const Container = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  justify-content: center;
  padding: 22px 0px;
  overflow-y: scroll;
  background: ${({ theme }) => theme.bgLight};
`;

const Wrapper = styled.div`
  flex: 1;
  max-width: 1600px;
  display: flex;
  gap: 22px;
  padding: 0px 16px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const Left = styled.div`
  flex: 0.3;
  height: fit-content;
  padding: 24px;
  background: ${({ theme }) => theme.card};
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 20px;

  @media (max-width: 768px) {
    position: static;
    flex: 1;
  }
`;

const Right = styled.div`
  flex: 0.7;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Title = styled.div`
  font-weight: 600;
  font-size: 18px;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 20px;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SecTitle = styled.div`
  font-size: 20px;
  color: ${({ theme }) => theme.text_primary};
  font-weight: 600;
`;

const NutritionCard = styled.div`
  background: ${({ theme }) => theme.card};
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-4px);
  }
`;

const FoodName = styled.h3`
  font-size: 18px;
  color: ${({ theme }) => theme.primary};
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.text_secondary + 20};
`;

const NutritionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const NutritionItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px dashed ${({ theme }) => theme.text_secondary + 20};
`;

const NutritionLabel = styled.span`
  font-weight: 500;
  color: ${({ theme }) => theme.text_secondary};
`;

const NutritionValue = styled.span`
  font-weight: 600;
  color: ${({ theme }) => theme.text_primary};
`;

const SummaryCard = styled.div`
  background: ${({ theme }) => theme.primary + 15};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const SummaryTitle = styled.h3`
  color: ${({ theme }) => theme.primary};
  margin-top: 0;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryItem = styled.div`
  text-align: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
`;

const SummaryValue = styled.div`
  font-size: 20px;
  font-weight: 700;
  color: ${({ theme }) => theme.primary};
`;

const SummaryLabel = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.text_secondary};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const ErrorMessage = styled.div`
  padding: 16px;
  background: #ffebee;
  color: #c62828;
  border-radius: 8px;
  margin-top: 16px;
`;

// Nutrition field configuration
const NUTRITION_FIELDS = [
  { key: "serving_size_g", label: "Serving Size", unit: "g" },
  { key: "calories", label: "Calories", unit: "kcal" },
  { key: "fat_total_g", label: "Total Fat", unit: "g" },
  { key: "fat_saturated_g", label: "Saturated Fat", unit: "g" },
  { key: "protein_g", label: "Protein", unit: "g" },
  { key: "sodium_mg", label: "Sodium", unit: "mg" },
  { key: "potassium_mg", label: "Potassium", unit: "mg" },
  { key: "carbohydrates_total_g", label: "Total Carbs", unit: "g" },
  { key: "fiber_g", label: "Fiber", unit: "g" },
  { key: "sugar_g", label: "Sugar", unit: "g" },
];

const Dietplan = () => {
  const [foodQuery, setFoodQuery] = useState("");
  const {
    nutritionData,
    isLoading,
    error,
    query: currentQuery,
    fetchNutritionData,
    setQuery,
  } = useNutritionData("1 banana");

  const handleSearch = useCallback(() => {
    if (foodQuery.trim()) {
      setQuery(foodQuery);
      fetchNutritionData(foodQuery);
    }
  }, [foodQuery, fetchNutritionData, setQuery]);

  const isPremiumValue = useCallback(
    (value) => typeof value === "string" && value.includes("premium subscribers"),
    []
  );

  const calculateTotal = useCallback(
    (field) => {
      if (!nutritionData) return 0;
      return nutritionData.reduce((sum, item) => {
        const value = item[field];
        return typeof value === "number" ? sum + value : sum;
      }, 0);
    },
    [nutritionData]
  );

  const getAvailableNutritionItems = useCallback(
    (item) => {
      if (!item) return [];
      return NUTRITION_FIELDS.filter(({ key }) => {
        const value = item[key];
        return typeof value === "number" || (typeof value === "string" && !isPremiumValue(value));
      }).map(({ key, label, unit }) => ({
        key,
        label,
        value: item[key],
        unit,
      }));
    },
    [isPremiumValue]
  );

  const summaryItems = useMemo(() => {
    if (!nutritionData) return [];
    return [
      { key: "items", label: "Items", value: nutritionData.length },
      { key: "calories", label: "Calories", value: calculateTotal("calories"), unit: "kcal" },
      { key: "fat_total_g", label: "Total Fat", value: calculateTotal("fat_total_g"), unit: "g" },
      { key: "carbs", label: "Carbs", value: calculateTotal("carbohydrates_total_g"), unit: "g" },
    ].filter((item) => item.value > 0);
  }, [nutritionData, calculateTotal]);

  const nutritionCards = useMemo(() => {
    if (!nutritionData) return null;
    return nutritionData
      .map((item, index) => {
        const availableItems = getAvailableNutritionItems(item);
        if (availableItems.length === 0) return null;
        return (
          <NutritionCard key={index}>
            <FoodName>{item.name || "Unnamed Food Item"}</FoodName>
            <NutritionGrid>
              {availableItems.map(({ key, label, value, unit }) => (
                <NutritionItem key={key}>
                  <NutritionLabel>{label}</NutritionLabel>
                  <NutritionValue>
                    {value}
                    {unit ? ` ${unit}` : ""}
                  </NutritionValue>
                </NutritionItem>
              ))}
            </NutritionGrid>
          </NutritionCard>
        );
      })
      .filter(Boolean);
  }, [nutritionData, getAvailableNutritionItems]);

  const renderContent = useMemo(() => {
    if (isLoading) {
      return (
        <LoadingContainer>
          <CircularProgress />
        </LoadingContainer>
      );
    }
    if (nutritionData) {
      return (
        <>
          <SummaryCard>
            <SummaryTitle>Nutrition Summary for: {currentQuery}</SummaryTitle>
            <SummaryGrid>
              {summaryItems.map((item, index) => (
                <SummaryItem key={index}>
                  <SummaryValue>{item.value}</SummaryValue>
                  <SummaryLabel>
                    {item.label}
                    {item.unit ? ` (${item.unit})` : ""}
                  </SummaryLabel>
                </SummaryItem>
              ))}
            </SummaryGrid>
          </SummaryCard>
          {nutritionCards}
        </>
      );
    }
    return (
      <NutritionCard>
        <p>Search for food items to view their nutritional information.</p>
      </NutritionCard>
    );
  }, [isLoading, nutritionData, currentQuery, summaryItems, nutritionCards]);

  return (
    <Container>
      <Wrapper>
        <Left>
          <Title>Nutrition Finder</Title>
          <div>
            <TextInput
              label="Enter Food Name:"
              value={foodQuery}
              handelChange={(e) => setFoodQuery(e.target.value)}
              placeholder="e.g., 1lb brisket with fries"
              disabled={isLoading}
            />
            <br />
            <Button
              text="Search Nutrition"
              onClick={handleSearch}
              isLoading={isLoading}
              isDisabled={!foodQuery.trim()}
              style={{ marginTop: "16px", width: "100%" }}
            />
          </div>
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </Left>
        <Right>
          <Section>
            <SecTitle>Nutrition Details</SecTitle>
            {renderContent}
          </Section>
        </Right>
      </Wrapper>
    </Container>
  );
};

export default Dietplan;