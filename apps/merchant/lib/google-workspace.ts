import { initializeApp, getApp, getApps } from "firebase/app"
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, type User } from "firebase/auth"
import firebaseConfig from "../firebase-applet-config.json"

// Avoid initializing twice in Next.js Hot Module Replacement processes
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
export const auth = getAuth(app)

export const provider = new GoogleAuthProvider()
provider.addScope("https://www.googleapis.com/auth/drive.file")

let cachedAccessToken: string | null = null

if (typeof window !== "undefined") {
  cachedAccessToken = sessionStorage.getItem("google_oauth_token")
}

export async function googleSignIn(): Promise<{ user: User; accessToken: string }> {
  const result = await signInWithPopup(auth, provider)
  const credential = GoogleAuthProvider.credentialFromResult(result)
  
  if (!credential?.accessToken) {
    throw new Error("Failed to retrieve Google OAuth access token.")
  }
  
  cachedAccessToken = credential.accessToken
  if (typeof window !== "undefined") {
    sessionStorage.setItem("google_oauth_token", cachedAccessToken)
  }
  return { user: result.user, accessToken: cachedAccessToken }
}

export async function googleSignOut(): Promise<void> {
  await signOut(auth)
  cachedAccessToken = null
  if (typeof window !== "undefined") {
    sessionStorage.removeItem("google_oauth_token")
  }
}

export function getCachedToken(): string | null {
  return cachedAccessToken
}

// Drive Integration
export async function uploadToDrive(token: string, filename: string, content: string, mimeType = "text/plain") {
  const metadata = {
    name: filename,
    mimeType: mimeType,
  }

  const form = new FormData()
  form.append(
    "metadata",
    new Blob([JSON.stringify(metadata)], { type: "application/json" })
  )
  form.append(
    "file",
    new Blob([content], { type: mimeType })
  )

  const response = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Google Drive Upload Error: ${err}`)
  }

  return await response.json()
}

export async function listDriveFiles(token: string) {
  const response = await fetch(
    "https://www.googleapis.com/drive/v3/files?spaces=drive&fields=files(id,name,mimeType,webViewLink,createdTime)",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Google Drive List Error: ${err}`)
  }

  return await response.json()
}

// Gmail Integration
export async function sendGmail(token: string, to: string, subject: string, body: string) {
  // Convert standard strings to safe transport headers
  const emailLines = [
    `To: ${to}`,
    "Content-Type: text/html; charset=utf-8",
    "MIME-Version: 1.0",
    `Subject: ${subject}`,
    "",
    body,
  ]
  const rawMessage = emailLines.join("\r\n")
  
  // Safe base64url encoding
  let encodedMessage = ""
  if (typeof window !== "undefined") {
    encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")
  } else {
    encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")
  }

  const response = await fetch(
    "https://www.googleapis.com/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raw: encodedMessage,
      }),
    }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gmail Send Error: ${err}`)
  }

  return await response.json()
}

// Keep Sync Integration
export interface KeepNote {
  id: string
  title: string
  content: string
  color?: string
  lastUpdated: string
}

export async function saveKeepNotesToDrive(token: string, notes: KeepNote[]): Promise<any> {
  const filesList = await listDriveFiles(token)
  const existingFile = filesList.files?.find((f: any) => f.name === "google_keep_sync.json")

  if (existingFile) {
    const response = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notes),
      }
    )
    if (!response.ok) {
      throw new Error(`Failed to update Keep sync file: ${await response.text()}`)
    }
    return await response.json()
  } else {
    return await uploadToDrive(token, "google_keep_sync.json", JSON.stringify(notes), "application/json")
  }
}

export async function loadKeepNotesFromDrive(token: string): Promise<KeepNote[]> {
  const filesList = await listDriveFiles(token)
  const existingFile = filesList.files?.find((f: any) => f.name === "google_keep_sync.json")

  if (!existingFile) {
    return []
  }

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files/${existingFile.id}?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to load Keep sync file: ${await response.text()}`)
  }

  return await response.json()
}
