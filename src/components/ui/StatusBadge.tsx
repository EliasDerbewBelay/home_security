import React from 'react';
import { View, Text } from 'react-native';

interface StatusBadgeProps {
  label: string;
  status: 'active' | 'inactive' | 'warning' | 'error';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, status, className = '' }) => {
  const statusStyles = {
    active: 'bg-secondary/20 text-secondary border-secondary/30',
    inactive: 'bg-white/5 text-white/50 border-white/10',
    warning: 'bg-accent/20 text-accent border-accent/30',
    error: 'bg-danger/20 text-danger border-danger/30',
  };

  return (
    <View className={`px-3 py-1 rounded-full border ${statusStyles[status]} ${className}`}>
      <Text className={`text-xs font-bold ${statusStyles[status].split(' ')[1]}`}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
};
