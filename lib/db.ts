import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import bcrypt from 'bcryptjs'

export interface User {
  id: string
  username: string
  password: string
  role: 'admin' | 'user'
  langgr_url: string | null
  agent_name: string | null
  createdAt: string
  updatedAt: string
}

interface Database {
  users: User[]
}

const file = 'db.json'
const adapter = new JSONFile<Database>(file)
const db = new Low(adapter, { users: [] })

export async function initDB() {
  await db.read()
  
  // Create default admin user if no users exist
  if (db.data.users.length === 0) {
    const hashedPassword = await bcrypt.hash('pass_for_admin_123', 10)
    db.data.users.push({
      id: 'admin-001',
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
      langgr_url: null,
      agent_name: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })
    await db.write()
  }
}

export async function findUserByUsername(username: string): Promise<User | null> {
  await db.read()
  return db.data.users.find(user => user.username === username) || null
}

export async function findUserById(id: string): Promise<User | null> {
  await db.read()
  return db.data.users.find(user => user.id === id) || null
}

export async function createUser(username: string, password: string, role: 'admin' | 'user' = 'user'): Promise<User> {
  await db.read()
  
  const existingUser = db.data.users.find(user => user.username === username)
  if (existingUser) {
    throw new Error('Username already exists')
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    username,
    password: hashedPassword,
    role,
    langgr_url: null,
    agent_name: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  db.data.users.push(newUser)
  await db.write()
  
  return newUser
}


export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  await db.read()
  
  const userIndex = db.data.users.findIndex(user => user.id === userId)
  if (userIndex === -1) {
    return false
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  db.data.users[userIndex].password = hashedPassword
  db.data.users[userIndex].updatedAt = new Date().toISOString()
  
  await db.write()
  return true
}

export async function updateUserAgentConfig(userId: string, langgr_url: string | null, agent_name: string | null): Promise<boolean> {
  await db.read()
  
  const userIndex = db.data.users.findIndex(user => user.id === userId)
  if (userIndex === -1) {
    return false
  }

  db.data.users[userIndex].langgr_url = langgr_url
  db.data.users[userIndex].agent_name = agent_name
  db.data.users[userIndex].updatedAt = new Date().toISOString()
  
  await db.write()
  return true
}

export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  await db.read()
  return db.data.users.map(({ password, ...user }) => user)
}

export async function deleteUser(userId: string): Promise<boolean> {
  await db.read()
  
  const userIndex = db.data.users.findIndex(user => user.id === userId)
  if (userIndex === -1) {
    return false
  }

  db.data.users.splice(userIndex, 1)
  await db.write()
  return true
}

export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword)
}
