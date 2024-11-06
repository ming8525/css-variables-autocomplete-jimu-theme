"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cssVariables = void 0;
exports.loadCssVariables = loadCssVariables;
exports.provideCompletionItems = provideCompletionItems;
exports.activate = activate;
exports.deactivate = deactivate;
const vscode_1 = __importDefault(require("vscode"));
const fs_1 = __importDefault(require("fs"));
exports.cssVariables = [];
async function loadCssVariables(cssFilePath) {
    if (cssFilePath && fs_1.default.existsSync(cssFilePath)) {
        const fileContent = fs_1.default.readFileSync(cssFilePath, 'utf-8');
        exports.cssVariables = extractCssVariables(fileContent);
    }
    else {
        exports.cssVariables = [];
    }
}
function extractCssVariables(content) {
    const regex = /--([\w-]+):/g;
    const variables = [];
    let match;
    while ((match = regex.exec(content)) !== null) {
        variables.push(match[1]);
    }
    return variables;
}
function provideCompletionItems(document, position) {
    const linePrefix = document.lineAt(position).text.substr(0, position.character);
    if (!linePrefix.endsWith('--')) {
        return undefined;
    }
    const dashPosition = linePrefix.lastIndexOf('--');
    const range = dashPosition >= 0 ? new vscode_1.default.Range(position.line, dashPosition, position.line, position.character) : undefined;
    return exports.cssVariables.map(variable => {
        const completionItem = new vscode_1.default.CompletionItem(`--${variable}`, vscode_1.default.CompletionItemKind.Variable);
        completionItem.insertText = `var(--${variable})`;
        if (!document.languageId.endsWith('css') && range) {
            completionItem.range = range;
        }
        return completionItem;
    });
}
async function activate(context) {
    console.log('Extension activated');
    const config = vscode_1.default.workspace.getConfiguration('cssVariablesAutocompleteJimuTheme');
    let relativePath = config.get('filePath') || '';
    const cssFilePath = vscode_1.default.workspace.workspaceFolders?.[0].uri.fsPath + "/" + relativePath;
    await loadCssVariables(cssFilePath);
    vscode_1.default.workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration('cssVariablesAutocompleteJimuTheme.filePath')) {
            const config = vscode_1.default.workspace.getConfiguration('cssVariablesAutocompleteJimuTheme');
            let relativePath = config.get('filePath') || '';
            const cssFilePath = vscode_1.default.workspace.workspaceFolders?.[0].uri.fsPath + "/" + relativePath;
            await loadCssVariables(cssFilePath);
        }
    });
    const supportedLanguages = config.get('languages') || ['typescript', 'typescriptreact', 'css', 'scss', 'json'];
    const provider = vscode_1.default.languages.registerCompletionItemProvider(supportedLanguages, { provideCompletionItems }, '-');
    const disposable = vscode_1.default.commands.registerCommand('css-variables-autocomplete-jimu-theme.helloWorld', () => {
        vscode_1.default.window.showInformationMessage('Hello World from css-variables-autocomplete-jimu-theme!');
    });
    context.subscriptions.push(disposable, provider);
}
function deactivate() { }
//# sourceMappingURL=index.js.map