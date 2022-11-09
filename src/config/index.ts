import { schema } from './schema'
export const config = schema.parse(global.process.env)
