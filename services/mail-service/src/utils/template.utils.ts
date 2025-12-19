import fs from 'fs'
import path from 'path'
import Handlebars from 'handlebars'

export function renderTemplate(
  templateName: string,
  context: Record<string, any>
): string {
  const filePath = path.join(
    __dirname,
    '..',
    'templates',
    `${templateName}.hbs`
  )

  const source = fs.readFileSync(filePath, 'utf-8')
  const template = Handlebars.compile(source)

  return template(context)
}
