import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../../App'
import { api, formatDZD, type Product } from '../api'

type Props = NativeStackScreenProps<RootStackParamList, 'Product'>

export default function ProductScreen({ route }: Props) {
  const { slug } = route.params
  const [product, setProduct] = useState<(Product & { description?: string }) | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api<Product>(`/products/${slug}`)
      .then(setProduct)
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0E7C66" />
      </View>
    )
  }
  if (!product) {
    return (
      <View style={styles.center}>
        <Text>تعذّر تحميل المنتج.</Text>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source= uri: product.images?.[0]?.url || 'https://via.placeholder.com/400' 
        style={styles.image}
      />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.vendor}>{product.vendor?.storeName}</Text>
      <Text style={styles.price}>{formatDZD(product.price)}</Text>
      {product.description ? <Text style={styles.desc}>{product.description}</Text> : null}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16 },
  image: { width: '100%', height: 260, borderRadius: 12, backgroundColor: '#eee' },
  name: { fontSize: 20, fontWeight: '700', marginTop: 12, textAlign: 'right' },
  vendor: { fontSize: 14, color: '#888', textAlign: 'right', marginTop: 4 },
  price: { fontSize: 22, fontWeight: '800', color: '#0E7C66', marginTop: 8, textAlign: 'right' },
  desc: { fontSize: 15, lineHeight: 24, color: '#333', marginTop: 12, textAlign: 'right' },
})
