"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadCssVariables = loadCssVariables;
exports.provideCompletionItems = provideCompletionItems;
exports.activate = activate;
exports.deactivate = deactivate;
const vscode_1 = __importDefault(require("vscode"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
let cssVariables = [];
async function loadCssVariables(cssFilePath) {
    let fileContent;
    if (cssFilePath && fs_1.default.existsSync(cssFilePath)) {
        fileContent = fs_1.default.readFileSync(cssFilePath, 'utf-8');
    }
    else {
        fileContent = fs_1.default.readFileSync(path_1.default.join(__dirname, './variables-template.css'), 'utf-8');
    }
    cssVariables = extractCssVariables(fileContent);
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
    return cssVariables.map((variable, index) => {
        const completionItem = new vscode_1.default.CompletionItem(`--${variable}`, vscode_1.default.CompletionItemKind.Variable);
        completionItem.insertText = `var(--${variable})`;
        if (!document.languageId.endsWith('css') && range) {
            completionItem.range = range;
        }
        completionItem.sortText = String(index).padStart(5, '0');
        return completionItem;
    });
}
function getVariablesTemplateFilePath() {
    const config = vscode_1.default.workspace.getConfiguration('cssVariablesAutocompleteJimuTheme');
    let relativePath = config.get('filePath') || 'variables-template.css';
    const cssFilePath = relativePath !== 'variables-template.css' ? vscode_1.default.workspace.workspaceFolders?.[0].uri.fsPath + "/" + relativePath : '';
    return cssFilePath;
}
async function activate(context) {
    const config = vscode_1.default.workspace.getConfiguration('cssVariablesAutocompleteJimuTheme');
    const cssFilePath = getVariablesTemplateFilePath();
    await loadCssVariables(cssFilePath);
    vscode_1.default.workspace.onDidChangeConfiguration(async (e) => {
        if (e.affectsConfiguration('cssVariablesAutocompleteJimuTheme.filePath')) {
            const cssFilePath = getVariablesTemplateFilePath();
            await loadCssVariables(cssFilePath);
        }
    });
    const supportedLanguages = config.get('languages') || ['typescript', 'typescriptreact', 'css', 'scss', 'json'];
    const provider = vscode_1.default.languages.registerCompletionItemProvider(supportedLanguages, { provideCompletionItems }, '-');
    context.subscriptions.push(provider);
}
function deactivate() { }
//# sourceMappingURL=index.js.map