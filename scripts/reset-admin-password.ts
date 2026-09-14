import bcrypt from 'bcryptjs'
import { setAdminPasswordHash } from '../lib/settings'

const password = process.argv[2]
if (!password || password.length < 8) {
  console.error('Usage: npm run reset-admin-password -- <new-password (min. 8 characters)>')
  process.exit(1)
}

async function main() {
  await setAdminPasswordHash(bcrypt.hashSync(password, 10))
  console.log('Admin password updated directly in the database.')
}

main()
