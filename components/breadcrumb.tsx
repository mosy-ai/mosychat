'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'

export function Breadcrumb() {
  const pathname = usePathname()
  const pathSegments = pathname.split('/').filter(Boolean)

  const breadcrumbItems: Array<{ label: string; href: string; icon?: any }> = [
    { label: 'Home', href: '/', icon: Home }
  ]

  let currentPath = ''
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`
    
    let label = segment.charAt(0).toUpperCase() + segment.slice(1)
    if (segment === 'knowledge-base') label = 'Knowledge Base'
    if (segment === 'admin') label = 'Admin'
    
    breadcrumbItems.push({
      label,
      href: currentPath
    })
  })

  if (breadcrumbItems.length <= 2) return null

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index === 0 && item.icon && <item.icon className="w-4 h-4 mr-1" />}
          {index < breadcrumbItems.length - 1 ? (
            <Link 
              href={item.href} 
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
          {index < breadcrumbItems.length - 1 && (
            <ChevronRight className="w-4 h-4 mx-2" />
          )}
        </div>
      ))}
    </nav>
  )
}
