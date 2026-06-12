import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../App'
import { api, formatDZD, type Product } from '../api'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

export default function HomeScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<{ items: Product[] }>('/products')
      .then((d) => setProducts((d as any).items || (d as any) || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0E7C66" />
      </View>
    )
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('Product', { slug: item.slug, name: item.name })}
        >
          <Image
            source= uri: item.images?.[0]?.url || 'https://via.placeholder.com/200' 
            style={styles.image}
          />
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.vendor}>{item.vendor?.storeName}</Text>
          <Text style={styles.price}>{formatDZD(item.price)}</Text>
        </TouchableOpacity>
      )}
      ListEmptyComponent={<Text style={styles.empty}>لا توجد منتجات.</Text>}
    />
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list: { padding: 8 },
  card: { flex: 1, margin: 6, backgroundColor: '#fff', borderRadius: 12, padding: 8 },
  image: { width: '100%', height: 130, borderRadius: 8, backgroundColor: '#eee' },
  name: { fontSize: 14, fontWeight: '600', marginTop: 6, textAlign: 'right' },
  vendor: { fontSize: 12, color: '#888', textAlign: 'right' },
  price: { fontSize: 15, fontWeight: '700', color: '#0E7C66', marginTop: 4, textAlign: 'right' },
  empty: { textAlign: 'center', marginTop: 40, color: '#888' },
})
