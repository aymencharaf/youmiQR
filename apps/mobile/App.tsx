import 'react-native-gesture-handler'
import { I18nManager } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StatusBar } from 'expo-status-bar'
import HomeScreen from './src/screens/HomeScreen'
import ProductScreen from './src/screens/ProductScreen'

// تفعيل الاتجاه من اليمين لليسار (RTL)
I18nManager.allowRTL(true)
I18nManager.forceRTL(true)

export type RootStackParamList = {
  Home: undefined
  Product: { slug: string; name: string }
}

const Stack = createNativeStackNavigator<RootStackParamList>()

const headerOptions = {
  headerStyle: { backgroundColor: '#0E7C66' },
  headerTintColor: '#fff',
  headerTitleAlign: 'center' as const,
}

const homeOptions = { title: 'يومي — السوق' }

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator screenOptions={headerOptions}>
        <Stack.Screen name="Home" component={HomeScreen} options={homeOptions} />
        <Stack.Screen
          name="Product"
          component={ProductScreen}
          options={({ route }) => ({ title: route.params.name })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
