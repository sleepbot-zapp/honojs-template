import { Hono } from 'hono'
import { Logger } from '@/utils/logger'
import fs from 'fs'
import path from 'path'
import { successResponse, errorResponse } from '@/utils/response'

const uploadRoutes = new Hono()

uploadRoutes.post('/upload', async (c) => {
  const formData = await c.req.formData()
  const file = formData.get('file') as File

  if (!file) {
    return c.json((errorResponse(400, 'No File Provided'), 400))
  }

  const uploadDir = path.resolve(process.cwd(), 'uploads')

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir)
  }

  const filePath = path.join(uploadDir, file.name)
  const buffer = await file.arrayBuffer()

  fs.writeFileSync(filePath, Buffer.from(buffer))

  Logger.info(`File uploaded: ${file.name}`)
  return c.json(successResponse(200, 'File uploaded successfully', null), 200)
})

export default uploadRoutes
