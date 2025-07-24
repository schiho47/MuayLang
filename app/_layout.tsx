import { Stack, StackNavigationOptions } from 'expo-router'
// import { Colors } from '../constants/Colors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StatusBar } from 'expo-status-bar'
import { PaperProvider } from 'react-native-paper'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { UserProvider } from '../contexts/UserContext'

export default function RootLayout() {
  // const colorScheme = useColorScheme()
  // const theme = Colors[colorScheme] ?? Colors.light
  const queryClient = new QueryClient()
  return (
    <PaperProvider>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <SafeAreaProvider>
            <StatusBar value="auto" />
            <Stack
              screenOptions={
                {
                  // headerStyle: { backgroundColor: theme.navBackground },
                  // headerTintColor: theme.title,
                } as StackNavigationOptions
              }
            >
              {/* Groups */}
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(dashboard)" options={{ headerShown: false }} />
              <Stack.Screen name="vocabulary/add" options={{ headerShown: false }} />
              <Stack.Screen name="vocabulary/edit/[id]" options={{ headerShown: false }} />
              Individual Screens
              <Stack.Screen name="index" options={{ title: 'Home', headerShown: false }} />
            </Stack>
          </SafeAreaProvider>
        </UserProvider>
      </QueryClientProvider>
    </PaperProvider>
  )
}
