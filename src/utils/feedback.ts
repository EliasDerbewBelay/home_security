import { Alert, Platform } from 'react-native';

export const showComingSoon = (featureName: string) => {
  if (Platform.OS === 'web') {
    alert(`${featureName} feature is coming soon to the encrypted network.`);
  } else {
    Alert.alert(
      'System Notice',
      `${featureName} integration is currently under development. Please check back after the next secure patch.`,
      [{ text: 'Acknowledged', style: 'default' }]
    );
  }
};
