'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Trash2, Settings } from 'lucide-react'

interface User {
  id: string
  username: string
  role: string
  langgr_url: string | null
  agent_name: string | null
  createdAt: string
}

export default function AdminPanel() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showAgentConfig, setShowAgentConfig] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'user'
  })
  const [agentConfig, setAgentConfig] = useState({
    langgr_url: '',
    agent_name: ''
  })
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null)

  useEffect(() => {
    loadUsers()
    getCurrentUser()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    }
    setLoading(false)
  }

  const getCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/verify')
      const data = await response.json()
      if (data.success && data.authenticated) {
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error('Failed to get current user:', error)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      })

      const data = await response.json()
      if (data.success) {
        setNewUser({ username: '', password: '', role: 'user' })
        setShowCreateForm(false)
        loadUsers()
      } else {
        alert(data.error || 'Failed to create user')
      }
    } catch (error) {
      alert('Error creating user')
    }
  }

  const resetUserPassword = async (userId: string) => {
    const newPassword = prompt('Enter new password for user:')
    if (!newPassword) return

    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: userId,
          newPassword
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('Password updated successfully!')
      } else {
        alert(data.error || 'Failed to update password')
      }
    } catch (error) {
      alert('Error updating password')
    }
  }

  const deleteUser = async (userId: string, username: string) => {
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/users?id=${userId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      if (data.success) {
        alert('User deleted successfully!')
        loadUsers()
      } else {
        alert(data.error || 'Failed to delete user')
      }
    } catch (error) {
      alert('Error deleting user')
    }
  }

  const updateAgentConfig = async (userId: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          langgr_url: agentConfig.langgr_url || null,
          agent_name: agentConfig.agent_name || null
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('Agent configuration updated successfully!')
        setShowAgentConfig(null)
        setAgentConfig({ langgr_url: '', agent_name: '' })
        loadUsers()
      } else {
        alert(data.error || 'Failed to update agent configuration')
      }
    } catch (error) {
      alert('Error updating agent configuration')
    }
  }

  const openAgentConfig = (user: User) => {
    setAgentConfig({
      langgr_url: user.langgr_url || '',
      agent_name: user.agent_name || ''
    })
    setShowAgentConfig(user.id)
  }

  if (loading) {
    return (
      <DashboardLayout requireAdmin>
        <div className="text-center">Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout requireAdmin>
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl">User Management</CardTitle>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                variant="default"
              >
                Create User
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {showCreateForm && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New User</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateUser} className="space-y-4">
                    <Input
                      type="text"
                      placeholder="Username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                      required
                    />
                    <Input
                      type="password"
                      placeholder="Password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      required
                    />
                    <Select value={newUser.role} onValueChange={(value) => setNewUser({...newUser, role: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button type="submit">Create User</Button>
                      <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {showAgentConfig && (
              <Card>
                <CardHeader>
                  <CardTitle>Configure Agent Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Input
                      type="text"
                      placeholder="LangGraph Deployment URL"
                      value={agentConfig.langgr_url}
                      onChange={(e) => setAgentConfig({...agentConfig, langgr_url: e.target.value})}
                    />
                    <Input
                      type="text"
                      placeholder="Agent Name"
                      value={agentConfig.agent_name}
                      onChange={(e) => setAgentConfig({...agentConfig, agent_name: e.target.value})}
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => updateAgentConfig(showAgentConfig)}>
                        Update Configuration
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setShowAgentConfig(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div>
              <h2 className="text-xl font-semibold mb-4">User Management</h2>
              <Card>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Agent URL</TableHead>
                      <TableHead>Agent Name</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-32 truncate" title={user.langgr_url || 'Not set'}>
                          {user.langgr_url ? user.langgr_url.substring(0, 30) + '...' : 'Not set'}
                        </TableCell>
                        <TableCell>{user.agent_name || 'Not set'}</TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => openAgentConfig(user)}
                              variant="outline"
                              size="sm"
                              title="Configure agent"
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                            <Button
                              onClick={() => resetUserPassword(user.id)}
                              variant="link"
                              size="sm"
                            >
                              Reset Password
                            </Button>
                            {currentUser?.username !== user.username && (
                              <Button
                                onClick={() => deleteUser(user.id, user.username)}
                                variant="destructive"
                                size="sm"
                                title="Delete user"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
