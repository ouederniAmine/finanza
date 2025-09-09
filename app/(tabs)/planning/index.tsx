import { Redirect } from 'expo-router';
import React from 'react';

export default function PlanningIndex() {
  // Redirect to budgets as the default planning screen
  return <Redirect href="/planning/budgets" />;
}
