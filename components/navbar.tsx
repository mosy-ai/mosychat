'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LogOut, User, Home, FileText, Users, Brain, MessageSquare } from 'lucide-react'
import { useState, useEffect } from 'react'
import { UserResponse } from '@/lib/api-client'

interface NavbarProps {
  user?: UserResponse | null
}

export function Navbar({ user }: NavbarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    try {
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.refresh()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  if (!mounted) return null

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6" />
              ChatMosyAI
            </Link>
            
            {user && (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/dashboard">
                  <Button variant={isActive('/dashboard') && pathname === '/dashboard' ? 'default' : 'ghost'} size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/dashboard/chat">
                  <Button variant={isActive('/dashboard/chat') ? 'default' : 'ghost'} size="sm">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    AI Chat
                  </Button>
                </Link>
                
                {user.role !== 'ADMIN' && (
                  <Link href="/dashboard/knowledge-base">
                    <Button variant={isActive('/dashboard/knowledge-base') ? 'default' : 'ghost'} size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Knowledge Base
                    </Button>
                  </Link>
                )}
                
                {user.role === 'ADMIN' && (
                  <>
                    <Link href="/dashboard/admin/users">
                      <Button variant={isActive('/dashboard/admin/users') ? 'default' : 'ghost'} size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        Users
                      </Button>
                    </Link>
                    <Link href="/dashboard/knowledge-base">
                      <Button variant={isActive('/dashboard/knowledge-base') ? 'default' : 'ghost'} size="sm">
                        <FileText className="w-4 h-4 mr-2" />
                        KB Admin
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
