/**
 * Theme Library Page
 * Browse official templates, imported templates, and import new themes
 */

'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Github, Download, Trash2, Loader } from 'lucide-react'
import { useThemeImporter } from '@/hooks/use-theme-importer'

const OFFICIAL_TEMPLATES = [
  {
    id: 'luxury-fashion',
    name: 'Luxury Fashion',
    description: 'High-end fashion theme with elegant styling',
    icon: '👗',
    category: 'fashion',
    featured: true
  },
  {
    id: 'minimal-tech',
    name: 'Minimal Tech',
    description: 'Modern minimal tech product showcase',
    icon: '⚡',
    category: 'tech',
    featured: true
  },
  {
    id: 'beauty-brand',
    name: 'Beauty Brand',
    description: 'Cosmetics & beauty product storefront',
    icon: '💄',
    category: 'beauty',
    featured: true
  }
]

export default function ThemeLibraryPage() {
  const [tab, setTab] = useState('official')
  const [importedThemes, setImportedThemes] = useState([])
  const [selectedThemeType, setSelectedThemeType] = useState('shopify')
  const importer = useThemeImporter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const progressWidthClass = (() => {
    const progress = Math.min(100, Math.max(0, Math.round(importer.progress || 0)))
    if (progress >= 100) return 'w-full'
    if (progress >= 75) return 'w-3/4'
    if (progress >= 50) return 'w-1/2'
    if (progress >= 25) return 'w-1/4'
    return 'w-0'
  })()

  const handleImportStart = (method: string) => {
    console.log('Starting import method:', method)
    // Will implement different import flows
  }

  const handleZipUpload = async (file: File | undefined) => {
    if (!file) return
    
    try {
      const themeName = file.name.replace('.zip', '')
      const result = await importer.importFromZip(file, selectedThemeType, themeName)
      
      // Add to imported themes list
      setImportedThemes(prev => [...prev, {
        id: `imported-${Date.now()}`,
        name: result.summary.name,
        type: result.summary.type,
        registry: result.registry,
        template: result.template,
        tokens: result.tokens
      }])
      
      setTab('imported')
    } catch (err) {
      console.error('Import failed:', err)
      alert(`导入失败: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">模板库</h1>
          <p className="text-gray-600">浏览官方模板、导入自定义主题、或从 Git 克隆</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setTab('official')}
            className={`pb-2 px-4 font-medium transition-colors ${
              tab === 'official'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            官方模板
          </button>
          <button
            onClick={() => setTab('imported')}
            className={`pb-2 px-4 font-medium transition-colors ${
              tab === 'imported'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            我的模板 ({importedThemes.length})
          </button>
          <button
            onClick={() => setTab('import')}
            className={`pb-2 px-4 font-medium transition-colors ${
              tab === 'import'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            导入
          </button>
        </div>

        {/* Official Templates Tab */}
        {tab === 'official' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {OFFICIAL_TEMPLATES.map(template => (
              <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-gradient-to-br from-blue-100 to-blue-50 p-8 text-center">
                  <div className="text-5xl mb-4">{template.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                  {template.featured && (
                    <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  <div className="flex gap-2">
                    <Link
                      href={`/ai-studio?template=${template.id}`}
                      className="flex-1"
                    >
                      <Button variant="default" className="w-full">
                        使用
                      </Button>
                    </Link>
                    <Link
                      href={`/templates/${template.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full">
                        预览
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Imported Themes Tab */}
        {tab === 'imported' && (
          <div>
            {importedThemes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 mb-4">还没有导入任何模板</p>
                <Button onClick={() => setTab('import')}>导入第一个模板</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {importedThemes.map(theme => (
                  <Card key={theme.id} className="overflow-hidden">
                    <div className="bg-gray-100 p-8 text-center">
                      <div className="text-4xl">📦</div>
                      <h3 className="mt-4 text-lg font-semibold">{theme.name}</h3>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 text-sm mb-4">{theme.type}</p>
                      <div className="flex gap-2">
                        <Link href={`/ai-studio?theme=${theme.id}`} className="flex-1">
                          <Button variant="default" className="w-full">
                            编辑
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setImportedThemes(t => t.filter(x => x.id !== theme.id))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Import Tab */}
        {tab === 'import' && (
          <div className="max-w-2xl">
            <div className="space-y-6">
              {/* Theme Type Selection */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">选择主题类型</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'shopify', label: 'Shopify' },
                    { value: 'html', label: 'HTML' },
                    { value: 'nextjs', label: 'Next.js' },
                    { value: 'tailwind', label: 'Tailwind' },
                    { value: 'jsx', label: 'React/JSX' },
                    { value: 'tsx', label: 'React/TSX' }
                  ].map(type => (
                    <button
                      key={type.value}
                      onClick={() => setSelectedThemeType(type.value)}
                      className={`p-3 rounded border-2 transition-colors ${
                        selectedThemeType === type.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </Card>

              {/* ZIP Upload */}
              <Card className="p-8 border-2 border-dashed border-gray-300 hover:border-blue-500 cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center">
                  {importer.status === 'uploading' || importer.status === 'processing' ? (
                    <>
                      <Loader className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
                      <h3 className="text-lg font-semibold mb-2">
                        {importer.status === 'uploading' ? '上传中...' : '处理中...'}
                      </h3>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className={`bg-blue-500 h-2 rounded-full transition-all ${progressWidthClass}`} />
                      </div>
                    </>
                  ) : (
                    <>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">上传 ZIP 文件</h3>
                      <p className="text-gray-600 text-sm mb-4">
                        拖拽或点击选择 {selectedThemeType} 主题 ZIP 文件
                      </p>
                      <Button
                        variant="default"
                        onClick={(e) => {
                          e.stopPropagation()
                          fileInputRef.current?.click()
                        }}
                      >
                        选择文件
                      </Button>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={(e) => handleZipUpload(e.target.files?.[0])}
                />
              </Card>

              {/* GitHub Import */}
              <Card className="p-8">
                <div className="flex items-center gap-4">
                  <Github className="w-12 h-12 text-gray-600" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">从 GitHub 导入</h3>
                    <p className="text-gray-600 text-sm mb-4">从 GitHub 仓库导入主题</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleImportStart('github')}
                  >
                    连接 GitHub
                  </Button>
                </div>
              </Card>

              {/* Shopify Theme Download */}
              <Card className="p-8">
                <div className="flex items-center gap-4">
                  <Download className="w-12 h-12 text-gray-600" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">导入 Shopify 主题</h3>
                    <p className="text-gray-600 text-sm mb-4">导入 Shopify 主题库中的主题</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleImportStart('shopify')}
                  >
                    浏览主题
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
