const vscode = require("vscode")
const fs = require("fs")

function activate(context) {
    let cssVariables = {}

    // 获取 CSS 文件路径的配置
    function getCSSFilePath() {
        const config = vscode.workspace.getConfiguration("cssVariables")
        const relativePath = config.get("filePath", "styles/variables.css")
        return vscode.workspace.workspaceFolders[0].uri.fsPath + "/" + relativePath
    }

    // 加载CSS变量
    function loadCSSVariables() {
        const cssFilePath = getCSSFilePath()
        try {
            const content = fs.readFileSync(cssFilePath, "utf-8")
            cssVariables = {}

            const regex = /(--[\w-]+):\s*([^]+)/g
            let match
            while ((match = regex.exec(content)) !== null) {
                cssVariables[match[1]] = match[2]
            }
        } catch (error) {
            vscode.window.showWarningMessage(`Failed to load CSS variables from ${cssFilePath}, error: ${error}`)
        }
    }

    const provider = vscode.languages.registerCompletionItemProvider(
        ["javascript", "typescript", "javascriptreact", "typescriptreact"],
        {
            provideCompletionItems(document, position) {
                const linePrefix = document.lineAt(position).text.substr(0, position.character)

                if (!linePrefix.endsWith("--")) {
                    return undefined
                }
                
                const items = Object.keys(cssVariables).map(variable => {
                    const item = new vscode.CompletionItem(variable.replace(/^--/, ""), vscode.CompletionItemKind.Variable)
                    item.detail = `CSS Variable: ${variable}`
                    item.documentation = cssVariables[variable]
                    return item
                })
                return items
            }
        },
        '-'
    )
    loadCSSVariables()
    context.subscriptions.push(provider)

    vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.fileName.endsWith(getCSSFilePath())) {
            loadCSSVariables()
        }
    })

    vscode.workspace.onDidChangeConfiguration(event => {
        if (event.affectsConfiguration("cssVariables.filePath")) {
            loadCSSVariables()
        }
    })
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}
