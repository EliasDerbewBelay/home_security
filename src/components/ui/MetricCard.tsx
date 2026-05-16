import React from 'react';
import { View, Text } from 'react-native';
import { GlassCard } from './GlassCard';

interface MetricCardProps {
  label: string;
  value: string | number;
  isGreen?: boolean;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
  label, 
  value, 
  isGreen = false,
  className = '' 
}) => {
  return (
    <GlassCard className={`flex-1 items-center justify-center p-3 ${className}`}>
      <Text className="text-white/40 text-[10px] font-bold tracking-widest mb-1">
        {label.toUpperCase()}
      </Text>
      <Text className={`text-xl font-bold ${isGreen ? 'text-secondary' : 'text-white'}`}>
        {value}
      </Text>
    </GlassCard>
  );
};
