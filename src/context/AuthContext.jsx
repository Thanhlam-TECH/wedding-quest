import { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [roomId, setRoomId] = useState(null)
  const [needsRoom, setNeedsRoom] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        // Check if user has a room
        const userDoc = await getDoc(doc(db, 'users', u.uid))
        if (userDoc.exists() && userDoc.data().roomId) {
          setRoomId(userDoc.data().roomId)
          setNeedsRoom(false)
        } else {
          setNeedsRoom(true)
        }
      } else {
        setRoomId(null)
        setNeedsRoom(false)
      }
      setLoading(false)
    })
    return unsub
  }, [])

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password)

  const signup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password)

  const logout = () => signOut(auth)

  // Create a new room
  const createRoom = async (role) => {
    if (!user) return
    // Generate 6-char room code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    const roomRef = doc(db, 'rooms', code)

    await setDoc(roomRef, {
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      members: {
        [user.uid]: { email: user.email, role },
      },
    })

    // Save room to user profile
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      roomId: code,
      role,
    })

    setRoomId(code)
    setNeedsRoom(false)
    return code
  }

  // Join existing room
  const joinRoom = async (code, role) => {
    if (!user) return
    const roomRef = doc(db, 'rooms', code.toUpperCase())
    const roomDoc = await getDoc(roomRef)

    if (!roomDoc.exists()) {
      throw new Error('Mã phòng không tồn tại')
    }

    const roomData = roomDoc.data()
    const memberCount = Object.keys(roomData.members || {}).length
    if (memberCount >= 2) {
      throw new Error('Phòng đã đủ 2 người')
    }

    // Check if the chosen role is already taken
    const existingRoles = Object.values(roomData.members || {}).map((m) => m.role)
    if (existingRoles.includes(role)) {
      throw new Error(`Vai trò "${role === 'groom' ? 'Hoàng Tử' : 'Công Chúa'}" đã có người chọn rồi`)
    }

    // Add user to room
    await setDoc(roomRef, {
      ...roomData,
      members: {
        ...roomData.members,
        [user.uid]: { email: user.email, role },
      },
    })

    // Save room to user profile
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      roomId: code.toUpperCase(),
      role,
    })

    setRoomId(code.toUpperCase())
    setNeedsRoom(false)
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, roomId, needsRoom, login, signup, logout, createRoom, joinRoom }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
