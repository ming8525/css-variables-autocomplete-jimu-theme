import vscode from 'vscode'
import fs from 'fs'
import path from 'path'

let cssVariables: string[] = []

export async function loadCssVariables(cssFilePath: string) {
  let fileContent
  if (cssFilePath && fs.existsSync(cssFilePath)) {
    fileContent = fs.readFileSync(cssFilePath, 'utf-8')
  } else {
    fileContent = fs.readFileSync(path.join(__dirname, './variables-template.css'), 'utf-8')
  }
  cssVariables = extractCssVariables(fileContent)
}

function extractCssVariables(content: string) {
  const regex = /--([\w-]+):/g
  const variables = []
  let match
  while ((match = regex.exec(content)) !== null) {
    variables.push(match[1])
  }
  return variables
}

export function provideCompletionItems(document: vscode.TextDocument, position: vscode.Position) {
  const linePrefix = document.lineAt(position).text.substr(0, position.character)

  if (!linePrefix.endsWith('--')) {
    return undefined
  }

  const dashPosition = linePrefix.lastIndexOf('--')
  const range = dashPosition >= 0 ? new vscode.Range(position.line, dashPosition, position.line, position.character) : undefined

  return cssVariables.map((variable, index) => {
    const completionItem = new vscode.CompletionItem(`--${variable}`, vscode.CompletionItemKind.Variable)

    completionItem.insertText = `var(--${variable})`
    if (!document.languageId.endsWith('css') && range) {
      completionItem.range = range
    }
    completionItem.sortText = String(index).padStart(5, '0')
    return completionItem
  })
}

function getVariablesTemplateFilePath () {
  const config = vscode.workspace.getConfiguration('cssVariablesAutocompleteJimuTheme')
  let relativePath = config.get('filePath') || 'variables-template.css'
  const cssFilePath = relativePath !== 'variables-template.css' ? vscode.workspace.workspaceFolders?.[0].uri.fsPath + "/" + relativePath : ''
  return cssFilePath
}

export async function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('cssVariablesAutocompleteJimuTheme')
  const cssFilePath = getVariablesTemplateFilePath()
  await loadCssVariables(cssFilePath)
  vscode.workspace.onDidChangeConfiguration(async (e) => {
    if (e.affectsConfiguration('cssVariablesAutocompleteJimuTheme.filePath')) {
      const cssFilePath = getVariablesTemplateFilePath()
      await loadCssVariables(cssFilePath)
    }
  })

  const supportedLanguages = config.get('languages') || ['typescript', 'typescriptreact', 'css', 'scss', 'json']
  const provider = vscode.languages.registerCompletionItemProvider(
    supportedLanguages,
    { provideCompletionItems },
    '-'
  )

  context.subscriptions.push(provider)
}

export function deactivate() { }
