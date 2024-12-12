'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusCircle, Trash2, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Promotion {
  index: string;
  price: string;
}

interface Product {
  name: string
  oldPrice: string
  newPrice: string
  quantity: string
  promotions: Promotion[]
}

export default function ProductListGenerator() {
  const [products, setProducts] = useState<Product[]>([{ name: '', oldPrice: '', newPrice: '', quantity: '1', promotions: [] }])
  const [copyButtonText, setCopyButtonText] = useState('Copiar Texto')

  const addProduct = () => {
    setProducts([...products, { name: '', oldPrice: '', newPrice: '', quantity: '1', promotions: [] }])
  }

  const removeProduct = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index)
    setProducts(updatedProducts.length ? updatedProducts : [{ name: '', oldPrice: '', newPrice: '', quantity: '1', promotions: [] }])
  }

  const updateProduct = (index: number, field: keyof Product, value: string | Promotion[]) => {
    const updatedProducts = [...products]
    updatedProducts[index] = { ...updatedProducts[index], [field]: value }
    setProducts(updatedProducts)

    // Check if this is the last product and all fields are filled
    if (index === products.length - 1 && 
        updatedProducts[index].name && 
        updatedProducts[index].newPrice) {
      // Add a new empty product
      setProducts([...updatedProducts, { name: '', oldPrice: '', newPrice: '', quantity: '1', promotions: [] }])
    }
  }

  const updatePromotion = (productIndex: number, promotionIndex: number, field: keyof Promotion, value: string) => {
    const updatedProducts = [...products]
    const updatedPromotions = [...updatedProducts[productIndex].promotions]
    updatedPromotions[promotionIndex] = { ...updatedPromotions[promotionIndex], [field]: value }
    updatedProducts[productIndex] = { ...updatedProducts[productIndex], promotions: updatedPromotions }
    setProducts(updatedProducts)
  }

  const addPromotion = (productIndex: number) => {
    const updatedProducts = [...products]
    updatedProducts[productIndex].promotions.push({ index: '', price: '' })
    setProducts(updatedProducts)
  }

  const removePromotion = (productIndex: number, promotionIndex: number) => {
    const updatedProducts = [...products]
    updatedProducts[productIndex].promotions.splice(promotionIndex, 1)
    setProducts(updatedProducts)
  }

  // Remove empty products when focus is lost
  const handleBlur = () => {
    const filledProducts = products.filter(product => 
      product.name.trim() !== '' || product.oldPrice.trim() !== '' || product.newPrice.trim() !== ''
    )
    if (filledProducts.length < products.length) {
      setProducts([...filledProducts, { name: '', oldPrice: '', newPrice: '', quantity: '1', promotions: [] }])
    }
  }

  const formatCurrency = (value: string | number) => {
    const number = typeof value === 'string' ? parseFloat(value.replace(',', '.')) : value
    return isNaN(number) ? '0,00' : number.toFixed(2).replace('.', ',')
  }

  const generateText = () => {
    let text = 'Lista de Produtos:\n'
    let total = 0

    products.forEach(product => {
      if (product.name) {
        const newPrice = parseFloat(product.newPrice.replace(',', '.'))
        const quantity = parseInt(product.quantity) || 1
        let subtotal = 0

        let promotionText = ''
        if (product.promotions.length > 0) {
          promotionText = ' (Promoção:'
          let remainingQuantity = quantity

          // Sort promotions by index in descending order
          const sortedPromotions = [...product.promotions].sort((a, b) => parseInt(b.index) - parseInt(a.index))

          sortedPromotions.forEach(promo => {
            const index = parseInt(promo.index)
            const promoPrice = parseFloat(promo.price.replace(',', '.'))
            if (!isNaN(index) && !isNaN(promoPrice) && index > 0 && index <= remainingQuantity) {
              const promoSets = Math.floor(remainingQuantity / index)
              const promoItems = promoSets * index
              const regularItems = index - 1
              subtotal += (regularItems * newPrice + promoPrice) * promoSets
              remainingQuantity -= promoItems
              promotionText += ` a cada ${index}, o ${index}º sai por R$ ${formatCurrency(promoPrice)};`
            }
          })

          // Calculate remaining items at regular price
          subtotal += remainingQuantity * newPrice

          promotionText = promotionText.slice(0, -1) + ')'
        } else {
          subtotal = quantity * newPrice
        }

        total += subtotal

        if (product.oldPrice) {
          text += `- ${product.name} (${quantity} un.)- de ~R$ ${formatCurrency(product.oldPrice)}~ por *R$ ${formatCurrency(product.newPrice)}*${promotionText}.\n`
        } else {
          text += `- ${product.name} (${quantity} un.)- *R$ ${formatCurrency(product.newPrice)}*${promotionText}.\n`
        }
      }
    })

    text += `\nValor total - *R$ ${formatCurrency(total)}*.`
    return text
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateText()).then(() => {
      setCopyButtonText('Copiado!')
      setTimeout(() => setCopyButtonText('Copiar Texto'), 3000)
    }).catch((err) => {
      console.error('Falha ao copiar texto: ', err)
      setCopyButtonText('Erro ao copiar')
      setTimeout(() => setCopyButtonText('Copiar Texto'), 3000)
    })
  }

  return (
    <div className="max-w-[1000px] mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Gerador de Lista de Produtos</h1>
      {products.map((product, index) => (
        <div key={index} className="flex flex-wrap gap-2 items-start border-b pb-4 mb-4">
          <div className="flex flex-wrap gap-2 items-center w-full">
            <Input
              placeholder="Nome do produto"
              value={product.name}
              onChange={(e) => updateProduct(index, 'name', e.target.value)}
              onBlur={handleBlur}
              className="flex-grow min-w-[200px]"
            />
            <Input
              placeholder="De valor"
              value={product.oldPrice}
              onChange={(e) => updateProduct(index, 'oldPrice', e.target.value)}
              onBlur={handleBlur}
              className="w-24"
            />
            <Input
              placeholder="Por valor"
              value={product.newPrice}
              onChange={(e) => updateProduct(index, 'newPrice', e.target.value)}
              onBlur={handleBlur}
              className="w-24"
            />
            <Input
              placeholder="Qtd."
              value={product.quantity}
              onChange={(e) => updateProduct(index, 'quantity', e.target.value)}
              onBlur={handleBlur}
              className="w-16"
              type="number"
              min="1"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-[180px]">
                  Promoções <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[300px] p-4">
                {product.promotions.map((promo, promoIndex) => (
                  <div key={promoIndex} className="flex gap-2 mb-2">
                    <Input
                      placeholder="Índice"
                      value={promo.index}
                      onChange={(e) => updatePromotion(index, promoIndex, 'index', e.target.value)}
                      className="w-20"
                      type="number"
                      min="2"
                    />
                    <Input
                      placeholder="Valor"
                      value={promo.price}
                      onChange={(e) => updatePromotion(index, promoIndex, 'price', e.target.value)}
                      className="flex-grow"
                    />
                    <Button
                      onClick={() => removePromotion(index, promoIndex)}
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button onClick={() => addPromotion(index)} className="w-full mt-2">
                  Adicionar Promoção
                </Button>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              onClick={() => removeProduct(index)}
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              aria-label={`Remover produto ${product.name || index + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button 
        onClick={addProduct} 
        variant="ghost" 
        size="sm" 
        className="mt-2 text-muted-foreground hover:text-primary"
      >
        <PlusCircle className="w-4 h-4 mr-2" />
        Adicionar Produto
      </Button>
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Texto Gerado:</h2>
        <pre className="whitespace-pre-wrap bg-gray-100 p-4 rounded-md">
          {generateText()}
        </pre>
        <Button onClick={copyToClipboard} className="mt-2">
          {copyButtonText}
        </Button>
      </div>
    </div>
  )
}
