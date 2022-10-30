import getConfig from 'next/config'
import { schema } from './schema'

const { serverRuntimeConfig } = getConfig()
export const config = schema.parse(serverRuntimeConfig)
