// src/screens/ProfileScreen/LifeDirectionSection.js
import React, { forwardRef } from 'react';
import { View } from 'react-native';
import LifeDirectionCard from '../../components/LifeDirectionCard';

const LifeDirectionSection = forwardRef(({ lifeDirection, onSave, navigation }, ref) => {
  return (
    <LifeDirectionCard 
      lifeDirection={lifeDirection}
      onSave={onSave}
      navigation={navigation}
      ref={ref}
    />
  );
});

export default LifeDirectionSection;