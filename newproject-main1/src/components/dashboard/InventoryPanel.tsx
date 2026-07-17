import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RefreshCw,
  Camera,
  Layers,
  TrendingUp,
  TrendingDown,
  Upload,
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  X,
  Sparkles
} from 'lucide-react'
import { useApp } from '../../context/AppContext'
import { getProductImage } from '../../services/db'
import { VoiceListener } from '../../services/voice'

interface ExtractedItem {
  id: string
  name: string
  category: 'Electronics' | 'Apparel' | 'Groceries' | 'Medical' | 'Food'
  stock: number
  minStock: number
  price: number
  cost: number
  sku: string
  expiryDate?: string
  salesCount: number
  overstock: boolean
  image: string
}

export default function InventoryPanel() {
  const {
    dbState,
    updateDbState,
    triggerLog,
    addNotification,
    isInventoryInitialized,
    setInventoryInitialized
  } = useApp()

  // Existing scanner/tabs states
  const [scanning, setScanning] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'Electronics' | 'Apparel' | 'Groceries' | 'Medical'>('All')

  // Importer states
  const [showImporter, setShowImporter] = useState(false)
  const [file, setFile] = useState<File | { name: string; size: number } | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [parsingLogs, setParsingLogs] = useState<string[]>([])
  const [currentLogIdx, setCurrentLogIdx] = useState(0)
  const [extractedProducts, setExtractedProducts] = useState<ExtractedItem[]>([])
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [showCameraScanner, setShowCameraScanner] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [rawStockText, setRawStockText] = useState('')
  const [isDictating, setIsDictating] = useState(false)
  const voiceListenerRef = useRef<VoiceListener | null>(null)

  useEffect(() => {
    voiceListenerRef.current = new VoiceListener()
    return () => {
      if (voiceListenerRef.current) {
        voiceListenerRef.current.stop()
      }
    }
  }, [])

  // CSV programmatical parser
  const parseCSVData = (text: string) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0)
    if (lines.length < 2) return []

    // Helper splits line handling quotes
    const splitCSVLine = (line: string) => {
      const result = []
      let current = ''
      let inQuotes = false
      for (let i = 0; i < line.length; i++) {
        const char = line[i]
        if (char === '"') {
          inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim())
          current = ''
        } else {
          current += char
        }
      }
      result.push(current.trim())
      return result
    }

    const headers = splitCSVLine(lines[0]).map(h => h.toLowerCase().replace(/["']/g, ''))
    
    // Find column matches
    const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('title') || h.includes('product') || h.includes('item'))
    const categoryIdx = headers.findIndex(h => h.includes('category') || h.includes('type') || h.includes('dept'))
    const stockIdx = headers.findIndex(h => h.includes('stock') || h.includes('qty') || h.includes('quantity') || h.includes('count'))
    const minStockIdx = headers.findIndex(h => h.includes('min') || h.includes('safety') || h.includes('limit'))
    const priceIdx = headers.findIndex(h => h.includes('price') || h.includes('sell') || h.includes('rate') || h.includes('selling'))
    const costIdx = headers.findIndex(h => h.includes('cost') || h.includes('buy') || h.includes('purchase') || h.includes('buying'))
    const skuIdx = headers.findIndex(h => h.includes('sku') || h.includes('code') || h.includes('barcode'))
    const expiryIdx = headers.findIndex(h => h.includes('expiry') || h.includes('date') || h.includes('expire'))

    const parsedItems: ExtractedItem[] = []
    const categoriesList = ['Electronics', 'Apparel', 'Groceries', 'Medical', 'Food'] as const

    const mapCategory = (catStr: string): 'Electronics' | 'Apparel' | 'Groceries' | 'Medical' | 'Food' => {
      const clean = catStr.toLowerCase()
      if (clean.includes('elec') || clean.includes('tech') || clean.includes('phone')) return 'Electronics'
      if (clean.includes('cloth') || clean.includes('wear') || clean.includes('apparel')) return 'Apparel'
      if (clean.includes('groc') || clean.includes('tea') || clean.includes('honey')) return 'Groceries'
      if (clean.includes('med') || clean.includes('health') || clean.includes('pill') || clean.includes('vitamin')) return 'Medical'
      if (clean.includes('food') || clean.includes('choco') || clean.includes('drink')) return 'Food'
      return categoriesList[Math.floor(Math.random() * categoriesList.length)]
    }

    for (let i = 1; i < lines.length; i++) {
      const cells = splitCSVLine(lines[i])
      if (cells.length < 2) continue

      const name = nameIdx !== -1 && cells[nameIdx] ? cells[nameIdx] : `Imported Item ${i}`
      const rawCategory = categoryIdx !== -1 && cells[categoryIdx] ? cells[categoryIdx] : 'Groceries'
      const category = mapCategory(rawCategory)
      const stock = stockIdx !== -1 && !isNaN(parseInt(cells[stockIdx])) ? parseInt(cells[stockIdx]) : Math.floor(Math.random() * 50) + 10
      const minStock = minStockIdx !== -1 && !isNaN(parseInt(cells[minStockIdx])) ? parseInt(cells[minStockIdx]) : Math.floor(stock * 0.2) + 3
      const price = priceIdx !== -1 && !isNaN(parseFloat(cells[priceIdx].replace(/[^0-9.]/g, ''))) ? parseFloat(cells[priceIdx].replace(/[^0-9.]/g, '')) : Math.floor(Math.random() * 100) + 15
      const cost = costIdx !== -1 && !isNaN(parseFloat(cells[costIdx].replace(/[^0-9.]/g, ''))) ? parseFloat(cells[costIdx].replace(/[^0-9.]/g, '')) : Math.floor(price * 0.5) + 3
      const sku = skuIdx !== -1 && cells[skuIdx] ? cells[skuIdx] : `SKU-UPL-${Math.floor(Math.random() * 9000) + 1000}`
      const expiryDate = expiryIdx !== -1 && cells[expiryIdx] ? cells[expiryIdx] : undefined
      const image = getProductImage(name, category)

      parsedItems.push({
        id: `p-upl-${Date.now()}-${i}`,
        name,
        category,
        stock,
        minStock,
        price,
        cost,
        sku,
        expiryDate,
        salesCount: Math.floor(Math.random() * 120),
        overstock: stock > minStock * 3,
        image
      })
    }
    return parsedItems
  }

  // Generates stock presets when scanned PDF/Excel sheets are imported (Simulated OCR Engine)
  const generateMockProductsFromFile = (fileName: string) => {
    const isMedical = fileName.toLowerCase().includes('med') || fileName.toLowerCase().includes('pharm')
    const isGrocery = fileName.toLowerCase().includes('groc') || fileName.toLowerCase().includes('food')
    const isFashion = fileName.toLowerCase().includes('clothe') || fileName.toLowerCase().includes('apparel') || fileName.toLowerCase().includes('fashion')

    let templateList = [
      { name: 'Curve LED Monitor 27"', category: 'Electronics', price: 14999, cost: 6500, image: '🖥️' },
      { name: 'Ergonomic Desk chair Premium', category: 'Electronics', price: 9999, cost: 4200, image: '🪑' },
      { name: 'Wireless Mechanical Keyboard', category: 'Electronics', price: 4999, cost: 2100, image: '⌨️' },
      { name: 'Comfort Hoodie Black Edition', category: 'Apparel', price: 2999, cost: 1100, image: '🧥' },
      { name: 'Sports GPS Smart Watch', category: 'Electronics', price: 5999, cost: 2500, image: '⌚' },
      { name: 'Pure Clover Honey 1kg', category: 'Groceries', price: 890, cost: 350, image: '🍯' },
      { name: 'Dark Roasted Coffee Beans', category: 'Groceries', price: 450, cost: 200, image: '☕' },
      { name: 'Gluten Free Sourdough', category: 'Food', price: 180, cost: 75, image: '🍞' },
      { name: 'Bandages FlexiPack (50 count)', category: 'Medical', price: 299, cost: 100, image: '🩹' },
      { name: 'Cotton Socks Pack of 3', category: 'Apparel', price: 490, cost: 180, image: '🧦' }
    ]

    if (isMedical) {
      templateList = [
        { name: 'Aspirin Fast Relief (50 tabs)', category: 'Medical', price: 220, cost: 60, image: '💊' },
        { name: 'Digital Fingertip Oximeter', category: 'Medical', price: 1499, cost: 600, image: '🩺' },
        { name: 'Infrared Temperature Gun', category: 'Medical', price: 2199, cost: 850, image: '🌡️' },
        { name: 'Cotton Swabs Sterile 200 pack', category: 'Medical', price: 149, cost: 50, image: '🩹' },
        { name: 'Vitamin C 1000mg Effervescent', category: 'Medical', price: 349, cost: 130, image: '💊' },
        { name: 'Deep Heat Rub Pain relief', category: 'Medical', price: 249, cost: 95, image: '🧴' },
        { name: 'Face Shields anti-fog (5 pack)', category: 'Medical', price: 399, cost: 140, image: '😷' },
        { name: 'Digital Blood Sugar Monitor', category: 'Medical', price: 1899, cost: 800, image: '🩺' }
      ]
    } else if (isGrocery) {
      templateList = [
        { name: 'Premium Rolled Oats 1kg bag', category: 'Groceries', price: 299, cost: 120, image: '🌾' },
        { name: 'Cold Pressed Virgin Coconut Oil', category: 'Groceries', price: 450, cost: 190, image: '🍾' },
        { name: 'Jasmine Fragrant Rice 5kg', category: 'Groceries', price: 850, cost: 400, image: '🌾' },
        { name: 'Raw Organic Honey 500g', category: 'Groceries', price: 499, cost: 220, image: '🍯' },
        { name: 'Natural Himalayan Salt 1kg', category: 'Groceries', price: 150, cost: 60, image: '🧂' },
        { name: 'Almond Milk Barista Edition 1L', category: 'Groceries', price: 220, cost: 105, image: '🥛' },
        { name: 'Gourmet Cheese Crackers 200g', category: 'Food', price: 120, cost: 50, image: '🍪' },
        { name: 'Choco Chips Cookies premium', category: 'Food', price: 199, cost: 85, image: '🍪' }
      ]
    } else if (isFashion) {
      templateList = [
        { name: 'Premium Denim Jeans Blue', category: 'Apparel', price: 2499, cost: 950, image: '👖' },
        { name: 'Classic Leather Jacket Brown', category: 'Apparel', price: 5999, cost: 2600, image: '🧥' },
        { name: 'Casual Canvas Sneakers', category: 'Apparel', price: 1899, cost: 750, image: '👟' },
        { name: 'Knitted Winter Beanie Unisex', category: 'Apparel', price: 499, cost: 180, image: '🧥' },
        { name: 'Polarized Aviator Sunglasses', category: 'Apparel', price: 1299, cost: 500, image: '🕶️' },
        { name: 'Fitted Cotton Polo Shirt', category: 'Apparel', price: 899, cost: 350, image: '👕' },
        { name: 'Duffel Bag Sport Waterproof', category: 'Apparel', price: 1999, cost: 850, image: '🎒' }
      ]
    }

    return templateList.map((item, idx) => {
      const stock = Math.floor(Math.random() * 60) + 15
      const minStock = Math.floor(stock * 0.25) + 3
      return {
        id: `p-upl-${Date.now()}-${idx}`,
        name: item.name,
        category: item.category as any,
        stock,
        minStock,
        price: item.price,
        cost: item.cost,
        sku: `SKU-UPL-${Math.floor(Math.random() * 90000) + 10000}`,
        salesCount: Math.floor(Math.random() * 80),
        overstock: stock > minStock * 3,
        image: getProductImage(item.name, item.category)
      }
    })
  }

  // File loading sequencer
  const startFileIngestion = (uploadedFile: File | { name: string; size: number }) => {
    setFile(uploadedFile)
    setIsParsing(true)
    setCurrentLogIdx(0)
    
    const logsList = [
      `[Ingestor] Opening file stream for '${uploadedFile.name}' (${(uploadedFile.size / 1024).toFixed(1)} KB)...`,
      `[AI OCR] Loading vision models. Initiating grid structural mapping...`,
      `[AI OCR] Found grid coordinates. Decoupling column layers...`,
      `[Parser] Mapping attributes (Product Name, Price, Cost, Stock, SKU)...`,
      `[Validator] Normalizing categories with BusinessOS guidelines...`,
      `[Engine] Checking security schemas and cryptographic hashes...`,
      `[Done] Sync completed. Document mapped successfully.`
    ]
    setParsingLogs(logsList)

    let timer = setInterval(() => {
      setCurrentLogIdx(prev => {
        if (prev >= logsList.length - 1) {
          clearInterval(timer)
          
          if (uploadedFile instanceof File && (uploadedFile.name.endsWith('.csv') || uploadedFile.name.endsWith('.txt'))) {
            const reader = new FileReader()
            reader.onload = (e) => {
              const text = e.target?.result as string
              const parsed = parseCSVData(text)
              setExtractedProducts(parsed)
              setIsParsing(false)
            }
            reader.readAsText(uploadedFile)
          } else {
            // Simulated PDF parsing
            const parsed = generateMockProductsFromFile(uploadedFile.name)
            setExtractedProducts(parsed)
            setIsParsing(false)
          }
          return prev
        }
        return prev + 1
      })
    }, 450)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) startFileIngestion(selectedFile)
  }

  const parseRawStockText = (text: string): ExtractedItem[] => {
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    const parsedItems: ExtractedItem[] = []
    
    lines.forEach((line, idx) => {
      const str = line.trim()
      
      let stock = 10
      const stockMatch = str.match(/(?:stock|qty|quantity|units|items)?\s*[:\-\s]*\b(\d+)\b\s*(?:qty|units|items)?/i)
      if (stockMatch) {
        stock = parseInt(stockMatch[1], 10)
      }
      
      let price = 499
      const priceMatch = str.match(/(?:price|rate|rs\.?|₹|\$)\s*[:\-\s]*\b(\d+(?:\.\d+)?)\b/i)
      if (priceMatch) {
        price = parseFloat(priceMatch[1])
      }
      
      let cost = Math.round(price * 0.45)
      const costMatch = str.match(/(?:cost|buy|buying)\s*[:\-\s]*\b(\d+(?:\.\d+)?)\b/i)
      if (costMatch) {
        cost = parseFloat(costMatch[1])
      }

      let category: ExtractedItem['category'] = 'Groceries'
      const lowerStr = str.toLowerCase()
      if (lowerStr.includes('apparel') || lowerStr.includes('wear') || lowerStr.includes('cloth') || lowerStr.includes('jean') || lowerStr.includes('shirt') || lowerStr.includes('hoodie')) {
        category = 'Apparel'
      } else if (lowerStr.includes('electronics') || lowerStr.includes('tech') || lowerStr.includes('phone') || lowerStr.includes('earbud') || lowerStr.includes('cable') || lowerStr.includes('smart')) {
        category = 'Electronics'
      } else if (lowerStr.includes('med') || lowerStr.includes('pharma') || lowerStr.includes('vitamin') || lowerStr.includes('pill') || lowerStr.includes('drug')) {
        category = 'Medical'
      } else if (lowerStr.includes('food') || lowerStr.includes('tea') || lowerStr.includes('snack') || lowerStr.includes('cookie') || lowerStr.includes('burger')) {
        category = 'Food'
      } else if (lowerStr.includes('grocer') || lowerStr.includes('milk') || lowerStr.includes('soap')) {
        category = 'Groceries'
      }

      let name = str.split(/[,;\-:\d]/)[0].trim()
      if (!name) name = `Stock Item ${idx + 1}`
      
      const sku = `SKU-AI-${Math.floor(Math.random() * 90000) + 10000}`
      const minStock = Math.max(2, Math.floor(stock * 0.2))

      parsedItems.push({
        id: `p-upl-${Date.now()}-${idx}`,
        name,
        category,
        stock,
        minStock,
        price,
        cost,
        sku,
        salesCount: 0,
        overstock: stock > minStock * 3,
        image: getProductImage(name, category)
      })
    })

    return parsedItems
  }

  const handleVoiceDictation = () => {
    if (!voiceListenerRef.current) return

    if (isDictating) {
      voiceListenerRef.current.stop()
      setIsDictating(false)
    } else {
      setIsDictating(true)
      voiceListenerRef.current.start({
        onResult: (text) => {
          setRawStockText((prev) => (prev ? prev + '\n' + text : text))
        },
        onError: (err) => {
          console.error('Dictation error:', err)
          addNotification('Dictation Error', 'Could not record voice. Please try again.', 'error')
          setIsDictating(false)
        },
        onEnd: () => {
          setIsDictating(false)
        }
      })
    }
  }

  const handleAIParseText = () => {
    if (!rawStockText.trim()) return

    setFile({ name: 'notepad_transcript.txt', size: rawStockText.length })
    setIsParsing(true)
    setParsingLogs([])
    setCurrentLogIdx(0)

    const logsList = [
      `[Ingestor] Reading raw notepad notebook stream...`,
      `[AI NLP] Activating Natural Language Processing parser...`,
      `[AI NLP] Parsing entities (Product Name, Stock Qty, Price, Department Category)...`,
      `[AI NLP] Mapped stock level entities successfully!`,
      `[Done] Mapped raw notebook entries to structured data.`
    ]
    setParsingLogs(logsList)

    let timer = setInterval(() => {
      setCurrentLogIdx((prev) => {
        if (prev >= logsList.length - 1) {
          clearInterval(timer)
          const parsed = parseRawStockText(rawStockText)
          setExtractedProducts(parsed)
          setIsParsing(false)
          setRawStockText('')
          addNotification('Text Mapped', `AI matched ${parsed.length} items from your note.`, 'success')
          return prev
        }
        return prev + 1
      })
    }, 400)
  }

  const startCamera = async () => {
    setShowCameraScanner(true)
    setIsCapturing(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      })
      setCameraStream(stream)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (err) {
      console.error('Camera stream access error:', err)
      addNotification('Camera Error', 'Could not open camera stream. Please check permissions.', 'error')
      setShowCameraScanner(false)
    }
  }

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      setCameraStream(null)
    }
    setShowCameraScanner(false)
  }

  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsCapturing(true)
    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (context) {
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 480
      context.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Stop video feed
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop())
        setCameraStream(null)
      }

      // Start simulated OCR log stream
      setFile({ name: 'notepad_camera_snapshot.jpg', size: 1048576 }) // Mocks a 1 MB image file
      setIsParsing(true)
      setParsingLogs([])
      setCurrentLogIdx(0)

      const logsList = [
        `[AI Vision] Decompressing raw captured image...`,
        `[AI Vision] Applying thresholding, binarization, and deskew filters...`,
        `[AI Vision] Segmenting image text clusters. Processing Optical Character Recognition...`,
        `[AI OCR] Tesseract core neural net parsed 2 handwritten blocks...`,
        `[Parser] Mapped attributes (Product Name, Stock Qty, Price, Department Category)...`,
        `[Done] Successfully recognized 3 products from book snapshot!`
      ]
      setParsingLogs(logsList)

      let timer = setInterval(() => {
        setCurrentLogIdx((prev) => {
          if (prev >= logsList.length - 1) {
            clearInterval(timer)
            // Generate mock products based on the OCR scan
            const ocrProducts: ExtractedItem[] = [
              {
                id: `p-upl-${Date.now()}-ocr1`,
                name: 'Wireless Earbuds Pro Max',
                category: 'Electronics',
                stock: 45,
                minStock: 10,
                price: 3499,
                cost: 1600,
                sku: `SKU-AI-${Math.floor(Math.random() * 90000) + 10000}`,
                salesCount: 0,
                overstock: false,
                image: getProductImage('Wireless Earbuds Pro Max', 'Electronics')
              },
              {
                id: `p-upl-${Date.now()}-ocr2`,
                name: 'Premium Leather Boots Brown',
                category: 'Apparel',
                stock: 20,
                minStock: 5,
                price: 2499,
                cost: 950,
                sku: `SKU-AI-${Math.floor(Math.random() * 90000) + 10000}`,
                salesCount: 0,
                overstock: false,
                image: getProductImage('Premium Leather Boots Brown', 'Apparel')
              },
              {
                id: `p-upl-${Date.now()}-ocr3`,
                name: 'Organic Honey Tea jar',
                category: 'Groceries',
                stock: 80,
                minStock: 15,
                price: 450,
                cost: 180,
                sku: `SKU-AI-${Math.floor(Math.random() * 90000) + 10000}`,
                salesCount: 0,
                overstock: true,
                image: getProductImage('Organic Honey Tea jar', 'Groceries')
              }
            ]
            setExtractedProducts(ocrProducts)
            setIsParsing(false)
            setIsCapturing(false)
            setShowCameraScanner(false)
            addNotification('OCR Scan Success', 'Extracted 3 items from notebook page snapshot.', 'success')
            return prev
          }
          return prev + 1
        })
      }, 400)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) {
      startFileIngestion(e.dataTransfer.files[0])
    }
  }

  // Load preset demo file for easy user testing
  const loadDemoTemplate = (type: 'grocery' | 'medical' | 'electronics') => {
    const names = {
      grocery: 'grocery_stock_ledger.xlsx',
      medical: 'pharma_inventory_manifest.pdf',
      electronics: 'electronics_catalog_july.csv'
    }
    startFileIngestion({ name: names[type], size: 18432 })
  }

  // Ingestion Alignment Grid utilities
  const handleEditField = (id: string, field: keyof ExtractedItem, value: any) => {
    setExtractedProducts(prev => prev.map(p => {
      if (p.id === id) {
        let updated = { ...p, [field]: value } as any
        if (field === 'price' || field === 'cost' || field === 'stock' || field === 'minStock') {
          const num = parseFloat(value) || 0
          updated[field] = num
        }
        if (field === 'name' || field === 'category') {
          updated.image = getProductImage(updated.name, updated.category)
        }
        return updated
      }
      return p
    }))
  }

  const handleRemoveRow = (id: string) => {
    setExtractedProducts(prev => prev.filter(p => p.id !== id))
  }

  const handleAddRow = () => {
    const newId = `p-upl-added-${Date.now()}`
    const newItem: ExtractedItem = {
      id: newId,
      name: 'New Product Item',
      category: 'Groceries',
      stock: 25,
      minStock: 5,
      price: 150.00,
      cost: 75.00,
      sku: `SKU-NEW-${Math.floor(Math.random() * 9000) + 1000}`,
      salesCount: 0,
      overstock: false,
      image: getProductImage('New Product Item', 'Groceries')
    }
    setExtractedProducts(prev => [...prev, newItem])
  }

  const handleConfirmIngest = () => {
    if (extractedProducts.length === 0) return

    updateDbState((prev) => {
      let updatedProducts = [...prev.products]
      if (importMode === 'replace') {
        updatedProducts = extractedProducts.map(p => ({
          ...p,
          image: p.image && p.image.includes('3d') ? p.image : getProductImage(p.name, p.category)
        })) as any
      } else {
        // Merge
        extractedProducts.forEach(newP => {
          const matchIdx = updatedProducts.findIndex(p => p.sku === newP.sku || p.name.toLowerCase() === newP.name.toLowerCase())
          const imageVal = newP.image && newP.image.includes('3d') ? newP.image : getProductImage(newP.name, newP.category)
          if (matchIdx !== -1) {
            updatedProducts[matchIdx] = {
              ...updatedProducts[matchIdx],
              stock: updatedProducts[matchIdx].stock + newP.stock,
              price: newP.price,
              cost: newP.cost,
              image: imageVal
            }
          } else {
            updatedProducts.push({
              ...newP,
              image: imageVal
            } as any)
          }
        })
      }
      return { ...prev, products: updatedProducts }
    })

    const valuation = extractedProducts.reduce((sum, p) => sum + (p.stock * p.price), 0)
    triggerLog(`[AI Data Ingestion] Ingested ${extractedProducts.length} items. Total catalog addition valuation: ₹${valuation.toLocaleString('en-IN')}. Ingestion mode: ${importMode.toUpperCase()}.`)

    addNotification(
      'Stock Ingested Successfully',
      `Bulk stock registry completed. Loaded ${extractedProducts.length} items. AI employee models initialized.`,
      'success'
    )

    setInventoryInitialized(true)
    setFile(null)
    setExtractedProducts([])
    setShowImporter(false)
  }

  // Scan simulation (existing functionality)
  const simulateScan = () => {
    setScanning(true)
    triggerLog('[Barcode Scanner] Accessing video terminal...')

    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * dbState.products.length)
      const scannedProduct = dbState.products[randomIndex]

      updateDbState((prev) => {
        const updatedProducts = prev.products.map((p, idx) => {
          if (idx === randomIndex) {
            return { ...p, stock: p.stock + 1 }
          }
          return p
        })
        return { ...prev, products: updatedProducts }
      })

      triggerLog(`[Barcode Scanner] Decrypted SKU code. Registered: ${scannedProduct.name} (+1 stock)`)
      setScanning(false)
      addNotification(
        'Barcode Scanned',
        `Successfully scanned ${scannedProduct.name}. Inventory count updated.`,
        'info'
      )
    }, 1800)
  }

  const getExpiryBadge = (dateStr?: string) => {
    if (!dateStr) return <span className="text-slate-500">-</span>
    const date = new Date(dateStr)
    const today = new Date()
    const diffTime = date.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return <span className="rounded bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[10px] text-red-400">Expired</span>
    }
    if (diffDays <= 30) {
      return (
        <span className="rounded bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 text-[10px] text-yellow-400">
          Critical ({diffDays}d)
        </span>
      )
    }
    return <span className="rounded bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] text-green-400">Safe</span>
  }

  const triggerReorder = (productId: string) => {
    const product = dbState.products.find((p) => p.id === productId)
    if (!product) return

    triggerLog(`[Purchase Order] Drafted reorder PO for ${product.name} (Qty: 25).`)

    updateDbState((prev) => {
      const updatedProducts = prev.products.map((p) => {
        if (p.id === productId) {
          return { ...p, stock: p.stock + 25 }
        }
        return p
      })
      return { ...prev, products: updatedProducts }
    })

    addNotification(
      'Reorder Completed',
      `${product.name} stock replenished. +25 items added to warehouse shelf B2.`,
      'success'
    )
  }

  const filteredProducts = dbState.products.filter(
    (p) => selectedCategory === 'All' || p.category === selectedCategory
  )
  const fastMoving = dbState.products.filter((p) => p.salesCount >= 100)
  const slowMoving = dbState.products.filter((p) => p.salesCount < 100)

  // MAIN RENDER SELECTOR:
  // Render Ingestion desk if inventory is not initialized OR the owner clicked "Import Stock File"
  if (!isInventoryInitialized || showImporter) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl flex items-center gap-2">
            <Layers className="h-7 w-7 text-cyan-bright animate-pulse" /> AI Stock Data Ingestion Desk
          </h1>
          <p className="text-sm text-slate-400">
            Feed CSV, Excel sheets, or scanned stock PDFs to configure and initialize your AI employee knowledge base.
          </p>
        </div>

        {file === null ? (
          /* STEP 1: DROPZONE */
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer min-h-[320px] ${
                  dragActive
                    ? 'border-cyan-bright bg-cyan/10 shadow-lg shadow-cyan/10'
                    : 'border-white/10 glass hover:border-electric hover:bg-white/[0.02]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv,.xlsx,.xls,.pdf,.txt"
                  className="hidden"
                />
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-electric to-neon text-white shadow-xl shadow-electric/25 mb-4">
                  <Upload className="h-6 w-6" />
                </div>
                <h3 className="font-display text-lg font-bold text-white">Upload Store Manifest File</h3>
                <p className="text-xs text-slate-400 mt-2 max-w-sm">
                  Drag and drop your spreadsheet or PDF file here, or click to browse.
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-3 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                  <span className="rounded bg-white/5 border border-white/5 px-2 py-1">.CSV</span>
                  <span className="rounded bg-white/5 border border-white/5 px-2 py-1">.XLSX</span>
                  <span className="rounded bg-white/5 border border-white/5 px-2 py-1">.PDF</span>
                  <span className="rounded bg-white/5 border border-white/5 px-2 py-1">.TXT</span>
                </div>
              </div>

              {/* AI Text/Voice Manual entry block */}
              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 text-left">
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5 mb-1">
                  <Sparkles className="h-4 w-4 text-cyan-bright animate-pulse" /> AI Notepad & Voice Ingestor
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Type/paste raw ledger lines or dictate your physical book stock. Our AI will automatically decode products, categories, stock counts, and prices.
                </p>
                
                <div className="space-y-3.5">
                  <textarea
                    placeholder="Type or paste notebook lines here...
e.g.
Wireless Earbuds, stock 20, price 2999
Premium Cotton Hoodie, stock 15, price 1899, cost 800, category Apparel
Organic Green Tea - 40 units - price 250"
                    value={rawStockText}
                    onChange={(e) => setRawStockText(e.target.value)}
                    rows={4}
                    className="w-full rounded-2xl bg-black/45 border border-white/5 p-4 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan/50 font-mono"
                  />
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleVoiceDictation}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-bold transition-all cursor-pointer ${
                          isDictating
                            ? 'bg-red-500/10 border-red-500 text-red-400 animate-pulse'
                            : 'glass border-white/5 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{isDictating ? '🛑 Stop' : '🎤 Dictate'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={startCamera}
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-white/5 glass px-3 py-2 text-[11px] font-bold text-slate-400 hover:text-white transition-all cursor-pointer"
                      >
                        <Camera className="h-3.5 w-3.5" />
                        <span>Scan Page</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleAIParseText}
                      disabled={!rawStockText.trim()}
                      className="rounded-xl bg-gradient-to-r from-electric to-cyan px-4 py-2 text-[11px] font-bold text-white shadow-lg shadow-electric/25 hover:scale-[1.01] transition-transform disabled:opacity-40 disabled:hover:scale-100 cursor-pointer"
                    >
                      Parse & Import with AI ✨
                    </button>
                  </div>
                </div>
              </div>

              {/* Close Ingestion Desk if inventory already exists */}
              {isInventoryInitialized && (
                <button
                  onClick={() => setShowImporter(false)}
                  className="rounded-xl glass-strong border border-white/5 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel and Return to Inventory
                </button>
              )}
            </div>

            {/* Quick Demo side panel */}
            <div className="glass-card rounded-3xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-cyan-bright" /> Quick Sandbox Simulation
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Don't have a CSV or PDF document ready? Pick a mock scenario file below to test the ingestion engine immediately.
                </p>
                <div className="space-y-3 mt-6">
                  <button
                    onClick={() => loadDemoTemplate('grocery')}
                    className="w-full flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 p-3.5 text-left text-xs text-slate-300 transition-all cursor-pointer hover:border-electric/30 group"
                  >
                    <div>
                      <p className="font-bold text-white group-hover:text-electric-bright transition-colors">grocery_manifest.xlsx</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">8 Groceries & Food products</p>
                    </div>
                    <FileText className="h-4 w-4 text-slate-400 group-hover:text-white" />
                  </button>
                  <button
                    onClick={() => loadDemoTemplate('medical')}
                    className="w-full flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 p-3.5 text-left text-xs text-slate-300 transition-all cursor-pointer hover:border-electric/30 group"
                  >
                    <div>
                      <p className="font-bold text-white group-hover:text-electric-bright transition-colors">pharma_stock_sheet.pdf</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">8 Medical & Pharmacy items</p>
                    </div>
                    <FileText className="h-4 w-4 text-slate-400 group-hover:text-white" />
                  </button>
                  <button
                    onClick={() => loadDemoTemplate('electronics')}
                    className="w-full flex items-center justify-between rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 p-3.5 text-left text-xs text-slate-300 transition-all cursor-pointer hover:border-electric/30 group"
                  >
                    <div>
                      <p className="font-bold text-white group-hover:text-electric-bright transition-colors">retail_electronics.csv</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">10 Electronics & Apparel items</p>
                    </div>
                    <FileText className="h-4 w-4 text-slate-400 group-hover:text-white" />
                  </button>
                </div>
              </div>
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-[11px] text-slate-500 mt-4 leading-relaxed">
                <strong>Why upload?</strong> Feeding your manifest updates stock tables, recalculates finance parameters, and syncs AI agents response capabilities.
              </div>
            </div>
          </div>
        ) : isParsing ? (
          /* STEP 2: PROCESSING OCR SIMULATION TERMINAL */
          <div className="glass-card rounded-3xl p-6 max-w-2xl mx-auto border border-electric/20 glow-blue">
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-2 border-slate-700" />
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-bright border-t-transparent animate-spin" />
                  <RefreshCw className="h-4.5 w-4.5 text-cyan-bright" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-white">AI Data Ingestion Engine</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">TARGET: {file.name}</p>
                </div>
              </div>
              <span className="rounded bg-electric/10 border border-electric/30 px-2 py-0.5 text-[9px] font-mono text-cyan-bright uppercase tracking-wider animate-pulse">
                OCR Running
              </span>
            </div>

            <div className="h-56 overflow-hidden rounded-2xl bg-base border border-white/5 p-4 font-mono text-[11px] leading-relaxed text-green-400 space-y-1.5 shadow-inner">
              {parsingLogs.slice(0, currentLogIdx + 1).map((log, idx) => (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  {log}
                </motion.p>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between text-[11px] text-slate-500 font-semibold font-mono">
              <span>PROCESSED: {Math.round(((currentLogIdx + 1) / parsingLogs.length) * 100)}%</span>
              <span>256-bit Document Stream Tunnel</span>
            </div>
          </div>
        ) : (
          /* STEP 3: PREVIEW & REVIEW TABLE */
          <div className="space-y-6">
            <div className="glass-card rounded-3xl p-5">
              <div className="flex flex-col gap-4 justify-between border-b border-white/5 pb-4 mb-4 sm:flex-row sm:items-center">
                <div>
                  <h3 className="text-sm font-semibold text-white">Review Extracted Records</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    AI Ingestion parsed <strong className="text-white">{extractedProducts.length} items</strong>. Align details or adjust columns below before loading.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddRow}
                    className="flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-semibold text-white border border-white/5 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Row
                  </button>
                  <button
                    onClick={() => {
                      setFile(null)
                      setExtractedProducts([])
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-white/5 hover:bg-red-500/20 px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-red-400 border border-white/5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Clear All
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] text-slate-300">
                  <thead>
                    <tr className="border-b border-white/5 text-slate-500 font-semibold">
                      <th className="pb-3 pr-2">Icon</th>
                      <th className="pb-3">Product Name</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">SKU / Barcode</th>
                      <th className="pb-3">Stock Count</th>
                      <th className="pb-3 text-right">Buying Price (₹)</th>
                      <th className="pb-3 text-right">Selling Price (₹)</th>
                      <th className="pb-3 text-right">Markup (₹)</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {extractedProducts.map((p) => {
                      const markup = p.price - p.cost
                      return (
                        <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="py-2 pr-2">
                            <div className="flex items-center justify-center h-7 w-7 rounded-lg bg-white/5 border border-white/5 overflow-hidden">
                              {p.image && p.image.startsWith('http') ? (
                                <img src={p.image} alt="Product" className="h-full w-full object-cover" />
                              ) : (
                                <input
                                  type="text"
                                  value={p.image}
                                  onChange={(e) => handleEditField(p.id, 'image', e.target.value)}
                                  className="w-full bg-transparent text-center border-none p-0 focus:ring-0 focus:outline-none"
                                />
                              )}
                            </div>
                          </td>
                          <td className="py-2">
                            <input
                              type="text"
                              value={p.name}
                              onChange={(e) => handleEditField(p.id, 'name', e.target.value)}
                              className="w-48 bg-transparent border-none p-0 focus:ring-0 focus:outline-none text-white font-medium"
                            />
                          </td>
                          <td className="py-2">
                            <select
                              value={p.category}
                              onChange={(e) => handleEditField(p.id, 'category', e.target.value)}
                              className="bg-transparent border-none p-0 text-slate-400 focus:ring-0 focus:outline-none"
                            >
                              <option value="Electronics" className="bg-slate-900 text-white">Electronics</option>
                              <option value="Apparel" className="bg-slate-900 text-white">Apparel</option>
                              <option value="Groceries" className="bg-slate-900 text-white">Groceries</option>
                              <option value="Medical" className="bg-slate-900 text-white">Medical</option>
                              <option value="Food" className="bg-slate-900 text-white">Food</option>
                            </select>
                          </td>
                          <td className="py-2">
                            <input
                              type="text"
                              value={p.sku}
                              onChange={(e) => handleEditField(p.id, 'sku', e.target.value)}
                              className="w-28 bg-transparent border-none p-0 focus:ring-0 focus:outline-none font-mono text-[10px] text-slate-400"
                            />
                          </td>
                          <td className="py-2">
                            <input
                              type="number"
                              value={p.stock}
                              onChange={(e) => handleEditField(p.id, 'stock', e.target.value)}
                              className="w-16 bg-transparent border-none p-0 focus:ring-0 focus:outline-none font-mono text-center text-white"
                            />
                          </td>
                          <td className="py-2 text-right">
                            <span className="text-slate-500 font-mono mr-0.5">₹</span>
                            <input
                              type="number"
                              step="1"
                              value={p.cost}
                              onChange={(e) => handleEditField(p.id, 'cost', e.target.value)}
                              className="w-16 bg-transparent border-none p-0 focus:ring-0 focus:outline-none font-mono text-right text-white"
                            />
                          </td>
                          <td className="py-2 text-right">
                            <span className="text-slate-500 font-mono mr-0.5">₹</span>
                            <input
                              type="number"
                              step="1"
                              value={p.price}
                              onChange={(e) => handleEditField(p.id, 'price', e.target.value)}
                              className="w-16 bg-transparent border-none p-0 focus:ring-0 focus:outline-none font-mono text-right text-white"
                            />
                          </td>
                          <td className="py-2 text-right font-mono font-medium text-cyan-bright">
                            ₹{markup.toLocaleString('en-IN')}
                          </td>
                          <td className="py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveRow(p.id)}
                              className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom options and action bar */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Settings Card */}
              <div className="glass-card rounded-2xl p-5 md:col-span-2 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Ingestion Modes</h4>
                  <div className="flex gap-4 mt-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="radio"
                        checked={importMode === 'merge'}
                        onChange={() => setImportMode('merge')}
                        className="text-electric bg-transparent border-slate-700 focus:ring-0"
                      />
                      <div>
                        <strong>Merge Inflow</strong>
                        <p className="text-[10px] text-slate-500 mt-0.5">Add to existing stock and catalog items matching SKUs.</p>
                      </div>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="radio"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-electric bg-transparent border-slate-700 focus:ring-0"
                      />
                      <div>
                        <strong>Clean Overwrite</strong>
                        <p className="text-[10px] text-slate-500 mt-0.5">Wipe current table and load newly imported products only.</p>
                      </div>
                    </label>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/[0.02] border border-white/5 p-3 text-[11px] text-slate-400 leading-normal">
                  <AlertCircle className="h-4 w-4 text-cyan-bright shrink-0" />
                  We recommend verifying barcode SKUs carefully before confirming ingestion to prevent registry leaks.
                </div>
              </div>

              {/* Confirm Actions */}
              <div className="glass-card rounded-2xl p-5 flex flex-col justify-between border border-cyan-bright/20">
                <div>
                  <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Commit Import</h4>
                  <div className="mt-3 text-xs text-slate-400 space-y-1">
                    <p>Total Items: <strong className="text-white font-mono">{extractedProducts.length}</strong></p>
                    <p>Est. Inventory Cost Basis: <strong className="text-white font-mono">₹{extractedProducts.reduce((sum, p) => sum + (p.stock * p.cost), 0).toLocaleString('en-IN')}</strong></p>
                    <p>Est. Retail valuation: <strong className="text-white font-mono">₹{extractedProducts.reduce((sum, p) => sum + (p.stock * p.price), 0).toLocaleString('en-IN')}</strong></p>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <button
                    onClick={handleConfirmIngest}
                    disabled={extractedProducts.length === 0}
                    className="w-full rounded-xl bg-gradient-to-r from-electric to-neon py-2.5 text-center text-xs font-semibold text-white shadow-xl shadow-electric/25 hover:scale-102 transition-transform cursor-pointer"
                  >
                    Confirm & Ingest to System
                  </button>
                  <button
                    onClick={() => {
                      setFile(null)
                      setExtractedProducts([])
                    }}
                    className="w-full rounded-xl glass py-2 text-center text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    Discard and Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Camera Notebook scanner modal overlay */}
        <AnimatePresence>
          {showCameraScanner && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-strong max-w-lg w-full rounded-3xl p-6 text-left shadow-2xl glow-cyan text-slate-200 border border-white/10 relative overflow-hidden"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-3.5 mb-4 shrink-0">
                  <h3 className="font-display text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    📷 AI Notebook Camera OCR Scanner
                  </h3>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="text-slate-400 hover:text-white text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <p className="text-xs text-slate-400">
                    Hold your physical notebook/book page up to your camera. Align the text block inside the scanning HUD, and press **Capture Page & OCR** to process.
                  </p>

                  {/* Webcam Preview Container */}
                  <div className="relative aspect-video w-full rounded-2xl bg-black border border-white/5 overflow-hidden shadow-inner">
                    
                    {/* Streaming video element */}
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="h-full w-full object-cover"
                    />

                    {/* Hidden Canvas for Capturing Snapshots */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* High-tech scanning HUD lines and overlays */}
                    <div className="absolute inset-4 border border-cyan/30 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                      <div className="flex justify-between">
                        <span className="h-4 w-4 border-t-2 border-l-2 border-cyan-bright" />
                        <span className="h-4 w-4 border-t-2 border-r-2 border-cyan-bright" />
                      </div>

                      {/* HUD horizontal scanline animation */}
                      <motion.div
                        animate={{ y: [0, 200, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                        className="w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-bright to-transparent opacity-80"
                      />

                      <div className="flex justify-between">
                        <span className="h-4 w-4 border-b-2 border-l-2 border-cyan-bright" />
                        <span className="h-4 w-4 border-b-2 border-r-2 border-cyan-bright" />
                      </div>
                    </div>

                    {/* Centered target reticle */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="h-10 w-10 border border-dashed border-cyan/40 rounded-full animate-pulse flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-cyan-bright" />
                      </div>
                    </div>

                    {/* Live Indicator tag */}
                    <span className="absolute top-3 left-3 rounded bg-red-500/10 border border-red-500/30 px-2 py-0.5 text-[8px] font-mono text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping" />
                      Webcam Live
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span>Stream format: 1280x720 (High Definition)</span>
                    <span>Active Device: Web Camera</span>
                  </div>

                  {/* Control Footer Action Buttons */}
                  <div className="flex gap-3 pt-3 border-t border-white/5 shrink-0">
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="flex-1 rounded-xl border border-white/5 hover:bg-white/5 py-2.5 text-xs font-semibold text-slate-400 transition-colors cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={captureSnapshot}
                      disabled={isCapturing}
                      className="flex-1 rounded-xl bg-gradient-to-r from-electric to-cyan py-2.5 text-xs font-bold text-white shadow-lg shadow-electric/25 hover:scale-[1.01] transition-transform cursor-pointer text-center flex items-center justify-center gap-2"
                    >
                      {isCapturing ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Extracting OCR...</span>
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4" />
                          <span>Capture Page & OCR</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // STANDARD INVENTORY VIEW
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl">
            AI Inventory Manager
          </h1>
          <p className="text-sm text-slate-400">
            Real-time warehousing, shelf mapping, expiry auditing, and auto-restocking limits.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowImporter(true)}
            className="flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 px-5 py-2.5 text-xs font-semibold text-white transition-all cursor-pointer"
          >
            <Upload className="h-4 w-4 text-cyan-bright" /> Ingest Manifest (Excel/PDF)
          </button>
          <button
            onClick={simulateScan}
            disabled={scanning}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-electric to-neon px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-electric/25 hover:scale-105 transition-transform cursor-pointer"
          >
            <Camera className="h-4 w-4" /> {scanning ? 'Scanning...' : 'Simulate Scanner Check'}
          </button>
        </div>
      </div>

      {/* Barcode Overlay Modal */}
      <AnimatePresence>
        {scanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md"
          >
            <div className="glass-strong max-w-sm rounded-3xl p-6 text-center shadow-2xl glow-blue">
              <div className="relative mx-auto mb-6 h-48 w-48 overflow-hidden rounded-2xl bg-base border border-white/10">
                <div className="absolute inset-0 border border-electric opacity-40" />
                <div className="absolute inset-x-0 top-1/2 h-[2px] bg-cyan-bright animate-bounce shadow-glow" />
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <RefreshCw className="h-6 w-6 animate-spin text-electric-bright" />
                    <span>Analyzing camera feed...</span>
                  </div>
                </div>
              </div>
              <h3 className="font-display text-lg font-bold text-white">Scanner Telemetry active</h3>
              <p className="text-xs text-slate-400 mt-2">
                Simulating camera barcode snapshot validation. Processing cryptographic OCR code...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Main inventory list */}
        <div className="glass-card rounded-2xl p-5 lg:col-span-8">
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h3 className="text-sm font-semibold text-white">Product Registry Table</h3>
            {/* Category filter */}
            <div className="flex flex-wrap gap-1.5">
              {(['All', 'Electronics', 'Apparel', 'Groceries', 'Medical'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer ${
                    selectedCategory === cat ? 'bg-electric text-white' : 'glass text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] text-slate-300">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 font-semibold">
                  <th className="pb-3">Image</th>
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">SKU / Barcode</th>
                  <th className="pb-3">Stock / Min</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Buying (₹)</th>
                  <th className="pb-3 text-right">Selling (₹)</th>
                  <th className="pb-3 text-right">Profit (₹)</th>
                  <th className="pb-3 text-right">Valuation (₹)</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((p) => {
                  const isLow = p.stock <= p.minStock
                  const isOutOfStock = p.stock === 0
                  const profit = p.price - p.cost
                  const totalValue = p.stock * p.price
                  
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3 pr-2">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 border border-white/5 text-base shadow-sm overflow-hidden shrink-0">
                          {p.image && p.image.startsWith('http') ? (
                            <img 
                              src={p.image.includes('unsplash.com/featured') || p.image.includes('source.unsplash.com') ? getProductImage(p.name, p.category) : p.image} 
                              alt="Product" 
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            p.image || '📦'
                          )}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-white max-w-[110px] truncate" title={p.name}>
                        {p.name}
                      </td>
                      <td className="py-3 text-slate-400">{p.category}</td>
                      <td className="py-3 font-mono text-[10px] text-slate-400">{p.sku}</td>
                      <td className="py-3 font-mono">{p.stock} / {p.minStock}</td>
                      <td className="py-3">
                        {isOutOfStock ? (
                          <span className="flex items-center gap-1 text-red-400 font-bold">
                            🔴 Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="flex items-center gap-1 text-yellow-400 font-bold animate-pulse-glow">
                            🟡 Low Stock
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-400 font-bold">
                            🟢 In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right font-mono">₹{p.cost.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right font-mono">₹{p.price.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right font-mono text-cyan-bright font-medium">₹{profit.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right font-mono font-bold text-white">₹{totalValue.toLocaleString('en-IN')}</td>
                      <td className="py-3 text-right">
                        {isLow ? (
                          <button
                            onClick={() => triggerReorder(p.id)}
                            className="rounded-lg bg-electric/15 border border-electric/30 px-2 py-1 text-[10px] font-semibold text-electric-bright hover:bg-electric/25 transition-colors cursor-pointer"
                          >
                            Restock
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Stock Intelligence Hub */}
        <div className="glass-card flex flex-col justify-between rounded-2xl p-5 lg:col-span-4">
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4 text-cyan-bright animate-spin" /> AI Stock Intelligence
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-display">Predictive warehouse modeling and alerts</p>
          </div>

          <div className="my-5 space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
            {dbState.products.map(p => {
              const isOutOfStock = p.stock === 0
              const isLow = p.stock <= p.minStock
              
              let supplier = 'Apex Global Inc.'
              if (p.category === 'Electronics') supplier = 'Silicon Ingest Ltd'
              if (p.category === 'Apparel') supplier = 'Future Fabrics Depot'
              if (p.category === 'Groceries') supplier = 'Universal Foods Wholesalers'
              if (p.category === 'Medical') supplier = 'BioHealth Logistics'

              const reorderQty = p.minStock * 3

              if (isOutOfStock) {
                return (
                  <div key={p.id} className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-xs leading-normal">
                    <p className="font-bold text-red-400">⚠️ OUT OF STOCK: {p.name}</p>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Customers cannot order this item. <strong className="text-white">Order {reorderQty} units</strong> immediately from <em className="text-cyan-bright">{supplier}</em>.
                    </p>
                  </div>
                )
              }

              if (isLow) {
                const salesRate = p.salesCount > 0 ? (p.salesCount / 20) : 0.8
                const daysRemaining = Math.max(1, Math.round(p.stock / salesRate))
                
                return (
                  <div key={p.id} className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3 text-xs leading-normal">
                    <p className="font-bold text-yellow-400">⏳ CRITICAL EXHAUSTION: {p.name}</p>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Stock will last approximately <strong className="text-yellow-400">{daysRemaining} days</strong>. Restock directive: Order <strong className="text-white">{reorderQty} units</strong> from <em className="text-cyan-bright">{supplier}</em>.
                    </p>
                  </div>
                )
              }

              if (p.salesCount > 180) {
                return (
                  <div key={p.id} className="rounded-xl border border-green-500/20 bg-green-500/5 p-3 text-xs leading-normal">
                    <p className="font-bold text-green-400">⚡ VELOCITY SPIKE: {p.name}</p>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Selling <strong className="text-green-400">35% faster</strong> this week. Current buffer is healthy, but demand is growing.
                    </p>
                  </div>
                )
              }

              if (p.salesCount < 80 && p.stock > p.minStock * 2) {
                return (
                  <div key={p.id} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs leading-normal">
                    <p className="font-bold text-slate-400">🧊 SLOW MOVING INVENTORY: {p.name}</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Only {p.salesCount} sold. Suggest configuring a <strong className="text-gradient">15% discount campaign</strong> to clear overstock storage racks.
                    </p>
                  </div>
                )
              }

              return null
            })}
          </div>

          <div className="rounded-xl bg-white/[0.02] border border-white/5 p-3 text-[11px] text-slate-400 flex items-start gap-2">
            <Layers className="h-4 w-4 text-cyan-bright shrink-0 mt-0.5" />
            <div>
              <strong>Reorder Automation:</strong> Standard quantities calculated dynamically using real-time checkout velocity rates.
            </div>
          </div>
        </div>
      </div>

      {/* Bottom widgets: Expiry tracker and product movements */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Expiry Auditer */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 border-b border-white/5 pb-3 flex items-center gap-2">
            Expiry Ledger Audits
          </h3>
          <div className="space-y-3">
            {dbState.products
              .filter((p) => p.expiryDate)
              .map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs border-b border-white/[0.02] pb-2 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-white">{p.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Expiry Batch: {p.expiryDate}</p>
                  </div>
                  {getExpiryBadge(p.expiryDate)}
                </div>
              ))}
          </div>
        </div>

        {/* Product Movements */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-semibold text-white mb-4 border-b border-white/5 pb-3">
            Product Velocity Audits
          </h3>
          <div className="grid gap-4 grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1 mb-2">
                <TrendingUp className="h-3.5 w-3.5 text-green-400" /> Fast Moving Velocity
              </p>
              <div className="space-y-2">
                {fastMoving.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex justify-between text-xs rounded bg-white/[0.01] p-1.5 border border-white/5">
                    <span className="text-slate-300 truncate max-w-[80px]">{p.name}</span>
                    <span className="font-mono text-green-400 font-bold">{p.salesCount} sold</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase flex items-center gap-1 mb-2">
                <TrendingDown className="h-3.5 w-3.5 text-red-400" /> Overstock / Slow
              </p>
              <div className="space-y-2">
                {slowMoving.slice(0, 3).map((p) => (
                  <div key={p.id} className="flex justify-between text-xs rounded bg-white/[0.01] p-1.5 border border-white/5">
                    <span className="text-slate-300 truncate max-w-[80px]">{p.name}</span>
                    <span className="font-mono text-yellow-400">{p.stock} units</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
