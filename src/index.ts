import vscode from 'vscode'
import fs from 'fs'

export let cssVariables: string[] = []

export async function loadCssVariables(cssFilePath: string) {
  if (cssFilePath && fs.existsSync(cssFilePath)) {
    const fileContent = fs.readFileSync(cssFilePath, 'utf-8')
    cssVariables = extractCssVariables(fileContent)
  } else {
    cssVariables = []
  }
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

  return cssVariables.map(variable => {
    const completionItem = new vscode.CompletionItem(`--${variable}`, vscode.CompletionItemKind.Variable)

    completionItem.insertText = `var(--${variable})`
    if (!document.languageId.endsWith('css') && range) {
      completionItem.range = range
    }

    return completionItem
  })
}

export async function activate(context: vscode.ExtensionContext) {
  console.log('Extension activated')
  const config = vscode.workspace.getConfiguration('cssVariablesAutocompleteJimuTheme')
  let relativePath = config.get('filePath') || ''
  const cssFilePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath + "/" + relativePath
  await loadCssVariables(cssFilePath)
  vscode.workspace.onDidChangeConfiguration(async (e) => {
    if (e.affectsConfiguration('cssVariablesAutocompleteJimuTheme.filePath')) {
      const config = vscode.workspace.getConfiguration('cssVariablesAutocompleteJimuTheme')
      let relativePath = config.get('filePath') || ''
      const cssFilePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath + "/" + relativePath
      await loadCssVariables(cssFilePath)
    }
  })

  const supportedLanguages = config.get('languages') || ['typescript', 'typescriptreact', 'css', 'scss', 'json']
  const provider = vscode.languages.registerCompletionItemProvider(
    supportedLanguages,
    { provideCompletionItems },
    '-'
  )

  const disposable = vscode.commands.registerCommand('css-variables-autocomplete-jimu-theme.helloWorld', () => {
    vscode.window.showInformationMessage('Hello World from css-variables-autocomplete-jimu-theme!')
  })

  context.subscriptions.push(disposable, provider)
}

export function deactivate() { }
