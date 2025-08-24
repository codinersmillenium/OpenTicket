import * as decUser from 'declarations/user'
import * as decEvent from 'declarations/event'
import * as decTicket from 'declarations/ticket'
import * as decToken from 'declarations/token'
import * as decTrx from 'declarations/transaction'
import { AuthClient } from '@dfinity/auth-client'
import { Principal } from '@dfinity/principal'
import { HttpAgent } from '@dfinity/agent'

/**
 * Singleton AuthClient instance
 * - Avoids multiple calls to AuthClient.create() (expensive operation)
 */
let authClientInstance: AuthClient | null = null

// Actor cache to prevent re-creating actors multiple times
const actorCache: Record<string, any> = {}

//Returns a singleton AuthClient instance
export const getAuthClient = async (): Promise<AuthClient> => {
  if (!authClientInstance) {
    authClientInstance = await AuthClient.create()
  }
  return authClientInstance
}

const network = process.env.DFX_NETWORK
const identityProvider =
  network === 'ic'
    ? 'https://identity.ic0.app' // Mainnet Internet Identity
    : `${process.env.API_HOST}?canisterId=${process.env.CANISTER_ID_INTERNET_IDENTITY}`

/**
 * Initialize an actor for a given canister
 * - Uses caching to avoid unnecessary re-creation
 */
export const initActor = async (canister: 'user' | 'event' | 'ticket' | 'token' | 'trx' = 'user') => {
  try {
    // Return cached actor if already created
    if (actorCache[canister]) return actorCache[canister]

    const authClient = await getAuthClient()
    const identity = authClient.getIdentity()
    const agent = new HttpAgent({ host: process.env.API_HOST, identity });
    if (process.env.DFX_NETWORK !== "ic") {
       await agent.fetchRootKey().catch((err) => {
            console.warn(
                "Unable to fetch root key. Check to ensure that your local replica is running"
            );
            console.error(err);
        });
    }
    const options = { agent: agent }

    let actor: any
    switch (canister) {
      case 'user':
        actor = decUser.createActor(decUser.canisterId, options)
        break
      case 'event':
        actor = decEvent.createActor(decEvent.canisterId, options)
        break
      case 'ticket':
        actor = decTicket.createActor(decTicket.canisterId, options)
        break
      case 'token':
        actor = decToken.createActor(decToken.canisterId, options)
        break
      case 'trx':
        actor = decTrx.createActor(decTrx.canisterId, options)
        break
      default:
        throw new Error(`Unknown canister: ${canister}`)
    }

    actorCache[canister] = actor // cache actor
    return actor
  } catch (err) {
    console.error('Failed to init actor:', err)
    return null
  }
}

//Get the principal of the currently authenticated user
export const getPrincipal = async () => {
  const authClient = await getAuthClient()
  const identity = authClient.getIdentity()
  const principalText = identity.getPrincipal().toString()
  const principalObj = Principal.fromText(principalText)
  return [principalText, principalObj] as const
}

export const checkPrincipal = async () => {
    const actor = await initActor()
    return actor.checkPrincipal()
}

export const convertToToken = async (amount: Number) => {
    const actor = await initActor('token')
    return actor.convertToken(amount)
}

/**
 * Called after login
 * - Checks if the user is authenticated
 * - Validates if the user exists in the user canister
 */
export const callbackSignIn = async () => {
  try {
    const authClient = await getAuthClient()
    const identity = authClient.getIdentity()
    const isAuthenticated = await authClient.isAuthenticated()

    if (!identity || !isAuthenticated) return 'init'

    const [_, principalObj] = await getPrincipal()
    const actor = await initActor('user')
    if (!actor) return false

    const { ok } = await actor.findUserById(principalObj)
    return typeof ok !== 'undefined'
  } catch (err) {
    console.error('callbackSignIn error:', err)
    return false
  }
}

/**
 * Sign in using Internet Identity
 * - Redirects to `/signin` after successful login
 */
export const signIn = async () => {
  const authClient = await getAuthClient()
  await authClient.login({
    identityProvider,
    onSuccess: async () => {
      await initActor('user')
      window.location.href = '/signin'
    }
  })
}

//Sign out and reset actors
export const signOut = async () => {
  const authClient = await getAuthClient()
  await authClient.logout()

  // Clear actor cache so they will be re-created with fresh identity
  Object.keys(actorCache).forEach((key) => delete actorCache[key])
  await initActor('user')
}