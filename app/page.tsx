'use client'

import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
// import { toast } from "@/hooks/use-toast" // Removed import
import { PlusCircle, Trash2 } from 'lucide-react'

interface Product {
  name: string
  oldPrice: string
  newPrice: string
}

export default function ProductListGenerator() {
  const [products, setProducts] = useState<Product[]>([{ name: '', oldPrice: '', newPrice: '' }])
  const [copyButtonText, setCopyButtonText] = useState('Copiar Texto')

  const addProduct = () => {
    setProducts([...products, { name: '', oldPrice: '', newPrice: '' }])
  }

  const removeProduct = (index: number) => {
    const updatedProducts = products.filter((_, i) => i !== index)
    setProducts(updatedProducts.length ? updatedProducts : [{ name: '', oldPrice: '', newPrice: '' }])
  }

  const updateProduct = (index: number, field: keyof Product, value: string) => {
    const updatedProducts = [...products]
    updatedProducts[index][field] = value
    setProducts(updatedProducts)

    // Check if this is the last product and all fields are filled
    if (index === products.length - 1 && 
        updatedProducts[index].name && 
        updatedProducts[index].newPrice) {
      // Add a new empty product
      setProducts([...updatedProducts, { name: '', oldPrice: '', newPrice: '' }])
    }
  }

  // Remove empty products when focus is lost
  const handleBlur = () => {
    const filledProducts = products.filter(product => 
      product.name.trim() !== '' || product.oldPrice.trim() !== '' || product.newPrice.trim() !== ''
    )
    if (filledProducts.length < products.length) {
      setProducts([...filledProducts, { name: '', oldPrice: '', newPrice: '' }])
    }
  }

  const formatCurrency = (value: string) => {
    const number = parseFloat(value.replace(',', '.'))
    return isNaN(number) ? '0,00' : number.toFixed(2).replace('.', ',')
  }

  const generateText = () => {
    let text = 'Lista de Produtos:\n'
    let total = 0

    products.forEach(product => {
      if (product.name) {
        const newPrice = parseFloat(product.newPrice.replace(',', '.'))
        total += isNaN(newPrice) ? 0 : newPrice

        if (product.oldPrice) {
          text += `- ${product.name} - de ~R$ ${formatCurrency(product.oldPrice)}~ por *R$ ${formatCurrency(product.newPrice)}*.\n`
        } else {
          text += `- ${product.name} - por *R$ ${formatCurrency(product.newPrice)}*.\n`
        }
      }
    })

    text += `\nValor total - *R$ ${formatCurrency(total.toString())}*.`
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
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Gerador de Lista de Produtos</h1>
      {products.map((product, index) => (
        <div key={index} className="flex gap-2 items-center">
          <Input
            placeholder="Nome do produto"
            value={product.name}
            onChange={(e) => updateProduct(index, 'name', e.target.value)}
            onBlur={handleBlur}
            className="flex-grow"
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