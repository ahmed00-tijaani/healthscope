import mammoth from 'mammoth'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = pdfWorker

const SUPPORTED_LABEL = '.txt, .pdf, .docx, .csv, or .md'

async function extractPdfText(file) {
  const buffer = await file.arrayBuffer()
  const pdf = await getDocument({ data: buffer }).promise
  const pages = []

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum)
    const content = await page.getTextContent()
    pages.push(content.items.map((item) => item.str).join(' '))
  }

  return pages.join('\n\n').trim()
}

async function extractDocxText(file) {
  const buffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer: buffer })
  return result.value.trim()
}

export async function extractTextFromFile(file) {
  if (!file) {
    throw new Error('No file selected.')
  }

  const name = file.name.toLowerCase()
  const type = file.type

  if (
    type.startsWith('text/')
    || name.endsWith('.txt')
    || name.endsWith('.csv')
    || name.endsWith('.md')
  ) {
    return (await file.text()).trim()
  }

  if (type === 'application/pdf' || name.endsWith('.pdf')) {
    const text = await extractPdfText(file)
    if (!text) throw new Error('Could not read text from this PDF. Try a text-based report or paste manually.')
    return text
  }

  if (
    type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    || name.endsWith('.docx')
  ) {
    const text = await extractDocxText(file)
    if (!text) throw new Error('Could not read text from this Word document.')
    return text
  }

  if (name.endsWith('.doc')) {
    throw new Error('Legacy .doc files are not supported. Save as .docx or PDF and try again.')
  }

  throw new Error(`Unsupported file type. Upload ${SUPPORTED_LABEL}.`)
}

export const ACCEPTED_FILE_TYPES = '.txt,.pdf,.docx,.doc,.csv,.md,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

export const ACCEPTED_FILE_LABEL = SUPPORTED_LABEL
