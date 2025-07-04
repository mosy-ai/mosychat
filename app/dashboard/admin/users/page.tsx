'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DashboardLayout } from '@/components/dashboard-layout'
import { Trash2, Settings } from 'lucide-react'
import { apiClient, UserResponse } from '@/lib/api-client'
import { verifyAndGetMe } from '@/lib/custom-func'

export default function AdminPanel() {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showAgentConfig, setShowAgentConfig] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    role: 'USER'
  })
  const [agentConfig, setAgentConfig] = useState({
    langgr_url: '',
    agent_name: ''
  })
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null)

  useEffect(() => {
    loadUsers()
    getCurrentUser()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await apiClient.listUsers()
      setUsers(response.data)
    } catch (error) {
      console.error('Failed to load users:', error)
    }
    setLoading(false)
  }

  const getCurrentUser = async () => {
    try {
      const user = await verifyAndGetMe()
      setCurrentUser(user)
    } catch (error) {
      console.error('Failed to get current user:', error)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const userData = {
        email: newUser.email,
        name: newUser.name,
        password: newUser.password,
        is_active: true,
        role: newUser.role
      }
      
      await apiClient.createUser(userData)
      setNewUser({ email: '', name: '', password: '', role: 'USER' })
      setShowCreateForm(false)
      loadUsers()
      alert('User created successfully!')
    } catch (error) {
      console.error('Failed to create user:', error)
      alert('Error creating user')
    }
  }

  const resetUserPassword = async (userId: string) => {
    const newPassword = prompt('Enter new password for user:')
    if (!newPassword) return

    try {
      await apiClient.updateUser(userId, { password: newPassword })
      alert('Password updated successfully!')
    } catch (error) {
      console.error('Failed to update password:', error)
      alert('Error updating password')
    }
  }

  const deleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      return
    }

    try {
      await apiClient.deleteUser(userId)
      alert('User deleted successfully!')
      loadUsers()
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Error deleting user')
    }
  }

  const updateAgentConfig = async (userId: string) => {
    try {
      await apiClient.updateUser(userId, {
        langgr_url: agentConfig.langgr_url || null,
        agent_name: agentConfig.agent_name || null
      })
      alert('Agent configuration updated successfully!')
      setShowAgentConfig(null)
      setAgentConfig({ langgr_url: '', agent_name: '' })
      loadUsers()
    } catch (error) {
      console.error('Failed to update agent configuration:', error)
      alert('Error updating agent configuration')
    }
  }

  const openAgentConfig = (user: UserResponse) => {
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
        <div className="flex justify-between items-center">
          <CardTitle className="text-3xl">User Management</CardTitle>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            variant="default"
          >
            Create User
          </Button>
        </div>
        {showCreateForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New User</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                />
                <Input
                  type="text"
                  placeholder="Name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
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
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
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

        
          <Card className="px-8">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
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
                    <TableCell className="font-medium">{user.name || 'N/A'}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'ADMIN' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-32 truncate" title={user.langgr_url || 'Not set'}>
                      {user.langgr_url ? user.langgr_url.substring(0, 30) + '...' : 'Not set'}
                    </TableCell>
                    <TableCell>{user.agent_name || 'Not set'}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
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
                        {currentUser?.email !== user.email && (
                          <Button
                            onClick={() => deleteUser(user.id, user.email)}
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
    </DashboardLayout>
  )
}
