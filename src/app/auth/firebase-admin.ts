import 'google-application-credentials-base64'
import firebaseAdmin from 'firebase-admin'

const key = 'FIREBASE_ADMIN_INITIALIZED'
const globalAny: any = global

if (!globalAny[key]) {
  firebaseAdmin.initializeApp()
  globalAny[key] = true
}

export { firebaseAdmin }
