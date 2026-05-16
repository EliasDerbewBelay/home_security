import React from 'react';
import { View, ViewProps } from 'react-native';
// No need for styled() in NativeWind v4, View is automatically interoped

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  neonColor?: 'blue' | 'red' | 'green' | 'none';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  neonColor = 'none',
  style,
  ...props 
}) => {
  const neonClasses = {
    blue: 'neon-shadow-blue border-primary/30',
    red: 'neon-shadow-red border-danger/30',
    green: 'border-secondary/30',
    none: 'border-white/10',
  };

  return (
    <View 
      className={`glass-card p-4 rounded-2xl border ${neonClasses[neonColor]} ${className}`}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
};
