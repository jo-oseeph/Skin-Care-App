import { Redirect } from 'expo-router';

export default function Index() {
  // For now everyone goes straight to the home tab
  // Later: if logged in → home, if not → login
  return <Redirect href="/(tabs)/home" />;
}